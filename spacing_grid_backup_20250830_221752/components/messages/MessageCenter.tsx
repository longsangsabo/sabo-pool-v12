import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Send, 
  Search, 
  Archive, 
  Trash2,
  Settings,
  Plus,
  MessageSquare,
  Inbox,
  RefreshCw,
  Filter,
  BarChart3
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import MessageList from './MessageList';
import ComposeMessage from './ComposeMessage';
import MessageSearch from './MessageSearch';
import MessageStats from './MessageStats';
import NotificationSettings from './NotificationSettings';

const MessageCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    messages, 
    sentMessages,
    archivedMessages,
    deletedMessages,
    unreadCount,
    stats,
    isLoading,
    error,
    refreshMessages,
    fetchSentMessages,
    fetchArchivedMessages,
    fetchDeletedMessages
  } = useMessages();

  // Add safe defaults to prevent undefined errors
  const safeMessages = messages || [];
  const safeSentMessages = sentMessages || [];
  const safeArchivedMessages = archivedMessages || [];
  const safeDeletedMessages = deletedMessages || [];

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMessages();
    
    // Refresh other tabs based on current active tab
    switch (activeTab) {
      case 'sent':
        await fetchSentMessages();
        break;
      case 'archive':
        await fetchArchivedMessages();
        break;
      case 'trash':
        await fetchDeletedMessages();
        break;
    }
    
    setRefreshing(false);
  };

  // Load data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'sent':
        if (safeSentMessages.length === 0) fetchSentMessages();
        break;
      case 'archive':
        if (safeArchivedMessages.length === 0) fetchArchivedMessages();
        break;
      case 'trash':
        if (safeDeletedMessages.length === 0) fetchDeletedMessages();
        break;
    }
  }, [activeTab, safeSentMessages.length, safeArchivedMessages.length, safeDeletedMessages.length, fetchSentMessages, fetchArchivedMessages, fetchDeletedMessages]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Hộp thư</h1>
            <p className="text-muted-foreground">Quản lý tin nhắn và thông báo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Soạn tin
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-body-small">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Inbox className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-body-small text-muted-foreground">Tổng tin nhắn</p>
                <p className="text-heading-bold">{stats.total_messages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-body-small text-muted-foreground">Chưa đọc</p>
                <p className="text-heading-bold text-red-500">{stats.unread_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-body-small text-muted-foreground">Đã gửi</p>
                <p className="text-heading-bold">{stats.sent_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-body-small text-muted-foreground">Lưu trữ</p>
                <p className="text-heading-bold">{stats.archived_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Center Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span>Hộp thư đến</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Đã gửi</span>
          </TabsTrigger>
          
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Tìm kiếm</span>
          </TabsTrigger>
          
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span>Lưu trữ</span>
          </TabsTrigger>
          
          <TabsTrigger value="trash" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Thùng rác</span>
          </TabsTrigger>
          
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Thống kê</span>
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Hộp thư đến
                <Badge variant="secondary">{safeMessages.length}</Badge>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount} chưa đọc</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MessageList 
                messages={safeMessages} 
                isLoading={isLoading}
                onRefresh={handleRefresh}
                type="inbox"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Tin đã gửi
                <Badge variant="secondary">{safeSentMessages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MessageList 
                messages={safeSentMessages} 
                isLoading={isLoading}
                type="sent"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <MessageSearch />
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Tin đã lưu trữ
                <Badge variant="secondary">{safeArchivedMessages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeArchivedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Chưa có tin nhắn được lưu trữ</p>
                </div>
              ) : (
                <MessageList 
                  messages={safeArchivedMessages} 
                  isLoading={isLoading}
                  type="archive"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trash Tab */}
        <TabsContent value="trash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Thùng rác
                <Badge variant="secondary">{safeDeletedMessages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeDeletedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Thùng rác trống</p>
                </div>
              ) : (
                <MessageList 
                  messages={safeDeletedMessages} 
                  isLoading={isLoading}
                  type="trash"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <MessageStats stats={stats} />
        </TabsContent>
      </Tabs>

      {/* Compose Message Modal */}
      {showCompose && (
        <ComposeMessage 
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          onSent={() => {
            setShowCompose(false);
            handleRefresh();
          }}
        />
      )}

      {/* Notification Settings Modal */}
      {showSettings && (
        <NotificationSettings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default MessageCenter;
