import React, { useState } from 'react';
import { Bell, MessageSquare, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { useMessages } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SmartNotificationBadgeProps {
  systemNotifications?: any[];
  hasUrgent?: boolean;
  onClick?: () => void;
}

const SmartNotificationBadge: React.FC<SmartNotificationBadgeProps> = ({
  systemNotifications = [],
  hasUrgent = false,
  onClick,
}) => {
  const { unreadMessages, unreadCount: messageUnreadCount } = useMessages();
  const navigate = useNavigate();

  const totalUnreadCount = (systemNotifications?.length || 0) + messageUnreadCount;
  const hasNotifications = totalUnreadCount > 0;

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else {
      navigate('/notifications');
    }
  };

  const handleMessageClick = (messageId: string) => {
    navigate(`/messages?message=${messageId}`);
  };

  const handleViewAllMessages = () => {
    navigate('/messages');
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 rounded-full"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {hasNotifications && (
            <Badge
              variant={hasUrgent ? "destructive" : "default"}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {hasNotifications && (
            <Badge variant="secondary" className="text-xs">
              {totalUnreadCount} mới
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Recent Messages Section */}
        {messageUnreadCount > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-gray-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Tin nhắn mới ({messageUnreadCount})
            </DropdownMenuLabel>
            
            {unreadMessages.slice(0, 3).map((message) => (
              <DropdownMenuItem
                key={message.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleMessageClick(message.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">
                      {message.sender_name || message.sender_email}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                  {message.priority === 'high' && (
                    <AlertTriangle className="w-3 h-3 text-red-500 ml-2" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            
            {messageUnreadCount > 3 && (
              <DropdownMenuItem
                className="text-center text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={handleViewAllMessages}
              >
                Xem thêm {messageUnreadCount - 3} tin nhắn...
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* System Notifications Section */}
        {systemNotifications.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-gray-600">
              Thông báo hệ thống ({systemNotifications.length})
            </DropdownMenuLabel>
            
            {systemNotifications.slice(0, 3).map((notification, index) => (
              <DropdownMenuItem
                key={index}
                className="flex items-start p-3 cursor-pointer hover:bg-gray-50"
                onClick={handleNotificationClick}
              >
                <div className="flex items-start gap-3 w-full">
                  {getPriorityIcon(notification.priority)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </div>
                    {notification.created_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.created_at)}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            {systemNotifications.length > 3 && (
              <DropdownMenuItem
                className="text-center text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={handleViewAllNotifications}
              >
                Xem thêm {systemNotifications.length - 3} thông báo...
              </DropdownMenuItem>
            )}
          </>
        )}
        
        {/* No notifications */}
        {!hasNotifications && (
          <DropdownMenuItem disabled className="text-center text-gray-500 py-6">
            <div className="flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-gray-300" />
              <span>Không có thông báo mới</span>
            </div>
          </DropdownMenuItem>
        )}
        
        {/* Action buttons */}
        {hasNotifications && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex gap-2">
              {messageUnreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleViewAllMessages}
                >
                  Tất cả tin nhắn
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleViewAllNotifications}
              >
                Tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SmartNotificationBadge;
