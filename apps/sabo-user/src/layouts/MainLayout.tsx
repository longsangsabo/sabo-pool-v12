import React, { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import Navigation from '@/components/Navigation';
import { Breadcrumbs, QuickActions, ResponsiveSidebar } from '../components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showSidebar?: boolean;
  showQuickActions?: boolean;
  sidebarContent?: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  background?: 'default' | 'gray' | 'gradient';
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  description,
  showBreadcrumbs = true,
  showSidebar = false,
  showQuickActions = true,
  sidebarContent,
  className = '',
  maxWidth = 'full',
  background = 'default'
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const backgroundClasses = {
    default: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={clsx('min-h-screen', backgroundClasses[background])}>
      {/* Navigation */}
      <Navigation />
      
      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <ResponsiveSidebar 
            isOpen={sidebarOpen || !isMobile}
            onToggle={toggleSidebar}
          />
        )}
        
        {/* Main Content */}
        <main className={clsx(
          'flex-1 transition-all duration-200',
          {
            'md:ml-64': showSidebar,
            'ml-0': !showSidebar
          }
        )}>
          <div className={clsx(
            'mx-auto px-4 sm:px-6 lg:px-8 py-6',
            maxWidthClasses[maxWidth]
          )}>
            {/* Breadcrumbs */}
            {showBreadcrumbs && user && (
              <div className="mb-6">
                <Breadcrumbs />
              </div>
            )}
            
            {/* Page Header */}
            {(title || description) && (
              <div className="mb-8">
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-lg text-gray-600">
                    {description}
                  </p>
                )}
              </div>
            )}
            
            {/* Page Content */}
            <div className={clsx('space-y-6', className)}>
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Quick Actions (Mobile) */}
      {showQuickActions && isMobile && user && (
        <QuickActions />
      )}
    </div>
  );
};

export default MainLayout;
