import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Mail,
  Inbox,
  Archive,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Check,
  CheckCheck,
  RotateCcw,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUnifiedMessages } from '@/hooks/useUnifiedMessages';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';

const InboxPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('unread');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    unreadMessages,
    systemMessages,
    unreadCount,
    isConnected,
    markAsRead,
    deleteMessage,
    refreshMessages,
    isLoading: loading,
    error
  } = useUnifiedMessages();

  // Map unified messages to notification format for compatibility
  const notifications = unreadMessages;
  const deletedNotifications: any[] = []; // Would be fetched from deletedMessages
  const markAllAsRead = async () => {
    // Implementation would use markMultipleAsRead
  };
  const deleteNotification = deleteMessage;
  const restoreNotification = async (id: string) => {}; // Placeholder
  const permanentlyDeleteNotification = async (id: string) => {}; // Placeholder
  const getUnreadCount = () => unreadCount;
  const getReadCount = () => 0; // Would calculate from stats
  const getDeletedCount = () => 0; // Would calculate from deletedMessages
  const fetchNotifications = refreshMessages;

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'challenge_received':
      case 'challenge_accepted':
      case 'challenge_declined':
        return '🎯';
      case 'match_reminder':
      case 'match_completed':
        return '🎱';
      case 'tournament_registration':
      case 'tournament_started':
        return '🏆';
      case 'club_approved':
      case 'club_rejected':
        return '🏢';
      case 'rank_verification':
      case 'rank_verification_approved':
      case 'rank_verification_rejected':
        return '⭐';
      case 'system':
        return '⚙️';
      case 'welcome':
        return '👋';
      default:
        return '📧';
    }
  };

  const getStatusBadge = (notification: any) => {
    if (!notification.read_at) {
      return (
        <Badge
          variant='secondary'
          className='bg-primary-100 text-primary-800 text-xs'
        >
          <Clock className='w-3 h-3 mr-1' />
          Chưa đọc
        </Badge>
      );
    }
    return (
      <Badge variant='outline' className='text-xs text-neutral-500'>
        <Check className='w-3 h-3 mr-1' />
        Đã đọc
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return (
        <Badge variant='destructive' className='text-xs'>
          <AlertCircle className='w-3 h-3 mr-1' />
          Quan trọng
        </Badge>
      );
    }
    return null;
  };

  const getCurrentNotifications = () => {
    let currentList = [];

    switch (activeTab) {
      case 'unread':
        currentList = notifications.filter(n => !n.read_at);
        break;
      case 'read':
        currentList = notifications.filter(n => n.read_at);
        break;
      case 'deleted':
        currentList = deletedNotifications;
        break;
      default:
        currentList = notifications;
    }

    if (searchQuery) {
      currentList = currentList.filter(
        notification =>
          notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return currentList;
  };

  const handleMessageClick = (notification: any) => {
    setSelectedMessage(notification);
    if (!notification.read_at && activeTab !== 'deleted') {
      markAsRead(notification.id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchNotifications();
      toast.success('Đã làm mới hộp thư');
    } catch (error) {
      toast.error('Không thể làm mới hộp thư');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả là đã đọc');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteNotification(messageId);
      toast.success('Đã chuyển tin nhắn vào thùng rác');
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const handleRestoreMessage = async (messageId: string) => {
    try {
      await restoreNotification(messageId);
      toast.success('Đã khôi phục tin nhắn');
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Không thể khôi phục tin nhắn');
    }
  };

  const handlePermanentDelete = async (messageId: string) => {
    try {
      await permanentlyDeleteNotification(messageId);
      toast.success('Đã xóa vĩnh viễn tin nhắn');
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Không thể xóa vĩnh viễn tin nhắn');
    }
  };

  const filteredMessages = getCurrentNotifications();

  return (
    <>
      <Helmet>
        <title>Hộp thư - SABO Billiards</title>
        <meta
          name='description'
          content='Quản lý tin nhắn và thông báo hệ thống'
        />
      </Helmet>

      <PageLayout variant='dashboard'>
        <div className='bg-gradient-to-br from-green-50 to-blue-50 p-8 -m-6 min-h-screen'>
          {/* Enhanced Header */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white'>
                  <Mail className='w-7 h-7' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-neutral-900'>
                    Hộp thư thông minh
                  </h1>
                  <p className='text-neutral-600 mt-1'>
                    Quản lý tin nhắn và thông báo một cách hiệu quả
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    isConnected
                      ? 'bg-success-100 text-success-700 border border-success-200'
                      : 'bg-error-100 text-error-700 border border-error-200'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      isConnected ? 'bg-success-500' : 'bg-error-500'
                    }`}
                  />
                  {isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}
                </div>

                <Button
                  variant='outline'
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className='hover:bg-primary-50 hover:border-primary-300 transition-all'
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Làm mới
                </Button>

                <Button
                  variant='outline'
                  onClick={handleMarkAllAsRead}
                  className='hover:bg-success-50 hover:border-success-300 transition-all'
                >
                  <CheckCheck className='w-4 h-4 mr-2' />
                  Đọc tất cả
                </Button>
              </div>
            </div>

            {/* Enhanced Search */}
            <div className='flex items-center gap-4 mb-6'>
              <div className='relative flex-1 max-w-lg'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <Input
                  placeholder='Tìm kiếm trong tin nhắn...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-12 h-12 border-2 border-neutral-200 focus:border-blue-500 transition-all'
                />
              </div>
              <Button variant='outline' size='lg' className='h-12'>
                <Filter className='w-4 h-4 mr-2' />
                Bộ lọc
              </Button>
            </div>

            {/* Enhanced Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-3 h-12 bg-neutral-100 rounded-xl p-1'>
                <TabsTrigger
                  value='unread'
                  className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all'
                >
                  <EyeOff className='w-4 h-4 mr-2' />
                  Chưa đọc ({getUnreadCount()})
                </TabsTrigger>
                <TabsTrigger
                  value='read'
                  className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all'
                >
                  <Eye className='w-4 h-4 mr-2' />
                  Đã đọc ({getReadCount()})
                </TabsTrigger>
                <TabsTrigger
                  value='deleted'
                  className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Đã xóa ({getDeletedCount()})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Enhanced Messages List */}
            <div className='lg:col-span-1'>
              <Card className='shadow-lg border-0'>
                <CardHeader className='pb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg'>
                  <CardTitle className='text-lg flex items-center justify-between'>
                    <span>Danh sách tin nhắn</span>
                    <Badge variant='outline' className='ml-2'>
                      {filteredMessages.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <ScrollArea className='h-[600px]'>
                    {loading ? (
                      <div className='flex items-center justify-center py-12'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                      </div>
                    ) : error ? (
                      <div className='text-center py-12 text-red-500'>
                        <AlertCircle className='w-12 h-12 mx-auto mb-4' />
                        <p>{error}</p>
                      </div>
                    ) : filteredMessages.length === 0 ? (
                      <div className='text-center py-12 text-neutral-500'>
                        <Inbox className='w-16 h-16 mx-auto mb-4 opacity-50' />
                        <p className='text-lg font-medium mb-2'>
                          Không có tin nhắn
                        </p>
                        <p className='text-sm'>
                          {activeTab === 'unread' &&
                            'Bạn đã đọc tất cả tin nhắn!'}
                          {activeTab === 'read' && 'Chưa có tin nhắn đã đọc'}
                          {activeTab === 'deleted' && 'Thùng rác đang trống'}
                        </p>
                      </div>
                    ) : (
                      <div className='divide-y divide-gray-100'>
                        {filteredMessages.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 cursor-pointer hover:bg-neutral-50 transition-all duration-200 ${
                              !notification.read_at && activeTab !== 'deleted'
                                ? 'bg-primary-50 border-l-4 border-l-blue-500'
                                : ''
                            } ${
                              selectedMessage?.id === notification.id
                                ? 'bg-primary-100 shadow-inner'
                                : ''
                            }`}
                            onClick={() => handleMessageClick(notification)}
                          >
                            <div className='flex items-start gap-3'>
                              <div className='text-2xl'>
                                {getMessageIcon(notification.type)}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <h4
                                    className={`font-medium text-sm truncate ${
                                      !notification.read_at &&
                                      activeTab !== 'deleted'
                                        ? 'text-neutral-900'
                                        : 'text-neutral-700'
                                    }`}
                                  >
                                    {notification.title}
                                  </h4>
                                  {getPriorityBadge(notification.priority)}
                                </div>

                                <p className='text-sm text-neutral-600 line-clamp-2 mb-3'>
                                  {notification.message}
                                </p>

                                <div className='flex items-center justify-between'>
                                  <span className='text-xs text-neutral-500'>
                                    {formatDistanceToNow(
                                      new Date(notification.created_at),
                                      {
                                        addSuffix: true,
                                        locale: vi,
                                      }
                                    )}
                                  </span>

                                  <div className='flex items-center gap-2'>
                                    {getStatusBadge(notification)}
                                    {!notification.read_at &&
                                      activeTab !== 'deleted' && (
                                        <div className='w-2 h-2 bg-primary-500 rounded-full animate-pulse'></div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Message Detail */}
            <div className='lg:col-span-2'>
              <Card className='h-full shadow-lg border-0'>
                {selectedMessage ? (
                  <>
                    <CardHeader className='border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          <div className='text-4xl'>
                            {getMessageIcon(selectedMessage.type)}
                          </div>
                          <div>
                            <CardTitle className='flex items-center gap-3 text-xl'>
                              {selectedMessage.title}
                              {getPriorityBadge(selectedMessage.priority)}
                              {getStatusBadge(selectedMessage)}
                            </CardTitle>
                            <p className='text-sm text-neutral-500 mt-2'>
                              {formatDistanceToNow(
                                new Date(selectedMessage.created_at),
                                {
                                  addSuffix: true,
                                  locale: vi,
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          {activeTab === 'deleted' ? (
                            <>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleRestoreMessage(selectedMessage.id)
                                }
                                className='hover:bg-success-50 hover:border-success-300'
                              >
                                <RotateCcw className='w-4 h-4 mr-1' />
                                Khôi phục
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() =>
                                  handlePermanentDelete(selectedMessage.id)
                                }
                              >
                                <Trash2 className='w-4 h-4 mr-1' />
                                Xóa vĩnh viễn
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant='outline'
                                size='sm'
                                className='hover:bg-neutral-50'
                              >
                                <Archive className='w-4 h-4' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleDeleteMessage(selectedMessage.id)
                                }
                                className='hover:bg-error-50 hover:border-red-300'
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='outline' size='sm'>
                                    <MoreVertical className='w-4 h-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem>
                                    <Check className='w-4 h-4 mr-2' />
                                    Đánh dấu đã đọc
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Archive className='w-4 h-4 mr-2' />
                                    Lưu trữ
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className='text-error-600'>
                                    <Trash2 className='w-4 h-4 mr-2' />
                                    Xóa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className='p-6'>
                      <ScrollArea className='h-[500px]'>
                        <div className='prose max-w-none'>
                          <div className='text-neutral-700 leading-relaxed text-base mb-6'>
                            {selectedMessage.message}
                          </div>

                          {selectedMessage.metadata &&
                            Object.keys(selectedMessage.metadata).length >
                              0 && (
                              <div className='bg-neutral-50 rounded-lg p-4 mb-6'>
                                <h4 className='font-medium mb-3 text-neutral-900'>
                                  Chi tiết bổ sung
                                </h4>
                                <div className='space-y-2'>
                                  {Object.entries(selectedMessage.metadata).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className='flex justify-between text-sm'
                                      >
                                        <span className='font-medium text-neutral-600 capitalize'>
                                          {key.replace(/_/g, ' ')}:
                                        </span>
                                        <span className='text-neutral-800'>
                                          {typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {selectedMessage.action_url && (
                            <div className='mt-6'>
                              <Button asChild size='lg' className='w-full'>
                                <a href={selectedMessage.action_url}>
                                  Xem chi tiết →
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className='flex items-center justify-center h-full'>
                    <div className='text-center text-neutral-500'>
                      <Mail className='w-20 h-20 mx-auto mb-6 opacity-30' />
                      <h3 className='text-xl font-medium mb-3'>
                        Chọn một tin nhắn
                      </h3>
                      <p className='text-gray-400'>
                        Chọn một tin nhắn từ danh sách bên trái để xem chi tiết
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default InboxPage;
