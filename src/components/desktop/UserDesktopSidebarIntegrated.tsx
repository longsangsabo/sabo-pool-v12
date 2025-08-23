import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SPAPointsBadge from '@/components/SPAPointsBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  SABO_NAVIGATION_CONFIG, 
  useActiveRoute, 
  useNavigationBadges 
} from '@/config/NavigationConfig';

interface UserDesktopSidebarIntegratedProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const UserDesktopSidebarIntegrated: React.FC<UserDesktopSidebarIntegratedProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const { user } = useAuth();
  const { isActiveRoute } = useActiveRoute();
  const { getBadgeCount } = useNavigationBadges();

  // Get navigation items organized by category
  const coreNavItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'core');
  const communicationItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'communication');
  const socialItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'social');
  const schedulingItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'scheduling');
  const commerceItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'commerce');
  const clubItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'clubs');
  const financeItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'finance');
  const systemItems = SABO_NAVIGATION_CONFIG.desktop.filter(item => item.category === 'system');

  const renderNavigationSection = (
    title: string, 
    items: any[], 
    showTitle: boolean = true
  ) => (
    <>
      {showTitle && !collapsed && (
        <div className='px-2 py-1 mb-2'>
          <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            {title}
          </h3>
        </div>
      )}
      <div className={cn('space-y-1', showTitle && 'mb-4')}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          const badgeCount = getBadgeCount(item.badgeKey);

          return (
            <NavLink
              key={`${item.category}-${index}`}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <div className='relative'>
                <Icon className={cn('w-5 h-5', isActive && 'text-primary-foreground')} />
                {badgeCount && badgeCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center'
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Badge>
                )}
              </div>
              {!collapsed && (
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <span className='truncate'>{item.name}</span>
                    {item.comingSoon && (
                      <Badge variant='secondary' className='text-xs ml-2'>
                        Soon
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className='text-xs text-muted-foreground truncate mt-0.5'>
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        // Apply mobile-synchronized design tokens
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
            {/* Header Section */}
      <div className='p-4 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
            <Target className='w-5 h-5 text-primary-foreground' />
          </div>
          {!collapsed && (
            <div className='flex-1 min-w-0'>
              <h2 className='font-bold text-lg truncate'>SABO ARENA</h2>
              <p className='text-xs text-muted-foreground truncate'>
                Billiards Arena
              </p>
            </div>
          )}
          <div className='flex items-center gap-1'>
            <ThemeToggle 
              size={collapsed ? 'sm' : 'md'} 
              variant={collapsed ? 'icon' : 'compact'} 
            />
            {onToggle && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onToggle}
                className='ml-1'
              >
                {collapsed ? (
                  <ChevronRight className='w-4 h-4' />
                ) : (
                  <ChevronLeft className='w-4 h-4' />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className='p-4 border-b border-border'>
          <div className='flex items-center gap-3'>
            <Avatar className='w-10 h-10'>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-sm truncate'>
                  {user.user_metadata?.display_name || user.email || 'User'}
                </p>
                <p className='text-xs text-muted-foreground truncate'>
                  Player
                </p>
              </div>
            )}
            {!collapsed && (
              <div>
                <SPAPointsBadge />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <ScrollArea className='flex-1'>
        <nav className='p-2'>
          {/* Core Navigation Section */}
          {renderNavigationSection('Menu chính', coreNavItems)}

          {/* Communication Section */}
          {renderNavigationSection('Liên lạc', communicationItems)}

          {/* Social Section */}
          {renderNavigationSection('Cộng đồng', socialItems)}

          {/* Scheduling Section */}
          {renderNavigationSection('Lịch trình', schedulingItems)}

          {/* Commerce Section */}
          {renderNavigationSection('Thương mại', commerceItems)}

          {/* Club Section */}
          {renderNavigationSection('Câu lạc bộ', clubItems)}

          {/* Finance Section */}
          {renderNavigationSection('Tài chính', financeItems)}

          {/* System Section */}
          {renderNavigationSection('Hệ thống', systemItems)}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className='p-4 border-t border-border'>
        {!collapsed && (
          <div className='space-y-2'>
            <div className='text-xs text-muted-foreground'>
              <p>Phiên bản: 1.0.0</p>
              <p>© 2024 SABO ARENA</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDesktopSidebarIntegrated;
