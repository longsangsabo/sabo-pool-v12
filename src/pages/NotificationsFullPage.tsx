import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ArrowLeft, 
  Filter, 
  CheckCircle, 
  Trash2, 
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Search,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

interface FilterState {
  tab: 'all' | 'unread' | 'read';
  priority: 'all' | 'urgent' | 'high' | 'medium' | 'low';
  type: 'all' | 'challenge' | 'spa' | 'tournament' | 'club' | 'system';
  search: string;
}

export const NotificationsFullPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    tab: 'all',
    priority: 'all',
    type: 'all',
    search: ''
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching notifications for user:', user.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        toast.error('Lỗi khi tải thông báo: ' + error.message);
        return;
      }

      console.log('✅ Fetched notifications:', data?.length || 0);
      setNotifications((data as unknown as Notification[]) || []);
    } catch (error) {
      console.error('❌ Exception fetching notifications:', error);
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Lỗi khi đánh dấu đã đọc');
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Lỗi khi đánh dấu đã đọc');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting notification:', error);
        toast.error('Lỗi khi xóa thông báo');
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  // Delete selected notifications
  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', selectedNotifications)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting notifications:', error);
        toast.error('Lỗi khi xóa thông báo');
        return;
      }

      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.includes(n.id))
      );
      setSelectedNotifications([]);
      toast.success(`Đã xóa ${selectedNotifications.length} thông báo`);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate if has action URL
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  // Toggle notification selection
  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all notifications
  const selectAllNotifications = () => {
    const filteredIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(filteredIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Get notification icon
  const getNotificationIcon = (type: string, icon: string) => {
    const iconMap: Record<string, string> = {
      'challenge_created': '🏆',
      'challenge_received': '⚔️',
      'challenge_accepted': '✅',
      'challenge_declined': '❌',
      'open_challenge_joined': '🎉',
      'match_reminder_1h': '⏰',
      'result_submitted': '📊',
      'spa_transfer': '💰',
      'club_approved': '🏢',
    };

    return iconMap[type] || '🔔';
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Tab filter
    if (filters.tab === 'unread' && notification.is_read) return false;
    if (filters.tab === 'read' && !notification.is_read) return false;

    // Priority filter
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;

    // Type filter
    if (filters.type !== 'all') {
      const typeMap: Record<string, string[]> = {
        'challenge': ['challenge_created', 'challenge_received', 'challenge_accepted', 'challenge_declined', 'open_challenge_joined'],
        'spa': ['spa_transfer'],
        'tournament': ['tournament_created', 'tournament_started'],
        'club': ['club_approved', 'club_rejected'],
        'system': ['system_maintenance', 'system_update']
      };
      
      const allowedTypes = typeMap[filters.type] || [];
      if (!allowedTypes.includes(notification.type)) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Stats
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const totalCount = notifications.length;

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('notifications_page_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for important notifications
          if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Đăng nhập để xem thông báo</h3>
            <p className="text-muted-foreground mb-4">
              Bạn cần đăng nhập để xem danh sách thông báo của mình.
            </p>
            <Button onClick={() => navigate('/auth/login')}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:hidden">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Thông báo</h1>
              <p className="text-sm text-muted-foreground">
                {totalCount} thông báo • {unreadCount} chưa đọc
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={markAllAsRead} disabled={unreadCount === 0}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đánh dấu tất cả đã đọc
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={deleteSelectedNotifications}
                  disabled={selectedNotifications.length === 0}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa đã chọn ({selectedNotifications.length})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={selectAllNotifications}>
                  Chọn tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearSelection}>
                  Bỏ chọn tất cả
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thông báo..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <Tabs 
            value={filters.tab} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, tab: value as any }))}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                Tất cả
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Chưa đọc
                <Badge variant="destructive" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                Đã đọc
                <Badge variant="outline" className="ml-1 text-xs">
                  {totalCount - unreadCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Filter className="w-4 h-4 mr-1" />
                  Mức độ
                  {filters.priority !== 'all' && (
                    <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                  )}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  Loại
                  {filters.type !== 'all' && (
                    <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}>
                  Tất cả loại
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'challenge' }))}>
                  🏆 Thách đấu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'spa' }))}>
                  💰 SPA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'club' }))}>
                  🏢 Club
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'system' }))}>
                  ⚙️ Hệ thống
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Đang tải thông báo...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">
              {filters.tab === 'unread' ? 'Không có thông báo chưa đọc' : 
               filters.search ? 'Không tìm thấy kết quả' : 'Không có thông báo'}
            </h3>
            <p className="text-muted-foreground text-center text-sm mb-4">
              {filters.tab === 'unread' ? 'Tất cả thông báo đã được đọc' :
               filters.search ? 'Thử tìm kiếm với từ khóa khác' : 'Thông báo sẽ xuất hiện ở đây khi có hoạt động mới'}
            </p>
            
            {/* Debug info */}
            {totalCount === 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mt-4 max-w-sm text-center">
                <p><strong>Debug Info:</strong></p>
                <p>User ID: {user?.id?.slice(0, 8)}...</p>
                <p>Total notifications: {totalCount}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p className="mt-2 text-blue-600">
                  💡 Tip: Tạo thách đấu hoặc tham gia activities để nhận thông báo
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={async () => {
                      try {
                        const testNotification = {
                          id: crypto.randomUUID(),
                          user_id: user.id,
                          type: 'test_notification',
                          title: '🧪 Test Notification',
                          message: 'Đây là thông báo test được tạo từ trang notifications.',
                          icon: 'bell',
                          priority: 'medium',
                          is_read: false,
                          created_at: new Date().toISOString()
                        };
                        
                        const { error } = await supabase
                          .from('notifications')
                          .insert([testNotification]);
                        
                        if (error) {
                          toast.error('Lỗi tạo test notification: ' + error.message);
                        } else {
                          toast.success('Đã tạo test notification!');
                          fetchNotifications();
                        }
                      } catch (err) {
                        toast.error('Lỗi tạo test notification');
                      }
                    }}
                  >
                    🧪 Tạo Test Notification
                  </Button>
                )}
              </div>
            )}
            
            {(filters.search || filters.priority !== 'all' || filters.type !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setFilters({ tab: 'all', priority: 'all', type: 'all', search: '' })}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors relative ${
                  !notification.is_read 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-muted/50'
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  {/* Selection checkbox */}
                  <input
                    type="checkbox"
                    className="absolute top-3 left-3 z-10"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectNotification(notification.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex items-start gap-3 ml-6">
                    <div className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-sm leading-5">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 leading-5">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.is_read && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Đánh dấu đã đọc
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsFullPage;
