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
import { supabase } from '@/integrations/supabase/client';
import SPAPointsBadge from '@/components/SPAPointsBadge';

interface UserDesktopSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

// Mobile-Desktop synchronized design tokens
const SABO_SIDEBAR_TOKENS = {
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
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    sizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem' },
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  animation: {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    hover: 'transform: scale(1.02)',
    active: 'transform: scale(0.98)',
  },
};

// Navigation items synchronized with mobile interface
const navigationItems = [
  // Core Navigation - matches mobile bottom navigation exactly
  { 
    name: 'Trang chủ', 
    href: '/dashboard', 
    icon: Home,
    isCoreNav: true,
    description: 'Bảng tin và hoạt động'
  },
  { 
    name: 'Thách đấu', 
    href: '/challenges', 
    icon: Swords,
    isCoreNav: true,
    description: 'Tạo và tham gia thách đấu',
    badgeKey: 'challenges'
  },
  { 
    name: 'Giải đấu', 
    href: '/tournaments', 
    icon: Trophy,
    isCoreNav: true,
    description: 'Tham gia giải đấu'
  },
  { 
    name: 'Bảng xếp hạng', 
    href: '/leaderboard', 
    icon: BarChart3,
    isCoreNav: true,
    description: 'Xem thứ hạng và ELO'
  },
  { 
    name: 'Hồ sơ', 
    href: '/profile', 
    icon: User,
    isCoreNav: true,
    description: 'Thông tin cá nhân'
  },
  
  // Extended Navigation - desktop additional features
  { 
    name: 'Hộp thư', 
    href: '/messages', 
    icon: MessageCircle,
    description: 'Tin nhắn và trò chuyện',
    badgeKey: 'messages'
  },
  { 
    name: 'Thông báo', 
    href: '/notifications', 
    icon: Bell,
    description: 'Cập nhật mới nhất',
    badgeKey: 'notifications'
  },
  { 
    name: 'Cộng đồng', 
    href: '/community', 
    icon: Heart,
    description: 'Kết nối với người chơi'
  },
  { 
    name: 'Lịch', 
    href: '/calendar', 
    icon: Calendar,
    description: 'Lịch trình thi đấu'
  },
  { 
    name: 'Marketplace', 
    href: '/marketplace', 
    icon: Store,
    description: 'Mua bán và trao đổi'
  },
  { 
    name: 'CLB', 
    href: '/clubs', 
    icon: Users,
    description: 'Câu lạc bộ billiards'
  },
  { 
    name: 'Đăng ký CLB', 
    href: '/club-registration', 
    icon: Shield,
    description: 'Tạo câu lạc bộ mới'
  },
  { 
    name: 'Ví', 
    href: '/wallet', 
    icon: Wallet,
    description: 'Quản lý tài chính'
  },
  { 
    name: 'Cài đặt', 
    href: '/settings', 
    icon: Settings,
    description: 'Tùy chỉnh hệ thống'
  },
];

export const UserDesktopSidebarSynchronized: React.FC<UserDesktopSidebarProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  // Get notification counts for badges - synchronized with mobile
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

  const { data: challengeCount } = useQuery({
    queryKey: ['pending-challenges-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const { data: messageCount } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      // Mock data - replace with actual message count query
      return 5;
    },
    refetchInterval: 30000,
  });

  // Get badge count for navigation items
  const getBadgeCount = (badgeKey?: string) => {
    switch (badgeKey) {
      case 'challenges':
        return challengeCount;
      case 'notifications':
        return notificationCount;
      case 'messages':
        return messageCount;
      default:
        return null;
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Separate core and secondary navigation
  const coreNavItems = navigationItems.filter(item => item.isCoreNav);
  const secondaryNavItems = navigationItems.filter(item => !item.isCoreNav);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        fontFamily: SABO_SIDEBAR_TOKENS.typography.fontFamily,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Header Section - SABO Branding */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">SABO ARENA</h2>
              <p className="text-xs text-muted-foreground truncate">
                Billiards Arena
              </p>
            </div>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="ml-auto hover:bg-accent"
              style={{ transition: SABO_SIDEBAR_TOKENS.animation.transition }}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* User Profile Section - Synchronized with mobile header */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.user_metadata?.display_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Player Mode
              </p>
            </div>
            <SPAPointsBadge />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {/* Core Navigation Section - Mobile Bottom Nav Equivalent */}
          {!collapsed && (
            <div className="px-2 py-1 mb-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Menu chính
              </h3>
            </div>
          )}
          
          <div className="space-y-1 mb-4">
            {coreNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              const badgeCount = getBadgeCount(item.badgeKey);

              return (
                <NavLink
                  key={index}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    'active:scale-[0.98]',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm font-semibold' 
                      : 'text-muted-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  style={{ 
                    transition: SABO_SIDEBAR_TOKENS.animation.transition,
                  }}
                >
                  <div className="relative">
                    <Icon 
                      className={cn(
                        'w-5 h-5',
                        isActive && 'text-primary-foreground'
                      )} 
                    />
                    {badgeCount && badgeCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse"
                      >
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </Badge>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Secondary Navigation Section */}
          {!collapsed && (
            <div className="px-2 py-1 mb-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Khác
              </h3>
            </div>
          )}
          
          <div className="space-y-1">
            {secondaryNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              const badgeCount = getBadgeCount(item.badgeKey);

              return (
                <NavLink
                  key={index}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    'active:scale-[0.98]',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm font-semibold' 
                      : 'text-muted-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  style={{ 
                    transition: SABO_SIDEBAR_TOKENS.animation.transition,
                  }}
                >
                  <div className="relative">
                    <Icon 
                      className={cn(
                        'w-5 h-5',
                        isActive && 'text-primary-foreground'
                      )} 
                    />
                    {badgeCount && badgeCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse"
                      >
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </Badge>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};
