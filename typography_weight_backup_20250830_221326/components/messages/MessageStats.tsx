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
        <Card className="border-primary-200 bg-primary-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-body-small-muted">Tổng tin nhắn</p>
                <p className="text-heading font-bold text-primary-600">{stats.total_messages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-error-200 bg-error-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-error-100 rounded-full">
                <Clock className="h-6 w-6 text-error-600" />
              </div>
              <div>
                <p className="text-body-small-muted">Chưa đọc</p>
                <p className="text-heading font-bold text-error-600">{stats.unread_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success-200 bg-success-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-full">
                <Send className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-body-small-muted">Đã gửi</p>
                <p className="text-heading font-bold text-success-600">{stats.sent_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-warning-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-full">
                <Archive className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-body-small-muted">Lưu trữ</p>
                <p className="text-heading font-bold text-warning-600">{stats.archived_count}</p>
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
                <span className="text-body-small font-medium">Đã đọc</span>
                <div className="flex items-center gap-2">
                  <span className="text-body-small-muted">
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
                <span className="text-body-small font-medium">Chưa đọc</span>
                <div className="flex items-center gap-2">
                  <span className="text-body-small-muted">
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
                <span className="text-body-small font-medium">Đã lưu trữ</span>
                <div className="flex items-center gap-2">
                  <span className="text-body-small-muted">
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
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">Tin nhắn cá nhân</span>
                </div>
                <Badge variant="secondary">
                  {stats.total_messages - stats.system_messages}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-info-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-info-600" />
                  <span className="font-medium">Tin nhắn hệ thống</span>
                </div>
                <Badge variant="secondary">
                  {stats.system_messages}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-small font-medium">Tỷ lệ tin nhắn hệ thống</span>
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
              <div className="text-3xl font-bold text-primary-600">
                {stats.total_messages > 0 ? ((stats.total_messages - stats.unread_count) / stats.total_messages * 100).toFixed(1) : 0}%
              </div>
              <p className="text-body-small-muted">Tỷ lệ đọc tin nhắn</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-success-600">
                {stats.sent_count}
              </div>
              <p className="text-body-small-muted">Tin nhắn đã gửi</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-warning-600">
                {stats.total_messages > 0 ? (stats.archived_count / stats.total_messages * 100).toFixed(1) : 0}%
              </div>
              <p className="text-body-small-muted">Tỷ lệ lưu trữ</p>
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
              <div className="flex items-center gap-3 p-3 bg-warning-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-warning-600" />
                <div>
                  <p className="text-body-small font-medium">Bạn có {stats.unread_count} tin nhắn chưa đọc</p>
                  <p className="text-caption-muted">
                    Nên đọc và xử lý các tin nhắn quan trọng
                  </p>
                </div>
              </div>
            )}

            {stats.archived_count === 0 && stats.total_messages > 20 && (
              <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <Archive className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-body-small font-medium">Chưa có tin nhắn nào được lưu trữ</p>
                  <p className="text-caption-muted">
                    Hãy lưu trữ các tin nhắn cũ để giữ hộp thư gọn gàng
                  </p>
                </div>
              </div>
            )}

            {stats.total_messages === 0 && (
              <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-success-600" />
                <div>
                  <p className="text-body-small font-medium">Hộp thư trống</p>
                  <p className="text-caption-muted">
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
