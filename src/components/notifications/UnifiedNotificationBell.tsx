import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  action_text?: string;
  action_url?: string;
  created_at: string;
  metadata?: any;
}

interface UnifiedNotificationBellProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
  onClick?: () => void;
}

export const UnifiedNotificationBell: React.FC<UnifiedNotificationBellProps> = ({
  variant = 'desktop',
  className = '',
  onClick
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Error recovery
  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => {
        setHasError(false);
        setIsOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  // Force refresh mechanism to fix badge sync issues
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing notification state...');
    
    // Clear all local state
    setNotifications([]);
    setUnreadCount(0);
    setHasError(false);
    setIsOpen(false);
    
    // Force re-fetch from database
    if (user) {
      await fetchNotifications(true);
    }
  };

  // Add force refresh on component mount to ensure fresh data
  useEffect(() => {
    if (user) {
      console.log('🎯 UnifiedNotificationBell mounted, force refreshing...');
      forceRefresh();
    }
  }, [user?.id]); // Only trigger when user changes

  // Error handler wrapper
  const withErrorHandling = (fn: Function) => {
    return (...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        console.error('Notification component error:', error);
        setHasError(true);
        setIsOpen(false);
      }
    };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Error in click outside handler:', error);
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      try {
        document.removeEventListener('mousedown', handleClickOutside);
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    };
  }, [isOpen]);

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        setIsOpen(false);
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error in cleanup:', error);
      }
    };
  }, []);

  // Fetch notifications with better error handling and caching prevention
  const fetchNotifications = async (forceRefresh = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      if (forceRefresh) {
        console.log('🧹 Force refresh: Clearing all cached state...');
        
        // Clear any localStorage cache that might exist
        try {
          localStorage.removeItem('notifications_cache');
          localStorage.removeItem('notification_count');
          localStorage.removeItem(`notifications_${user.id}`);
        } catch (e) {
          console.log('Note: localStorage clear failed (no cache found)');
        }
        
        // Reset component state
        setNotifications([]);
        setUnreadCount(0);
        setHasError(false);
      }
      
      // Create fresh query to prevent caching
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        
        if (forceRefresh) {
          console.log('🔧 Force refresh detected error - checking auth state...');
          // Check if user is properly authenticated
          const { data: authData } = await supabase.auth.getUser();
          if (!authData.user) {
            console.log('⚠️  User not authenticated - clearing badge');
            setNotifications([]);
            setUnreadCount(0);
            return;
          }
        }
      }

      const notificationData = (data as unknown as Notification[]) || [];
      setNotifications(notificationData);
      
      // Calculate unread count more reliably
      const unreadNotifications = notificationData.filter(n => !n.is_read);
      const newUnreadCount = unreadNotifications.length;
      
      console.log(`📊 Notification fetch: Total=${notificationData.length}, Unread=${newUnreadCount}`, 
        forceRefresh ? '(FORCED REFRESH)' : '');
      setUnreadCount(newUnreadCount);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      if (forceRefresh) {
        console.log('🔧 Force refresh caught error - resetting state');
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read with immediate state update
  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistically update UI first
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Then update database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Revert optimistic update on error
        await fetchNotifications(true);
        return;
      }

      console.log(`✅ Marked notification ${notificationId.slice(0,8)}... as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert by refetching
      await fetchNotifications(true);
    }
  };

  // Mark all as read with optimistic updates and safety
  const markAllAsRead = async () => {
    try {
      // Optimistically update UI first
      const unreadNotifications = notifications.filter(n => !n.is_read);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        // Revert optimistic update
        await fetchNotifications(true);
        toast.error('Có lỗi xảy ra khi đánh dấu thông báo');
        return;
      }

      console.log(`✅ Marked ${unreadNotifications.length} notifications as read`);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert by refetching
      await fetchNotifications(true);
      toast.error('Có lỗi xảy ra khi đánh dấu thông báo');
    }
  };

  // Handle notification click with error safety
  const handleNotificationClick = withErrorHandling((notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Close dropdown first
    setIsOpen(false);

    // Navigate if has action URL with delay to prevent conflicts
    if (notification.action_url) {
      setTimeout(() => {
        try {
          window.location.href = notification.action_url!;
        } catch (error) {
          console.error('Error navigating:', error);
        }
      }, 100);
    }
  });

  // Get icon for notification type
  const getNotificationIcon = (type: string, icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'challenge_created': '🏆',
      'challenge_received': '⚔️',
      'challenge_accepted': '✅',
      'challenge_declined': '❌',
      'open_challenge_joined': '🎉',
      'match_reminder_1h': '⏰',
      'result_submitted': '📊',
      'club_approved': '🏢',
    };

    return iconMap[type] || '🔔';
  };

  // Get priority color with dark mode support
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };

    return colorMap[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Real-time subscription with error handling
  useEffect(() => {
    if (!user?.id) return;

    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        await fetchNotifications();

        // Subscribe to real-time notifications for both INSERT and UPDATE
        subscription = supabase
          .channel(`unified_notifications_${user.id}`) // Unique channel per user
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              try {
                console.log('New notification received:', payload);
                const newNotification = payload.new as Notification;
                
                // Prevent duplicate notifications
                setNotifications(prev => {
                  const exists = prev.some(n => n.id === newNotification.id);
                  if (exists) {
                    console.log('Duplicate notification detected, skipping...');
                    return prev;
                  }
                  return [newNotification, ...prev];
                });
                setUnreadCount(prev => prev + 1);
                
                // Show toast for high priority notifications (throttled)
                if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
                  setTimeout(() => {
                    toast.info(newNotification.title, {
                      description: newNotification.message,
                    });
                  }, 100); // Small delay to prevent spam
                }
              } catch (error) {
                console.error('Error handling real-time notification:', error);
              }
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
              try {
                console.log('Notification updated:', payload);
                const updatedNotification = payload.new as Notification;
                
                // Update local state
                setNotifications(prev => 
                  prev.map(n => 
                    n.id === updatedNotification.id ? updatedNotification : n
                  )
                );
                
                // Recalculate unread count from updated notifications
                setNotifications(prev => {
                  const unreadCountNew = prev.filter(n => 
                    n.id === updatedNotification.id ? !updatedNotification.is_read : !n.is_read
                  ).length;
                  setUnreadCount(unreadCountNew);
                  return prev.map(n => 
                    n.id === updatedNotification.id ? updatedNotification : n
                  );
                });
              } catch (error) {
                console.error('Error handling notification update:', error);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      try {
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    };
  }, [user?.id]);

  // Add window focus listener - THROTTLED to prevent spam
  useEffect(() => {
    let lastFocusTime = 0;
    const THROTTLE_DELAY = 30000; // 30 seconds throttle

    const handleWindowFocus = () => {
      const now = Date.now();
      if (user?.id && (now - lastFocusTime) > THROTTLE_DELAY) {
        console.log('🔄 Window focused - gentle refresh (throttled)');
        lastFocusTime = now;
        fetchNotifications(false); // Gentle refresh, no force
      }
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (!document.hidden && user?.id && (now - lastFocusTime) > THROTTLE_DELAY) {
        console.log('🔄 Page became visible - gentle refresh (throttled)');
        lastFocusTime = now;
        fetchNotifications(false); // Gentle refresh, no force
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  // Add periodic refresh - REDUCED FREQUENCY to prevent spam
  useEffect(() => {
    if (!user?.id) return;

    const refreshInterval = setInterval(() => {
      console.log('⏰ Periodic refresh - gentle refresh only');
      fetchNotifications(false); // Gentle refresh only, no force
    }, 180000); // Refresh every 3 minutes instead of 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user?.id]);

  if (!user) return null;

  // Show error state
  if (hasError) {
    return (
      <div className={`relative ${className}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          disabled
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Toggle dropdown with safety
  const toggleDropdown = withErrorHandling(() => {
    // If onClick is provided (mobile), call it instead of toggling dropdown
    if (onClick) {
      onClick();
      return;
    }
    // Desktop behavior - show dropdown
    setIsOpen(!isOpen);
  });

  // Render notification dropdown content
  const renderNotificationDropdown = () => {
    const isCompact = variant === 'mobile';
    const dropdownWidth = isCompact ? 'w-72' : 'w-80';
    const maxHeight = isCompact ? 'max-h-80' : 'max-h-96';

    return (
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-full mt-2 ${dropdownWidth} bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 z-50`}
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-sm' : ''}`}>Thông báo</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={forceRefresh}
                className="text-xs h-6 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                title="Force refresh notifications"
              >
                🔄
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-6 px-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`${maxHeight} overflow-y-auto`}>
          {loading ? (
            <div className="p-4 text-center">
              <div className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'} border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2`}></div>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>Đang tải...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400 dark:text-gray-500 mx-auto mb-2`} />
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  } ${isCompact ? 'p-3' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={isCompact ? 'text-sm' : 'text-lg'}>
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium truncate text-gray-900 dark:text-white`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className={`${isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0`}></div>
                        )}
                      </div>
                      <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300 mb-2`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`${isCompact ? 'text-xs' : 'text-xs'} text-gray-400 dark:text-gray-500`}>
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main notification bell button
  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
        onClick={toggleDropdown}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className={`absolute -top-1 -right-1 ${variant === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'} rounded-full p-0 flex items-center justify-center text-xs bg-red-500 dark:bg-red-600 text-white`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown - only show for desktop when no onClick prop */}
      {isOpen && !onClick && renderNotificationDropdown()}
    </div>
  );
};

export default UnifiedNotificationBell;
