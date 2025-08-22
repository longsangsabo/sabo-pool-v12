import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Building2,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  AlertTriangle,
  Home,
  Swords,
  User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAdminViewMode } from '@/hooks/useAdminViewMode';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const AdminMobileNavigation: React.FC = () => {
  const location = useLocation();
  const { isPlayerView } = useAdminViewMode();

  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Light haptic feedback
    }
  };

  // Get pending tasks count for admin (simplified)
  const { data: pendingTasksCount } = useQuery({
    queryKey: ['admin-pending-tasks'],
    queryFn: async () => {
      // Use existing tables - get pending challenges as indicator
      const { count } = await supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Get notifications count as system alerts indicator
  const { data: alertsCount } = useQuery({
    queryKey: ['admin-system-alerts'],
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      return count || 0;
    },
    refetchInterval: 60000,
  });

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: Users,
      badge: pendingTasksCount,
    },
    {
      path: '/admin/tournaments',
      label: 'Tournaments',
      icon: Trophy,
    },
    {
      path: '/admin/clubs',
      label: 'Clubs',
      icon: Building2,
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: alertsCount,
    },
  ];

  // Player view navigation items (same as regular player)
  const playerViewNavItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      path: '/challenges',
      label: 'Thách đấu',
      icon: Swords,
    },
    {
      path: '/tournaments',
      label: 'Giải đấu',
      icon: Trophy,
    },
    {
      path: '/leaderboard',
      label: 'BXH',
      icon: BarChart3,
    },
    {
      path: '/profile',
      label: 'Hồ sơ',
      icon: User,
    },
  ];

  // Choose navigation items based on view mode
  const navItems = isPlayerView ? playerViewNavItems : adminNavItems;

  const isActive = (path: string) => {
    if (isPlayerView) {
      // Player view navigation logic
      if (path === '/dashboard') {
        return location.pathname === '/' || location.pathname === '/dashboard';
      }
      return location.pathname.startsWith(path);
    } else {
      // Admin navigation logic
      if (path === '/admin') {
        return location.pathname === '/admin';
      }
      return location.pathname.startsWith(path);
    }
  };

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden mobile-safe-area-bottom'>
      <div className='flex items-center justify-around py-2 px-4'>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={triggerHapticFeedback}
              className={cn(
                'relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95',
                active
                  ? 'text-primary bg-primary/10 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <div className='relative'>
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-200',
                    active ? 'fill-current scale-110' : 'hover:scale-105'
                  )}
                />
                {item.badge && Number(item.badge) > 0 && (
                  <Badge
                    variant='destructive'
                    className='absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse'
                  >
                    {Number(item.badge) > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium truncate w-full text-center transition-all duration-200',
                  active
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
