import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CombinedSPALeaderboard } from '@/components/legacy/CombinedSPALeaderboard';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Activity,
  Target,
  Zap,
  Award,
  Star,
  Clock,
  Calendar,
  Filter,
  Crown,
  Medal,
  Archive,
} from 'lucide-react';

const ELORankingDashboard: React.FC = () => {
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
        return <Crown className='w-6 h-6 text-yellow-500' />;
      case 2:
        return <Medal className='w-6 h-6 text-gray-400' />;
      case 3:
        return <Trophy className='w-6 h-6 text-amber-600' />;
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bảng Xếp Hạng SABO Arena
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Theo dõi thứ hạng và thành tích của các cao thủ
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Legacy SPA
          </TabsTrigger>
          <TabsTrigger value="spa" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            SPA Rankings
          </TabsTrigger>
          <TabsTrigger value="elo" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            ELO Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="legacy" className="space-y-6">
          <CombinedSPALeaderboard />
        </TabsContent>

        <TabsContent value="elo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedData.map((player, index) => (
              <Card
                key={player.id}
                className={`overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
                  index < 3 ? 'ring-2 ring-yellow-400/50' : ''
                } ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/80'
                    : 'bg-white/80 border-gray-200/50 backdrop-blur-sm hover:bg-white/90'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Position and Icon */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                          index < 3
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {getRankIcon(index + 1) || `#${index + 1}`}
                      </div>
                      {index < 3 && (
                        <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center">
                      <Avatar className="w-16 h-16 ring-4 ring-blue-500/30">
                        <AvatarImage src={player.avatar_url} />
                        <AvatarFallback className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                          {getPlayerDisplayName(player).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Player Info */}
                    <div className="text-center space-y-2">
                      <h3 className={`font-bold text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {getPlayerDisplayName(player)}
                      </h3>
                      
                      <Badge className={`${getRankBadgeColor(player.current_rank)}`}>
                        {player.current_rank || 'Chưa xếp hạng'}
                      </Badge>

                      <div className="space-y-1">
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {player.elo?.toLocaleString() || '0'}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          ELO Rating
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="spa" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedData.map((player, index) => (
              <Card
                key={player.id}
                className={`overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
                  index < 3 ? 'ring-2 ring-purple-400/50' : ''
                } ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/80'
                    : 'bg-white/80 border-gray-200/50 backdrop-blur-sm hover:bg-white/90'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Position and Icon */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                          index < 3
                            ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {getRankIcon(index + 1) || `#${index + 1}`}
                      </div>
                      {index < 3 && (
                        <Star className="w-5 h-5 text-purple-500 animate-pulse" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center">
                      <Avatar className="w-16 h-16 ring-4 ring-purple-500/30">
                        <AvatarImage src={player.avatar_url} />
                        <AvatarFallback className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                          {getPlayerDisplayName(player).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Player Info */}
                    <div className="text-center space-y-2">
                      <h3 className={`font-bold text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {getPlayerDisplayName(player)}
                      </h3>
                      
                      <Badge className={`${getRankBadgeColor(player.current_rank)}`}>
                        {player.current_rank || 'Chưa xếp hạng'}
                      </Badge>

                      <div className="space-y-1">
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                          {player.ranking_points?.toLocaleString() || '0'}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          SPA Points
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ELORankingDashboard;
