
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ClubProfileForm from '@/components/ClubProfileForm';
import ClubSettings from '@/components/ClubSettings';

const ClubSettingsTab = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Đăng xuất thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-heading-primary'>
            Cài đặt & Hồ sơ
          </h2>
          <p className='text-muted-foreground'>
            Quản lý thông tin câu lạc bộ và cấu hình hệ thống
          </p>
        </div>
        <Button
          variant='outline'
          onClick={handleLogout}
          className='text-error-600 border-error-200 hover:bg-error-50'
        >
          <LogOut className='w-4 h-4 mr-2' />
          Đăng xuất
        </Button>
      </div>

      <Tabs defaultValue='profile' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile' className='flex items-center gap-2'>
            <Building className='w-4 h-4' />
            Thông tin CLB
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Settings className='w-4 h-4' />
            Cài đặt nâng cao
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <ClubProfileForm />
        </TabsContent>

        <TabsContent value='settings'>
          <ClubSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubSettingsTab;
