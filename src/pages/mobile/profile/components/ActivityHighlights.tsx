import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { useRecentActivities } from '@/hooks/useRecentActivities';

interface ActivityHighlightsProps {
  theme: 'light' | 'dark';
}

export const ActivityHighlights: React.FC<ActivityHighlightsProps> = ({
  theme,
}) => {
  const { activities, loading } = useRecentActivities();

  const recentMatches = activities?.filter(activity => 
    activity.type === 'match_result'
  ).slice(0, 3) || [];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Thắng':
        return theme === 'dark' 
          ? 'from-emerald-500/30 to-green-500/20 text-emerald-300' 
          : 'from-emerald-200 to-green-200 text-emerald-700';
      case 'Thua':
        return theme === 'dark' 
          ? 'from-red-500/30 to-rose-500/20 text-red-300' 
          : 'from-red-200 to-rose-200 text-red-700';
      case 'Hòa':
        return theme === 'dark' 
          ? 'from-yellow-500/30 to-amber-500/20 text-yellow-300' 
          : 'from-yellow-200 to-amber-200 text-yellow-700';
      default:
        return theme === 'dark' 
          ? 'from-gray-500/30 to-slate-500/20 text-gray-300' 
          : 'from-gray-200 to-slate-200 text-gray-700';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'Thắng':
        return <Trophy className="w-4 h-4" />;
      case 'Thua':
        return <Target className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <Card
      className={`overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
          : 'bg-white border-slate-200'
      }`}
    >
      <CardHeader className='pb-3'>
        <CardTitle
          className={`text-base font-semibold flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-slate-700/50 border border-slate-600/30'
                : 'bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className='w-3.5 h-3.5 text-slate-400' />
          </div>
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      <CardContent className='px-5 pb-5 space-y-2'>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`animate-pulse flex items-center justify-between p-3 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-slate-800/30'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                  }`} />
                  <div className="space-y-1">
                    <div className={`h-3 rounded w-24 ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                    }`} />
                    <div className={`h-2 rounded w-16 ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                    }`} />
                  </div>
                </div>
                <div className={`h-6 w-12 rounded ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                }`} />
              </div>
            ))}
          </div>
        ) : recentMatches.length === 0 ? (
          <div className={`text-center py-6 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có trận đấu nào gần đây</p>
          </div>
        ) : (
          recentMatches.map((match, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${
                getResultColor(match.title.split(' ')[0])
              } ${
                theme === 'dark'
                  ? 'backdrop-blur-sm border border-white/10'
                  : 'border border-black/10'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-white/10 backdrop-blur-sm'
                      : 'bg-black/10'
                  }`}
                >
                  {getResultIcon(match.title.split(' ')[0])}
                </div>
                <div>
                  <div className='text-sm font-medium'>
                    {match.title}
                  </div>
                  <div className='text-xs opacity-75'>
                    {match.description}
                  </div>
                </div>
              </div>
              <div className='text-xs font-medium opacity-90'>
                {match.time}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
