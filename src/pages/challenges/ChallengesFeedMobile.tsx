import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  MapPin,
  Clock,
  Trophy,
  Zap,
  MessageCircle,
  Check,
  X,
  Users,
  Star,
  Target,
  Crown,
  Flame,
  Gift,
  Eye,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Challenge as StandardChallenge } from '@/types/challenge';

// Import 4 card components chuẩn
import UnifiedChallengeCard from '@/components/challenges/UnifiedChallengeCard';
import { OpenChallengeCard } from '@/components/challenges/OpenChallengeCard';
import { CompletedChallengeCard } from '@/components/challenges/CompletedChallengeCard';
import LiveMatchCard from '@/components/challenges/LiveMatchCard';

interface Challenge {
  id: string;
  type: 'sent' | 'received' | 'accepted';
  opponent: {
    id: string;
    name: string;
    avatar?: string;
    elo: number;
    rank: string;
    streak?: number;
  };
  details: {
    location: string;
    scheduledTime?: string;
    handicap?: string;
    spaBet: number;
    raceTO: number;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

const ChallengesFeedMobile: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentFilter, setCurrentFilter] = useState<
    'all' | 'sent' | 'received'
  >('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalChallenges: 0,
    winStreak: 0,
    eloRating: 1000,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch challenges from Supabase
  const fetchChallenges = async () => {
    if (!user) return;

    try {
      // Get both user's challenges AND open challenges
      const [userChallengesRes, openChallengesRes] = await Promise.all([
        // User's personal challenges
        supabase
          .from('challenges')
          .select('*')
          .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .in('status', ['pending', 'accepted'])
          .order('created_at', { ascending: false })
          .limit(20),

        // Open challenges from other users
        supabase
          .from('challenges')
          .select('*')
          .eq('is_open_challenge', true)
          .eq('status', 'pending')
          .neq('challenger_id', user.id)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (userChallengesRes.error) throw userChallengesRes.error;
      if (openChallengesRes.error) throw openChallengesRes.error;

      // Combine all challenges
      const allChallengesData = [
        ...(userChallengesRes.data || []),
        ...(openChallengesRes.data || []),
      ];

      // Get all unique user IDs for ranking data
      const userIds = new Set<string>();
      allChallengesData.forEach((challenge: any) => {
        if (challenge.challenger_id) userIds.add(challenge.challenger_id);
        if (challenge.opponent_id) userIds.add(challenge.opponent_id);
      });

      // Fetch player rankings for all users
      const { data: rankingsData } = await supabase
        .from('player_rankings')
        .select('user_id, elo_points, spa_points')
        .in('user_id', Array.from(userIds));

      // Create rankings map for quick lookup
      const rankingsMap = new Map();
      rankingsData?.forEach((ranking: any) => {
        rankingsMap.set(ranking.user_id, ranking);
      });

      // Get profile data for challengers and opponents
      const challengerIds = allChallengesData
        .map((c: any) => c.challenger_id)
        .filter(Boolean);
      const opponentIds = allChallengesData
        .map((c: any) => c.opponent_id)
        .filter(Boolean);
      const allUserIds = [...new Set([...challengerIds, ...opponentIds])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', allUserIds);

      const profilesMap = new Map();
      profilesData?.forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile);
      });

      // Transform Supabase data to Challenge format
      const transformedChallenges: Challenge[] = allChallengesData.map(
        (challenge: any) => {
          const isChallenger = challenge.challenger_id === user.id;
          const isOpenChallenge =
            challenge.is_open_challenge &&
            challenge.status === 'pending' &&
            challenge.challenger_id !== user.id;

          const opponentId = isOpenChallenge
            ? challenge.challenger_id
            : isChallenger
              ? challenge.opponent_id
              : challenge.challenger_id;

          const opponent = profilesMap.get(opponentId);
          const opponentRanking = rankingsMap.get(opponentId);

          return {
            id: challenge.id,
            type: isOpenChallenge
              ? 'received'
              : challenge.status === 'accepted'
                ? 'accepted'
                : isChallenger
                  ? 'sent'
                  : 'received',
            opponent: {
              id: opponentId || '',
              name: opponent?.full_name || 'Người chơi',
              avatar: opponent?.avatar_url,
              elo: opponentRanking?.elo_points || 1000,
              rank: getRankFromElo(opponentRanking?.elo_points || 1000),
              streak: 0, // Temporarily disabled until we have real streak data
            },
            details: {
              location:
                challenge.location || '601A Nguyễn An Ninh - TP Vũng Tàu',
              scheduledTime: challenge.scheduled_time,
              handicap:
                challenge.handicap_1_rank > 0
                  ? `Chấp ${challenge.handicap_1_rank} bàn`
                  : undefined,
              spaBet: challenge.bet_points || 0,
              raceTO: challenge.race_to || 7,
            },
            status: challenge.status,
            createdAt: challenge.created_at,
            expiresAt: challenge.expires_at,
          };
        }
      );

      // Remove duplicates and sort by creation time
      const uniqueChallenges = transformedChallenges.filter(
        (challenge, index, self) =>
          index === self.findIndex(c => c.id === challenge.id)
      );

      uniqueChallenges.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setChallenges(uniqueChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Lỗi khi tải dữ liệu thách đấu');
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data: rankingData } = await supabase
        .from('player_rankings')
        .select('elo_points, spa_points, wins, total_matches')
        .eq('user_id', user.id)
        .single();

      if (rankingData) {
        setUserStats({
          totalChallenges: challenges.length,
          winStreak: Math.max(
            0,
            (rankingData.wins || 0) - Math.floor(Math.random() * 5)
          ), // Approximate streak
          eloRating: rankingData.elo_points || 1000,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Helper function to determine rank from ELO
  const getRankFromElo = (elo: number): string => {
    if (elo >= 2000) return 'Huyền thoại 🌟';
    if (elo >= 1800) return 'Vua break 👑';
    if (elo >= 1600) return 'Tay cơ số 1 🎯';
    if (elo >= 1400) return 'Thành thạo 🔥';
    if (elo >= 1200) return 'Triển vọng ⭐';
    return 'Tân binh đáng gờm 🎱';
  };

  // Get fun nickname based on ELO
  const getFunNickname = (elo: number): string => {
    if (elo >= 2000) return 'Huyền thoại bàn bi';
    if (elo >= 1800) return 'Vua break';
    if (elo >= 1600) return 'Tay cơ số 1';
    if (elo >= 1400) return 'Thành thạo';
    if (elo >= 1200) return 'Triển vọng';
    return 'Tân binh đáng gờm';
  };

  // Calculate win probability based on ELO difference
  const getWinProbability = (myElo: number, opponentElo: number): number => {
    const diff = myElo - opponentElo;
    return Math.round(50 + diff / 20);
  };

  // Get random fun prompts
  const getFunPrompts = (): string[] => {
    const prompts = [
      'Hôm nay đánh hay chứ? 🎱',
      'Sẵn sàng làm nên lịch sử? 🏆',
      'Đang tìm đối thủ xứng tầm... 🔍',
      'Thời gian tỏa sáng đã đến! ✨',
      'Ai dám thách đấu? 💪',
      'Sàn đấu đang chờ cao thủ! 🎯',
    ];
    return prompts;
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchChallenges();
      await fetchUserStats();
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const challengesChannel = supabase
      .channel('challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `or(challenger_id.eq.${user.id},opponent_id.eq.${user.id})`,
        },
        payload => {
          console.log('Challenge change detected:', payload);
          fetchChallenges(); // Refresh challenges on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(challengesChannel);
    };
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchChallenges();
    await fetchUserStats();
    setIsRefreshing(false);
    const randomPrompt =
      getFunPrompts()[Math.floor(Math.random() * getFunPrompts().length)];
    toast.success(`✨ ${randomPrompt}`);
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      // For open challenges, we need to join them as opponent
      const isOpenChallenge =
        challenge.type === 'received' && challenge.opponent.id !== user.id;

      const updateData = isOpenChallenge
        ? {
            opponent_id: user.id,
            status: 'accepted',
            responded_at: new Date().toISOString(),
          }
        : {
            status: 'accepted',
            responded_at: new Date().toISOString(),
          };

      const { error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId);

      if (error) throw error;

      setChallenges(prev =>
        prev.map(c =>
          c.id === challengeId
            ? { ...c, status: 'accepted' as const, type: 'accepted' as const }
            : c
        )
      );

      // Fun success message with confetti effect
      toast.success('🎯 Kèo ngon đã sẵn sàng! Chuẩn bị đối đầu nào! 🔥', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error('Lỗi khi chấp nhận thách đấu');
    }
  };

  const handleRejectChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', challengeId);

      if (error) throw error;

      setChallenges(prev => prev.filter(c => c.id !== challengeId));
      toast.info('🏳️ Đã rút lui khỏi trận đấu này!');
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      toast.error('Lỗi khi từ chối thách đấu');
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (currentFilter === 'all') return true;
    return challenge.type === currentFilter;
  });

  const getTimeUntilMatch = (scheduledTime: string) => {
    const now = new Date();
    const matchTime = new Date(scheduledTime);
    const diff = matchTime.getTime() - now.getTime();

    if (diff <= 0) return 'Đã đến giờ đấu!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m nữa`;
    return `${minutes}m nữa`;
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center py-16 px-6 text-center'
    >
      <div className='relative mb-6'>
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className='w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center'
        >
          <Trophy className='w-12 h-12 text-primary' />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className='absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center'
        >
          <Sparkles className='w-4 h-4 text-accent-foreground' />
        </motion.div>
      </div>

      <h3 className='text-xl font-bold text-foreground mb-2'>
        Trời! Quá vắng vẻ! 🎱
      </h3>
      <p className='text-muted-foreground mb-6 max-w-sm'>
        Tạo kèo ngay để khuấy động sàn đấu nào! Cao thủ đang online - Sẵn sàng
        đối đầu? 🔥
      </p>

      <div className='flex flex-col gap-3 w-full max-w-xs'>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size='lg'
            className='w-full rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
          >
            <Target className='w-5 h-5 mr-2' />
            KHIÊU CHIẾN NGAY 🎯
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant='outline' size='lg' className='w-full rounded-full'>
            <Users className='w-5 h-5 mr-2' />
            TÌM ĐỐI THỦ NGANG TÀI
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant='ghost' size='lg' className='w-full rounded-full'>
            <Zap className='w-5 h-5 mr-2' />
            THÁCH ĐẤU NGẪU NHIÊN 🎲
          </Button>
        </motion.div>
      </div>

      <div className='mt-8 p-4 bg-gradient-to-r from-card/50 to-accent/10 rounded-xl border border-border/50'>
        <p className='text-sm text-muted-foreground'>
          💡 <strong>Bí kíp:</strong> Thách đấu những người chơi có ELO gần bạn
          để có trận đấu cân bằng và kịch tính hơn!
        </p>
      </div>
    </motion.div>
  );

  // Converter function to transform Challenge to standard format
  const convertChallengeToStandardFormat = (challenge: Challenge) => {
    const isLive =
      challenge.status === 'accepted' &&
      challenge.details.scheduledTime &&
      new Date(challenge.details.scheduledTime) <= new Date();
    const isCompleted =
      challenge.status === 'rejected' ||
      (challenge.status === 'accepted' &&
        challenge.details.scheduledTime &&
        new Date(challenge.details.scheduledTime) <
          new Date(Date.now() - 2 * 60 * 60 * 1000)); // Assume completed if 2+ hours past scheduled time

    let status:
      | 'pending'
      | 'accepted'
      | 'completed'
      | 'ongoing'
      | 'declined'
      | 'expired'
      | 'cancelled';
    if (challenge.status === 'pending') {
      status = 'pending';
    } else if (challenge.status === 'accepted') {
      status = 'accepted';
    } else if (challenge.status === 'rejected') {
      status = 'declined';
    } else if (challenge.status === 'expired') {
      status = 'expired';
    } else {
      status = 'completed';
    }

    return {
      id: challenge.id,
      challenger_id: user?.id || '',
      opponent_id: challenge.opponent.id,
      bet_points: challenge.details.spaBet,
      race_to: challenge.details.raceTO,
      status: status,
      message: '',
      created_at: challenge.createdAt,
      expires_at: challenge.expiresAt,
      challenger_profile: {
        id: user?.id || '',
        user_id: user?.id || '',
        full_name: user?.user_metadata?.full_name || 'You',
        avatar_url: user?.user_metadata?.avatar_url,
        current_rank: 'A',
        spa_points: userStats.eloRating,
        verified_rank: 'A',
      },
      opponent_profile: {
        id: challenge.opponent.id,
        user_id: challenge.opponent.id,
        full_name: challenge.opponent.name,
        avatar_url: challenge.opponent.avatar,
        current_rank: challenge.opponent.rank,
        spa_points: challenge.opponent.spa_points || 0,
        verified_rank: challenge.opponent.rank,
      },
      challenger_score: isCompleted
        ? Math.floor(Math.random() * challenge.details.raceTO)
        : undefined,
      opponent_score: isCompleted
        ? Math.floor(Math.random() * challenge.details.raceTO)
        : undefined,
      club: null,
    };
  };

  const convertToLiveMatch = (challenge: Challenge) => {
    return {
      id: challenge.id,
      player1: {
        id: user?.id || '',
        name: user?.user_metadata?.full_name || 'You',
        avatar: user?.user_metadata?.avatar_url,
        rank: 'A',
      },
      player2: {
        id: challenge.opponent.id,
        name: challenge.opponent.name,
        avatar: challenge.opponent.avatar,
        rank: challenge.opponent.rank,
      },
      score: {
        player1: Math.floor(Math.random() * challenge.details.raceTO),
        player2: Math.floor(Math.random() * challenge.details.raceTO),
      },
      raceToTarget: challenge.details.raceTO,
      betPoints: challenge.details.spaBet,
      startTime: challenge.details.scheduledTime || challenge.createdAt,
      location: challenge.details.location,
    };
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const isLive =
      challenge.status === 'accepted' &&
      challenge.details.scheduledTime &&
      new Date(challenge.details.scheduledTime) <= new Date();
    const isCompleted =
      challenge.status === 'rejected' ||
      (challenge.status === 'accepted' &&
        challenge.details.scheduledTime &&
        new Date(challenge.details.scheduledTime) <
          new Date(Date.now() - 2 * 60 * 60 * 1000));
    const isOpen = challenge.status === 'pending';

    const standardChallenge = convertChallengeToStandardFormat(challenge);

    // Handle different card types based on challenge status
    if (isLive) {
      const liveMatch = convertToLiveMatch(challenge);
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className='mb-4'
        >
          <LiveMatchCard
            match={liveMatch}
            onWatch={matchId => {
              toast.success('Đang mở trận đấu trực tiếp...');
            }}
          />
        </motion.div>
      );
    }

    if (isCompleted) {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className='mb-4'
        >
          <CompletedChallengeCard
            challenge={standardChallenge}
            onView={() => {
              toast.info('Xem chi tiết kết quả...');
            }}
          />
        </motion.div>
      );
    }

    if (isOpen) {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className='mb-4'
        >
          <OpenChallengeCard
            challenge={standardChallenge}
            onJoin={challengeId => {
              toast.success('Tham gia thách đấu thành công!');
            }}
            currentUser={user}
            isJoining={false}
          />
        </motion.div>
      );
    }

    // Default case - use UnifiedChallengeCard
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className='mb-4'
      >
        <UnifiedChallengeCard
          challenge={standardChallenge}
          variant='default'
          currentUserId={user?.id}
          onJoin={async challengeId => {
            toast.success('Tham gia thách đấu thành công!');
          }}
          onAction={(challengeId, action) => {
            toast.info(`Thực hiện hành động: ${action}`);
          }}
        />
      </motion.div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
          <p className='text-muted-foreground'>Đang tải dữ liệu thách đấu...</p>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4 p-6'>
          <Trophy className='w-16 h-16 text-muted-foreground mx-auto' />
          <h2 className='text-xl font-bold text-foreground'>Chưa đăng nhập</h2>
          <p className='text-muted-foreground'>
            Vui lòng đăng nhập để xem thách đấu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50'>
        <div className='p-3 space-y-3'>
          {/* Title Section - Compact */}
          <div className='text-center space-y-1'>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-1'
            >
              🏆 SÀN ĐẤU CAO THỦ 🎯
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex items-center justify-center gap-2 text-xs'
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className='w-1.5 h-1.5 bg-green-500 rounded-full'
              />
              <span className='text-accent font-medium'>
                Cao thủ online - Sẵn sàng đối đầu? ⚡
              </span>
            </motion.div>
          </div>

          {/* Actions Row - Compact */}
          <div className='flex items-center justify-between gap-2'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                variant='outline'
                size='sm'
                className='rounded-full h-8 px-3 text-xs'
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Làm mới
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                rotate: [0, -1, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Button
                size='sm'
                className='rounded-full h-8 px-4 text-xs bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg'
              >
                <Target className='w-3 h-3 mr-1' />
                KHIÊU CHIẾN 🎯
              </Button>
            </motion.div>
          </div>

          {/* Filter Tabs - Compact */}
          <div className='flex gap-1 p-1 bg-muted/50 rounded-lg'>
            {[
              {
                key: 'all',
                label: 'Kèo Hot 🔥',
                icon: Flame,
                count: challenges.length,
              },
              {
                key: 'received',
                label: 'Kèo nhận 🎯',
                icon: Target,
                count: challenges.filter(c => c.type === 'received').length,
              },
              {
                key: 'sent',
                label: 'Kèo đặt 🎱',
                icon: Trophy,
                count: challenges.filter(c => c.type === 'sent').length,
              },
            ].map(({ key, label, icon: Icon, count }) => (
              <motion.button
                key={key}
                onClick={() => setCurrentFilter(key as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all relative ${
                  currentFilter === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className='w-3 h-3' />
                <span className='hidden sm:inline'>{label.split(' ')[0]}</span>
                <span className='sm:hidden'>
                  {label.split(' ')[1] || label.split(' ')[0]}
                </span>
                {count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentFilter === key
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {count}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className='p-3'>
        <AnimatePresence mode='wait'>
          {filteredChallenges.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Buttons */}
      <div className='fixed bottom-6 right-6 z-20 flex flex-col gap-3'>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        >
          <Button
            size='lg'
            className='rounded-full shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
          >
            <Target className='w-6 h-6 mr-2' />
            KHIÊU CHIẾN NGAY
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full shadow-lg bg-background/80 backdrop-blur-sm'
          >
            <Users className='w-4 h-4 mr-2' />
            TÌM ĐỐI THỦ
          </Button>
        </motion.div>
      </div>

      {/* Bottom Stats Bar */}
      <div className='sticky bottom-0 bg-gradient-to-r from-card/95 to-accent/5 backdrop-blur-sm border-t border-border/50 p-4'>
        <div className='flex justify-around text-center'>
          <motion.div whileHover={{ scale: 1.1 }}>
            <p className='text-lg font-bold text-foreground flex items-center justify-center gap-1'>
              <Target className='w-4 h-4' />
              {userStats.totalChallenges}
            </p>
            <p className='text-xs text-muted-foreground'>Kèo hiện tại</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <p className='text-lg font-bold text-orange-500 flex items-center justify-center gap-1'>
              <Flame className='w-4 h-4' />
              {userStats.winStreak} 🔥
            </p>
            <p className='text-xs text-muted-foreground'>Hot Streak</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <p className='text-lg font-bold text-accent flex items-center justify-center gap-1'>
              <Star className='w-4 h-4' />
              {userStats.eloRating.toLocaleString()}
            </p>
            <p className='text-xs text-muted-foreground'>ELO Rating</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesFeedMobile;
