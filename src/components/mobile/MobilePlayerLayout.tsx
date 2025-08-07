import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { useMobilePageTitle } from '@/hooks/useMobilePageTitle';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';

// ✅ Chuẩn hóa tên các trang mobile
export const MOBILE_PAGE_TITLES = {
  // Core Player Pages
  DASHBOARD: 'Trang Chủ',
  PROFILE: 'Hồ Sơ',
  TOURNAMENTS: 'Giải Đấu',
  CHALLENGES: 'Thách Đấu',
  LEADERBOARD: 'Xếp Hạng',
  
  // Secondary Pages  
  CALENDAR: 'Lịch Thi Đấu',
  COMMUNITY: 'Cộng Đồng',
  FEED: 'Bảng Tin',
  MARKETPLACE: 'Cửa Hàng',
  NOTIFICATIONS: 'Thông Báo',
  SETTINGS: 'Cài Đặt',
  WALLET: 'Ví Điện Tử',
  
  // Club Pages
  CLUBS: 'Câu Lạc Bộ',
  CLUB_DETAIL: 'Chi Tiết CLB',
  CLUB_REGISTRATION: 'Đăng Ký CLB',
  
  // Public Pages
  ABOUT: 'Giới Thiệu',
  CONTACT: 'Liên Hệ',
  NEWS: 'Tin Tức',
  PRIVACY: 'Chính Sách',
  TERMS: 'Điều Khoản',
} as const;

// ✅ Type cho page titles
export type MobilePageTitle = typeof MOBILE_PAGE_TITLES[keyof typeof MOBILE_PAGE_TITLES];

interface MobilePlayerLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  customPadding?: string;
  className?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
  pageTitle?: MobilePageTitle;
}

export const MobilePlayerLayout: React.FC<MobilePlayerLayoutProps> = ({
  children,
  showBackground = true,
  customPadding = 'p-4',
  className = '',
  showHeader = true,
  showNavigation = true,
  pageTitle: customPageTitle,
}) => {
  const { theme } = useTheme();
  const { isMobile } = useOptimizedResponsive();
  const autoPageTitle = useMobilePageTitle();
  
  // Use custom title if provided, otherwise auto-detect
  const finalPageTitle = customPageTitle || autoPageTitle;

  // Only apply to mobile
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Billiards Background Overlay - Dark Mode Only */}
      {theme === 'dark' && showBackground && (
        <div 
          className='fixed inset-0 w-full h-full z-0'
          style={{
            backgroundImage: 'url(https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//billiards-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
      )}
      
      {/* Mobile Header */}
      {showHeader && (
        <MobileHeader title={finalPageTitle} />
      )}
      
      {/* Main Content Container */}
      <div 
        className={`min-h-screen relative z-10 ${
          theme === 'dark' && showBackground ? 'bg-transparent' : 'bg-background'
        } ${className}`}
      >
        {/* Content Area */}
        <main 
          className={`${customPadding} ${showHeader ? 'pt-8' : 'pt-4'} ${showNavigation ? 'pb-20' : 'pb-4'}`}
        >
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      {showNavigation && (
        <MobileNavigation />
      )}
    </>
  );
};

export default MobilePlayerLayout;
