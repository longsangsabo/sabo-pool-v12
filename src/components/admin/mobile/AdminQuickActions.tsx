import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Trophy,
  Building2,
  BarChart3,
  Shield,
  Bell,
  Database,
  Settings,
  Zap,
} from 'lucide-react';

export const AdminQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Users,
      label: 'Quản Lý Users',
      description: 'Xem và quản lý người dùng',
      path: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Trophy,
      label: 'Giải Đấu',
      description: 'Quản lý các giải đấu',
      path: '/admin/tournaments',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      icon: Building2,
      label: 'CLB',
      description: 'Quản lý câu lạc bộ',
      path: '/admin/clubs',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: BarChart3,
      label: 'Thống Kê',
      description: 'Xem báo cáo và analytics',
      path: '/admin/analytics',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Shield,
      label: 'Xác Minh Rank',
      description: 'Duyệt yêu cầu xác minh',
      path: '/admin/rank-verification',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Bell,
      label: 'Thông Báo',
      description: 'Quản lý hệ thống thông báo',
      path: '/admin/notifications',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: Database,
      label: 'Database',
      description: 'Quản lý cơ sở dữ liệu',
      path: '/admin/database',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      icon: Settings,
      label: 'Cài Đặt',
      description: 'Cấu hình hệ thống',
      path: '/admin/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg flex items-center gap-2'>
          <Zap className='w-5 h-5 text-primary' />
          Thao Tác Nhanh
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-2 gap-3'>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant='outline'
                className='h-auto p-3 justify-start hover:shadow-md transition-all duration-200'
                onClick={() => navigate(action.path)}
              >
                <div className='flex items-center gap-3 w-full'>
                  <div className={`p-2 rounded-md ${action.bgColor}`}>
                    <Icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className='flex-1 text-left min-w-0'>
                    <p className='font-medium text-sm truncate'>{action.label}</p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
