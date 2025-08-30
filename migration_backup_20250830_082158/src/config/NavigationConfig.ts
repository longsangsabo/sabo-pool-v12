import { useLocation } from 'react-router-dom';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import {
  Home,
  Trophy,
  Swords,
  Users,
  Calendar,
  BarChart3,
  Wallet,
  Settings,
  Heart,
  Store,
  Shield,
  User,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Navigation item interface
export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  category?: string;
  description?: string;
  badgeKey?: string;
  isCore: boolean;
  mobileLabel?: string;
  comingSoon?: boolean;
}

// Complete navigation mapping for desktop interface
export const SABO_NAVIGATION_CONFIG = {
  // Core mobile navigation (5 tabs) - always available
  mobile: [
    { 
      name: 'Trang chủ', 
      href: '/standardized-dashboard', 
      icon: Home,
      mobileLabel: 'Home',
      isCore: true
    },
    { 
      name: 'Thách đấu', 
      href: '/standardized-challenges', 
      icon: Swords,
      mobileLabel: 'Challenges',
      badgeKey: 'challenges',
      isCore: true
    },
    { 
      name: 'Giải đấu', 
      href: '/standardized-tournaments', 
      icon: Trophy,
      mobileLabel: 'Tournaments',
      isCore: true
    },
    { 
      name: 'Bảng xếp hạng', 
      href: '/leaderboard', 
      icon: BarChart3,
      mobileLabel: 'Rankings',
      isCore: true
    },
    { 
      name: 'Hồ sơ', 
      href: '/standardized-profile', 
      icon: User,
      mobileLabel: 'Profile',
      isCore: true
    },
  ] as NavigationItem[],

  // Extended desktop navigation (14 tabs total) - desktop only
  desktop: [
    // Core navigation (same as mobile)
    { 
      name: 'Trang chủ', 
      href: '/standardized-dashboard', 
      icon: Home,
      category: 'core',
      description: 'Bảng tin và hoạt động',
      isCore: true
    },
    { 
      name: 'Thách đấu', 
      href: '/standardized-challenges', 
      icon: Swords,
      category: 'core',
      description: 'Tạo và tham gia thách đấu',
      badgeKey: 'challenges',
      isCore: true
    },
    { 
      name: 'Giải đấu', 
      href: '/standardized-tournaments', 
      icon: Trophy,
      category: 'core',
      description: 'Tham gia giải đấu',
      isCore: true
    },
    { 
      name: 'Bảng xếp hạng', 
      href: '/leaderboard', 
      icon: BarChart3,
      category: 'core',
      description: 'Xem thứ hạng',
      isCore: true
    },
    { 
      name: 'Hồ sơ', 
      href: '/standardized-profile', 
      icon: User,
      category: 'core',
      description: 'Thông tin cá nhân',
      isCore: true
    },

    // Extended desktop features
    { 
      name: 'Hộp thư', 
      href: '/messages', 
      icon: MessageCircle,
      category: 'communication',
      description: 'Tin nhắn và trò chuyện',
      badgeKey: 'messages',
      isCore: false
    },
    { 
      name: 'Thông báo', 
      href: '/notifications', 
      icon: Bell,
      category: 'communication',
      description: 'Cập nhật mới nhất',
      badgeKey: 'notifications',
      isCore: false
    },
    { 
      name: 'Cộng đồng', 
      href: '/community', 
      icon: Heart,
      category: 'social',
      description: 'Kết nối với người chơi',
      isCore: false
    },
    { 
      name: 'Lịch', 
      href: '/calendar', 
      icon: Calendar,
      category: 'scheduling',
      description: 'Lịch trình thi đấu',
      isCore: false
    },
    { 
      name: 'Marketplace', 
      href: '/marketplace', 
      icon: Store,
      category: 'commerce',
      description: 'Mua bán và trao đổi',
      isCore: false,
      comingSoon: true // Will show placeholder until implemented
    },
    { 
      name: 'CLB', 
      href: '/clubs', 
      icon: Users,
      category: 'clubs',
      description: 'Câu lạc bộ billiards',
      isCore: false
    },
    { 
      name: 'Đăng ký CLB', 
      href: '/club-registration', 
      icon: Shield,
      category: 'clubs',
      description: 'Tạo câu lạc bộ mới',
      isCore: false
    },
    { 
      name: 'Ví', 
      href: '/wallet', 
      icon: Wallet,
      category: 'finance',
      description: 'Quản lý tài chính',
      isCore: false
    },
    { 
      name: 'Cài đặt', 
      href: '/settings', 
      icon: Settings,
      category: 'system',
      description: 'Tùy chỉnh hệ thống',
      isCore: false
    },
  ] as NavigationItem[],

  // Category organization for desktop sidebar
  categories: {
    core: { label: 'Menu chính', order: 1 },
    communication: { label: 'Liên lạc', order: 2 },
    social: { label: 'Cộng đồng', order: 3 },
    scheduling: { label: 'Lịch trình', order: 4 },
    commerce: { label: 'Thương mại', order: 5 },
    clubs: { label: 'Câu lạc bộ', order: 6 },
    finance: { label: 'Tài chính', order: 7 },
    system: { label: 'Hệ thống', order: 8 },
  }
};

// Route validation and existence checking
export const ROUTE_STATUS = {
  // Existing and functional routes
  existing: [
    '/standardized-dashboard',
    '/standardized-challenges', 
    '/standardized-tournaments',
    '/leaderboard', 
    '/standardized-profile',
    '/messages',
    '/notifications',
    '/community',
    '/calendar',
    '/clubs',
    '/club-registration',
    '/wallet',
    '/settings'
  ],

  // Routes that need placeholder pages
  placeholders: [
    '/marketplace' // Will show "Coming Soon" page
  ],

  // Routes with potential issues (to be verified)
  needsVerification: [
    '/community', // Check if CommunityPage exists and is functional
    '/calendar',  // Check if CalendarPage has proper content
    '/marketplace' // Currently shows placeholder
  ]
};

// Active route detection utility
export const useActiveRoute = () => {
  const location = useLocation();
  
  const isActiveRoute = (href: string) => {
    if (href === '/standardized-dashboard') {
      return location.pathname === '/standardized-dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getActiveCategory = () => {
    const activeRoute = SABO_NAVIGATION_CONFIG.desktop.find(item => 
      isActiveRoute(item.href)
    );
    return activeRoute?.category || 'core';
  };

  const getActiveNavItem = () => {
    return SABO_NAVIGATION_CONFIG.desktop.find(item => 
      isActiveRoute(item.href)
    );
  };

  return {
    isActiveRoute,
    getActiveCategory,
    getActiveNavItem,
    currentPath: location.pathname
  };
};

// Badge data hook for navigation counts
export const useNavigationBadges = () => {
  // Challenge notifications
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

  // Notification count
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

  // Message count (mock for now)
  const { data: messageCount } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      // TODO: Replace with actual message count query
      return 0;
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
        return null;
    }
  };

  return { getBadgeCount };
};

// Responsive navigation component selector
export const useNavigationConfig = () => {
  const { isMobile, isTablet, isDesktop } = useOptimizedResponsive();
  
  const getNavigationItems = () => {
    if (isMobile) {
      return SABO_NAVIGATION_CONFIG.mobile;
    }
    return SABO_NAVIGATION_CONFIG.desktop;
  };

  const shouldShowExtendedNav = () => {
    return isDesktop;
  };

  const getNavigationMode = () => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  };

  return {
    getNavigationItems,
    shouldShowExtendedNav,
    getNavigationMode,
    isMobile,
    isTablet,
    isDesktop
  };
};

export default SABO_NAVIGATION_CONFIG;
