import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const TestNotificationButton: React.FC = () => {
  const { user } = useAuth();

  const createTestNotification = async (type: string, priority: string, title: string, message: string) => {
    if (!user?.id) {
      toast.error('Bạn cần đăng nhập để tạo test notification');
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: type,
          title: title,
          message: message,
          priority: priority,
          is_read: false,
          action_url: type === 'challenge' ? '/player/challenges' : 
                     type === 'tournament' ? '/player/tournaments' : 
                     type === 'spa_transfer' ? '/player/spa' : null,
        });

      if (error) throw error;
      
      toast.success(`Đã tạo test notification: ${title}`);
    } catch (err: any) {
      console.error('Error creating test notification:', err);
      toast.error('Lỗi khi tạo test notification');
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Vui lòng đăng nhập để test notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>🧪 Test Unified Notifications</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click các button để tạo test notifications và kiểm tra hệ thống
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={() => createTestNotification(
            'challenge',
            'high',
            'Thách đấu mới!',
            'Bạn nhận được thách đấu từ người chơi khác. Hãy xem chi tiết và quyết định chấp nhận hay từ chối.'
          )}
          className="w-full"
          variant="outline"
        >
          🏆 Tạo Challenge Notification
        </Button>

        <Button
          onClick={() => createTestNotification(
            'spa_transfer',
            'normal',
            'Chuyển SPA thành công!',
            'Bạn đã nhận được 50 điểm SPA từ việc thắng thách đấu. Tổng SPA hiện tại: 1250 điểm.'
          )}
          className="w-full"
          variant="outline"
        >
          💰 Tạo SPA Transfer Notification
        </Button>

        <Button
          onClick={() => createTestNotification(
            'tournament',
            'urgent',
            'Giải đấu sắp bắt đầu!',
            'Giải đấu "SABO Championship 2025" sẽ bắt đầu trong 30 phút. Vui lòng chuẩn bị sẵn sàng.'
          )}
          className="w-full"
          variant="outline"
        >
          🏅 Tạo Tournament Notification (Urgent)
        </Button>

        <Button
          onClick={() => createTestNotification(
            'system',
            'normal',
            'Cập nhật hệ thống',
            'Hệ thống notification tích hợp đã được cập nhật. Bây giờ bạn có thể xem tất cả thông báo ở một nơi.'
          )}
          className="w-full"
          variant="outline"
        >
          🔧 Tạo System Notification
        </Button>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">
            💡 Tip: Sau khi tạo notification, kiểm tra:
          </p>
          <ul className="text-xs text-blue-600 mt-1 space-y-1">
            <li>• Bell icon ở header (số badge sẽ tăng)</li>
            <li>• Click vào bell để xem dropdown</li>
            <li>• Navigate đến /player/notifications</li>
            <li>• Test mark as read và delete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestNotificationButton;
