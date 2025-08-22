import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Menu, 
  Shield, 
  Home, 
  Sun, 
  Moon,
  Settings,
  LogOut,
  Search,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminMobileHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
}

export const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({
  title = 'SABO Admin',
  onMenuClick,
  showSearch = true,
  showProfile = true,
  showNotifications = true,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Đã đăng xuất thành công');
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Lỗi khi đăng xuất');
    }
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border lg:hidden mobile-safe-area-top'>
      <div className='flex items-center justify-between px-4 py-3'>
        {/* Left side - Menu and Title */}
        <div className='flex items-center gap-3 flex-1'>
          {onMenuClick && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onMenuClick}
              className='p-2 hover:bg-muted'
            >
              <Menu className='h-5 w-5' />
            </Button>
          )}

          <div className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-primary' />
            <h1 className='text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
              {title}
            </h1>
            <Badge
              variant='secondary'
              className='bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-0.5'
            >
              Admin
            </Badge>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className='flex items-center gap-2'>
          {/* Search Button */}
          {showSearch && (
            <Button
              variant='ghost'
              size='sm'
              className='p-2 hover:bg-muted'
              onClick={() => toast.info('Tìm kiếm đang phát triển')}
            >
              <Search className='h-4 w-4' />
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant='ghost'
              size='sm'
              className='p-2 hover:bg-muted relative'
              onClick={() => navigate('/admin/notifications')}
            >
              <Bell className='h-4 w-4' />
              <div className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse' />
            </Button>
          )}

          {/* Profile Menu */}
          {showProfile && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='p-1 rounded-full'>
                  <Avatar className='h-8 w-8 border-2 border-primary/20'>
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                    <AvatarFallback className='text-xs font-bold bg-gradient-to-br from-primary to-blue-600 text-white'>
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <div className='px-3 py-2 border-b'>
                  <p className='text-sm font-medium'>{user?.email}</p>
                  <p className='text-xs text-muted-foreground'>Administrator</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Home className='mr-2 h-4 w-4' />
                  Về Trang Player
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className='mr-2 h-4 w-4' />
                  Cài Đặt Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'dark' ? (
                    <Sun className='mr-2 h-4 w-4' />
                  ) : (
                    <Moon className='mr-2 h-4 w-4' />
                  )}
                  {theme === 'dark' ? 'Chế Độ Sáng' : 'Chế Độ Tối'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className='text-destructive'>
                  <LogOut className='mr-2 h-4 w-4' />
                  Đăng Xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
