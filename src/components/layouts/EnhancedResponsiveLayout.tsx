import React, { useState } from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { useNavigationConfig } from '@/config/NavigationConfig';
import { UserDesktopSidebarIntegrated } from '@/components/desktop/UserDesktopSidebarIntegrated';
import { MobilePlayerLayout } from '@/components/mobile/MobilePlayerLayout';

interface EnhancedResponsiveLayoutProps {
  children: React.ReactNode;
}

export const EnhancedResponsiveLayout: React.FC<EnhancedResponsiveLayoutProps> = ({
  children,
}) => {
  const { isMobile, isTablet, isDesktop } = useOptimizedResponsive();
  const { shouldShowExtendedNav } = useNavigationConfig();
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  // Mobile layout - uses existing mobile player layout with bottom navigation
  if (isMobile) {
    return (
      <MobilePlayerLayout>
        {children}
      </MobilePlayerLayout>
    );
  }

  // Tablet layout - compact desktop sidebar
  if (isTablet) {
    return (
      <div className="flex h-screen bg-background">
        <UserDesktopSidebarIntegrated 
          collapsed={true} // Always collapsed on tablet for space
          onToggle={handleToggleSidebar}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop layout - full sidebar with all 14 navigation options
  if (isDesktop && shouldShowExtendedNav()) {
    return (
      <div className="flex h-screen bg-background">
        <UserDesktopSidebarIntegrated 
          collapsed={desktopSidebarCollapsed}
          onToggle={handleToggleSidebar}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Fallback layout
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {children}
      </div>
    </div>
  );
};

export default EnhancedResponsiveLayout;
