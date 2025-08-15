import React, { useState, useEffect } from 'react';
import { Bell, Filter, CheckCircle, ChevronDown, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useChallengeNotifications } from '@/hooks/useChallengeNotifications';
import { NotificationCard, NotificationBell } from '@/components/notifications/ChallengeNotificationComponents';
import { ChallengeNotificationType } from '@/types/challengeNotification';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FilterState {
  read: 'all' | 'read' | 'unread';
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  type: 'all' | ChallengeNotificationType;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    hasMore,
    totalCount
  } = useChallengeNotifications();

  const [filters, setFilters] = useState<FilterState>({
    read: 'all',
    priority: 'all',
    type: 'all'
  });

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Fetch notifications when component mounts or filters change
  useEffect(() => {
    const filterOptions = {
      isRead: filters.read === 'read' ? true : filters.read === 'unread' ? false : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      type: filters.type !== 'all' ? filters.type : undefined
    };
    
    fetchNotifications(filterOptions, { page: 1, limit: 20 });
  }, [filters]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast.success('Đã đánh dấu là đã đọc');
    } catch (err) {
      toast.error('Không thể đánh dấu thông báo');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (err) {
      toast.error('Không thể đánh dấu tất cả thông báo');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      toast.success('Đã xóa thông báo');
    } catch (err) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setSelectedNotifications([]);
      toast.success(`Đã xóa ${selectedNotifications.length} thông báo`);
    } catch (err) {
      toast.error('Không thể xóa một số thông báo');
    }
  };

  const handleRefresh = () => {
    fetchNotifications(undefined, { page: 1, limit: 20 });
    refreshUnreadCount();
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllVisibleNotifications = () => {
    const visibleIds = notifications.map(n => n.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filters.read === 'read' && !notification.isRead) return false;
    if (filters.read === 'unread' && notification.isRead) return false;
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    return true;
  });

  const getFilterLabel = (filterType: string, value: string): string => {
    const labels = {
      read: {
        all: 'Tất cả',
        read: 'Đã đọc',
        unread: 'Chưa đọc'
      },
      priority: {
        all: 'Tất cả',
        urgent: 'Khẩn cấp',
        high: 'Cao',
        medium: 'Trung bình',
        low: 'Thấp'
      },
      type: {
        all: 'Tất cả loại'
      }
    };

    return labels[filterType]?.[value] || value;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải thông báo...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <NotificationBell count={unreadCount} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-600">
                {totalCount} thông báo • {unreadCount} chưa đọc
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Đánh dấu tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Lọc:</span>
              
              {/* Read Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {getFilterLabel('read', filters.read)}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, read: 'all' }))}>
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, read: 'unread' }))}>
                    Chưa đọc
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, read: 'read' }))}>
                    Đã đọc
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {getFilterLabel('priority', filters.priority)}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, priority: 'all' }))}>
                    Tất cả mức độ
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, priority: 'urgent' }))}>
                    🚨 Khẩn cấp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, priority: 'high' }))}>
                    ⚠️ Cao
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, priority: 'medium' }))}>
                    🔔 Trung bình
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, priority: 'low' }))}>
                    ℹ️ Thấp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Selection Actions */}
              {selectedNotifications.length > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-300" />
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} đã chọn
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Bỏ chọn
                  </Button>
                </>
              )}
              
              {notifications.length > 0 && selectedNotifications.length === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllVisibleNotifications}
                >
                  Chọn tất cả
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có thông báo
                </h3>
                <p className="text-gray-500 text-center">
                  {filters.read !== 'all' || filters.priority !== 'all' || filters.type !== 'all' 
                    ? 'Không có thông báo phù hợp với bộ lọc hiện tại'
                    : 'Bạn chưa có thông báo nào'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className="relative">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  className="absolute top-4 left-4 z-10 rounded border-gray-300"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleSelectNotification(notification.id)}
                />
                
                {/* Notification Card */}
                <div className="ml-8">
                  <NotificationCard
                    notification={notification}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onDelete={() => handleDeleteNotification(notification.id)}
                    onClick={() => {
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                      }
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => fetchNotifications(undefined, { page: Math.floor(notifications.length / 20) + 1, limit: 20 })}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                'Tải thêm'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
