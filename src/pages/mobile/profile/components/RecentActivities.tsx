import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  ChevronRight, 
  Trophy, 
  Star, 
  User,
  Award 
} from 'lucide-react';

interface RecentActivitiesProps {
  theme: 'light' | 'dark';
}

const ActivityItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  time: string;
  theme: 'light' | 'dark';
  gradient: string;
  points?: { value: string; label: string };
}> = ({ icon, title, time, theme, gradient, points }) => (
  <div className={`group relative overflow-hidden rounded-xl border ${gradient}`}>
    <div className='flex items-center gap-4 p-3'>
      <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center`}>
        {icon}
        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
          theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
        }`}></div>
      </div>
      <div className='flex-1 min-w-0'>
        <div className={`text-sm font-medium mb-0.5 ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
        }`}>{title}</div>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
        }`}>{time}</div>
      </div>
      {points && (
        <div className={`text-right ${
          theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
        }`}>
          <div className='text-sm font-bold'>{points.value}</div>
          <div className='text-xs font-medium opacity-80'>{points.label}</div>
        </div>
      )}
    </div>
  </div>
);

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ theme }) => {
  const activities = [
    {
      icon: <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />,
      title: 'Tham gia giải đấu mới',
      time: '2 giờ trước',
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30 backdrop-blur-sm' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100'
    },
    {
      icon: <Star className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`} />,
      title: 'Nhận 50 SPA Points',
      time: '1 ngày trước',
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-r from-emerald-950/30 to-green-900/20 border-emerald-800/30 backdrop-blur-sm' 
        : 'bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-100',
      points: { value: '+50', label: 'SPA' }
    },
    {
      icon: <User className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`} />,
      title: 'Cập nhật hồ sơ',
      time: '3 ngày trước',
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-r from-amber-950/30 to-yellow-900/20 border-amber-800/30 backdrop-blur-sm' 
        : 'bg-gradient-to-r from-amber-50 to-yellow-50/50 border-amber-100'
    }
  ];

  return (
    <Card className={`overflow-hidden ${
      theme === 'dark' 
        ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm' 
        : 'bg-white border-slate-200'
    }`}>
      <CardHeader className='pb-4 border-b border-slate-200/10'>
        <CardTitle className={`text-base font-semibold flex items-center justify-between ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <div className='flex items-center gap-2'>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-slate-700/50 border border-slate-600/30' 
                : 'bg-slate-100 border border-slate-200'
            }`}>
              <Activity className='w-3.5 h-3.5 text-slate-400' />
            </div>
            Hoạt động gần đây
          </div>
          <Button 
            variant='ghost' 
            size='sm' 
            className={`text-xs h-7 px-2 ${
              theme === 'dark' 
                ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50' 
                : 'text-slate-500 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            Xem tất cả <ChevronRight className='w-3 h-3 ml-1' />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-5 space-y-4'>
        {activities.map((activity, index) => (
          <ActivityItem
            key={index}
            icon={activity.icon}
            title={activity.title}
            time={activity.time}
            theme={theme}
            gradient={activity.gradient}
            points={activity.points}
          />
        ))}
      </CardContent>
    </Card>
  );
};
