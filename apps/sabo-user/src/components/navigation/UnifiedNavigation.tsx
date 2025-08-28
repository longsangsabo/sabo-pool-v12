import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { useNavigationConfig } from '@/config/NavigationConfig';
import { UserDesktopSidebarIntegrated } from '@/components/desktop/UserDesktopSidebarIntegrated';
import { MobilePlayerLayout } from '@/components/mobile/MobilePlayerLayout';

interface UnifiedNavigationProps {
  children: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  children,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const { isMobile, isTablet, isDesktop } = useOptimizedResponsive();
  const { getNavigationMode } = useNavigationConfig();

  const navigationMode = getNavigationMode();

  // Mobile navigation - use existing mobile layout
  if (isMobile) {
    return (
      <MobilePlayerLayout>
        {children}
      </MobilePlayerLayout>
    );
  }

  // Tablet navigation - use desktop sidebar but more compact
  if (isTablet) {
    return (
      <div className="flex h-screen bg-background">
        <UserDesktopSidebarIntegrated 
          collapsed={true} // Always collapsed on tablet
          onToggle={onToggleCollapsed}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop navigation - full sidebar with toggle capability
  if (isDesktop) {
    return (
      <div className="flex h-screen bg-background">
        <UserDesktopSidebarIntegrated 
          collapsed={collapsed}
          onToggle={onToggleCollapsed}
        />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          collapsed ? 'ml-0' : 'ml-0'
        }`}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-background p-4">
      {children}
    </div>
  );
};

export default UnifiedNavigation;
