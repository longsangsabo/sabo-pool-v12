import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useOptimizedChallenges } from '@/hooks/useOptimizedChallenges';
import { useState as useStateForMatches } from 'react';
import UnifiedCreateChallengeModal from '@/components/modals/UnifiedCreateChallengeModal';
import UnifiedChallengeCard from '@/components/challenges/UnifiedChallengeCard';
import ChallengeDetailsModal from '@/components/ChallengeDetailsModal';
import CreateChallengeButton from '@/components/CreateChallengeButton';

import TrustScoreBadge from '@/components/TrustScoreBadge';
import CompactStatCard from '@/components/challenges/CompactStatCard';
import { CompletedChallengeCard } from '@/components/challenges/CompletedChallengeCard';
import LiveMatchCard from '@/components/challenges/LiveMatchCard';
import LiveActivityFeed from '@/components/challenges/LiveActivityFeed';

import MobileChallengeManager from '@/components/challenges/MobileChallengeManager';
import { ChallengeDebugPanel } from '@/components/ChallengeDebugPanel';

import { ActiveChallengeHighlight } from '@/components/challenges/ActiveChallengeHighlight';
import ErrorBoundary from '@/components/ErrorBoundary';

import { toast } from 'sonner';
import {
  Plus,
  Search,
  Trophy,
  Target,
  Users,
  Zap,
  Clock,
  MapPin,
  Calendar,
  Bell,
  MessageSquare,
  Star,
  ArrowUp,
  ArrowDown,
  Shield,
  Sword,
} from 'lucide-react';

interface ChallengeStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  won: number;
  lost: number;
  winRate: number;
}

const EnhancedChallengesPageV2: React.FC = () => {
  const { user } = useAuth();
  const { isDesktop, isMobile, width } = useResponsive();

  // Use the optimized hook to prevent multiple fetches
  const {
    challenges,
    loading,
    error,
    acceptChallenge,
    declineChallenge,
    fetchChallenges,
    submitScore,
    isSubmittingScore,
  } = useOptimizedChallenges();

  // Hook để lấy matches từ challenges đã được accept
  const [matchesData, setMatchesData] = useStateForMatches<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('community-challenges');
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<
    'all' | 'standard' | 'sabo'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminCreateModal, setShowAdminCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter challenges by user involvement
  const myChallenges = challenges.filter(
    c => c.challenger_id === user?.id || c.opponent_id === user?.id
  );

  // ✅ FIXED: Active challenges = all accepted challenges (ready to play/enter scores)
  const activeChallenges = challenges.filter(c => {
    // Must be accepted status
    if (c.status !== 'accepted') return false;

    // Must involve current user
    const isMyChallenge =
      c.challenger_id === user?.id || c.opponent_id === user?.id;
    return isMyChallenge;
  });

  // Completed challenges filter
  const completedChallenges = challenges.filter(c => {
    if (c.status !== 'completed') return false;
    const isMyChallenge =
      c.challenger_id === user?.id || c.opponent_id === user?.id;
    return isMyChallenge;
  });

  const myMatches = myChallenges.filter(
    c => c.status === 'accepted' || c.status === 'completed'
  );
  const openChallenges = challenges.filter(
    c => c.status === 'pending' && !c.opponent_id
  );

  // Handle score submission
  const handleSubmitScore = async (
    challengeId: string,
    challengerScore: number,
    opponentScore: number
  ) => {
    try {
      // Use the existing submitScore function from the hook
      await submitScore(challengeId, challengerScore, opponentScore);

      // Close the modal
      setShowDetailsModal(false);
      setSelectedChallenge(null);

      toast.success('Tỷ số đã được ghi nhận thành công!');
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Không thể ghi tỷ số. Vui lòng thử lại.');
    }
  };

  // Handle card actions
  const handleChallengeAction = (
    challengeId: string,
    action: 'accept' | 'decline' | 'cancel' | 'view' | 'score'
  ) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    if (action === 'view' || action === 'score') {
      setSelectedChallenge(challenge);
      setShowDetailsModal(true);
    }
    // Other actions would be handled by individual components
  };

  // Calculate stats from derived data
  const stats: ChallengeStats = (() => {
    let won = 0;
    let lost = 0;
    completedChallenges.forEach(c => {
      const challengerFinal =
        c.challenger_final_score ?? c.challenger_score ?? 0;
      const opponentFinal = c.opponent_final_score ?? c.opponent_score ?? 0;
      let winnerId: string | null = null;
      if (challengerFinal !== opponentFinal) {
        winnerId =
          challengerFinal > opponentFinal ? c.challenger_id : c.opponent_id;
      }
      if (winnerId) {
        if (winnerId === user?.id) won += 1;
        else if (c.challenger_id === user?.id || c.opponent_id === user?.id)
          lost += 1;
      }
    });
    const totalCompleted = completedChallenges.length;
    return {
      total: myChallenges.length,
      pending: myChallenges.filter(c => c.status === 'pending').length,
      accepted: myChallenges.filter(c => c.status === 'accepted').length,
      completed: totalCompleted,
      won,
      lost,
      winRate:
        totalCompleted > 0 ? Math.round((won / totalCompleted) * 100) : 0,
    };
  })();

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  // Fetch matches for accepted challenges
  const fetchMatches = async () => {
    if (!user) return;

    setLoadingMatches(true);
    try {
      // Simple query without joins to avoid foreign key issues
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching matches:', error);
        throw error;
      }

      setMatchesData(matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Lỗi tải danh sách trận đấu');
    } finally {
      setLoadingMatches(false);
    }
  };

  // Load matches when component mounts or user changes
  useEffect(() => {
    fetchMatches();
  }, [user]);

  // Function to get match for a challenge
  const getMatchForChallenge = (challengeId: string) => {
    return matchesData.find(match => match.challenge_id === challengeId);
  };

  // Function to update match status
  const handleAcceptMatch = async (matchId: string) => {
    try {
      // Find the match to get challenge_id
      const match = matchesData.find(m => m.id === matchId);
      if (!match) {
        toast.error('Không tìm thấy trận đấu');
        return;
      }

      // Update match status
      const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'in_progress' })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // If challenge has null scheduled_time, update it to now
      if (match.challenge_id) {
        const challenge = challenges.find(c => c.id === match.challenge_id);
        if (challenge && !challenge.scheduled_time) {
          const { error: challengeError } = await supabase
            .from('challenges')
            .update({ status: 'ongoing' })
            .eq('id', challenge.id);

          if (challengeError)
            console.error(
              'Error updating challenge scheduled_time:',
              challengeError
            );
        }
      }

      toast.success('Đã xác nhận trận đấu!');
      fetchMatches(); // Refresh matches
      fetchChallenges?.(); // Refresh challenges too
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Có lỗi xảy ra khi xác nhận trận đấu');
    }
  };

  const getFilteredChallenges = (
    challengeList: any[],
    skipStatusFilter = false
  ) => {
    const filtered = challengeList.filter(challenge => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        (() => {
          const challengerName =
            challenge.challenger_profile?.full_name?.toLowerCase() || '';
          const opponentName =
            challenge.opponent_profile?.full_name?.toLowerCase() || '';
          const clubName =
            challenge.club_profiles?.club_name?.toLowerCase() || '';

          return (
            challengerName.includes(searchTerm.toLowerCase()) ||
            opponentName.includes(searchTerm.toLowerCase()) ||
            clubName.includes(searchTerm.toLowerCase())
          );
        })();

      // Status filter - skip for active challenges tab
      const matchesStatus =
        skipStatusFilter ||
        statusFilter === 'all' ||
        challenge.status === statusFilter;

      // Challenge type filter - FIXED LOGIC for null/undefined challenge_type
      const matchesType =
        challengeTypeFilter === 'all' ||
        (challengeTypeFilter === 'sabo' &&
          challenge.challenge_type === 'sabo') ||
        (challengeTypeFilter === 'standard' &&
          (challenge.challenge_type === 'standard' ||
            challenge.challenge_type === null ||
            challenge.challenge_type === undefined));

      const result = matchesSearch && matchesStatus && matchesType;
      return result;
    });

    return filtered;
  };

  const handleJoinOpenChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      // Show loading state
      toast.loading('Đang tham gia thách đấu...', { id: 'join-challenge' });

      const result = await acceptChallenge(challengeId);

      // Update toast to success
      toast.success('✅ Đã tham gia thành công! Status: accepted', {
        id: 'join-challenge',
      });

      // Refresh data immediately for real-time feedback
      await fetchChallenges?.();
      fetchMatches(); // Also refresh matches to show new match
    } catch (error) {
      console.error('❌ Error joining open challenge:', error);
      toast.error('Lỗi khi tham gia thách đấu', { id: 'join-challenge' });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Chờ phản hồi',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
        };
      case 'accepted':
        return {
          text: 'Đã chấp nhận',
          color: 'bg-green-100 text-green-800',
          icon: Trophy,
        };
      case 'declined':
        return {
          text: 'Đã từ chối',
          color: 'bg-red-100 text-red-800',
          icon: Target,
        };
      case 'completed':
        return {
          text: 'Hoàn thành',
          color: 'bg-blue-100 text-blue-800',
          icon: Star,
        };
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800',
          icon: Users,
        };
    }
  };

  const handleChallengeClick = (challenge: any) => {
    setSelectedChallenge(challenge);
    setShowDetailsModal(true);
  };

  const renderOpenChallengeCard = (challenge: any) => {
    return (
      <UnifiedChallengeCard
        key={challenge.id}
        challenge={{
          ...challenge,
          status: 'open',
        }}
        onJoin={handleJoinOpenChallenge}
      />
    );
  };

  const isInitialLoading = loading && challenges.length === 0;

  // Skeleton components (lightweight inline - can be extracted later)
  const SkeletonCard = () => (
    <div className='h-44 rounded-xl bg-gradient-to-br from-slate-200/60 to-slate-300/40 dark:from-slate-800/60 dark:to-slate-700/40 animate-pulse border border-slate-300/40 dark:border-slate-600/40' />
  );
  const SkeletonStat = () => (
    <div className='h-20 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse' />
  );
  const SkeletonHeader = () => (
    <div className='space-y-4'>
      <div className='h-10 w-64 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse'></div>
      <div className='h-4 w-96 max-w-full bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse'></div>
    </div>
  );

  if (isInitialLoading) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='max-w-[1400px] mx-auto px-8 py-8 space-y-10'>
          <SkeletonHeader />
          <div className='grid grid-cols-6 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStat key={i} />
            ))}
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='text-red-500'>❌ Lỗi tải dữ liệu</div>
          <p className='text-muted-foreground'>{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  // Desktop Layout Component
  const DesktopLayout = () => (
    <div className='min-h-screen bg-background'>
      {/* Desktop Container - Optimized for wider screens */}
      <div className='challenges-desktop max-w-[1400px] mx-auto px-8 py-6 space-y-8'>
        {/* Premium Header Section */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
              Thách đấu
            </h1>
            <p className='text-lg text-muted-foreground'>
              Quản lý và tham gia các thách đấu billiards chuyên nghiệp
            </p>
          </div>
          <div className='flex gap-3'>
            <CreateChallengeButton
              onCreateClick={() => setShowCreateModal(true)}
            />
            {isAdmin && (
              <Button
                onClick={() => setShowAdminCreateModal(true)}
                variant='outline'
                className='border-red-200 text-red-600 hover:bg-red-50 shadow-sm'
              >
                <Shield className='w-4 h-4 mr-2' />
                Admin: Tạo thách đấu
              </Button>
            )}
          </div>
        </div>

        {/* Compact Statistics Row - Professional Design */}
        <div className='grid grid-cols-6 gap-4 mb-8'>
          <CompactStatCard
            icon={Trophy}
            value={stats.total}
            label='Tổng cộng'
            color='primary'
          />
          <CompactStatCard
            icon={Clock}
            value={stats.pending}
            label='Chờ phản hồi'
            color='warning'
          />
          <CompactStatCard
            icon={Zap}
            value={stats.accepted}
            label='Đã chấp nhận'
            color='success'
          />
          <CompactStatCard
            icon={Star}
            value={stats.completed}
            label='Hoàn thành'
            color='info'
          />
          <CompactStatCard
            icon={Trophy}
            value={stats.won}
            label='Thắng'
            color='success'
          />
          <CompactStatCard
            icon={Target}
            value={`${stats.winRate}%`}
            label='Tỷ lệ thắng'
            color='primary'
          />
        </div>

        {/* Fixed Active Challenge Section - Always visible */}
        <div className='w-full mb-6'>
          <ErrorBoundary
            fallback={
              <div className='p-4 bg-red-50 border border-red-200 rounded'>
                ActiveChallengeHighlight error
              </div>
            }
          >
            <ActiveChallengeHighlight
              challenges={challenges || []}
              user={user}
              onChallengeClick={handleChallengeClick}
            />
          </ErrorBoundary>
        </div>

        {/* Live Activity Feed - Main Content Area */}
        <div className='w-full'>
          <LiveActivityFeed
            openChallenges={openChallenges}
            onJoinChallenge={handleJoinOpenChallenge}
            challenges={challenges}
            user={user}
            onChallengeClick={handleChallengeClick}
          />
        </div>

        {/* Advanced Management Section - Desktop Optimized */}
        <Card className='bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl'>
              <Target className='w-6 h-6' />
              Quản lý thách đấu nâng cao
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Desktop-Optimized Filters */}
            <div className='flex gap-4 items-center'>
              <div className='flex-1 max-w-md'>
                <div className='relative group'>
                  <Search className='w-4 h-4 absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                  <Input
                    placeholder='Tìm kiếm theo tên người chơi hoặc câu lạc bộ...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200'
                  />
                </div>
              </div>

              <div className='flex gap-3'>
                <Select
                  value={challengeTypeFilter}
                  onValueChange={(value: 'all' | 'standard' | 'sabo') =>
                    setChallengeTypeFilter(value)
                  }
                >
                  <SelectTrigger className='w-40 bg-background border-border/50'>
                    <SelectValue placeholder='Loại thách đấu' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
                    <SelectItem value='standard'>Thường</SelectItem>
                    <SelectItem value='sabo'>
                      <div className='flex items-center gap-2'>
                        <Sword className='w-4 h-4' />
                        SABO
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-40 border-border/50 hover:border-primary/30'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
                    <SelectItem value='pending'>Chờ phản hồi</SelectItem>
                    <SelectItem value='accepted'>Đã chấp nhận</SelectItem>
                    <SelectItem value='declined'>Đã từ chối</SelectItem>
                    <SelectItem value='completed'>Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='w-32 border-border/50 hover:border-primary/30'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='created_at'>Ngày tạo</SelectItem>
                    <SelectItem value='bet_points'>Mức cược</SelectItem>
                    <SelectItem value='expires_at'>Hết hạn</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  className='border-border/50 hover:border-primary/30 hover:scale-105 transition-all duration-200'
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUp className='w-4 h-4' />
                  ) : (
                    <ArrowDown className='w-4 h-4' />
                  )}
                </Button>
              </div>
            </div>

            {/* Enhanced 2-Group Tab System */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='space-y-6'
            >
              <TabsList className='grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-lg shadow-sm h-14'>
                <TabsTrigger
                  value='community-challenges'
                  className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm flex flex-col gap-1 py-2'
                >
                  <span className='flex items-center gap-2'>
                    <Users className='w-4 h-4' />
                    Thách đấu Cộng đồng
                  </span>
                  <span className='text-xs opacity-80'>
                    Mở • Live • Kết quả gần đây
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value='my-challenges'
                  className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm flex flex-col gap-1 py-2'
                >
                  <span className='flex items-center gap-2'>
                    <Target className='w-4 h-4' />
                    Thách đấu của tôi
                  </span>
                  <span className='text-xs opacity-80'>
                    Đang hoạt động • Lịch sử • Trận đấu
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* 🌐 COMMUNITY CHALLENGES TAB */}
              <TabsContent value='community-challenges' className='space-y-8'>
                <div className='space-y-6'>
                  {/* Community Header */}
                  <div className='text-center space-y-2'>
                    <h2 className='text-2xl font-bold text-foreground flex items-center justify-center gap-3'>
                      <Users className='w-7 h-7 text-primary' />
                      Thách đấu Cộng đồng
                    </h2>
                    <p className='text-muted-foreground'>
                      Tham gia cộng đồng billiards, xem trận đấu live và thách đấu mở
                    </p>
                  </div>

                  {/* Section 1: Open Challenges */}
                  <Card className='bg-gradient-to-br from-emerald-50/50 to-green-50/50 border border-emerald-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <Zap className='w-5 h-5 text-emerald-600' />
                        Thách đấu Mở
                        <Badge variant='secondary'>
                          {getFilteredChallenges(openChallenges).length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Thách đấu ai cũng có thể tham gia
                      </p>
                    </CardHeader>
                    <CardContent>
                      {getFilteredChallenges(openChallenges).length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {getFilteredChallenges(openChallenges).map(
                            renderOpenChallengeCard
                          )}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 w-fit mx-auto mb-4'>
                            <Users className='w-12 h-12 text-emerald-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Chưa có thách đấu mở nào
                          </h3>
                          <p className='text-muted-foreground mb-4'>
                            Hãy tạo thách đấu mở để mọi người có thể tham gia!
                          </p>
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className='bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Tạo thách đấu mở
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 2: Live Matches */}
                  <Card className='bg-gradient-to-br from-red-50/50 to-orange-50/50 border border-red-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse'></div>
                          <span>Trận đấu Live</span>
                        </div>
                        <Badge variant='destructive'>
                          {getFilteredChallenges(activeChallenges, true).length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Các trận đấu đang diễn ra trong cộng đồng
                      </p>
                    </CardHeader>
                    <CardContent>
                      {getFilteredChallenges(activeChallenges, true).length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {getFilteredChallenges(activeChallenges, true).map(
                            challenge => (
                              <LiveMatchCard
                                key={challenge.id}
                                match={{
                                  id: challenge.id,
                                  player1: {
                                    name: challenge.challenger_profile?.full_name || 'Unknown',
                                    avatar: challenge.challenger_profile?.avatar_url || '',
                                    rank: challenge.challenger_profile?.verified_rank || 'A',
                                  },
                                  player2: {
                                    name: challenge.opponent_profile?.full_name || 'Unknown',
                                    avatar: challenge.opponent_profile?.avatar_url || '',
                                    rank: challenge.opponent_profile?.verified_rank || 'A',
                                  },
                                  score: {
                                    player1: challenge.challenger_score || 0,
                                    player2: challenge.opponent_score || 0,
                                  },
                                  raceToTarget: challenge.race_to || 8,
                                  location: 'Pool Arena',
                                  startTime: challenge.created_at,
                                  betPoints: challenge.bet_points || 0,
                                }}
                                onWatch={id => console.log('Watch match:', id)}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 w-fit mx-auto mb-4'>
                            <Zap className='w-12 h-12 text-red-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Không có trận đấu live nào
                          </h3>
                          <p className='text-muted-foreground'>
                            Các trận đấu đang diễn ra sẽ hiển thị ở đây
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 3: Recent Community Results */}
                  <Card className='bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <Trophy className='w-5 h-5 text-blue-600' />
                        Kết quả gần đây
                        <Badge variant='outline'>
                          {getFilteredChallenges(completedChallenges).length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Các thách đấu đã hoàn thành trong cộng đồng
                      </p>
                    </CardHeader>
                    <CardContent>
                      {getFilteredChallenges(completedChallenges).length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {getFilteredChallenges(completedChallenges).slice(0, 6).map(
                            challenge => (
                              <CompletedChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onView={() => handleChallengeClick(challenge)}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 w-fit mx-auto mb-4'>
                            <Trophy className='w-12 h-12 text-blue-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Chưa có kết quả nào
                          </h3>
                          <p className='text-muted-foreground'>
                            Các thách đấu hoàn thành sẽ hiển thị ở đây
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* 👤 MY CHALLENGES TAB */}
              <TabsContent value='my-challenges' className='space-y-8'>
                <div className='space-y-6'>
                  {/* Personal Header */}
                  <div className='text-center space-y-2'>
                    <h2 className='text-2xl font-bold text-foreground flex items-center justify-center gap-3'>
                      <Target className='w-7 h-7 text-primary' />
                      Thách đấu của tôi
                    </h2>
                    <p className='text-muted-foreground'>
                      Quản lý thách đấu cá nhân, xem lịch sử và tiến độ
                    </p>
                  </div>

                  {/* Section 1: My Active Challenges */}
                  <Card className='bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <Zap className='w-5 h-5 text-amber-600' />
                        Thách đấu đang hoạt động
                        <Badge variant='secondary'>
                          {getFilteredChallenges(activeChallenges, true).filter(c => 
                            c.challenger_id === user?.id || c.opponent_id === user?.id
                          ).length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Các thách đấu đã được chấp nhận và sẵn sàng thi đấu
                      </p>
                    </CardHeader>
                    <CardContent>
                      {getFilteredChallenges(activeChallenges, true).filter(c => 
                        c.challenger_id === user?.id || c.opponent_id === user?.id
                      ).length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {getFilteredChallenges(activeChallenges, true)
                            .filter(c => c.challenger_id === user?.id || c.opponent_id === user?.id)
                            .map(challenge => (
                              <UnifiedChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                variant='match'
                                currentUserId={user?.id || ''}
                                onSubmitScore={handleSubmitScore}
                                isSubmittingScore={isSubmittingScore}
                                onAction={handleChallengeAction}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 w-fit mx-auto mb-4'>
                            <Zap className='w-12 h-12 text-amber-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Không có thách đấu đang hoạt động
                          </h3>
                          <p className='text-muted-foreground'>
                            Hãy tạo hoặc chấp nhận thách đấu để bắt đầu!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 2: Pending Responses */}
                  <Card className='bg-gradient-to-br from-yellow-50/50 to-amber-50/50 border border-yellow-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <Clock className='w-5 h-5 text-yellow-600' />
                        Chờ phản hồi
                        <Badge variant='outline'>
                          {myChallenges.filter(c => c.status === 'pending').length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Thách đấu đang chờ bạn hoặc đối thủ phản hồi
                      </p>
                    </CardHeader>
                    <CardContent>
                      {myChallenges.filter(c => c.status === 'pending').length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {myChallenges
                            .filter(c => c.status === 'pending')
                            .map(challenge => (
                              <UnifiedChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                currentUserId={user?.id || ''}
                                onAction={handleChallengeAction}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 w-fit mx-auto mb-4'>
                            <Clock className='w-12 h-12 text-yellow-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Không có thách đấu chờ phản hồi
                          </h3>
                          <p className='text-muted-foreground'>
                            Tất cả thách đấu đã được xử lý
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 3: My Matches (Score Entry) */}
                  <Card className='bg-gradient-to-br from-green-50/50 to-emerald-50/50 border border-green-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <Trophy className='w-5 h-5 text-green-600' />
                        Trận đấu của tôi
                        <Badge variant='outline'>
                          {getFilteredChallenges(myMatches).length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Nhập điểm số và quản lý kết quả trận đấu
                      </p>
                    </CardHeader>
                    <CardContent>
                      {getFilteredChallenges(myMatches).length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {getFilteredChallenges(myMatches).map(challenge => (
                            <UnifiedChallengeCard
                              key={challenge.id}
                              challenge={challenge}
                              variant='match'
                              currentUserId={user?.id || ''}
                              onSubmitScore={handleSubmitScore}
                              isSubmittingScore={isSubmittingScore}
                              onAction={handleChallengeAction}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 w-fit mx-auto mb-4'>
                            <Trophy className='w-12 h-12 text-green-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Chưa có trận đấu nào
                          </h3>
                          <p className='text-muted-foreground mb-4'>
                            Khi bạn chấp nhận thách đấu, trận đấu sẽ hiển thị ở đây
                          </p>
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className='bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Tạo thách đấu mới
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 4: My History */}
                  <Card className='bg-gradient-to-br from-purple-50/50 to-violet-50/50 border border-purple-200/30'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-3 text-lg'>
                        <Star className='w-5 h-5 text-purple-600' />
                        Lịch sử của tôi
                        <Badge variant='outline'>
                          {getFilteredChallenges(completedChallenges).filter(c =>
                            c.challenger_id === user?.id || c.opponent_id === user?.id
                          ).length}
                        </Badge>
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Tất cả thách đấu đã hoàn thành của bạn
                      </p>
                    </CardHeader>
                    <CardContent>
                      {getFilteredChallenges(completedChallenges).filter(c =>
                        c.challenger_id === user?.id || c.opponent_id === user?.id
                      ).length > 0 ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                          {getFilteredChallenges(completedChallenges)
                            .filter(c => c.challenger_id === user?.id || c.opponent_id === user?.id)
                            .slice(0, 9)
                            .map(challenge => (
                              <CompletedChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onView={() => handleChallengeClick(challenge)}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='p-4 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 w-fit mx-auto mb-4'>
                            <Star className='w-12 h-12 text-purple-600 mx-auto' />
                          </div>
                          <h3 className='text-lg font-semibold text-foreground mb-2'>
                            Chưa có lịch sử thách đấu
                          </h3>
                          <p className='text-muted-foreground'>
                            Hoàn thành thách đấu đầu tiên để xem lịch sử!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Mobile Layout Component - Enhanced with MobileChallengeManager
  const MobileLayout = () => (
    <div className='min-h-screen bg-background'>
      <div className='px-0 py-0'>
        <MobileChallengeManager className='h-screen' />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      {/* Responsive Layout Rendering */}
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}

      {/* Modals */}
      <UnifiedCreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChallengeCreated={() => {
          setShowCreateModal(false);
          // Data will refresh automatically via the hook
        }}
        variant='standard'
      />

      <UnifiedCreateChallengeModal
        isOpen={showAdminCreateModal}
        onClose={() => setShowAdminCreateModal(false)}
        onChallengeCreated={() => {
          setShowAdminCreateModal(false);
          // Data will refresh automatically via the hook
        }}
        variant='admin'
      />

      <ChallengeDetailsModal
        challenge={selectedChallenge as any}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedChallenge(null);
        }}
        onUpdate={() => {
          // Data will refresh automatically via the hook
        }}
      />
    </ErrorBoundary>
  );
};

export default EnhancedChallengesPageV2;
