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
import { useAuth } from '@/hooks/useAuth';
import { useMatchResults } from '@/hooks/useMatchResults';
import { ELOHistoryChart } from './ELOHistoryChart';
import { PlayerPerformanceAnalytics } from './PlayerPerformanceAnalytics';
import { RealtimeRankingTracker } from './RealtimeRankingTracker';
import { RankingLeaderboard } from './RankingLeaderboard';
import RankRegistrationForm from '@/components/RankRegistrationForm';

interface RankingStats {
  totalPlayers: number;
  averageELO: number;
  highestELO: number;
  lowestELO: number;
  activeThisWeek: number;
  totalMatches: number;
}

interface PersonalStats {
  currentELO: number;
  rank: string;
  position: number;
  totalMatches: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  recentForm: number;
  consistency: number;
  volatility: number;
  peakELO: number;
  eloChange24h: number;
  eloChange7d: number;
  eloChange30d: number;
}

export const ELORankingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchEloHistory } = useMatchResults();

  // Check URL params for initial tab
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [rankingStats, setRankingStats] = useState<RankingStats>({
    totalPlayers: 0,
    averageELO: 1500,
    highestELO: 2800,
    lowestELO: 800,
    activeThisWeek: 0,
    totalMatches: 0,
  });
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    currentELO: 1500,
    rank: 'K',
    position: 0,
    totalMatches: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    recentForm: 0,
    consistency: 50,
    volatility: 0,
    peakELO: 1500,
    eloChange24h: 0,
    eloChange7d: 0,
    eloChange30d: 0,
  });

  const getRankFromELO = (elo: number): string => {
    if (elo >= 2800) return 'E+';
    if (elo >= 2600) return 'E';
    if (elo >= 2400) return 'F+';
    if (elo >= 2200) return 'F';
    if (elo >= 2000) return 'G+';
    if (elo >= 1800) return 'G';
    if (elo >= 1600) return 'H+';
    if (elo >= 1400) return 'H';
    if (elo >= 1200) return 'I+';
    if (elo >= 1000) return 'I';
    if (elo >= 800) return 'K+';
    return 'K';
  };

  const getRankColor = (rank: string): string => {
    switch (rank) {
      case 'E+':
      case 'E':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'F+':
      case 'F':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'G+':
      case 'G':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'H+':
      case 'H':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'I+':
      case 'I':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'K+':
      case 'K':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRankName = (rank: string): string => {
    const names: { [key: string]: string } = {
      'E+': 'Chuyên nghiệp tiến bộ',
      E: 'Chuyên nghiệp',
      'F+': 'Xuất sắc tiến bộ',
      F: 'Xuất sắc',
      'G+': 'Giỏi tiến bộ',
      G: 'Giỏi',
      'H+': 'Khá tiến bộ',
      H: 'Khá',
      'I+': 'Trung bình tiến bộ',
      I: 'Trung bình',
      'K+': 'Người mới tiến bộ',
      K: 'Người mới',
    };
    return names[rank] || 'Chưa xếp hạng';
  };

  useEffect(() => {
    // Fetch ranking statistics and personal stats
    // This would be implemented with real API calls
    if (user) {
      // fetchPersonalStats();
      // fetchRankingStats();
    }
  }, [user]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    description?: string;
  }> = ({ title, value, change, icon, description }) => (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold'>{value}</p>
            {description && (
              <p className='text-xs text-muted-foreground mt-1'>
                {description}
              </p>
            )}
          </div>
          <div className='h-8 w-8 text-muted-foreground'>{icon}</div>
        </div>
        {change !== undefined && (
          <div className='mt-4 flex items-center text-sm'>
            {change > 0 ? (
              <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
            ) : change < 0 ? (
              <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
            ) : (
              <Activity className='h-4 w-4 text-gray-500 mr-1' />
            )}
            <span
              className={
                change > 0
                  ? 'text-green-600'
                  : change < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
              }
            >
              {change > 0 ? '+' : ''}
              {change}
            </span>
            <span className='text-muted-foreground ml-1'>vs tháng trước</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
              🏆 Hệ Thống Ranking ELO
            </h1>
            <p className='text-muted-foreground mt-1'>
              Theo dõi và phân tích chi tiết thứ hạng ELO của bạn
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              Bộ lọc
            </Button>
            <Button variant='outline' size='sm'>
              <Calendar className='h-4 w-4 mr-2' />
              Thời gian
            </Button>
          </div>
        </div>

        {/* Personal Stats Overview */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    ELO Hiện Tại
                  </p>
                  <p className='text-3xl font-bold text-foreground'>{personalStats.currentELO}</p>
                  <Badge className={getRankColor(personalStats.rank)}>
                    {personalStats.rank} - {getRankName(personalStats.rank)}
                  </Badge>
                </div>
                <Trophy className='h-8 w-8 text-yellow-500 dark:text-yellow-400' />
              </div>
              <div className='mt-4 flex items-center text-sm'>
                {personalStats.eloChange24h > 0 ? (
                  <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                ) : personalStats.eloChange24h < 0 ? (
                  <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
                ) : (
                  <Activity className='h-4 w-4 text-muted-foreground mr-1' />
                )}
                <span
                  className={
                    personalStats.eloChange24h > 0
                      ? 'text-green-600 dark:text-green-400'
                      : personalStats.eloChange24h < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                  }
                >
                  {personalStats.eloChange24h > 0 ? '+' : ''}
                  {personalStats.eloChange24h} (24h)
                </span>
              </div>
            </CardContent>
          </Card>

        <StatCard
          title='Vị Trí Xếp Hạng'
          value={`#${personalStats.position}`}
          change={-2}
          icon={<Award className='h-8 w-8' />}
          description='Trong tổng số players'
        />

        <StatCard
          title='Tỷ Lệ Thắng'
          value={`${personalStats.winRate.toFixed(1)}%`}
          change={+2.5}
          icon={<Target className='h-8 w-8' />}
          description={`${personalStats.totalMatches} trận đã đấu`}
        />

        <StatCard
          title='Chuỗi Hiện Tại'
          value={personalStats.currentStreak}
          change={personalStats.currentStreak}
          icon={<Zap className='h-8 w-8' />}
          description={`Tốt nhất: ${personalStats.bestStreak}`}
        />
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1'>
          <TabsTrigger value='overview'>Tổng Quan</TabsTrigger>
          <TabsTrigger value='history'>Lịch Sử</TabsTrigger>
          <TabsTrigger value='analytics'>Phân Tích</TabsTrigger>
          <TabsTrigger value='leaderboard'>BXH</TabsTrigger>
          <TabsTrigger value='realtime'>Live</TabsTrigger>
          <TabsTrigger value='register'>Đăng ký</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* System Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                Thống Kê Hệ Thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-primary'>
                    {rankingStats.totalPlayers}
                  </p>
                  <p className='text-sm text-muted-foreground'>Tổng Players</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-blue-600'>
                    {rankingStats.averageELO}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    ELO Trung Bình
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-green-600'>
                    {rankingStats.highestELO}
                  </p>
                  <p className='text-sm text-muted-foreground'>ELO Cao Nhất</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-orange-600'>
                    {rankingStats.lowestELO}
                  </p>
                  <p className='text-sm text-muted-foreground'>ELO Thấp Nhất</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-purple-600'>
                    {rankingStats.activeThisWeek}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Hoạt Động Tuần
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-red-600'>
                    {rankingStats.totalMatches}
                  </p>
                  <p className='text-sm text-muted-foreground'>Tổng Trận Đấu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Độ Ổn Định</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Consistency Score</span>
                    <span className='font-bold'>
                      {personalStats.consistency}%
                    </span>
                  </div>
                  <div className='w-full bg-secondary rounded-full h-2'>
                    <div
                      className='bg-primary h-2 rounded-full transition-all'
                      style={{ width: `${personalStats.consistency}%` }}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Thể hiện sự ổn định trong phong độ
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Phong Độ Gần Đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Recent Form</span>
                    <span className='font-bold'>
                      {personalStats.recentForm}%
                    </span>
                  </div>
                  <div className='w-full bg-secondary rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full transition-all'
                      style={{ width: `${personalStats.recentForm}%` }}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Phong độ trong 10 trận gần nhất
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Độ Biến Động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Volatility</span>
                    <span className='font-bold'>
                      {personalStats.volatility.toFixed(1)}
                    </span>
                  </div>
                  <div className='w-full bg-secondary rounded-full h-2'>
                    <div
                      className='bg-yellow-500 h-2 rounded-full transition-all'
                      style={{
                        width: `${Math.min(personalStats.volatility, 100)}%`,
                      }}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Mức độ thay đổi ELO theo thời gian
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='history'>
          <ELOHistoryChart playerId={user?.id} />
        </TabsContent>

        <TabsContent value='analytics'>
          <PlayerPerformanceAnalytics playerId={user?.id} />
        </TabsContent>

        <TabsContent value='leaderboard'>
          <RankingLeaderboard />
        </TabsContent>

        <TabsContent value='realtime'>
          <RealtimeRankingTracker />
        </TabsContent>

        <TabsContent value='register'>
          <RankRegistrationForm />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default ELORankingDashboard;
