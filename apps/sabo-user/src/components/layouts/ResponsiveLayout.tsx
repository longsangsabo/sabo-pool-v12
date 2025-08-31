import { memo, useState } from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { MobilePlayerLayout } from '../mobile/MobilePlayerLayout';
import PlayerDesktopLayout from '../desktop/PlayerDesktopLayout';
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

 // Tablet layout - use PlayerDesktopLayout with collapsed sidebar
 if (isTablet) {
  return (
   <div data-testid='tablet-layout'>
    <PlayerDesktopLayout pageTitle="SABO Arena Player (Tablet)">
     {children}
    </PlayerDesktopLayout>
   </div>
  );
 }

 // Desktop layout - unified PlayerDesktopLayout with consolidated features
 if (isDesktop) {
  return (
   <div data-testid='desktop-layout'>
    <PlayerDesktopLayout pageTitle="SABO Arena Player">
     {children}
    </PlayerDesktopLayout>
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
