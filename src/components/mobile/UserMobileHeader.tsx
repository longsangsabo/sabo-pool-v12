import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, Search, Menu, User, Settings, LogOut, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserMobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

const UserMobileHeader: React.FC<UserMobileHeaderProps> = ({
  title,
  showSearch = true,
  showProfile = true,
  showNotifications = true,
  onMenuClick,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get notification count with real-time updates
  const { data: notificationCount } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .is('deleted_at', null);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or handle search
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <>
      <header className='fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 z-[1000] mobile-safe-area-top px-safe'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {onMenuClick && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onMenuClick}
                className='hover:bg-muted'
              >
                <Menu className='h-5 w-5' />
              </Button>
            )}

            {/* Brand Logo */}
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>S</span>
              </div>
              <h1 className='text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                {title || 'SABO ARENA'}
              </h1>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {showSearch && (
              <Button 
                variant='ghost' 
                size='sm'
                onClick={() => setIsSearchOpen(true)}
                className='hover:bg-muted transition-colors'
              >
                <Search className='h-4 w-4' />
              </Button>
            )}

            {showNotifications && (
              <Button 
                variant='ghost' 
                size='sm'
                onClick={handleNotificationClick}
                className='relative hover:bg-muted transition-colors'
              >
                <Bell className='h-4 w-4' />
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

            {showProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-8 w-8 rounded-full p-0 hover:bg-muted transition-colors'
                  >
                    <Avatar className='h-7 w-7'>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className='text-xs'>
                        {user?.user_metadata?.full_name?.charAt(0) ||
                          user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-56 bg-card border border-border shadow-lg z-[1001]'
                  align='end'
                  forceMount
                >
                  <div className='flex items-center justify-start gap-2 p-2'>
                    <div className='flex flex-col space-y-1 leading-none'>
                      <p className='font-medium text-sm text-foreground'>
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className='cursor-pointer hover:bg-muted'
                    onClick={() => navigate('/profile')}
                  >
                    <User className='mr-2 h-4 w-4' />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className='cursor-pointer hover:bg-muted'
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10'
                    onClick={() => signOut()}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-auto">
          <SheetHeader>
            <SheetTitle>Tìm kiếm</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tìm người chơi, giải đấu, câu lạc bộ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UserMobileHeader;
