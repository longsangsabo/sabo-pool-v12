import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, Trash2, Archive, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useUnifiedNotifications, type UnifiedNotification } from '@/hooks/useUnifiedNotifications';
import { cn } from '@/lib/utils';

// ================================================================================
// UNIFIED NOTIFICATION BELL COMPONENT
// ================================================================================

interface UnifiedNotificationBellProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
  onClick?: () => void;
  showDropdown?: boolean;
  maxItems?: number;
}

export const UnifiedNotificationBell: React.FC<UnifiedNotificationBellProps> = ({
  variant = 'desktop',
  className = '',
  onClick,
  showDropdown = true,
  maxItems = 10
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    stats,
    loading,
    error,
    unreadCount,
    urgentCount,
    hasUrgent,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useUnifiedNotifications({
    limit: maxItems,
    realtime: true,
    autoRefresh: true
  });

  // Error recovery
  useEffect(() => {
    if (error) {
      setHasError(true);
      toast.error('Lỗi tải thông báo', {
        description: error
      });
    } else {
      setHasError(false);
    }
  }, [error]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = async (notification: UnifiedNotification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate if has action URL
    if (notification.action_url) {
      setTimeout(() => {
        window.location.href = notification.action_url!;
      }, 100);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      toast.success('Đã đánh dấu tất cả là đã đọc');
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (notification: UnifiedNotification) => {
    if (notification.icon && notification.icon !== 'bell') {
      return notification.icon;
    }

    const iconMap: Record<string, string> = {
      'challenge_created': '🏆',
      'challenge_received': '⚔️',
      'challenge_accepted': '✅',
      'challenge_declined': '❌',
      'tournament_started': '🎉',
      'match_reminder': '⏰',
      'result_submitted': '📊',
      'club_approved': '🏢',
      'milestone_completed': '🎯',
      'rank_request': '⭐',
      'system_announcement': '📢',
    };

    return iconMap[notification.type] || '🔔';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };

    return colorMap[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (showDropdown) {
      setIsOpen(!isOpen);
    }
  };

  // Render notification dropdown
  const renderDropdown = () => {
    const isCompact = variant === 'mobile';
    const dropdownWidth = isCompact ? 'w-80' : 'w-96';
    const maxHeight = isCompact ? 'max-h-80' : 'max-h-96';

    return (
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-full mt-2 ${dropdownWidth} bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${isCompact ? 'text-sm' : ''}`}>
              Thông báo
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đọc tất cả
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNotifications(true)}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {stats.total > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount} chưa đọc / {stats.total} tổng cộng
            </p>
          )}
        </div>

        {/* Content */}
        <div className={`${maxHeight} overflow-y-auto`}>
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
            </div>
          ) : hasError ? (
            <div className="p-4 text-center">
              <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lỗi tải thông báo</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNotifications(true)}
                className="mt-2 text-xs"
              >
                Thử lại
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có thông báo</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
                    !notification.is_read && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium truncate text-gray-900 dark:text-white`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300 mb-2 line-clamp-2`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                          {notification.category && (
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notifications';
              }}
            >
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Main notification bell button
  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "relative hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
          hasUrgent && "animate-pulse",
          hasError && "text-red-500"
        )}
        onClick={toggleDropdown}
        disabled={hasError}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant={hasUrgent ? "destructive" : "default"}
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs",
              hasUrgent ? "bg-red-500 dark:bg-red-600 animate-pulse" : "bg-blue-500 dark:bg-blue-600"
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown - only show for desktop when no onClick prop */}
      {isOpen && !onClick && showDropdown && renderDropdown()}
    </div>
  );
};

// ================================================================================
// NOTIFICATION CARD COMPONENT
// ================================================================================

interface UnifiedNotificationCardProps {
  notification: UnifiedNotification;
  onMarkAsRead?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

export const UnifiedNotificationCard: React.FC<UnifiedNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete,
  onClick,
  className
}) => {
  const getNotificationIcon = (notification: UnifiedNotification) => {
    if (notification.icon && notification.icon !== 'bell') {
      return notification.icon;
    }

    const iconMap: Record<string, string> = {
      'challenge_created': '🏆',
      'challenge_received': '⚔️',
      'challenge_accepted': '✅',
      'challenge_declined': '❌',
      'tournament_started': '🎉',
      'match_reminder': '⏰',
      'result_submitted': '📊',
      'club_approved': '🏢',
      'milestone_completed': '🎯',
      'rank_request': '⭐',
      'system_announcement': '📢',
    };

    return iconMap[notification.type] || '🔔';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'border-gray-200 dark:border-gray-700',
      medium: 'border-blue-200 dark:border-blue-700',
      high: 'border-orange-200 dark:border-orange-700',
      urgent: 'border-red-200 dark:border-red-700',
    };

    return colorMap[priority] || 'border-gray-200 dark:border-gray-700';
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer",
        !notification.is_read && "bg-blue-50 dark:bg-blue-900/20",
        getPriorityColor(notification.priority),
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {getNotificationIcon(notification)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {notification.title}
            </h3>
            {!notification.is_read && (
              <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {notification.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {notification.category}
              </Badge>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {!notification.is_read && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              
              {onArchive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedNotificationBell;
