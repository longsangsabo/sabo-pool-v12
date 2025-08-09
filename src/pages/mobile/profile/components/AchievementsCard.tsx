import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ChevronRight, Trophy, Zap, Star } from 'lucide-react';

interface AchievementsCardProps {
  theme: 'light' | 'dark';
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  theme,
}) => {
  const achievements = [
    {
      iconColor: theme === 'dark' ? 'text-violet-300' : 'text-violet-700',
      bg:
        theme === 'dark'
          ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/20 ring-2 ring-violet-400/30'
          : 'bg-gradient-to-br from-violet-200 to-purple-200 ring-2 ring-violet-300',
      title: 'Người mới xuất sắc',
      desc: 'Hoàn thành 5 trận đấu đầu tiên',
      points: '+100',
      secondary: 'EXP',
      icon: (
        <Trophy
          className={`w-6 h-6 ${theme === 'dark' ? 'text-violet-300' : 'text-violet-700'}`}
        />
      ),
      badge: '✨',
    },
    {
      iconColor: theme === 'dark' ? 'text-amber-300' : 'text-amber-600',
      bg:
        theme === 'dark'
          ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 ring-2 ring-amber-400/30'
          : 'bg-gradient-to-br from-amber-200 to-yellow-200 ring-2 ring-amber-300',
      title: 'Chiến thắng đầu tiên',
      desc: 'Thắng trận đấu xếp hạng đầu tiên',
      points: '+80',
      secondary: 'EXP',
      icon: (
        <Zap
          className={`w-6 h-6 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}
        />
      ),
    },
    {
      iconColor: theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600',
      bg:
        theme === 'dark'
          ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/20 ring-2 ring-emerald-400/30'
          : 'bg-gradient-to-br from-emerald-200 to-green-200 ring-2 ring-emerald-300',
      title: 'Tích cực tham gia',
      desc: 'Hoàn thành 10 trận đấu',
      points: '+150',
      secondary: 'EXP',
      icon: (
        <Star
          className={`w-6 h-6 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}
        />
      ),
    },
  ];

  return (
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
              <Award className='w-3.5 h-3.5 text-slate-400' />
            </div>
            Thành tích
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
        {achievements.map((a, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-violet-950/30 to-purple-900/20 border-violet-800/30 backdrop-blur-sm'
                : 'bg-gradient-to-r from-violet-50 to-purple-50/50 border-violet-100'
            }`}
          >
            <div className='flex items-center gap-4 p-4'>
              <div
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${a.bg}`}
              >
                {a.icon}
                {a.badge && (
                  <div
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      theme === 'dark'
                        ? 'bg-violet-400 text-violet-900'
                        : 'bg-violet-500 text-white'
                    }`}
                  >
                    {a.badge}
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div
                  className={`text-sm font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {a.title}
                </div>
                <div
                  className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {a.desc}
                </div>
              </div>
              <div
                className={`text-right ${
                  theme === 'dark' ? 'text-violet-300' : 'text-violet-600'
                }`}
              >
                <div className='text-sm font-bold'>{a.points}</div>
                <div className='text-xs opacity-80'>{a.secondary}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
