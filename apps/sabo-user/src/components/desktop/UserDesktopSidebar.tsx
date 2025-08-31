/**
 * @deprecated This component is deprecated as of Phase 2 Desktop Consolidation
 * 
 * ⚠️ LEGACY COMPONENT - DO NOT USE IN NEW CODE
 * 
 * This component has been replaced by the unified PlayerDesktopLayout system:
 * - PlayerDesktopLayout.tsx (main layout)
 * - PlayerDesktopSidebar.tsx (consolidated sidebar) 
 * - PlayerDesktopHeader.tsx (unified header)
 * 
 * Migration path:
 * - Replace all desktop layout usage with PlayerDesktopLayout
 * - Update imports to use new components
 * - Remove references to this legacy component
 * 
 * This component will be removed in Phase 3 of the standardization plan.
 * 
 * @see /workspaces/sabo-pool-v12/DESKTOP_CONSOLIDATION_PHASE1_COMPLETE.md
 * @see /workspaces/sabo-pool-v12/ROLE_PLAYER_STANDARDIZATION_PLAN.md
 */

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

// Navigation items
const navigationItems = [
 { name: 'Trang chủ', href: '/dashboard', icon: Home },
 { name: 'Thách đấu', href: '/challenges', icon: Swords },
 { name: 'Giải đấu', href: '/tournaments', icon: Trophy },
 { name: 'Bảng xếp hạng', href: '/leaderboard', icon: BarChart3 },
 { name: 'Hồ sơ', href: '/profile', icon: User },
 { name: 'Hộp thư', href: '/messages', icon: MessageCircle },
 { name: 'Thông báo', href: '/notifications', icon: Bell },
 { name: 'Cộng đồng', href: '/community', icon: Heart },
 { name: 'Lịch', href: '/calendar', icon: Calendar },
 { name: 'Marketplace', href: '/marketplace', icon: Store },
 { name: 'CLB', href: '/clubs', icon: Users },
 { name: 'Đăng ký CLB', href: '/club-registration', icon: Shield },
 { name: 'Ví', href: '/wallet', icon: Wallet },
 { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export const UserDesktopSidebar: React.FC<UserDesktopSidebarProps> = ({
 collapsed = false,
 onToggle,
}) => {
 const location = useLocation();
 const { user } = useAuth();

 const isActiveRoute = (href: string) => {
  if (href === '/dashboard') {
   return location.pathname === '/dashboard' || location.pathname === '/';
  }
  return location.pathname.startsWith(href);
 };

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
        Billiards Arena
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
   </div>

   {/* User Info */}
   {user && (
    <div className='p-4 border-b border-border'>
     <div className='flex items-center gap-3'>
      <Avatar className='h-8 w-8'>
       <AvatarImage src={user.user_metadata?.avatar_url} />
       <AvatarFallback>
        {user.user_metadata?.full_name?.charAt(0) ||
         user.email?.charAt(0).toUpperCase()}
       </AvatarFallback>
      </Avatar>
      {!collapsed && (
       <div className='flex-1 min-w-0'>
        <p className='font-medium text-body-small truncate'>
         {user.user_metadata?.full_name || user.email}
        </p>
        <div className='flex items-center gap-2 mt-1'>
         <SPAPointsBadge />
        </div>
       </div>
      )}
     </div>
    </div>
   )}

   {/* Navigation */}
   <ScrollArea className='flex-1'>
    <nav className='p-2 space-y-1'>
     {navigationItems.map(item => {
      const Icon = item.icon;
      const isActive = isActiveRoute(item.href);

      return (
       <NavLink
        key={item.name}
        to={item.href}
        className={cn(
         'flex items-center gap-3 px-3 py-2 rounded-lg text-body-small-medium transition-colors',
         'hover:bg-accent hover:text-accent-foreground',
         isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground'
        )}
       >
        <Icon
         className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')}
        />
        {!collapsed && <span className='truncate'>{item.name}</span>}
       </NavLink>
      );
     })}
    </nav>
   </ScrollArea>

   {/* Footer */}
   <div className='p-4 border-t border-border'>
    {!collapsed && (
     <div className='space-y-2'>
      <div className='text-caption text-muted-foreground'>
       <p>Phiên bản: 1.0.0</p>
       <p>© 2024 SABO ARENA</p>
      </div>
     </div>
    )}
   </div>
  </div>
 );
};

export default UserDesktopSidebar;
