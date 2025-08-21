import React from 'react';
import { useAdminViewMode } from '@/hooks/useAdminViewMode';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { MobilePlayerLayout, MOBILE_PAGE_TITLES, type MobilePageTitle } from './MobilePlayerLayout';
import { AdminPlayerLayout, ADMIN_PAGE_TITLES, type AdminPageTitle } from './AdminPlayerLayout';
import { Button } from '@/components/ui/button';
import { Eye, Shield, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminHybridLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  customPadding?: string;
  className?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
  pageTitle?: string;
  onMenuClick?: () => void;
}

export const AdminHybridLayout: React.FC<AdminHybridLayoutProps> = ({
  children,
  showBackground = true,
  customPadding = 'p-4',
  className = '',
  showHeader = true,
  showNavigation = true,
  pageTitle,
  onMenuClick,
}) => {
  const { isAdmin } = useAdminCheck();
  const { viewMode, toggleViewMode, isPlayerView, isAdminView } = useAdminViewMode();

  // Only show hybrid mode for admins
  if (!isAdmin) {
    return (
      <MobilePlayerLayout
        showBackground={showBackground}
        customPadding={customPadding}
        className={className}
        showHeader={showHeader}
        showNavigation={showNavigation}
        pageTitle={pageTitle as MobilePageTitle}
        onMenuClick={onMenuClick}
      >
        {children}
      </MobilePlayerLayout>
    );
  }

  // Admin Mode Toggle Button
  const ViewModeToggle = () => (
    <div className='fixed top-20 right-4 z-50 flex flex-col gap-2'>
      <Button
        onClick={toggleViewMode}
        size='sm'
        variant={isPlayerView ? 'default' : 'outline'}
        className='shadow-lg backdrop-blur-sm bg-background/90 border-2'
      >
        {isPlayerView ? (
          <>
            <Eye className='h-4 w-4 mr-2' />
            <span className='text-xs'>Player View</span>
          </>
        ) : (
          <>
            <Shield className='h-4 w-4 mr-2' />
            <span className='text-xs'>Admin View</span>
          </>
        )}
      </Button>
      
      {isPlayerView && (
        <Badge variant='secondary' className='text-xs bg-blue-500/20 text-blue-600 border-blue-200'>
          <RefreshCw className='h-3 w-3 mr-1' />
          Cleaning Mode
        </Badge>
      )}
    </div>
  );

  // Player View Mode - Admin sees the interface like a regular player
  if (isPlayerView) {
    return (
      <>
        <MobilePlayerLayout
          showBackground={showBackground}
          customPadding={customPadding}
          className={className}
          showHeader={showHeader}
          showNavigation={showNavigation}
          pageTitle={(pageTitle || 'Trang Chủ') as MobilePageTitle}
          onMenuClick={onMenuClick}
        >
          {children}
        </MobilePlayerLayout>
        <ViewModeToggle />
      </>
    );
  }

  // Admin View Mode - Normal admin interface
  return (
    <>
      <AdminPlayerLayout
        showBackground={showBackground}
        customPadding={customPadding}
        className={className}
        showHeader={showHeader}
        showNavigation={showNavigation}
        pageTitle={pageTitle as AdminPageTitle}
        onMenuClick={onMenuClick}
      >
        {children}
      </AdminPlayerLayout>
      <ViewModeToggle />
    </>
  );
};

export default AdminHybridLayout;
