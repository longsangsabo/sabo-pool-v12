import React, { useState } from 'react';
import { Bell, MessageSquare, AlertTriangle, CheckCircle, Info, Settings, Clock, Wifi, WifiOff } from 'lucide-react';
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
import { useUnifiedMessages } from '@/hooks/useUnifiedMessages';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UnifiedNotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

const UnifiedNotificationBadge: React.FC<UnifiedNotificationBadgeProps> = ({
  className,
  onClick,
}) => {
  const { 
    unreadCount, 
    recentNotifications, 
    highPriorityMessages,
    urgentUnreadMessages,
    directMessages,
    systemMessages,
    isConnected
  } = useUnifiedMessages();
  
  const navigate = useNavigate();

  const hasUrgent = urgentUnreadMessages.length > 0;
  const hasHighPriority = highPriorityMessages.length > 0;
  const hasNotifications = unreadCount > 0;

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Không tự navigate, chỉ gọi onClick callback nếu có
    if (onClick) {
      onClick();
    }
    // Removed auto navigation - notifications should just show dropdown
  };

  const handleMessageClick = (messageId: string) => {
    navigate(`/messages?message=${messageId}`);
  };

  const handleViewAllMessages = () => {
    navigate('/messages');
  };

  const handleViewSystemMessages = () => {
    navigate('/messages?filter=system');
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'normal':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'system':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'direct':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'tournament':
        return <div className="w-4 h-4 text-yellow-500">🏆</div>;
      case 'announcement':
        return <div className="w-4 h-4 text-purple-500">📢</div>;
      // 🔔 CHALLENGE NOTIFICATION TYPES
      case 'challenge_created':
      case 'challenge_received':
        return <div className="w-4 h-4 text-blue-500">⚔️</div>;
      case 'match_reminder_1h':
      case 'match_reminder_24h':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'spa_points_awarded':
        return <div className="w-4 h-4 text-green-500">🎁</div>;
      case 'challenge_accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'challenge_declined':
        return <div className="w-4 h-4 text-red-500">❌</div>;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessagePreview = (content: string, maxLength: number = 60) => {
    return content.length > maxLength 
      ? `${content.substring(0, maxLength)}...` 
      : content;
  };

  // 🔔 NEW: Handle both messages and challenge notifications
  const handleItemClick = (item: any) => {
    // Check if it's a challenge notification (has type field)
    if (item.type && item.challengeId) {
      // Handle challenge notification
      navigate(`/challenges/${item.challengeId}`);
    } else {
      // Handle regular message  
      handleMessageClick(item.id);
    }
  };

  // 🔔 NEW: Unified renderer for messages and notifications
  const renderNotificationItem = (item: any, key: string, badgeText?: string, badgeVariant: any = "secondary") => {
    const isChallenge = !!item.type; // Challenge notification has 'type' field
    const title = isChallenge ? item.title : (item.subject || item.sender?.full_name || 'Tin nhắn mới');
    const content = isChallenge ? item.message : item.content;
    const createdAt = isChallenge ? item.createdAt : item.created_at;
    const messageType = isChallenge ? item.type : item.message_type;
    const priority = item.priority;

    return (
      <DropdownMenuItem
        key={key}
        className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => handleItemClick(item)}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {getMessageTypeIcon(messageType)}
              <div className="font-medium text-sm truncate">
                {title}
              </div>
            </div>
            <div className="text-sm text-gray-600 truncate mt-1">
              {getMessagePreview(content)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatTime(createdAt)}
            </div>
          </div>
          {badgeText && (
            <Badge variant={badgeVariant} className="text-xs ml-2">
              {badgeText}
            </Badge>
          )}
          {!badgeText && getPriorityIcon(priority)}
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 hover:bg-gray-100 rounded-full ${className}`}
        >
          {hasUrgent ? (
            <Bell className="w-5 h-5 text-red-500 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 text-gray-600" />
          )}
          
          {hasNotifications && (
            <Badge
              variant={hasUrgent ? "destructive" : hasHighPriority ? "default" : "secondary"}
              className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                hasUrgent ? 'animate-pulse' : ''
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {/* Header với connection status */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Tin nhắn & Thông báo</span>
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
          {hasNotifications && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} mới
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Urgent Messages Section */}
        {urgentUnreadMessages.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Khẩn cấp ({urgentUnreadMessages.length})
            </DropdownMenuLabel>
            
            {urgentUnreadMessages.slice(0, 2).map((message) =>
              renderNotificationItem(message, message.id, "KHẨN CẤP", "destructive")
            )}
            
            <DropdownMenuSeparator />
          </>
        )}

        {/* High Priority Messages */}
        {highPriorityMessages.filter(msg => msg.priority !== 'urgent').length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-orange-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Ưu tiên cao ({highPriorityMessages.filter(msg => msg.priority !== 'urgent').length})
            </DropdownMenuLabel>
            
            {highPriorityMessages.filter(msg => msg.priority !== 'urgent').slice(0, 3).map((message) =>
              renderNotificationItem(message, message.id, "Cao", "secondary")  
            )}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Recent Messages Section */}
        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-gray-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Gần đây ({recentNotifications.length})
            </DropdownMenuLabel>
            
            {recentNotifications.slice(0, 3).map((message) =>
              renderNotificationItem(message, message.id)  
            )}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* No messages */}
        {!hasNotifications && (
          <DropdownMenuItem disabled className="text-center text-gray-500 py-6">
            <div className="flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-gray-300" />
              <span>Không có tin nhắn mới</span>
            </div>
          </DropdownMenuItem>
        )}
        
        {/* Action buttons */}
        {hasNotifications && (
          <>
            <div className="p-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleViewAllMessages}
              >
                Tất cả tin nhắn
              </Button>
              
              {systemMessages.filter(msg => msg.status === 'unread').length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleViewSystemMessages}
                >
                  Hệ thống ({systemMessages.filter(msg => msg.status === 'unread').length})
                </Button>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UnifiedNotificationBadge;
