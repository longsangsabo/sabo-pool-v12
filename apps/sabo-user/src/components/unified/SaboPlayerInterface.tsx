import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { DesktopDashboard } from '@/components/dashboard/DesktopDashboard';
import PlayerDesktopLayout from '@/components/desktop/PlayerDesktopLayout';
import { MobilePlayerLayout } from '@/components/mobile/MobilePlayerLayout';

// Import the synchronized design system
import './styles/sabo-design-system.css';

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

 // Desktop Interface - Uses unified PlayerDesktopLayout
 if (isDesktop) {
  return (
   <PlayerDesktopLayout pageTitle="SABO Arena Player">
    {children || <DesktopDashboard />}
   </PlayerDesktopLayout>
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

// Export individual components for custom layouts
export {
 DesktopDashboard,
 PlayerDesktopLayout,
};

/**
 * Usage Examples:
 * 
 * // Basic unified interface
 * <SaboPlayerInterface />
 * 
 * // Custom content with unified interface
 * <SaboPlayerInterface>
 *  <CustomDashboardContent />
 * </SaboPlayerInterface>
 * 
 * // Individual components for custom layouts
 * <PlayerDesktopLayout pageTitle="Custom Page">
 *  <DesktopDashboard />
 * </PlayerDesktopLayout>
 */
