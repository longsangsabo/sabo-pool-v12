import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Bell,
  Search,
  Wallet,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  showWallet?: boolean;
  onMenuClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'SABO ARENA',
  showSearch = true,
  showProfile = true,
  showNotifications = true,
  showWallet = false, // Bỏ tab ví theo yêu cầu
  onMenuClick,
}) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('wallets')
        .select('balance, points_balance')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { balance: 0, points_balance: 0 };
    },
    enabled: !!user?.id,
  });

  // Get notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .is('deleted_at', null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Đã đăng xuất thành công');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Lỗi khi đăng xuất');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden mobile-safe-area-top'>
      <div className='flex h-16 items-center px-4'>
        {/* Left section */}
        <div className='flex items-center gap-3 flex-1'>
          {onMenuClick && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onMenuClick}
              className='hover:bg-muted transition-colors'
            >
              <Menu className='w-5 h-5' />
            </Button>
          )}

          {/* Brand Logo & Title */}
          <div className='flex items-center gap-2'>
            {/* SABO Logo */}
            <div className='relative'>
              <img
                src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//logo-sabo-arena.png'
                alt='SABO ARENA Logo'
                className='w-9 h-9 object-cover rounded-full'
              />
            </div>

            {/* Title with gradient */}
            <div className='flex flex-col'>
              <h1 className='font-black text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-none tracking-tight'>
                SABO
              </h1>
              <span className='text-xs font-bold text-muted-foreground leading-none tracking-wider'>
                ARENA
              </span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className='flex items-center gap-1'>
          {/* Theme Toggle */}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className='hover:bg-muted/50 transition-colors'
          >
            {theme === 'light' ? (
              <Moon className='w-5 h-5' />
            ) : (
              <Sun className='w-5 h-5' />
            )}
          </Button>

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate('/notifications')}
              className='relative hover:bg-muted/50 transition-colors'
            >
              <Bell className='w-5 h-5' />
              {notificationCount && notificationCount > 0 && (
                <Badge
                  variant='destructive'
                  className='absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse'
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Profile Menu */}
          {showProfile && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='p-1 hover:bg-muted/50 transition-colors'
                >
                  <Avatar className='w-8 h-8 ring-2 ring-primary/20'>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'>
                      {profile?.display_name?.[0] ||
                        profile?.full_name?.[0] ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align='end'
                className='w-56 bg-background/95 backdrop-blur-sm border shadow-lg'
              >
                <div className='px-3 py-2'>
                  <p className='text-sm font-semibold'>
                    {profile?.display_name ||
                      profile?.full_name ||
                      'Người dùng'}
                  </p>
                  <p className='text-xs text-muted-foreground'>{user.email}</p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className='hover:bg-muted/50 cursor-pointer'
                >
                  <User className='w-4 h-4 mr-2' />
                  Hồ sơ cá nhân
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/wallet')}
                  className='hover:bg-muted/50 cursor-pointer'
                >
                  <Wallet className='w-4 h-4 mr-2' />
                  Ví của tôi
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/settings')}
                  className='hover:bg-muted/50 cursor-pointer'
                >
                  <Settings className='w-4 h-4 mr-2' />
                  Cài đặt
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className='hover:bg-destructive/10 text-destructive cursor-pointer'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
