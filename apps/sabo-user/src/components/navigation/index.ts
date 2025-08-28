// Navigation Components
export { Breadcrumbs } from './Breadcrumbs';
export { QuickActions } from './QuickActions';
export { ResponsiveSidebar } from './ResponsiveSidebar';
export { BottomNavigation } from './BottomNavigation';

// Re-export types for external use
export interface NavigationProps {
  isOpen?: boolean;
  onToggle?: () => void;
}
