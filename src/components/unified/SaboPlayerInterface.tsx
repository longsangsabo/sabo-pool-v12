import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { DesktopDashboard } from '@/components/dashboard/DesktopDashboard';
import { UserDesktopSidebarSynchronized } from '@/components/desktop/UserDesktopSidebarSynchronized';
import { UserDesktopHeaderSynchronized } from '@/components/desktop/UserDesktopHeaderSynchronized';
import { MobilePlayerLayout } from '@/components/mobile/MobilePlayerLayout';

// Import the synchronized design system
import '@/styles/sabo-design-system.css';

interface SaboPlayerInterfaceProps {
  children?: React.ReactNode;
}

/**
 * SABO Arena Unified Player Interface
 * 
 * This component demonstrates the synchronized desktop-mobile interface
 * that maintains visual consistency across all device types.
 * 
 * Features:
 * - Mobile-derived design tokens
 * - Consistent color palette
 * - Synchronized typography
 * - Unified component styling
 * - Responsive layout system
 */
export const SaboPlayerInterface: React.FC<SaboPlayerInterfaceProps> = ({ 
  children 
}) => {
  const { isMobile, isTablet, isDesktop } = useOptimizedResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Mobile Interface - Uses existing mobile layout
  if (isMobile) {
    return (
      <MobilePlayerLayout 
        pageTitle="Trang Chủ"
        showBackground={true}
        showHeader={true}
        showNavigation={true}
      >
        {children}
      </MobilePlayerLayout>
    );
  }

  // Desktop Interface - Synchronized with mobile design
  if (isDesktop) {
    return (
      <div className="sabo-player-interface flex min-h-screen bg-background">
        {/* Synchronized Desktop Sidebar */}
        <UserDesktopSidebarSynchronized
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Synchronized Desktop Header */}
          <UserDesktopHeaderSynchronized
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Content Container */}
          <main className="flex-1 overflow-auto">
            {children || <DesktopDashboard />}
          </main>
        </div>
      </div>
    );
  }

  // Tablet Interface - Falls back to mobile layout
  return (
    <MobilePlayerLayout 
      pageTitle="Trang Chủ"
      showBackground={true}
      showHeader={true}
      showNavigation={true}
    >
      {children}
    </MobilePlayerLayout>
  );
};

// Export individual synchronized components for custom layouts
export {
  DesktopDashboard,
  UserDesktopSidebarSynchronized,
  UserDesktopHeaderSynchronized,
};

/**
 * Usage Examples:
 * 
 * // Basic unified interface
 * <SaboPlayerInterface />
 * 
 * // Custom content with unified interface
 * <SaboPlayerInterface>
 *   <CustomDashboardContent />
 * </SaboPlayerInterface>
 * 
 * // Individual components for custom layouts
 * <div className="custom-layout">
 *   <UserDesktopSidebarSynchronized collapsed={false} />
 *   <main>
 *     <UserDesktopHeaderSynchronized />
 *     <DesktopDashboard />
 *   </main>
 * </div>
 */
