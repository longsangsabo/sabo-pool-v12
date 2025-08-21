import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { useAdminPageTitle } from '@/hooks/useAdminPageTitle';
import { AdminMobileHeader } from '@/components/admin/AdminMobileHeader';
import { AdminMobileNavigation } from '@/components/admin/AdminMobileNavigation';

// ✅ Chuẩn hóa tên các trang admin mobile
export const ADMIN_PAGE_TITLES = {
  // Core Admin Pages
  DASHBOARD: 'Quản Trị Hệ Thống',
  USERS: 'Quản Lý Users',
  TOURNAMENTS: 'Quản Lý Giải Đấu',
  CLUBS: 'Quản Lý CLB',
  ANALYTICS: 'Thống Kê',
  
  // Secondary Admin Pages
  TRANSACTIONS: 'Giao Dịch',
  CHALLENGES: 'Thách Đấu',
  LEADERBOARD: 'Bảng Xếp Hạng',
  NOTIFICATIONS: 'Thông Báo',
  SETTINGS: 'Cài Đặt',
  
  // Management Pages
  RANK_VERIFICATION: 'Xác Minh Rank',
  LEGACY_CLAIMS: 'Legacy Claims',
  GAME_CONFIG: 'Cấu Hình Game',
  PAYMENTS: 'Thanh Toán',
  EMERGENCY: 'Khẩn Cấp',
  
  // System Pages
  DATABASE: 'Cơ Sở Dữ Liệu',
  AUTOMATION: 'Tự Động Hóa', 
  DEVELOPMENT: 'Phát Triển',
  REPORTS: 'Báo Cáo',
  GUIDE: 'Hướng Dẫn',
  SCHEDULE: 'Lịch Trình',
  
  // Advanced Admin Pages
  AI_ASSISTANT: 'AI Assistant',
  SYSTEM_RESET: 'Reset Hệ Thống',
  DOC_CLEANUP: 'Dọn Dẹp Tài Liệu',
  TESTING: 'Testing Dashboard',
} as const;

// ✅ Type cho admin page titles
export type AdminPageTitle =
  (typeof ADMIN_PAGE_TITLES)[keyof typeof ADMIN_PAGE_TITLES];

interface AdminPlayerLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  customPadding?: string;
  className?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
  pageTitle?: AdminPageTitle;
  onMenuClick?: () => void;
}

export const AdminPlayerLayout: React.FC<AdminPlayerLayoutProps> = ({
  children,
  showBackground = true,
  customPadding = 'p-4',
  className = '',
  showHeader = true,
  showNavigation = true,
  pageTitle: customPageTitle,
  onMenuClick,
}) => {
  const { theme } = useTheme();
  const { isMobile } = useOptimizedResponsive();
  const autoPageTitle = useAdminPageTitle();

  // Use custom title if provided, otherwise auto-detect
  const finalPageTitle = customPageTitle || autoPageTitle;

  // Only apply to mobile
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Admin Background Overlay - Dark Mode Only */}
      {theme === 'dark' && showBackground && (
        <div
          className='fixed inset-0 w-full h-full z-0'
          style={{
            backgroundImage:
              'url(https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//admin-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            opacity: 0.1,
          }}
        />
      )}

      {/* Admin Mobile Header */}
      {showHeader && (
        <AdminMobileHeader title={finalPageTitle} onMenuClick={onMenuClick} />
      )}

      {/* Main Content Container */}
      <div
        className={`min-h-screen relative z-10 ${
          theme === 'dark' && showBackground
            ? 'bg-transparent'
            : 'bg-background'
        } ${className}`}
      >
        {/* Content Area */}
        <main
          className={`${customPadding} ${showHeader ? 'pt-16' : 'pt-4'} ${showNavigation ? 'pb-20' : 'pb-4'}`}
        >
          {children}
        </main>
      </div>

      {/* Admin Mobile Navigation */}
      {showNavigation && <AdminMobileNavigation />}
    </>
  );
};

export default AdminPlayerLayout;
