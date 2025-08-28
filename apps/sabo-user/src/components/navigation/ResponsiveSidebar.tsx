import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  Trophy,
  Target,
  Users,
  BarChart3,
  Settings,
  User,
  Calendar,
  Medal,
  TrendingUp,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavigationItem[];
}

interface ResponsiveSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  isOpen,
  onToggle
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      href: '/tournaments',
      icon: Trophy,
      badge: 2,
      children: [
        { id: 'active-tournaments', label: 'Active', href: '/tournaments/active', icon: Trophy },
        { id: 'upcoming-tournaments', label: 'Upcoming', href: '/tournaments/upcoming', icon: Calendar },
        { id: 'completed-tournaments', label: 'Completed', href: '/tournaments/completed', icon: Medal }
      ]
    },
    {
      id: 'challenges',
      label: 'Challenges',
      href: '/challenges',
      icon: Target,
      children: [
        { id: 'active-challenges', label: 'Active', href: '/challenges/active', icon: Target },
        { id: 'browse-challenges', label: 'Browse', href: '/challenges/browse', icon: Users }
      ]
    },
    {
      id: 'players',
      label: 'Players',
      href: '/players',
      icon: Users,
      children: [
        { id: 'rankings', label: 'Rankings', href: '/players/rankings', icon: TrendingUp },
        { id: 'find-players', label: 'Find Players', href: '/players/find', icon: Users }
      ]
    },
    {
      id: 'statistics',
      label: 'Statistics',
      href: '/statistics',
      icon: BarChart3,
      children: [
        { id: 'my-stats', label: 'My Stats', href: '/statistics/me', icon: BarChart3 },
        { id: 'leaderboards', label: 'Leaderboards', href: '/statistics/leaderboards', icon: Medal }
      ]
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: User
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);
  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const itemIsExpanded = hasChildren && isExpanded(item.id);
    const itemIsActive = isActive(item.href);

    return (
      <div key={item.id}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              level > 0 && 'ml-4',
              itemIsActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </div>
            <ChevronRight 
              className={clsx(
                'w-4 h-4 transition-transform',
                itemIsExpanded && 'rotate-90'
              )} 
            />
          </button>
        ) : (
          <NavLink
            to={item.href}
            onClick={() => {
              if (window.innerWidth < 768) {
                onToggle();
              }
            }}
            className={({ isActive }) => clsx(
              'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              level > 0 && 'ml-4',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {item.badge}
              </span>
            )}
          </NavLink>
        )}

        {hasChildren && itemIsExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            onClick={onToggle}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map(item => renderNavigationItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            SABO Pool Arena
          </div>
          <div className="text-xs text-gray-400">
            v12.0 Beta
          </div>
        </div>
      </aside>
    </>
  );
};
