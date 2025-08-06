import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Download,
  Trash2,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const EnhancedSettingsPage = () => {
  const { user, signOut } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    tournaments: true,
    challenges: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    statsVisible: true,
    onlineStatus: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  });

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Đăng xuất thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const handleSaveSettings = () => {
    toast.success('Cài đặt đã được lưu');
  };

  const handleChangePassword = () => {
    toast.info('Tính năng đổi mật khẩu sắp có');
  };

  const handleExportData = () => {
    toast.info('Tính năng xuất dữ liệu sắp có');
  };

  const handleDeleteAccount = () => {
    toast.error('Tính năng xóa tài khoản cần xác nhận bổ sung');
  };

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>Vui lòng đăng nhập để truy cập cài đặt</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header with Logout Button */}
      <div className='bg-white border-b border-gray-200 px-4 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-gray-900'>Cài đặt</h1>
          <Button
            variant='outline'
            size='sm'
            onClick={handleLogout}
            className='text-red-600 border-red-200 hover:bg-red-50'
          >
            <LogOut className='w-4 h-4 mr-2' />
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className='p-4 max-w-4xl mx-auto'>
        <Tabs defaultValue='profile' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='profile' className='flex items-center gap-2'>
              <User className='w-4 h-4' />
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger value='notifications' className='flex items-center gap-2'>
              <Bell className='w-4 h-4' />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value='privacy' className='flex items-center gap-2'>
              <Shield className='w-4 h-4' />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value='account' className='flex items-center gap-2'>
              <Settings className='w-4 h-4' />
              Tài khoản
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value='profile' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Thông tin cá nhân</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLogout}
                    className='text-red-600 hover:bg-red-50'
                  >
                    <LogOut className='w-4 h-4 mr-2' />
                    Đăng xuất
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={user?.email || ''}
                    disabled
                    className='bg-gray-50'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='display-name'>Tên hiển thị</Label>
                  <Input
                    id='display-name'
                    value={user?.user_metadata?.display_name || ''}
                    placeholder='Nhập tên hiển thị'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Số điện thoại</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='Nhập số điện thoại'
                  />
                </div>
                <Button onClick={handleSaveSettings} className='w-full'>
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value='notifications' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Cài đặt thông báo</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLogout}
                    className='text-red-600 hover:bg-red-50'
                  >
                    <LogOut className='w-4 h-4 mr-2' />
                    Đăng xuất
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='push-notifications'>Thông báo push</Label>
                      <p className='text-sm text-gray-500'>
                        Nhận thông báo về thách đấu và giải đấu
                      </p>
                    </div>
                    <Switch
                      id='push-notifications'
                      checked={notifications.push}
                      onCheckedChange={checked =>
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='email-notifications'>Thông báo email</Label>
                      <p className='text-sm text-gray-500'>
                        Nhận email về hoạt động quan trọng
                      </p>
                    </div>
                    <Switch
                      id='email-notifications'
                      checked={notifications.email}
                      onCheckedChange={checked =>
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='sms-notifications'>Thông báo SMS</Label>
                      <p className='text-sm text-gray-500'>
                        Nhận tin nhắn về trận đấu sắp diễn ra
                      </p>
                    </div>
                    <Switch
                      id='sms-notifications'
                      checked={notifications.sms}
                      onCheckedChange={checked =>
                        setNotifications(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='tournament-notifications'>Thông báo giải đấu</Label>
                      <p className='text-sm text-gray-500'>
                        Nhận thông tin về giải đấu mới
                      </p>
                    </div>
                    <Switch
                      id='tournament-notifications'
                      checked={notifications.tournaments}
                      onCheckedChange={checked =>
                        setNotifications(prev => ({ ...prev, tournaments: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='challenge-notifications'>Thông báo thách đấu</Label>
                      <p className='text-sm text-gray-500'>
                        Nhận thông báo khi có thách đấu mới
                      </p>
                    </div>
                    <Switch
                      id='challenge-notifications'
                      checked={notifications.challenges}
                      onCheckedChange={checked =>
                        setNotifications(prev => ({ ...prev, challenges: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='marketing-notifications'>Thông báo khuyến mãi</Label>
                      <p className='text-sm text-gray-500'>
                        Nhận thông tin về ưu đãi và sự kiện
                      </p>
                    </div>
                    <Switch
                      id='marketing-notifications'
                      checked={notifications.marketing}
                      onCheckedChange={checked =>
                        setNotifications(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className='w-full'>
                  Lưu cài đặt thông báo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value='privacy' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Bảo mật & Quyền riêng tư</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLogout}
                    className='text-red-600 hover:bg-red-50'
                  >
                    <LogOut className='w-4 h-4 mr-2' />
                    Đăng xuất
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-sm font-medium text-gray-900'>Quyền riêng tư</h3>
                  
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='public-profile'>Hồ sơ công khai</Label>
                      <p className='text-sm text-gray-500'>
                        Cho phép người khác xem hồ sơ của bạn
                      </p>
                    </div>
                    <Switch
                      id='public-profile'
                      checked={privacy.profileVisible}
                      onCheckedChange={checked =>
                        setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='stats-visible'>Hiển thị thống kê</Label>
                      <p className='text-sm text-gray-500'>
                        Cho phép người khác xem thống kê trận đấu
                      </p>
                    </div>
                    <Switch
                      id='stats-visible'
                      checked={privacy.statsVisible}
                      onCheckedChange={checked =>
                        setPrivacy(prev => ({ ...prev, statsVisible: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='online-status'>Trạng thái online</Label>
                      <p className='text-sm text-gray-500'>
                        Hiển thị khi bạn đang online
                      </p>
                    </div>
                    <Switch
                      id='online-status'
                      checked={privacy.onlineStatus}
                      onCheckedChange={checked =>
                        setPrivacy(prev => ({ ...prev, onlineStatus: checked }))
                      }
                    />
                  </div>
                </div>

                <hr />

                <div className='space-y-4'>
                  <h3 className='text-sm font-medium text-gray-900'>Bảo mật</h3>
                  
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='two-factor'>Xác thực hai bước</Label>
                      <p className='text-sm text-gray-500'>
                        Tăng cường bảo mật cho tài khoản
                      </p>
                    </div>
                    <Switch
                      id='two-factor'
                      checked={security.twoFactor}
                      onCheckedChange={checked =>
                        setSecurity(prev => ({ ...prev, twoFactor: checked }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='login-alerts'>Cảnh báo đăng nhập</Label>
                      <p className='text-sm text-gray-500'>
                        Thông báo khi có đăng nhập từ thiết bị mới
                      </p>
                    </div>
                    <Switch
                      id='login-alerts'
                      checked={security.loginAlerts}
                      onCheckedChange={checked =>
                        setSecurity(prev => ({ ...prev, loginAlerts: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className='w-full'>
                  Lưu cài đặt bảo mật
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value='account' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Quản lý tài khoản</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLogout}
                    className='text-red-600 hover:bg-red-50'
                  >
                    <LogOut className='w-4 h-4 mr-2' />
                    Đăng xuất
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-900'>Thao tác tài khoản</h3>
                  
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={handleChangePassword}
                  >
                    <Lock className='w-4 h-4 mr-3' />
                    Đổi mật khẩu
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={handleExportData}
                  >
                    <Download className='w-4 h-4 mr-3' />
                    Xuất dữ liệu cá nhân
                  </Button>

                  <Button
                    variant='destructive'
                    className='w-full justify-start'
                    onClick={handleLogout}
                  >
                    <LogOut className='w-4 h-4 mr-3' />
                    Đăng xuất khỏi tài khoản
                  </Button>
                </div>

                <hr />

                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-red-600'>Vùng nguy hiểm</h3>
                  <p className='text-sm text-gray-500'>
                    Các thao tác này không thể hoàn tác
                  </p>
                  
                  <Button
                    variant='destructive'
                    className='w-full justify-start'
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className='w-4 h-4 mr-3' />
                    Xóa tài khoản vĩnh viễn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedSettingsPage;
