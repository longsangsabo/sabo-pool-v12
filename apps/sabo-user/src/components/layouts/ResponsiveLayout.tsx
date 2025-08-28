import React from "react";
import { memo, useState } from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { DesktopLayout } from '../desktop/DesktopLayout';
import { MobilePlayerLayout } from '../mobile/MobilePlayerLayout';
import { TabletLayout } from '../tablet/TabletLayout';
import { UserDesktopSidebarIntegrated } from '../desktop/UserDesktopSidebarIntegrated';
import { DesktopHeader } from '../desktop/DesktopHeader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayoutBase: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const { isMobile, isTablet, isDesktop } = useOptimizedResponsive();
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  // Mobile layout - use existing mobile player layout with 5-tab bottom navigation
  if (isMobile) {
    return (
      <div data-testid='mobile-layout'>
        <MobilePlayerLayout customPadding='px-4'>{children}</MobilePlayerLayout>
      </div>
    );
  }

  // Tablet layout - compact desktop sidebar with all navigation options
  if (isTablet) {
    return (
      <div data-testid='tablet-layout' className="flex h-screen bg-background">
        <UserDesktopSidebarIntegrated 
          collapsed={true} // Always collapsed on tablet for space optimization
          onToggle={handleToggleSidebar}
        />
        <div className="flex-1 flex flex-col">
          <DesktopHeader />
          <main className="flex-1 overflow-auto">
            <div className="p-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Desktop layout - full navigation with 14 tabs and toggle capability
  if (isDesktop) {
    return (
      <div data-testid='desktop-layout' className="flex h-screen bg-background">
        <UserDesktopSidebarIntegrated 
          collapsed={desktopSidebarCollapsed}
          onToggle={handleToggleSidebar}
        />
        <div className="flex-1 flex flex-col">
          <DesktopHeader />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Fallback loading state during initial render
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoadingSpinner />
    </div>
  );
};

// Memoized for performance
export const ResponsiveLayout = memo(ResponsiveLayoutBase);
