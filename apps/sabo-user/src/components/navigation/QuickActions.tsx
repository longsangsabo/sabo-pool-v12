import React from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  Trophy, 
  Users, 
  Target,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/Button/Button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'tournament' | 'challenge';
  badge?: number;
}

export const QuickActions: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      id: 'new-tournament',
      label: 'New Tournament',
      icon: Trophy,
      action: () => console.log('Create tournament'),
      variant: 'tournament'
    },
    {
      id: 'join-challenge',
      label: 'Join Challenge',
      icon: Target,
      action: () => console.log('Join challenge'),
      variant: 'challenge'
    },
    {
      id: 'find-players',
      label: 'Find Players',
      icon: Users,
      action: () => console.log('Find players'),
      variant: 'secondary'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      action: () => console.log('View schedule'),
      variant: 'secondary'
    }
  ];

  const utilityActions = [
    {
      id: 'search',
      icon: Search,
      action: () => console.log('Open search')
    },
    {
      id: 'notifications',
      icon: Bell,
      action: () => console.log('Open notifications'),
      badge: 3
    },
    {
      id: 'settings',
      icon: Settings,
      action: () => console.log('Open settings')
    }
  ];

  return (
    <div className="flex items-center justify-between w-full">
      {/* Primary Quick Actions */}
      <div className="hidden md:flex items-center space-x-3">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'secondary'}
            size="sm"
            onClick={action.action}
            className="flex items-center space-x-2"
          >
            <action.icon className="w-4 h-4" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Mobile Quick Action Dropdown */}
      <div className="md:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => console.log('Open quick actions menu')}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Actions</span>
        </Button>
      </div>

      {/* Utility Actions */}
      <div className="flex items-center space-x-2">
        {utilityActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <action.icon className="w-5 h-5" />
            {action.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
