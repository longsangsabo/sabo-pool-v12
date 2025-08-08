import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Trophy, Users, Settings, UserCheck, Bell, 
  MoreHorizontal, CreditCard, Calendar, Swords, 
  ClipboardCheck, FileText, Shield, Target, Gift,
  MessageSquare, TrendingUp, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// 4 tabs chính hiển thị trên navigation bar
const mainNavItems = [
  { icon: BarChart3, path: '/club-management', label: 'Tổng quan' },
  { icon: Trophy, path: '/club-management/tournaments', label: 'Giải đấu' },
  { icon: Users, path: '/club-management/members', label: 'Thành viên' },
];

// Các trang quan trọng khác trong dropdown "Thêm"
const secondaryNavItems = [
  // Quản lý hoạt động
  { icon: Swords, path: '/club-management/challenges', label: 'Thách đấu', group: 'activities' },
  { icon: Calendar, path: '/club-management/schedule', label: 'Lịch trình', group: 'activities' },
  { icon: Bell, path: '/club-management/notifications', label: 'Thông báo', group: 'activities' },
  
  // Xác thực & Quản trị
  { icon: UserCheck, path: '/club-management/verification', label: 'Xác thực hạng', group: 'admin' },
  { icon: Shield, path: '/club-management/moderation', label: 'Kiểm duyệt', group: 'admin' },
  { icon: ClipboardCheck, path: '/club-management/approvals', label: 'Phê duyệt', group: 'admin' },
  
  // Tài chính & Thống kê
  { icon: CreditCard, path: '/club-management/payments', label: 'Thanh toán', group: 'finance' },
  { icon: TrendingUp, path: '/club-management/analytics', label: 'Thống kê', group: 'finance' },
  { icon: Target, path: '/club-management/performance', label: 'Hiệu suất', group: 'finance' },
  
  // Khuyến mãi & Tương tác
  { icon: Gift, path: '/club-management/promotions', label: 'Khuyến mãi', group: 'marketing' },
  { icon: MessageSquare, path: '/club-management/communications', label: 'Giao tiếp', group: 'marketing' },
  { icon: FileText, path: '/club-management/reports', label: 'Báo cáo', group: 'marketing' },
  
  // Cài đặt
  { icon: Settings, path: '/club-management/settings', label: 'Cài đặt', group: 'settings' },
  { icon: Zap, path: '/club-management/automations', label: 'Tự động hóa', group: 'settings' },
];

const groupLabels = {
  activities: 'Hoạt động',
  admin: 'Quản trị', 
  finance: 'Tài chính',
  marketing: 'Marketing',
  settings: 'Cài đặt'
};

export const ClubMobileNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Get notification count for any pending issues
  const { data: notificationCount } = useQuery({
    queryKey: ['club-notifications-count'],
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

  // Get pending verification count
  const { data: verificationCount } = useQuery({
    queryKey: ['club-verification-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('rank_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Group secondary items by category
  const groupedSecondaryItems = secondaryNavItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof secondaryNavItems>);

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden mobile-safe-area-bottom'>
      <div className='flex items-center justify-around py-2 px-2'>
        {/* Main navigation items */}
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/club-management' &&
              location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={triggerHapticFeedback}
              className={cn(
                'relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95',
                isActive
                  ? 'text-primary bg-primary/10 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <div className='relative'>
                <Icon className={cn(
                  'w-5 h-5 transition-all duration-200',
                  isActive ? 'fill-current scale-110' : 'hover:scale-105'
                )} />
                {/* Notification badges */}
                {item.path === '/club-management' && notificationCount && notificationCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse'
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
                {item.path === '/club-management/members' && verificationCount && verificationCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center bg-amber-500 text-white'
                  >
                    {verificationCount > 99 ? '99+' : verificationCount}
                  </Badge>
                )}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium truncate w-full text-center transition-all duration-200',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* More dropdown for secondary features */}
        <div className='relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={triggerHapticFeedback}
                className={cn(
                  'flex flex-col items-center justify-center h-auto p-1 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <MoreHorizontal className='w-5 h-5' />
                <span className='text-xs mt-1 font-medium'>Thêm</span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align='end' className='w-56 max-h-96 overflow-y-auto'>
              {Object.entries(groupedSecondaryItems).map(([groupKey, items]) => (
                <div key={groupKey}>
                  <DropdownMenuLabel className='text-xs font-semibold text-muted-foreground'>
                    {groupLabels[groupKey as keyof typeof groupLabels]}
                  </DropdownMenuLabel>
                  {items.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                    
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          triggerHapticFeedback();
                        }}
                        className={cn(
                          'flex items-center gap-2 cursor-pointer',
                          isActive ? 'bg-primary/10 text-primary' : ''
                        )}
                      >
                        <Icon className='w-4 h-4' />
                        <span>{item.label}</span>
                        {item.path.includes('verification') && verificationCount && verificationCount > 0 && (
                          <Badge variant='secondary' className='ml-auto bg-amber-500 text-white text-xs'>
                            {verificationCount}
                          </Badge>
                        )}
                        {item.path.includes('notifications') && notificationCount && notificationCount > 0 && (
                          <Badge variant='destructive' className='ml-auto text-xs'>
                            {notificationCount}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
