import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Trophy,
  Users,
  Calendar,
  MoreHorizontal,
  Settings,
  UserCheck,
  Bell,
  CreditCard,
  Swords,
  ClipboardCheck,
  FileText,
  Shield,
  Target,
  Gift,
  MessageSquare,
  TrendingUp,
  Zap,
  BarChart3,
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
  {
    icon: Home,
    path: '/club-management',
    label: 'Tổng quan',
    color: 'text-primary-600',
  },
  {
    icon: Trophy,
    path: '/club-management/tournaments',
    label: 'Giải đấu',
    color: 'text-amber-600',
  },
  {
    icon: Users,
    path: '/club-management/members',
    label: 'Thành viên',
    color: 'text-success-600',
  },
  {
    icon: Calendar,
    path: '/club-management/schedule',
    label: 'Lịch trình',
    color: 'text-info-600',
  },
];

// Các trang quan trọng khác trong dropdown "Thêm"
const secondaryNavItems = [
  // Quản lý hoạt động
  {
    icon: Swords,
    path: '/club-management/challenges',
    label: 'Thách đấu',
    group: 'activities',
  },
  {
    icon: Bell,
    path: '/club-management/notifications',
    label: 'Thông báo',
    group: 'activities',
  },
  {
    icon: BarChart3,
    path: '/club-management/analytics',
    label: 'Thống kê',
    group: 'activities',
  },

  // Xác thực & Quản trị
  {
    icon: UserCheck,
    path: '/club-management/verification',
    label: 'Xác thực hạng',
    group: 'admin',
  },
  {
    icon: Shield,
    path: '/club-management/moderation',
    label: 'Kiểm duyệt',
    group: 'admin',
  },
  {
    icon: ClipboardCheck,
    path: '/club-management/approvals',
    label: 'Phê duyệt',
    group: 'admin',
  },

  // Tài chính & Thống kê
  {
    icon: CreditCard,
    path: '/club-management/payments',
    label: 'Thanh toán',
    group: 'finance',
  },
  {
    icon: Target,
    path: '/club-management/performance',
    label: 'Hiệu suất',
    group: 'finance',
  },
  {
    icon: FileText,
    path: '/club-management/reports',
    label: 'Báo cáo',
    group: 'finance',
  },

  // Khuyến mãi & Tương tác
  {
    icon: Gift,
    path: '/club-management/promotions',
    label: 'Khuyến mãi',
    group: 'marketing',
  },
  {
    icon: MessageSquare,
    path: '/club-management/communications',
    label: 'Giao tiếp',
    group: 'marketing',
  },

  // Cài đặt
  {
    icon: Settings,
    path: '/club-management/settings',
    label: 'Cài đặt',
    group: 'settings',
  },
  {
    icon: Zap,
    path: '/club-management/automations',
    label: 'Tự động hóa',
    group: 'settings',
  },
];

const groupLabels = {
  activities: '📊 Hoạt động',
  admin: '🛡️ Quản trị',
  finance: '💰 Tài chính',
  marketing: '📢 Marketing',
  settings: '⚙️ Cài đặt',
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
      console.log('Verification count:', count); // Debug log
      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Group secondary items by category
  const groupedSecondaryItems = secondaryNavItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, typeof secondaryNavItems>
  );

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 lg:hidden mobile-safe-area-bottom shadow-lg'>
      <div className='flex items-center justify-between py-1 px-1 max-w-lg mx-auto'>
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
                'relative flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-xl transition-all duration-300 ease-in-out transform',
                isActive
                  ? 'text-white bg-gradient-to-b from-primary to-primary/80 shadow-md scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 active:scale-95'
              )}
            >
              <div className='relative'>
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-300',
                    isActive
                      ? 'drop-shadow-sm scale-110'
                      : `hover:scale-110 ${item.color}`
                  )}
                />
                {/* Notification badges chỉ hiển thị khi > 0 */}
                {item.path === '/club-management' &&
                  notificationCount &&
                  notificationCount > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-1 -right-1 w-4 h-4 text-xs p-0 flex items-center justify-center animate-bounce'
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                {/* Badge thông báo xác thực hạng cho tab thành viên */}
                {item.path === '/club-management/members' &&
                  verificationCount !== null &&
                  verificationCount !== undefined &&
                  verificationCount > 0 && (
                    <Badge
                      variant='secondary'
                      className='absolute -top-1 -right-1 w-4 h-4 text-xs p-0 flex items-center justify-center bg-amber-500 text-white animate-pulse'
                    >
                      {verificationCount > 9 ? '9+' : verificationCount}
                    </Badge>
                  )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium truncate w-full text-center transition-all duration-300',
                  isActive
                    ? 'text-white font-semibold drop-shadow-sm'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* More dropdown for secondary features */}
        <div className='relative flex flex-col items-center justify-center flex-1 py-2 px-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={triggerHapticFeedback}
                className={cn(
                  'flex flex-col items-center justify-center h-auto p-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <MoreHorizontal className='w-6 h-6 text-slate-600' />
                <span className='text-xs mt-1.5 font-medium text-muted-foreground'>
                  Thêm
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align='end'
              side='top'
              className='w-64 max-h-80 overflow-y-auto mb-2 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl'
            >
              {Object.entries(groupedSecondaryItems).map(
                ([groupKey, items]) => (
                  <div key={groupKey}>
                    <DropdownMenuLabel className='text-xs font-bold text-primary/80 py-2'>
                      {groupLabels[groupKey as keyof typeof groupLabels]}
                    </DropdownMenuLabel>
                    {items.map(item => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.path ||
                        location.pathname.startsWith(item.path);

                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            triggerHapticFeedback();
                          }}
                          className={cn(
                            'flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg mx-1 mb-1 transition-all duration-200',
                            isActive
                              ? 'bg-primary/10 text-primary font-medium shadow-sm'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span className='flex-1'>{item.label}</span>
                          {item.path.includes('verification') &&
                            verificationCount &&
                            verificationCount > 0 && (
                              <Badge
                                variant='secondary'
                                className='bg-amber-500 text-white text-xs px-1.5 py-0.5'
                              >
                                {verificationCount}
                              </Badge>
                            )}
                          {item.path.includes('notifications') &&
                            notificationCount &&
                            notificationCount > 0 && (
                              <Badge
                                variant='destructive'
                                className='text-xs px-1.5 py-0.5'
                              >
                                {notificationCount}
                              </Badge>
                            )}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator className='my-2' />
                  </div>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
