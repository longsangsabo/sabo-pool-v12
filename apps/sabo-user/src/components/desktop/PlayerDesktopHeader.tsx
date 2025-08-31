import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
 SheetDescription,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from '@/components/ui/sheet';
import {
 Search,
 Bell,
 MessageCircle,
 Settings,
 LogOut,
 User,
 Menu,
 Target,
 ChevronDown,
 Home,
 Trophy,
 Swords,
 BarChart3,
 Wallet,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SPAPointsBadge from '@/components/SPAPointsBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';

interface PlayerDesktopHeaderProps {
 onSidebarToggle?: () => void;
 sidebarCollapsed?: boolean;
}

// Mobile-Desktop synchronized design tokens
const PLAYER_HEADER_TOKENS = {
 spacing: {
  padding: { sm: '0.5rem', md: '1rem', lg: '1.5rem' },
  gap: { sm: '0.75rem', md: '1rem', lg: '1.5rem' },
 },
 colors: {
  primary: 'hsl(var(--primary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted-foreground))',
  card: 'hsl(var(--card))',
  border: 'hsl(var(--border))',
 },
 animation: {
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  hover: 'transform: scale(1.02)',
  active: 'transform: scale(0.98)',
 },
};

// Synchronized navigation for mobile sheet
const quickNavigationItems = [
 { name: 'Trang chủ', href: '/dashboard', icon: Home },
 { name: 'Thách đấu', href: '/challenges', icon: Swords },
 { name: 'Giải đấu', href: '/tournaments', icon: Trophy },
 { name: 'Bảng xếp hạng', href: '/leaderboard', icon: BarChart3 },
 { name: 'Ví điện tử', href: '/wallet', icon: Wallet },
];

/**
 * PlayerDesktopHeader - Unified Desktop Header
 * 
 * This component provides:
 * - Responsive header with mobile sheet navigation
 * - Real-time notifications and messages
 * - Global search functionality
 * - User profile management
 * - Theme toggle
 * - Mobile-desktop synchronized design
 */
export const PlayerDesktopHeader: React.FC<PlayerDesktopHeaderProps> = ({
 onSidebarToggle,
 sidebarCollapsed = false,
}) => {
 const navigate = useNavigate();
 const location = useLocation();
 const { user, signOut } = useAuth();

 // Get notification count
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
  refetchInterval: 30000,
 });

 // Get messages count
 const { data: messageCount } = useQuery({
  queryKey: ['unread-messages-count'],
  queryFn: async () => {
   const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

   if (error) throw error;
   return count || 0;
  },
  refetchInterval: 30000,
 });

 // Search functionality
 const [searchValue, setSearchValue] = React.useState('');

 const handleSearch = (value: string) => {
  if (value.trim()) {
   navigate(`/search?q=${encodeURIComponent(value.trim())}`);
  }
 };

 const handleSignOut = async () => {
  try {
   await signOut();
   navigate('/auth');
  } catch (error) {
   console.error('Error signing out:', error);
  }
 };

 // Get page title from current route
 const getPageTitle = () => {
  const path = location.pathname;
  if (path === '/dashboard' || path === '/') return 'Trang chủ';
  if (path.startsWith('/challenges')) return 'Thách đấu';
  if (path.startsWith('/tournaments')) return 'Giải đấu';
  if (path.startsWith('/leaderboard')) return 'Bảng xếp hạng';
  if (path.startsWith('/profile')) return 'Hồ sơ';
  if (path.startsWith('/messages')) return 'Hộp thư';
  if (path.startsWith('/notifications')) return 'Thông báo';
  if (path.startsWith('/community')) return 'Cộng đồng';
  if (path.startsWith('/calendar')) return 'Lịch thi đấu';
  if (path.startsWith('/marketplace')) return 'Cửa hàng';
  if (path.startsWith('/clubs')) return 'Câu lạc bộ';
  if (path.startsWith('/wallet')) return 'Ví điện tử';
  if (path.startsWith('/settings')) return 'Cài đặt';
  return 'SABO ARENA';
 };

 return (
  <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
   <div className='flex h-16 items-center justify-between px-4'>
    {/* Left Section */}
    <div className='flex items-center gap-4'>
     {/* Mobile Menu Button - visible on small screens */}
     <Sheet>
      <SheetTrigger asChild>
       <Button
        variant='ghost'
        
        className='md:hidden'
       >
        <Menu className='h-5 w-5' />
        <span className='sr-only'>Open menu</span>
       </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-80 p-0'>
       <SheetHeader className='p-4 border-b'>
        <div className='flex items-center gap-3'>
         <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
          <Target className='w-5 h-5 text-primary-foreground' />
         </div>
         <div>
          <SheetTitle>SABO ARENA</SheetTitle>
          <SheetDescription>Player Mode</SheetDescription>
         </div>
        </div>
       </SheetHeader>
       
       {/* Mobile Navigation */}
       <div className='p-4'>
        <nav className='space-y-2'>
         {quickNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
           (item.href === '/dashboard' && location.pathname === '/');
          
          return (
           <Button
            key={item.href}
            variant={isActive ? 'default' : 'ghost'}
            className='w-full justify-start gap-3'
            onClick={() => navigate(item.href)}
           >
            <Icon className='h-5 w-5' />
            {item.name}
           </Button>
          );
         })}
        </nav>
       </div>
      </SheetContent>
     </Sheet>

     {/* Desktop Sidebar Toggle */}
     {onSidebarToggle && (
      <Button
       variant='ghost'
       
       onClick={onSidebarToggle}
       className='hidden md:flex'
      >
       <Menu className='h-5 w-5' />
       <span className='sr-only'>Toggle sidebar</span>
      </Button>
     )}

     {/* Logo & Title */}
     <div className='flex items-center gap-3'>
      <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center md:hidden'>
       <Target className='w-5 h-5 text-primary-foreground' />
      </div>
      <div className='hidden sm:block'>
       <h1 className='text-body-large-semibold'>{getPageTitle()}</h1>
       <p className='text-caption text-muted-foreground'>
        Player Dashboard
       </p>
      </div>
     </div>
    </div>

    {/* Center Section - Search */}
    <div className='flex-1 max-w-md mx-4 hidden md:block'>
     <div className='relative'>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
      <Input
       placeholder='Tìm kiếm player, giải đấu...'
       value={searchValue}
       onChange={(e) => setSearchValue(e.target.value)}
       onKeyDown={(e) => {
        if (e.key === 'Enter') {
         handleSearch(searchValue);
        }
       }}
       className='pl-12'
      />
     </div>
    </div>

    {/* Right Section */}
    <div className='flex items-center gap-2'>
     {/* Mobile Search */}
     <Sheet>
      <SheetTrigger asChild>
       <Button
        variant='ghost'
        
        className='md:hidden'
       >
        <Search className='h-5 w-5' />
        <span className='sr-only'>Search</span>
       </Button>
      </SheetTrigger>
      <SheetContent side='top' className='h-auto'>
       <SheetHeader>
        <SheetTitle>Tìm kiếm</SheetTitle>
       </SheetHeader>
       <div className='py-4'>
        <div className='relative'>
         <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
         <Input
          placeholder='Tìm kiếm player, giải đấu...'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
           if (e.key === 'Enter') {
            handleSearch(searchValue);
           }
          }}
          className='pl-12'
          autoFocus
         />
        </div>
       </div>
      </SheetContent>
     </Sheet>

     {/* SPA Points Badge */}
     <SPAPointsBadge />

     {/* Messages */}
     <Button
      variant='ghost'
      
      onClick={() => navigate('/messages')}
      className='relative'
     >
      <MessageCircle className='h-5 w-5' />
      {messageCount && messageCount > 0 && (
       <Badge
        variant='destructive'
        className='absolute -top-1 -right-1 w-5 h-5 text-caption p-0 flex items-center justify-center'
       >
        {messageCount > 99 ? '99+' : messageCount}
       </Badge>
      )}
      <span className='sr-only'>Messages</span>
     </Button>

     {/* Notifications */}
     <UnifiedNotificationBell variant="desktop" />

     {/* Theme Toggle */}
     <ThemeToggle />

     {/* User Menu */}
     <DropdownMenu>
      <DropdownMenuTrigger asChild>
       <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
        <Avatar className='h-10 w-10'>
         <AvatarImage src={user?.user_metadata?.avatar_url} />
         <AvatarFallback>
          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
         </AvatarFallback>
        </Avatar>
       </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
       <div className='flex items-center justify-start gap-2 p-2'>
        <div className='flex flex-col space-y-1 leading-none'>
         {user?.user_metadata?.full_name && (
          <p className='font-medium'>{user.user_metadata.full_name}</p>
         )}
         {user?.email && (
          <p className='w-[200px] truncate text-body-small text-muted-foreground'>
           {user.email}
          </p>
         )}
        </div>
       </div>
       <DropdownMenuSeparator />
       <DropdownMenuItem onClick={() => navigate('/profile')}>
        <User className='mr-2 h-4 w-4' />
        <span>Hồ sơ</span>
       </DropdownMenuItem>
       <DropdownMenuItem onClick={() => navigate('/settings')}>
        <Settings className='mr-2 h-4 w-4' />
        <span>Cài đặt</span>
       </DropdownMenuItem>
       <DropdownMenuSeparator />
       <DropdownMenuItem onClick={handleSignOut}>
        <LogOut className='mr-2 h-4 w-4' />
        <span>Đăng xuất</span>
       </DropdownMenuItem>
      </DropdownMenuContent>
     </DropdownMenu>
    </div>
   </div>
  </header>
 );
};

export default PlayerDesktopHeader;
