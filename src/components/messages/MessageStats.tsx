import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Mail, 
  Send, 
  Archive, 
  Trash2,
  Clock,
  TrendingUp,
  MessageSquare,
  Users,
  Settings
} from 'lucide-react';
import { MessageStats as MessageStatsType } from '@/types/message';

interface MessageStatsProps {
  stats: MessageStatsType;
}

export const MessageStats: React.FC<MessageStatsProps> = ({ stats }) => {
  // Calculate percentages
  const readPercentage = stats.total_messages > 0 
    ? ((stats.total_messages - stats.unread_count) / stats.total_messages) * 100 
    : 0;
  
  const unreadPercentage = stats.total_messages > 0 
    ? (stats.unread_count / stats.total_messages) * 100 
    : 0;

  const archivedPercentage = stats.total_messages > 0 
    ? (stats.archived_count / stats.total_messages) * 100 
    : 0;

  const systemMessagePercentage = stats.total_messages > 0 
    ? (stats.system_messages / stats.total_messages) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tin nhắn</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_messages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chưa đọc</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã gửi</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Archive className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lưu trữ</p>
                <p className="text-2xl font-bold text-orange-600">{stats.archived_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thống kê đọc tin nhắn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Đã đọc</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {stats.total_messages - stats.unread_count}
                  </span>
                  <Badge variant="secondary">
                    {readPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={readPercentage} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Chưa đọc</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {stats.unread_count}
                  </span>
                  <Badge variant="destructive">
                    {unreadPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={unreadPercentage} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Đã lưu trữ</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {stats.archived_count}
                  </span>
                  <Badge variant="outline">
                    {archivedPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={archivedPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Message Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Phân loại tin nhắn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Tin nhắn cá nhân</span>
                </div>
                <Badge variant="secondary">
                  {stats.total_messages - stats.system_messages}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Tin nhắn hệ thống</span>
                </div>
                <Badge variant="secondary">
                  {stats.system_messages}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tỷ lệ tin nhắn hệ thống</span>
                  <Badge variant="outline">
                    {systemMessagePercentage.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={systemMessagePercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tóm tắt hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {stats.total_messages > 0 ? ((stats.total_messages - stats.unread_count) / stats.total_messages * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Tỷ lệ đọc tin nhắn</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {stats.sent_count}
              </div>
              <p className="text-sm text-muted-foreground">Tin nhắn đã gửi</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                {stats.total_messages > 0 ? (stats.archived_count / stats.total_messages * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Tỷ lệ lưu trữ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Khuyến nghị</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.unread_count > 10 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Bạn có {stats.unread_count} tin nhắn chưa đọc</p>
                  <p className="text-xs text-muted-foreground">
                    Nên đọc và xử lý các tin nhắn quan trọng
                  </p>
                </div>
              </div>
            )}

            {stats.archived_count === 0 && stats.total_messages > 20 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Archive className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Chưa có tin nhắn nào được lưu trữ</p>
                  <p className="text-xs text-muted-foreground">
                    Hãy lưu trữ các tin nhắn cũ để giữ hộp thư gọn gàng
                  </p>
                </div>
              </div>
            )}

            {stats.total_messages === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Hộp thư trống</p>
                  <p className="text-xs text-muted-foreground">
                    Hãy bắt đầu gửi tin nhắn đầu tiên!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageStats;
