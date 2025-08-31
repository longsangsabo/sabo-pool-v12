import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
 Home,
 Trophy,
 Swords,
 Users,
 Calendar,
 BarChart3,
 Wallet,
 Settings,
 Target,
 ChevronLeft,
 ChevronRight,
 Heart,
 Store,
 Shield,
 User,
 Mail,
 Bell,
 MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import SPAPointsBadge from '@/components/SPAPointsBadge';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PlayerDesktopSidebarProps {
 collapsed?: boolean;
 onToggle?: () => void;
}

// Mobile-Desktop synchronized design tokens
const PLAYER_SIDEBAR_TOKENS = {
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

// Navigation items - synchronized with mobile bottom navigation
const coreNavigationItems = [
 { 
  name: 'Trang chủ', 
  href: '/dashboard', 
  icon: Home,
  description: 'Bảng tin và hoạt động',
  isCoreNav: true
 },
 { 
  name: 'Thách đấu', 
  href: '/challenges', 
  icon: Swords,
  description: 'Tạo và tham gia thách đấu',
  badgeKey: 'challenges',
  isCoreNav: true
 },
 { 
  name: 'Giải đấu', 
  href: '/tournaments', 
  icon: Trophy,
  description: 'Tham gia giải đấu',
  isCoreNav: true
 },
 { 
  name: 'Bảng xếp hạng', 
  href: '/leaderboard', 
  icon: BarChart3,
  description: 'Xem thứ hạng và ELO',
  isCoreNav: true
 },
 { 
  name: 'Hồ sơ', 
  href: '/profile', 
  icon: User,
  description: 'Thông tin cá nhân',
  isCoreNav: true
 },
];

// Extended navigation items - desktop only
const extendedNavigationItems = [
 // Communication
 { 
  name: 'Hộp thư', 
  href: '/messages', 
  icon: MessageCircle,
  description: 'Tin nhắn và chat',
  category: 'communication',
  badgeKey: 'messages'
 },
 { 
  name: 'Thông báo', 
  href: '/notifications', 
  icon: Bell,
  description: 'Thông báo hệ thống',
  category: 'communication',
  badgeKey: 'notifications'
 },
 
 // Social & Community
 { 
  name: 'Cộng đồng', 
  href: '/community', 
  icon: Heart,
  description: 'Kết nối với cộng đồng',
  category: 'social'
 },
 { 
  name: 'Bảng tin', 
  href: '/feed', 
  icon: Users,
  description: 'Hoạt động của bạn bè',
  category: 'social'
 },
 
 // Scheduling & Commerce
 { 
  name: 'Lịch thi đấu', 
  href: '/calendar', 
  icon: Calendar,
  description: 'Lịch trình và sự kiện',
  category: 'scheduling'
 },
 { 
  name: 'Cửa hàng', 
  href: '/marketplace', 
  icon: Store,
  description: 'Mua sắm phụ kiện',
  category: 'commerce'
 },
 
 // Club Management
 { 
  name: 'Câu lạc bộ', 
  href: '/clubs', 
  icon: Users,
  description: 'Quản lý CLB',
  category: 'clubs'
 },
 { 
  name: 'Đăng ký CLB', 
  href: '/club-registration', 
  icon: Shield,
  description: 'Tạo CLB mới',
  category: 'clubs'
 },
 
 // Finance & System
 { 
  name: 'Ví điện tử', 
  href: '/wallet', 
  icon: Wallet,
  description: 'Quản lý tài chính',
  category: 'finance'
 },
 { 
  name: 'Cài đặt', 
  href: '/settings', 
  icon: Settings,
  description: 'Tùy chỉnh hệ thống',
  category: 'system'
 },
];

/**
 * PlayerDesktopSidebar - Consolidated Desktop Sidebar
 * 
 * This component consolidates functionality from:
 * - UserDesktopSidebar (basic navigation)
 * - UserDesktopSidebarIntegrated (enhanced features)
 * - UserDesktopSidebarSynchronized (mobile-sync design)
 * 
 * Features:
 * - Mobile-synchronized navigation (5 core tabs)
 * - Extended desktop navigation (9 additional items)
 * - Real-time badges for notifications/challenges
 * - Collapsible with state persistence
 * - User profile integration
 * - Theme toggle
 */
export const PlayerDesktopSidebar: React.FC<PlayerDesktopSidebarProps> = ({
 collapsed = false,
 onToggle,
}) => {
 const location = useLocation();
 const { user } = useAuth();

 // Get notification count
 const { data: notificationCount } = useQuery({
  queryKey: ['notification-count'],
  queryFn: async () => {
//    const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .is('deleted_at', null);

   if (error) throw error;
   return count || 0;
  },
  refetchInterval: 30000,
 });

 // Get pending challenges count
 const { data: challengeCount } = useQuery({
  queryKey: ['pending-challenges-count'],
  queryFn: async () => {
//    const { count, error } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

   if (error) throw error;
   return count || 0;
  },
  refetchInterval: 30000,
 });

 // Get messages count
 const { data: messageCount } = useQuery({
  queryKey: ['unread-messages-count'],
  queryFn: async () => {
//    const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

   if (error) throw error;
   return count || 0;
  },
  refetchInterval: 30000,
 });

 const getBadgeCount = (badgeKey?: string) => {
  switch (badgeKey) {
   case 'challenges':
    return challengeCount;
   case 'notifications':
    return notificationCount;
   case 'messages':
    return messageCount;
   default:
    return undefined;
  }
 };

 const isActiveRoute = (href: string) => {
  if (href === '/dashboard') {
   return location.pathname === '/dashboard' || location.pathname === '/';
  }
  return location.pathname.startsWith(href);
 };

 const renderNavigationItem = (item: any, index: number) => {
  const Icon = item.icon;
  const isActive = isActiveRoute(item.href);
  const badgeCount = getBadgeCount(item.badgeKey);

  return (
   <NavLink
    key={`${item.category || 'core'}-${index}`}
    to={item.href}
    className={cn(
     'flex items-center gap-3 px-3 py-2 rounded-lg text-body-small-medium transition-all duration-300',
     'hover:bg-accent hover:text-accent-foreground',
     'focus:bg-accent focus:text-accent-foreground focus:outline-none',
     isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
     collapsed && 'justify-center px-2'
    )}
   >
    <div className='relative'>
     <Icon className={cn('w-5 h-5', isActive && 'text-primary-foreground')} />
     {badgeCount && badgeCount > 0 && (
      <Badge
       variant='destructive'
       className='absolute -top-2 -right-2 w-5 h-5 text-caption p-0 flex items-center justify-center animate-pulse'
      >
       {badgeCount > 99 ? '99+' : badgeCount}
      </Badge>
     )}
    </div>
    {!collapsed && (
     <div className='flex-1 min-w-0'>
      <div className='flex items-center justify-between'>
       <span className='truncate'>{item.name}</span>
      </div>
      {item.description && (
       <p className='text-caption text-muted-foreground truncate mt-0.5'>
        {item.description}
       </p>
      )}
     </div>
    )}
   </NavLink>
  );
 };

 const renderNavigationSection = (title: string, items: any[]) => (
  <>
   {!collapsed && (
    <div className='px-2 py-1 mb-2'>
     <h3 className='text-caption-medium text-muted-foreground uppercase tracking-wider'>
      {title}
     </h3>
    </div>
   )}
   <div className='space-y-1 mb-4'>
    {items.map((item, index) => renderNavigationItem(item, index))}
   </div>
  </>
 );

 // Group extended items by category
 const communicationItems = extendedNavigationItems.filter(item => item.category === 'communication');
 const socialItems = extendedNavigationItems.filter(item => item.category === 'social');
 const schedulingItems = extendedNavigationItems.filter(item => item.category === 'scheduling');
 const commerceItems = extendedNavigationItems.filter(item => item.category === 'commerce');
 const clubItems = extendedNavigationItems.filter(item => item.category === 'clubs');
 const financeItems = extendedNavigationItems.filter(item => item.category === 'finance');
 const systemItems = extendedNavigationItems.filter(item => item.category === 'system');

 return (
  <div
   className={cn(
    'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
    collapsed ? 'w-16' : 'w-64'
   )}
  >
   {/* Header */}
   <div className='p-4 border-b border-border'>
    <div className='flex items-center gap-3'>
     <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
      <Target className='w-5 h-5 text-primary-foreground' />
     </div>
     {!collapsed && (
      <div className='flex-1 min-w-0'>
       <h2 className='font-bold text-body-large truncate'>SABO ARENA</h2>
       <p className='text-caption text-muted-foreground truncate'>
        Player Mode
       </p>
      </div>
     )}
     {onToggle && (
      <Button
       variant='ghost'
       
       onClick={onToggle}
       className='ml-auto'
      >
       {collapsed ? (
        <ChevronRight className='h-4 w-4' />
       ) : (
        <ChevronLeft className='h-4 w-4' />
       )}
      </Button>
     )}
    </div>

    {/* User Profile Section */}
    {!collapsed && user && (
     <div className='mt-4 p-3 bg-muted/50 rounded-lg'>
      <div className='flex items-center gap-3'>
       <Avatar className='w-10 h-10'>
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback>
         {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
        </AvatarFallback>
       </Avatar>
       <div className='flex-1 min-w-0'>
        <p className='text-body-small-medium truncate'>
         {user.user_metadata?.full_name || 'Player'}
        </p>
        <p className='text-caption text-muted-foreground truncate'>
         {user.email}
        </p>
       </div>
       <SPAPointsBadge />
      </div>
     </div>
    )}
   </div>

   {/* Navigation Menu */}
   <ScrollArea className='flex-1'>
    <nav className='p-2'>
     {/* Core Navigation - Mobile Bottom Nav Equivalent */}
     {renderNavigationSection('Menu chính', coreNavigationItems)}
     
     {/* Extended Navigation - Desktop Only */}
     {renderNavigationSection('Liên lạc', communicationItems)}
     {renderNavigationSection('Cộng đồng', socialItems)}
     {renderNavigationSection('Lịch trình', schedulingItems)}
     {renderNavigationSection('Thương mại', commerceItems)}
     {renderNavigationSection('Câu lạc bộ', clubItems)}
     {renderNavigationSection('Tài chính', financeItems)}
     {renderNavigationSection('Hệ thống', systemItems)}
    </nav>
   </ScrollArea>

   {/* Footer */}
   <div className='p-4 border-t border-border'>
    {!collapsed && (
     <div className='space-y-3'>
      <div className='flex items-center justify-between'>
       <span className='text-caption text-muted-foreground'>Theme</span>
       <ThemeToggle />
      </div>
      <div className='text-caption text-muted-foreground'>
       <p>Phiên bản: 1.0.0</p>
       <p>© 2024 SABO ARENA</p>
      </div>
     </div>
    )}
    {collapsed && (
     <div className='flex justify-center'>
      <ThemeToggle />
     </div>
    )}
   </div>
  </div>
 );
};

export default PlayerDesktopSidebar;
