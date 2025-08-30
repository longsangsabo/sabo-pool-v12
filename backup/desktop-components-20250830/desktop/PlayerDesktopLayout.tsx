import React, { useState } from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import PlayerDesktopSidebar from './PlayerDesktopSidebar';
import PlayerDesktopHeader from './PlayerDesktopHeader';

interface PlayerDesktopLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}

/**
 * PlayerDesktopLayout - Unified Desktop Layout for Role Player
 * 
 * This is the single source of truth for desktop player interface.
 * Consolidates functionality from multiple previous layouts:
 * - UserDesktopSidebar → PlayerDesktopSidebar
 * - UserDesktopSidebarIntegrated → Enhanced features
 * - UserDesktopSidebarSynchronized → Mobile-sync design tokens
 * 
 * Features:
 * - Mobile-synchronized design tokens
 * - Collapsible sidebar with state persistence
 * - Unified navigation with badges and real-time data
 * - Responsive header system
 * - Consistent styling with mobile interface
 */
export const PlayerDesktopLayout: React.FC<PlayerDesktopLayoutProps> = ({
  children,
  pageTitle,
  showHeader = true,
  showSidebar = true,
  className = '',
}) => {
  const { isDesktop } = useOptimizedResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Persist sidebar state in localStorage
    const saved = localStorage.getItem('player-desktop-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save sidebar state to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem(
      'player-desktop-sidebar-collapsed',
      JSON.stringify(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Only render on desktop - mobile uses PlayerMobileLayout
  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className={`player-desktop-layout flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      {showSidebar && (
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <PlayerDesktopSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {showHeader && (
          <PlayerDesktopHeader
            title={pageTitle}
            onToggleSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayerDesktopLayout;
