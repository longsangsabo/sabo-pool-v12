import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Menu,
  Building,
  MoreHorizontal,
  Home,
  Moon,
  Sun,
  Settings,
  Users,
  User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClubRole } from '@/hooks/useClubRole';

interface ClubMobileHeaderProps {
  onMenuClick: () => void;
  clubProfile?: any;
}

export const ClubMobileHeader: React.FC<ClubMobileHeaderProps> = ({
  onMenuClick,
  clubProfile,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isClubOwner } = useClubRole();

  // Notification count (reuse logic similar to player)
  const { data: notificationCount } = useQuery({
    queryKey: ['club-notification-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .is('deleted_at', null);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden mobile-safe-area-top'>
      <div className='flex h-14 items-center px-3'>
        {/* Left Section */}
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onMenuClick}
            className='hover:bg-muted/50'
          >
            <Menu className='w-5 h-5' />
          </Button>

          {/* SABO Logo + Brand */}
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <img
                src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//logo-sabo-arena.png'
                alt='SABO ARENA Logo'
                className='w-8 h-8 object-cover rounded-full'
              />
            </div>
            <div className='flex flex-col leading-none'>
              <h1 className='text-sm font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-none tracking-tight'>
                SABO
              </h1>
              <span className='text-[10px] font-bold text-muted-foreground leading-none tracking-wider'>
                ARENA
              </span>
            </div>
          </div>

          {/* Club Info */}
          <div className='flex items-center gap-2 min-w-0 ml-2'>
            <div className='w-0.5 h-6 bg-border'></div>
            <div className='flex flex-col leading-none truncate'>
              <span className='text-xs font-medium text-muted-foreground truncate'>
                {clubProfile?.club_name || clubProfile?.name || 'Câu Lạc Bộ'}
              </span>
              {isClubOwner && (
                <Badge
                  variant='secondary'
                  className='h-3 px-1 text-[9px] font-medium bg-primary/15 text-primary w-fit mt-0.5'
                >
                  Owner
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Simplified */}
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate('/messages')}
            className='relative hover:bg-muted/50'
          >
            <Bell className='w-5 h-5' />
            {notificationCount && notificationCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-destructive text-[10px] leading-none text-white font-medium w-4 h-4 rounded-full flex items-center justify-center animate-pulse'>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='hover:bg-muted/50'>
                <MoreHorizontal className='w-5 h-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-52'>
              <DropdownMenuItem
                onClick={() => navigate('/dashboard')}
                className='flex items-center gap-2'
              >
                <Home className='w-4 h-4' />
                Trang chủ
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className='flex items-center gap-2'
              >
                {theme === 'light' ? (
                  <Moon className='w-4 h-4' />
                ) : (
                  <Sun className='w-4 h-4' />
                )}
                {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/club-management/settings')}
                className='flex items-center gap-2'
              >
                <Settings className='w-4 h-4' />
                Cài đặt CLB
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/club-management/members')}
                className='flex items-center gap-2'
              >
                <Users className='w-4 h-4' />
                Quản lý thành viên
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className='flex items-center gap-2'
              >
                <User className='w-4 h-4' />
                Hồ sơ cá nhân
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className='w-8 h-8 border border-border'>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className='text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
              {user?.user_metadata?.full_name?.charAt(0) ||
                user?.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
