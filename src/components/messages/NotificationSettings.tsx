import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Volume2, 
  VolumeX,
  Smartphone,
  Monitor,
  Settings,
  Save,
  RotateCcw,
  Shield,
  Clock,
  Filter
} from 'lucide-react';
import { NotificationSettings } from '@/types/message';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => Promise<void>;
  loading?: boolean;
}

export const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({
  settings: initialSettings,
  onSave,
  loading = false
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onSave(settings);
      setHasChanges(false);
      toast({
        title: "Đã lưu cài đặt",
        description: "Cài đặt thông báo đã được cập nhật thành công.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cài đặt. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
    toast({
      title: "Đã khôi phục",
      description: "Cài đặt đã được khôi phục về trạng thái ban đầu.",
    });
  };

  const getQuietHoursLabel = () => {
    if (settings.quiet_hours_start && settings.quiet_hours_end) {
      return `${settings.quiet_hours_start} - ${settings.quiet_hours_end}`;
    }
    return 'Không đặt';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Cài đặt thông báo
          </h2>
          <p className="text-muted-foreground">
            Tùy chỉnh cách bạn nhận thông báo về tin nhắn mới
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Khôi phục
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Thông báo qua Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Bật thông báo email</Label>
              <p className="text-sm text-muted-foreground">
                Nhận email khi có tin nhắn mới
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.email_notifications}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            />
          </div>

          {settings.email_notifications && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tin nhắn ưu tiên cao</Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo ngay lập tức cho tin nhắn quan trọng
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_priority_high}
                    onCheckedChange={(checked) => updateSetting('email_priority_high', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tóm tắt hàng ngày</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận email tóm tắt các tin nhắn trong ngày
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_digest}
                    onCheckedChange={(checked) => updateSetting('email_digest', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo đẩy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-notifications">Bật thông báo đẩy</Label>
              <p className="text-sm text-muted-foreground">
                Hiển thị thông báo trên màn hình thiết bị
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.push_notifications}
              onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
            />
          </div>

          {settings.push_notifications && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Thiết bị nhận thông báo</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={settings.push_desktop ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateSetting('push_desktop', !settings.push_desktop)}
                    >
                      <Monitor className="h-3 w-3 mr-1" />
                      Máy tính
                    </Badge>
                    <Badge 
                      variant={settings.push_mobile ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateSetting('push_mobile', !settings.push_mobile)}
                    >
                      <Smartphone className="h-3 w-3 mr-1" />
                      Di động
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Âm thanh thông báo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Phát âm thanh khi có thông báo mới
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_sound}
                    onCheckedChange={(checked) => updateSetting('push_sound', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Giờ im lặng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Bật chế độ im lặng</Label>
              <p className="text-sm text-muted-foreground">
                Tắt thông báo trong khoảng thời gian nhất định
              </p>
            </div>
            <Switch
              checked={settings.quiet_hours_enabled}
              onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
            />
          </div>

          {settings.quiet_hours_enabled && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Giờ bắt đầu</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours_start || '22:00'}
                    onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">Giờ kết thúc</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours_end || '07:00'}
                    onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Giờ im lặng hiện tại:</strong> {getQuietHoursLabel()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trong thời gian này, bạn sẽ không nhận được thông báo âm thanh và đẩy
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Message Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Chỉ tin nhắn quan trọng</Label>
                <p className="text-sm text-muted-foreground">
                  Chỉ nhận thông báo cho tin nhắn được đánh dấu quan trọng
                </p>
              </div>
              <Switch
                checked={settings.notify_important_only}
                onCheckedChange={(checked) => updateSetting('notify_important_only', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mức độ ưu tiên tối thiểu</Label>
              <Select 
                value={settings.min_priority || 'low'} 
                onValueChange={(value) => updateSetting('min_priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Tin nhắn hệ thống</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo cho tin nhắn từ hệ thống
                </p>
              </div>
              <Switch
                checked={settings.notify_system_messages}
                onCheckedChange={(checked) => updateSetting('notify_system_messages', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quyền riêng tư
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hiển thị xem trước nội dung</Label>
              <p className="text-sm text-muted-foreground">
                Hiển thị một phần nội dung tin nhắn trong thông báo
              </p>
            </div>
            <Switch
              checked={settings.show_preview}
              onCheckedChange={(checked) => updateSetting('show_preview', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hiển thị tên người gửi</Label>
              <p className="text-sm text-muted-foreground">
                Hiển thị tên người gửi trong thông báo
              </p>
            </div>
            <Switch
              checked={settings.show_sender}
              onCheckedChange={(checked) => updateSetting('show_sender', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Mobile) */}
      {hasChanges && (
        <div className="md:hidden">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsComponent;
