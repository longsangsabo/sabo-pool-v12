import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Trophy,
  Building2,
  AlertTriangle,
  CreditCard,
  Activity,
  TrendingUp,
  Server,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeTournaments: number;
  totalClubs: number;
  pendingTasks: number;
  systemAlerts: number;
  todayTransactions: number;
  onlineUsers: number;
  serverUptime: string;
}

interface AdminStatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  loading,
}) => {
  const statsItems = [
    {
      icon: Users,
      label: 'Tổng Users',
      value: stats.totalUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      badge: stats.onlineUsers > 0 ? `${stats.onlineUsers} online` : undefined,
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      icon: Trophy,
      label: 'Giải Đấu Hoạt Động',
      value: stats.activeTournaments,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      icon: Building2,
      label: 'Tổng CLB',
      value: stats.totalClubs,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: AlertTriangle,
      label: 'Pending Tasks',
      value: stats.pendingTasks,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      badge: stats.pendingTasks > 0 ? 'Cần xử lý' : 'OK',
      badgeColor: stats.pendingTasks > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
    },
    {
      icon: CreditCard,
      label: 'Giao Dịch Hôm Nay',
      value: stats.todayTransactions,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Server,
      label: 'System Uptime',
      value: stats.serverUptime,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      badge: stats.systemAlerts > 0 ? `${stats.systemAlerts} alerts` : 'Stable',
      badgeColor: stats.systemAlerts > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700',
    },
  ];

  if (loading) {
    return (
      <div className='grid grid-cols-2 gap-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-muted rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <div className='h-3 bg-muted rounded w-3/4' />
                  <div className='h-4 bg-muted rounded w-1/2' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className='text-lg font-semibold mb-4'>Thống Kê Tổng Quan</h3>
      <div className='grid grid-cols-2 gap-3'>
        {statsItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card 
              key={index} 
              className='hover:shadow-md transition-shadow duration-200 border border-border/50'
            >
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-muted-foreground font-medium truncate'>
                      {item.label}
                    </p>
                    <p className='text-lg font-bold text-foreground mt-1'>
                      {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                    </p>
                    {item.badge && (
                      <Badge 
                        variant='outline' 
                        className={`text-xs mt-1 ${item.badgeColor} border-0`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
