import React from "react";
// =====================================================
// 🏆 CHALLENGE NOTIFICATION UI COMPONENTS
// =====================================================

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Bell,
  Trophy,
  Sword,
  Clock,
  Gift,
  Star,
  Shield,
  Target,
  Zap,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  TrendingUp,
  Award,
  Crown,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  ChallengeNotification, 
  NotificationPriority,
  ChallengeNotificationType 
} from '@/types/challengeNotification';

// ===== ICON MAPPING =====

const notificationIcons = {
  bell: Bell,
  trophy: Trophy,
  sword: Sword,
  clock: Clock,
  gift: Gift,
  star: Star,
  shield: Shield,
  target: Target,
  zap: Zap,
  heart: Heart,
  'message-circle': MessageCircle,
  users: Users,
  calendar: Calendar,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'x-circle': XCircle,
  info: Info,
  'trending-up': TrendingUp,
  award: Award,
  crown: Crown,
  flame: Flame
} as const;

const getNotificationIcon = (iconName: string) => {
  return notificationIcons[iconName as keyof typeof notificationIcons] || Bell;
};

// ===== PRIORITY STYLING =====

const priorityStyles = {
  low: 'border-gray-200 bg-gray-50/50',
  medium: 'border-blue-200 bg-blue-50/50',
  high: 'border-amber-200 bg-amber-50/50',
  urgent: 'border-red-200 bg-red-50/50 shadow-md'
};

const priorityBadgeStyles = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
};

// ===== INDIVIDUAL NOTIFICATION CARD =====

interface NotificationCardProps {
  notification: ChallengeNotification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (notification: ChallengeNotification) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
  showActions = true,
  compact = false
}) => {
  const Icon = getNotificationIcon(notification.icon);
  const timeAgo = formatDistanceToNow(notification.createdAt, { 
    addSuffix: true, 
    locale: vi 
  });

  const handleAction = () => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    onAction?.(notification);
    
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const priorityClass = priorityStyles[notification.priority];
  const unreadClass = notification.isRead ? '' : 'border-l-4 border-l-primary';

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-sm cursor-pointer',
      priorityClass,
      unreadClass,
      compact && 'p-2'
    )}>
      <CardContent className={cn('flex gap-3', compact ? 'p-3' : 'p-4')}>
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 rounded-full p-2',
          notification.priority === 'urgent' ? 'bg-red-100' :
          notification.priority === 'high' ? 'bg-amber-100' :
          notification.priority === 'medium' ? 'bg-blue-100' : 'bg-gray-100'
        )}>
          <Icon className={cn(
            'h-4 w-4',
            notification.priority === 'urgent' ? 'text-red-600' :
            notification.priority === 'high' ? 'text-amber-600' :
            notification.priority === 'medium' ? 'text-blue-600' : 'text-gray-600'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn(
                'font-medium text-sm leading-tight',
                !notification.isRead && 'font-semibold'
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                
                {notification.priority !== 'medium' && (
                  <Badge 
                    variant="secondary" 
                    className={cn('text-xs', priorityBadgeStyles[notification.priority])}
                  >
                    {notification.priority === 'urgent' ? 'Khẩn cấp' :
                     notification.priority === 'high' ? 'Quan trọng' : 'Thấp'}
                  </Badge>
                )}
                
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-1">
                {notification.actionText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleAction}
                  >
                    {notification.actionText}
                  </Button>
                )}
                
                {!notification.isRead && onMarkAsRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(notification.id)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== NOTIFICATION LIST =====

interface NotificationListProps {
  notifications: ChallengeNotification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onLoadMore,
  hasMore = false,
  emptyMessage = 'Không có thông báo nào',
  showActions = true,
  compact = false,
  maxHeight = '400px'
}) => {
  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-3">
      {/* Header with actions */}
      {showActions && unreadCount > 0 && onMarkAllAsRead && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {unreadCount} thông báo chưa đọc
          </span>
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      )}

      {/* Notifications */}
      <ScrollArea style={{ maxHeight }} className="pr-4">
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationCard
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                showActions={showActions}
                compact={compact}
              />
              {index < notifications.length - 1 && !compact && <Separator className="my-2" />}
            </div>
          ))}

          {/* Load more button */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center py-4">
              <Button variant="ghost" onClick={onLoadMore} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Đang tải...
                  </>
                ) : (
                  'Tải thêm'
                )}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// ===== NOTIFICATION BADGE =====

interface NotificationBadgeProps {
  count: number;
  variant?: 'default' | 'destructive';
  showZero?: boolean;
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  variant = 'destructive',
  showZero = false,
  maxCount = 99
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge 
      variant={variant}
      className={cn(
        'absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold',
        count === 0 && 'bg-muted text-muted-foreground'
      )}
    >
      {displayCount}
    </Badge>
  );
};

// ===== NOTIFICATION BELL ICON =====

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onClick,
  className,
  size = 'md',
  showBadge = true
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
      aria-label={`Thông báo${count > 0 ? ` (${count} chưa đọc)` : ''}`}
    >
      <Bell className={sizeClasses[size]} />
      {showBadge && <NotificationBadge count={count} />}
    </button>
  );
};

// ===== NOTIFICATION DROPDOWN =====

interface NotificationDropdownProps {
  notifications: ChallengeNotification[];
  unreadCount: number;
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
  maxItems?: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  maxItems = 5
}) => {
  const displayNotifications = notifications.slice(0, maxItems);
  const hasMore = notifications.length > maxItems;

  return (
    <div className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Thông báo</h3>
        {unreadCount > 0 && (
          <Badge variant="secondary">{unreadCount}</Badge>
        )}
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">
        <NotificationList
          notifications={displayNotifications}
          loading={loading}
          onMarkAsRead={onMarkAsRead}
          showActions={false}
          compact={true}
          emptyMessage="Không có thông báo mới"
          maxHeight="none"
        />
      </div>

      {/* Footer */}
      <div className="border-t p-3 space-y-2">
        {unreadCount > 0 && onMarkAllAsRead && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={onMarkAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
        
        {(hasMore || onViewAll) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onViewAll}
          >
            Xem tất cả thông báo
          </Button>
        )}
      </div>
    </div>
  );
};
