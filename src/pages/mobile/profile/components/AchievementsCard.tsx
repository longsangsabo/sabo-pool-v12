import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ChevronRight, Trophy, Zap, Star, Medal, Target } from 'lucide-react';
import { usePlayerStats } from '@/hooks/usePlayerStats';

interface AchievementsCardProps {
  theme: 'light' | 'dark';
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  theme,
}) => {
  const { stats, loading } = usePlayerStats();

  const generateAchievements = () => {
    if (!stats) return [];

    const achievements = [];

    // Achievement for first matches
    if (stats.total_matches >= 1) {
      achievements.push({
        iconColor: theme === 'dark' ? 'text-violet-300' : 'text-violet-700',
        bg:
          theme === 'dark'
            ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/20 ring-2 ring-violet-400/30'
            : 'bg-gradient-to-br from-violet-200 to-purple-200 ring-2 ring-violet-300',
        title: 'Người mới xuất sắc',
        desc: `Hoàn thành ${stats.total_matches} trận đấu`,
        points: '+' + (stats.total_matches * 20),
        secondary: 'EXP',
        icon: (
          <Trophy
            className={`w-6 h-6 ${theme === 'dark' ? 'text-violet-300' : 'text-violet-700'}`}
          />
        ),
        badge: '✨',
      });
    }

    // Achievement for first win
    if (stats.wins >= 1) {
      achievements.push({
        iconColor: theme === 'dark' ? 'text-amber-300' : 'text-amber-600',
        bg:
          theme === 'dark'
            ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 ring-2 ring-amber-400/30'
            : 'bg-gradient-to-br from-amber-200 to-yellow-200 ring-2 ring-amber-300',
        title: 'Chiến thắng đầu tiên',
        desc: `Thắng ${stats.wins} trận đấu`,
        points: '+' + (stats.wins * 50),
        secondary: 'EXP',
        icon: (
          <Zap
            className={`w-6 h-6 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}
          />
        ),
      });
    }

    // Achievement for high ELO
    if (stats.elo >= 1200) {
      achievements.push({
        iconColor: theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600',
        bg:
          theme === 'dark'
            ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/20 ring-2 ring-emerald-400/30'
            : 'bg-gradient-to-br from-emerald-200 to-green-200 ring-2 ring-emerald-300',
        title: 'Cao thủ',
        desc: `Đạt ${stats.elo} ELO`,
        points: '+200',
        secondary: 'EXP',
        icon: (
          <Star
            className={`w-6 h-6 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}
          />
        ),
      });
    }

    // Achievement for 10+ matches
    if (stats.total_matches >= 10) {
      achievements.push({
        iconColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-600',
        bg:
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 ring-2 ring-blue-400/30'
            : 'bg-gradient-to-br from-blue-200 to-cyan-200 ring-2 ring-blue-300',
        title: 'Tích cực tham gia',
        desc: `Hoàn thành ${stats.total_matches} trận đấu`,
        points: '+300',
        secondary: 'EXP',
        icon: (
          <Medal
            className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}
          />
        ),
      });
    }

    // Achievement for high win rate
    const winRate = stats.total_matches > 0 ? (stats.wins / stats.total_matches) * 100 : 0;
    if (winRate >= 60 && stats.total_matches >= 5) {
      achievements.push({
        iconColor: theme === 'dark' ? 'text-pink-300' : 'text-pink-600',
        bg:
          theme === 'dark'
            ? 'bg-gradient-to-br from-pink-500/30 to-rose-500/20 ring-2 ring-pink-400/30'
            : 'bg-gradient-to-br from-pink-200 to-rose-200 ring-2 ring-pink-300',
        title: 'Tỷ lệ thắng cao',
        desc: `${winRate.toFixed(0)}% tỷ lệ thắng`,
        points: '+250',
        secondary: 'EXP',
        icon: (
          <Target
            className={`w-6 h-6 ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}
          />
        ),
      });
    }

    return achievements.slice(0, 3); // Show only top 3 achievements
  };

  const achievements = generateAchievements();

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
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`animate-pulse rounded-xl border p-4 ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-700/50'
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${
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
                  <div className={`h-8 w-16 rounded ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Hãy thi đấu để mở khóa thành tích!</p>
          </div>
        ) : (
          achievements.map((a, i) => (
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
          ))
        )}
      </CardContent>
    </Card>
  );
};
