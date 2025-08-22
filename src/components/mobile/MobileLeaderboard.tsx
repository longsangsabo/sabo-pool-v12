import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Trophy, TrendingUp, Archive } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useTheme } from '@/hooks/useTheme';
import { CombinedSPALeaderboard } from '@/components/legacy/CombinedSPALeaderboard';

interface MobileLeaderboardProps {
  className?: string;
  hideTitle?: boolean;
}

const MobileLeaderboard: React.FC<MobileLeaderboardProps> = ({
  className,
  hideTitle = false,
}) => {
  const [activeTab, setActiveTab] = useState<'elo' | 'spa' | 'legacy'>('legacy');
  const { leaderboard, loading, error, updateFilters } = useLeaderboard();
  const { theme } = useTheme();

  // Utility function to get display name
  const getPlayerDisplayName = (player: any) => {
    return player.display_name || player.username || player.full_name || 'Player';
  };

  // Sort data based on active tab
  const sortedData = React.useMemo(() => {
    if (!leaderboard.length) return [];

    const sorted = [...leaderboard].sort((a, b) => {
      if (activeTab === 'elo') {
        return (b.elo || 0) - (a.elo || 0);
      } else {
        return (b.ranking_points || 0) - (a.ranking_points || 0);
      }
    });

    return sorted.slice(0, 50); // Show top 50
  }, [leaderboard, activeTab]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className='w-5 h-5 text-yellow-500' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-400' />;
      case 3:
        return <Trophy className='w-5 h-5 text-amber-600' />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: string) => {
    const rankColors: Record<string, string> = {
      'Chủ tịch':
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0',
      'Cao thủ':
        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0',
      'Thạc sĩ':
        'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0',
      'Chuyên viên':
        'bg-gradient-to-r from-orange-600 to-red-600 text-white border-0',
      'Nghiệp dư':
        'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0',
    };
    return (
      rankColors[rank] ||
      (theme === 'dark'
        ? 'bg-gray-700 text-gray-300 border-gray-600'
        : 'bg-gray-200 text-gray-700 border-gray-300')
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'elo' | 'spa' | 'legacy');
    
    // Only update filters for elo and spa tabs, not for legacy
    if (value !== 'legacy') {
      updateFilters({
        sortBy: value === 'elo' ? 'elo' : ('ranking_points' as any),
        sortOrder: 'desc',
      });
    }
  };

  if (loading) {
    return (
      <div className='space-y-2'>
        {[...Array(8)].map((_, i) => (
          <Card
            key={i}
            className={`animate-pulse overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-800/60 border-gray-700/50'
                : 'bg-gray-50/80 border-gray-200/50'
            }`}
          >
            <CardContent className='p-3'>
              <div className='flex items-center space-x-3'>
                <div
                  className={`w-8 h-8 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full animate-ping ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                    }`}
                  ></div>
                </div>
                <div
                  className={`w-11 h-11 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                ></div>
                <div className='flex-1 space-y-2'>
                  <div
                    className={`h-4 rounded w-3/4 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`h-3 rounded w-1/2 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
                <div
                  className={`h-6 w-16 rounded ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card
        className={`${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800/50'
            : 'bg-red-50/80 border-red-200/50'
        }`}
      >
        <CardContent className='p-8 text-center'>
          <p
            className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
          >
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList
          className={`grid w-full grid-cols-3 mb-2 ${
            theme === 'dark'
              ? 'bg-gray-800/60 border-gray-700/50'
              : 'bg-white/80 border-gray-200/50'
          }`}
        >
          <TabsTrigger
            value='legacy'
            className={`flex items-center gap-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'data-[state=active]:bg-orange-600 data-[state=active]:text-white'
                : 'data-[state=active]:bg-orange-500 data-[state=active]:text-white'
            }`}
          >
            <Archive className='w-4 h-4' />
            Legacy
          </TabsTrigger>
          <TabsTrigger
            value='spa'
            className={`flex items-center gap-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
                : 'data-[state=active]:bg-purple-500 data-[state=active]:text-white'
            }`}
          >
            <Crown className='w-4 h-4' />
            SPA
          </TabsTrigger>
          <TabsTrigger
            value='elo'
            className={`flex items-center gap-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white'
            }`}
          >
            <Trophy className='w-4 h-4' />
            ELO
          </TabsTrigger>
        </TabsList>

        <TabsContent value='elo'>
          <div className='space-y-2'>
            {sortedData.map((player, index) => (
              <Card
                key={player.id}
                className={`overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/80'
                    : 'bg-white/80 border-gray-200/50 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg'
                }`}
              >
                <CardContent className='p-3'>
                  <div className='flex items-center space-x-3'>
                    {/* Top Position */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                        index < 3
                          ? theme === 'dark'
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg animate-pulse'
                            : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {getRankIcon(index + 1) || index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      className={`w-11 h-11 ring-2 ring-offset-1 transition-all duration-300 ${
                        activeTab === 'elo'
                          ? 'ring-blue-500/30'
                          : 'ring-purple-500/30'
                      }`}
                    >
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback
                        className={`${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getPlayerDisplayName(player).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`font-semibold truncate transition-colors duration-200 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {getPlayerDisplayName(player)}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge
                          variant='secondary'
                          className={`text-xs px-2 py-0.5 transition-all duration-200 ${getRankBadgeColor(player.current_rank)}`}
                        >
                          {player.current_rank || 'Chưa xếp hạng'}
                        </Badge>
                      </div>
                    </div>

                    {/* ELO Points */}
                    <div className='text-right'>
                      <p
                        className={`text-lg font-bold transition-colors duration-200 ${
                          activeTab === 'elo'
                            ? theme === 'dark'
                              ? 'text-blue-400'
                              : 'text-blue-600'
                            : theme === 'dark'
                              ? 'text-purple-400'
                              : 'text-purple-600'
                        }`}
                      >
                        {player.elo.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        ELO
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='spa'>
          <div className='space-y-2'>
            {sortedData.map((player, index) => (
              <Card
                key={player.id}
                className={`overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/80'
                    : 'bg-white/80 border-gray-200/50 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg'
                }`}
              >
                <CardContent className='p-3'>
                  <div className='flex items-center space-x-3'>
                    {/* Top Position */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                        index < 3
                          ? theme === 'dark'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg animate-pulse'
                            : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {getRankIcon(index + 1) || index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar className='w-11 h-11 ring-2 ring-offset-1 ring-purple-500/30 transition-all duration-300'>
                      <AvatarImage 
                        src={player.avatar_url || undefined}
                        loading="lazy"
                        className="object-cover"
                        onError={(e) => {
                          console.log('Leaderboard avatar failed to load:', player.avatar_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <AvatarFallback
                        className={`${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getPlayerDisplayName(player).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`font-semibold truncate transition-colors duration-200 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {getPlayerDisplayName(player)}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge
                          variant='secondary'
                          className={`text-xs px-2 py-0.5 transition-all duration-200 ${getRankBadgeColor(player.current_rank)}`}
                        >
                          {player.current_rank || 'Chưa xếp hạng'}
                        </Badge>
                      </div>
                    </div>

                    {/* SPA Points */}
                    <div className='text-right'>
                      <p
                        className={`text-lg font-bold transition-colors duration-200 ${
                          theme === 'dark'
                            ? 'text-purple-400'
                            : 'text-purple-600'
                        }`}
                      >
                        {player.ranking_points.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        SPA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='legacy'>
          <div className='space-y-4'>
            <CombinedSPALeaderboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileLeaderboard;
