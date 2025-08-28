import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ChevronRight,
  Trophy,
  Star,
  User,
  Award,
} from 'lucide-react';
import { MilestoneProgress } from './MilestoneProgress';
import { MilestoneDetailPage } from './MilestoneDetailPage';
import { useRecentActivities } from '@/hooks/useRecentActivities';

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
  <div
    className={`group relative overflow-hidden rounded-xl border ${gradient}`}
  >
    <div className='flex items-center gap-4 p-3'>
      <div
        className={`relative w-9 h-9 rounded-lg flex items-center justify-center`}
      >
        {icon}
        <div
          className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
          }`}
        ></div>
      </div>
      <div className='flex-1 min-w-0'>
        <div
          className={`text-sm font-medium mb-0.5 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          {title}
        </div>
        <div
          className={`text-xs ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {time}
        </div>
      </div>
      {points && (
        <div
          className={`text-right ${
            theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
          }`}
        >
          <div className='text-sm font-bold'>{points.value}</div>
          <div className='text-xs font-medium opacity-80'>{points.label}</div>
        </div>
      )}
    </div>
  </div>
);

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  theme,
}) => {
  const [showMilestoneDetail, setShowMilestoneDetail] = useState(false);
  const { activities: recentActivities, loading } = useRecentActivities();

  // If milestone detail page is shown, render it instead
  if (showMilestoneDetail) {
    return (
      <MilestoneDetailPage 
        theme={theme} 
        onBack={() => setShowMilestoneDetail(false)}
      />
    );
  }

  // Helper function to get icon for activity type
  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'trophy':
        return <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />;
      case 'star':
        return <Star className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`} />;
      case 'user':
        return <User className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`} />;
      case 'award':
        return <Award className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} />;
      default:
        return <Activity className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />;
    }
  };

  // Helper function to get gradient for activity type
  const getActivityGradient = (gradientType: string) => {
    const gradients = {
      blue: theme === 'dark'
        ? 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30 backdrop-blur-sm'
        : 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100',
      emerald: theme === 'dark'
        ? 'bg-gradient-to-r from-emerald-950/30 to-green-900/20 border-emerald-800/30 backdrop-blur-sm'
        : 'bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-100',
      amber: theme === 'dark'
        ? 'bg-gradient-to-r from-amber-950/30 to-yellow-900/20 border-amber-800/30 backdrop-blur-sm'
        : 'bg-gradient-to-r from-amber-50 to-yellow-50/50 border-amber-100',
      red: theme === 'dark'
        ? 'bg-gradient-to-r from-red-950/30 to-red-900/20 border-red-800/30 backdrop-blur-sm'
        : 'bg-gradient-to-r from-red-50 to-red-50/50 border-red-100',
      purple: theme === 'dark'
        ? 'bg-gradient-to-r from-purple-950/30 to-purple-900/20 border-purple-800/30 backdrop-blur-sm'
        : 'bg-gradient-to-r from-purple-50 to-purple-50/50 border-purple-100',
    };
    return gradients[gradientType as keyof typeof gradients] || gradients.blue;
  };

  // Map real activities to component format
  const activities = recentActivities.map(activity => ({
    icon: getActivityIcon(activity.icon_type),
    title: activity.title,
    time: activity.time,
    gradient: getActivityGradient(activity.gradient_type),
    points: activity.points,
  }));

  // Fallback activities if no real data
  const fallbackActivities = [
    {
      icon: (
        <Activity
          className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        />
      ),
      title: 'Chưa có hoạt động nào',
      time: 'Hãy bắt đầu thi đấu',
      gradient:
        theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800/30 to-slate-700/20 border-gray-700/30 backdrop-blur-sm'
          : 'bg-gradient-to-r from-gray-50 to-slate-50/50 border-gray-100',
    },
  ];

  // Use real activities if available, otherwise show fallback
  const displayActivities = activities.length > 0 ? activities : fallbackActivities;

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Đang tải hoạt động...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Milestone Progress Section */}
          <MilestoneProgress 
            theme={theme} 
            onViewAll={() => setShowMilestoneDetail(true)}
          />
          
          {/* Recent Activities Section */}
          <Card
            className={`overflow-hidden ${
              theme === 'dark'
                ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
                : 'bg-white border-slate-200'
            }`}
          >
        <CardHeader className='pb-4 border-b border-slate-200/10'>
          <CardTitle
            className={`text-base font-semibold flex items-center justify-between ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
            }`}
          >
            <div className='flex items-center gap-2'>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-slate-700/50 border border-slate-600/30'
                    : 'bg-slate-100 border border-slate-200'
                }`}
              >
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
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`animate-pulse rounded-xl border p-3 ${
                        theme === 'dark'
                          ? 'bg-slate-800/30 border-slate-700/50'
                          : 'bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-lg ${
                          theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 space-y-2">
                          <div className={`h-4 rounded ${
                            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                          } w-3/4`} />
                          <div className={`h-3 rounded ${
                            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                          } w-1/2`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                displayActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    icon={activity.icon}
                    title={activity.title}
                    time={activity.time}
                    theme={theme}
                    gradient={activity.gradient}
                    points={activity.points || undefined}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
