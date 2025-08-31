// =====================================================
// 🏆 CHALLENGE NOTIFICATION REACT HOOK
// =====================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { challengeNotificationService } from '@/services/challengeNotificationService';
import {
 ChallengeNotification,
 ChallengeNotificationType,
 CreateNotificationData,
 NotificationFilters,
 PaginationOptions,
 NotificationStats
} from '@/types/challengeNotification';
import { toast } from 'sonner';

interface UseChallengeNotificationsOptions {
 realtime?: boolean;
 autoFetch?: boolean;
 pollInterval?: number;
}

interface UseChallengeNotificationsReturn {
 // Data
 notifications: ChallengeNotification[];
 unreadCount: number;
 stats: NotificationStats | null;
 loading: boolean;
 error: string | undefined;
 
 // Actions
 fetchNotifications: (filters?: NotificationFilters, options?: PaginationOptions) => Promise<void>;
 markAsRead: (notificationId: string) => Promise<void>;
 markAllAsRead: () => Promise<void>;
 deleteNotification: (notificationId: string) => Promise<void>;
 createNotification: (data: CreateNotificationData) => Promise<void>;
 refreshUnreadCount: () => Promise<void>;
 refreshStats: () => Promise<void>;
 
 // State
 isConnected: boolean;
 hasMore: boolean;
 totalCount: number;
}

export const useChallengeNotifications = (
 options: UseChallengeNotificationsOptions = {}
): UseChallengeNotificationsReturn => {
 const { user } = useAuth();
 const {
  realtime = true,
  autoFetch = true,
  pollInterval = 30000 // 30 seconds
 } = options;

 // State
 const [notifications, setNotifications] = useState<ChallengeNotification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [stats, setStats] = useState<NotificationStats | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [isConnected, setIsConnected] = useState(false);
 const [totalCount, setTotalCount] = useState(0);
 const [hasMore, setHasMore] = useState(false);

 // Refs
 const unsubscribeRef = useRef<(() => void) | null>(null);
 const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

 // ===== CORE ACTIONS =====

 const fetchNotifications = useCallback(async (
  filters?: NotificationFilters,
  options?: PaginationOptions
 ) => {
  if (!user?.id) return;

  try {
   setLoading(true);
   setError(null);

   const result = await challengeNotificationService.getUserNotifications(
    user.id,
    filters,
    options
   );

   if (options?.page && options.page > 1) {
    // Append to existing notifications for pagination
    setNotifications(prev => [...prev, ...result.notifications]);
   } else {
    // Replace notifications for fresh fetch
    setNotifications(result.notifications);
   }

   setTotalCount(result.total);
   const limit = options?.limit || 20;
   setHasMore(result.notifications.length === limit);

  } catch (err) {
   const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
   setError(errorMessage);
   console.error('❌ Error fetching notifications:', err);
  } finally {
   setLoading(false);
  }
 }, [user?.id]);

 const refreshUnreadCount = useCallback(async () => {
  if (!user?.id) return;

  try {
   const count = await challengeNotificationService.getUnreadCount(user.id);
   setUnreadCount(count);
  } catch (err) {
   console.error('❌ Error refreshing unread count:', err);
  }
 }, [user?.id]);

 const refreshStats = useCallback(async () => {
  if (!user?.id) return;

  try {
   const userStats = await challengeNotificationService.getUserNotificationStats(user.id);
   setStats(userStats);
   if (userStats) {
    setUnreadCount(userStats.unreadCount);
   }
  } catch (err) {
   console.error('❌ Error refreshing stats:', err);
  }
 }, [user?.id]);

 const markAsRead = useCallback(async (notificationId: string) => {
  if (!user?.id) return;

  try {
   const success = await challengeNotificationService.markAsRead(notificationId, user.id);
   if (success) {
    // Update local state
    setNotifications(prev => 
     prev.map(notification => 
      notification.id === notificationId 
       ? { ...notification, isRead: true }
       : notification
     )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Update stats
    if (stats) {
     setStats(prev => prev ? {
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1)
     } : null);
    }
   }
  } catch (err) {
   console.error('❌ Error marking notification as read:', err);
   toast.error('Không thể đánh dấu thông báo đã đọc');
  }
 }, [user?.id, stats]);

 const markAllAsRead = useCallback(async () => {
  if (!user?.id) return;

  try {
   const success = await challengeNotificationService.markAllAsRead(user.id);
   if (success) {
    // Update local state
    setNotifications(prev => 
     prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    // Reset unread count
    setUnreadCount(0);
    
    // Update stats
    if (stats) {
     setStats(prev => prev ? { ...prev, unreadCount: 0 } : null);
    }

    toast.success('Đã đánh dấu tất cả thông báo đã đọc');
   }
  } catch (err) {
   console.error('❌ Error marking all notifications as read:', err);
   toast.error('Không thể đánh dấu tất cả thông báo');
  }
 }, [user?.id, stats]);

 const deleteNotification = useCallback(async (notificationId: string) => {
  if (!user?.id) return;

  try {
   const success = await challengeNotificationService.deleteNotification(notificationId, user.id);
   if (success) {
    // Find and remove notification
    const deletedNotification = notifications.find(n => n.id === notificationId);
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Update counts
    if (deletedNotification && !deletedNotification.isRead) {
     setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setTotalCount(prev => Math.max(0, prev - 1));

    toast.success('Đã xóa thông báo');
   }
  } catch (err) {
   console.error('❌ Error deleting notification:', err);
   toast.error('Không thể xóa thông báo');
  }
 }, [user?.id, notifications]);

 const createNotification = useCallback(async (data: CreateNotificationData) => {
  try {
   const notification = await challengeNotificationService.createNotification(data);
   if (notification) {
    // Add to local state if it's for current user
    if (data.userId === user?.id) {
     setNotifications(prev => [notification, ...prev]);
     setUnreadCount(prev => prev + 1);
     setTotalCount(prev => prev + 1);
    }

    // Send real-time notification
    await challengeNotificationService.sendRealTimeNotification(data.userId, notification);
   }
  } catch (err) {
   console.error('❌ Error creating notification:', err);
  }
 }, [user?.id]);

 // ===== REAL-TIME SETUP =====

 useEffect(() => {
  if (!user?.id || !realtime) return;

  console.log('🔔 Setting up real-time notifications for user:', user.id);

  const unsubscribe = challengeNotificationService.subscribeToUserNotifications(
   user.id,
   (notification: ChallengeNotification) => {
    console.log('🔔 New real-time notification:', notification);
    
    // Add to notifications list
    setNotifications(prev => {
     // Avoid duplicates
     if (prev.some(n => n.id === notification.id)) {
      return prev;
     }
     return [notification, ...prev];
    });

    // Update unread count if not read
    if (!notification.isRead) {
     setUnreadCount(prev => prev + 1);
    }

    setTotalCount(prev => prev + 1);
    setIsConnected(true);
   }
  );

  unsubscribeRef.current = unsubscribe;
  setIsConnected(true);

  return () => {
   if (unsubscribeRef.current) {
    unsubscribeRef.current();
    unsubscribeRef.current = null;
   }
   setIsConnected(false);
  };
 }, [user?.id, realtime]);

 // ===== POLLING SETUP =====

 useEffect(() => {
  if (!user?.id || realtime || !pollInterval) return;

  console.log('🔔 Setting up polling for notifications, interval:', pollInterval);

  const poll = async () => {
   await refreshUnreadCount();
  };

  // Initial poll
  poll();

  // Set up interval
  pollIntervalRef.current = setInterval(poll, pollInterval);

  return () => {
   if (pollIntervalRef.current) {
    clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
   }
  };
 }, [user?.id, realtime, pollInterval, refreshUnreadCount]);

 // ===== AUTO FETCH =====

 useEffect(() => {
  if (autoFetch && user?.id) {
   fetchNotifications();
   refreshStats();
  }
 }, [autoFetch, user?.id, fetchNotifications, refreshStats]);

 // ===== CLEANUP =====

 useEffect(() => {
  return () => {
   if (unsubscribeRef.current) {
    unsubscribeRef.current();
   }
   if (pollIntervalRef.current) {
    clearInterval(pollIntervalRef.current);
   }
  };
 }, []);

 return {
  // Data
  notifications,
  unreadCount,
  stats,
  loading,
  error,
  
  // Actions
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  refreshUnreadCount,
  refreshStats,
  
  // State
  isConnected,
  hasMore,
  totalCount
 };
};

// ===== SPECIALIZED HOOKS =====

/**
 * Hook for just unread count (lightweight)
 */
export const useNotificationCount = () => {
 const { user } = useAuth();
 const [unreadCount, setUnreadCount] = useState(0);
 const [loading, setLoading] = useState(false);

 const refreshCount = useCallback(async () => {
  if (!user?.id) return;

  try {
   setLoading(true);
   const count = await challengeNotificationService.getUnreadCount(user.id);
   setUnreadCount(count);
  } catch (err) {
   console.error('❌ Error getting notification count:', err);
  } finally {
   setLoading(false);
  }
 }, [user?.id]);

 useEffect(() => {
  refreshCount();
  
  // Refresh every 30 seconds
  const interval = setInterval(refreshCount, 30000);
  return () => clearInterval(interval);
 }, [refreshCount]);

 return { unreadCount, loading, refreshCount };
};

/**
 * Hook for challenge-specific notifications
 */
export const useSpecificChallengeNotifications = (challengeId: string) => {
 const { user } = useAuth();
 const [notifications, setNotifications] = useState<ChallengeNotification[]>([]);
 const [loading, setLoading] = useState(false);

 const fetchChallengeNotifications = useCallback(async () => {
  if (!user?.id || !challengeId) return;

  try {
   setLoading(true);
   const result = await challengeNotificationService.getUserNotifications(
    user.id,
    { challengeId },
    { orderBy: 'created_at', orderDirection: 'desc' }
   );
   setNotifications(result.notifications);
  } catch (err) {
   console.error('❌ Error fetching challenge notifications:', err);
  } finally {
   setLoading(false);
  }
 }, [user?.id, challengeId]);

 useEffect(() => {
  fetchChallengeNotifications();
 }, [fetchChallengeNotifications]);

 return { notifications, loading, refresh: fetchChallengeNotifications };
};
