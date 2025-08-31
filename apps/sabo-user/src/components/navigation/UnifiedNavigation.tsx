import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { useNavigationConfig } from '@/config/NavigationConfig';
import PlayerDesktopLayout from '@/components/desktop/PlayerDesktopLayout';
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

 // Tablet navigation - use PlayerDesktopLayout
 if (isTablet) {
  return (
   <PlayerDesktopLayout pageTitle="SABO Arena (Tablet)">
    {children}
   </PlayerDesktopLayout>
  );
 }

 // Desktop navigation - use PlayerDesktopLayout
 if (isDesktop) {
  return (
   <PlayerDesktopLayout pageTitle="SABO Arena (Desktop)">
    {children}
   </PlayerDesktopLayout>
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
