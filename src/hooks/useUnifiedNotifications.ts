import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// ================================================================================
// UNIFIED NOTIFICATION INTERFACES
// ================================================================================

export interface UnifiedNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  category: 'general' | 'challenge' | 'tournament' | 'club' | 'match' | 'system' | 'milestone';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon: string;
  is_read: boolean;
  is_archived: boolean;
  auto_popup?: boolean;
  action_text?: string;
  action_url?: string;
  challenge_id?: string;
  tournament_id?: string;
  club_id?: string;
  match_id?: string;
  metadata?: Record<string, any>;
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  high_priority: number;
  urgent: number;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
}

export interface UseUnifiedNotificationsOptions {
  limit?: number;
  category?: string;
  type?: string;
  realtime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseUnifiedNotificationsReturn {
  // Data
  notifications: UnifiedNotification[];
  stats: NotificationStats;
  
  // State
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Computed values
  unreadCount: number;
  urgentCount: number;
  highPriorityCount: number;
  hasUrgent: boolean;
  
  // Actions
  fetchNotifications: (forceRefresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  markAsArchived: (notificationId: string) => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  
  // Filtering
  getNotificationsByCategory: (category: string) => UnifiedNotification[];
  getNotificationsByType: (type: string) => UnifiedNotification[];
  getUnreadNotifications: () => UnifiedNotification[];
  getUrgentNotifications: () => UnifiedNotification[];
}

// ================================================================================
// UNIFIED NOTIFICATION HOOK
// ================================================================================

export const useUnifiedNotifications = (
  options: UseUnifiedNotificationsOptions = {}
): UseUnifiedNotificationsReturn => {
  const { user } = useAuth();
  const {
    limit = 50,
    category,
    type,
    realtime = true,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;

  // State
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // ================================================================================
  // COMPUTED VALUES
  // ================================================================================

  const stats = useMemo((): NotificationStats => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.is_read).length;
    const high_priority = notifications.filter(n => n.priority === 'high').length;
    const urgent = notifications.filter(n => n.priority === 'urgent').length;

    const by_category = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const by_type = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      high_priority,
      urgent,
      by_category,
      by_type
    };
  }, [notifications]);

  const unreadCount = stats.unread;
  const urgentCount = stats.urgent;
  const highPriorityCount = stats.high_priority;
  const hasUrgent = urgentCount > 0;

  // ================================================================================
  // CORE FUNCTIONS
  // ================================================================================

  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      if (type) {
        query = query.eq('type', type);
      }

      // Apply limit
      query = query.limit(limit);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setNotifications(data || []);
      setIsConnected(true);
      
      if (forceRefresh) {
        console.log('🔄 Notifications force refreshed:', data?.length || 0);
      }

    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id, category, type, limit]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        // Revert optimistic update on error
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: false } : n
          )
        );
        throw error;
      }

      return true;
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message);
      return false;
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return true;

      // Optimistic update
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .in('id', unreadIds)
        .eq('user_id', user?.id);

      if (error) {
        // Revert optimistic update on error
        await fetchNotifications();
        throw error;
      }

      return true;
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message);
      return false;
    }
  }, [notifications, user?.id, fetchNotifications]);

  const markAsArchived = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      // Optimistic removal
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );

      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        // Revert on error
        await fetchNotifications();
        throw error;
      }

      return true;
    } catch (err: any) {
      console.error('Error archiving notification:', err);
      setError(err.message);
      return false;
    }
  }, [user?.id, fetchNotifications]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      // Optimistic removal
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );

      const { error } = await supabase
        .from('notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        // Revert on error
        await fetchNotifications();
        throw error;
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err.message);
      return false;
    }
  }, [user?.id, fetchNotifications]);

  // ================================================================================
  // FILTERING FUNCTIONS
  // ================================================================================

  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.is_read);
  }, [notifications]);

  const getUrgentNotifications = useCallback(() => {
    return notifications.filter(n => n.priority === 'urgent');
  }, [notifications]);

  // ================================================================================
  // EFFECTS
  // ================================================================================

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(true);
    }
  }, [user?.id, fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!realtime || !user?.id) return;

    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel('unified_notifications_realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('New notification received:', payload);
              const newNotification = payload.new as UnifiedNotification;
              
              setNotifications(prev => [newNotification, ...prev]);
              setError(null);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('Notification updated:', payload);
              const updatedNotification = payload.new as UnifiedNotification;
              
              setNotifications(prev =>
                prev.map(n =>
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              );
            }
          )
          .subscribe();

        setIsConnected(true);
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
        setIsConnected(false);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user?.id, realtime]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user?.id, fetchNotifications]);

  // Window focus refresh
  useEffect(() => {
    if (!user?.id) return;

    const handleFocus = () => {
      fetchNotifications(true);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, fetchNotifications]);

  // ================================================================================
  // RETURN HOOK INTERFACE
  // ================================================================================

  return {
    // Data
    notifications,
    stats,
    
    // State
    loading,
    error,
    isConnected,
    
    // Computed values
    unreadCount,
    urgentCount,
    highPriorityCount,
    hasUrgent,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markAsArchived,
    deleteNotification,
    
    // Filtering
    getNotificationsByCategory,
    getNotificationsByType,
    getUnreadNotifications,
    getUrgentNotifications,
  };
};
