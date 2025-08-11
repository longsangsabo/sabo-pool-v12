import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Challenge } from '@/types/challenge';

// Enhanced filtering logic for the new tab structure
export const useEnhancedChallengesV3 = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all challenges with enhanced data
  const fetchChallenges = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [useEnhancedChallengesV3] Fetching all challenges...');

      // Fetch ALL challenges from the system
      const { data: challengesData, error: fetchError } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Get all unique user IDs for profile data
      const userIds = new Set<string>();
      challengesData?.forEach(challenge => {
        if (challenge.challenger_id) userIds.add(challenge.challenger_id);
        if (challenge.opponent_id) userIds.add(challenge.opponent_id);
      });

      // Fetch profiles and rankings in parallel
      const [profilesResponse, rankingsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name, display_name, verified_rank, elo, avatar_url, current_rank')
          .in('user_id', Array.from(userIds)),
        supabase
          .from('player_rankings')
          .select('user_id, spa_points, elo_points')
          .in('user_id', Array.from(userIds))
      ]);

      const profiles = profilesResponse.data || [];
      const rankings = rankingsResponse.data || [];

      // Create lookup maps
      const profileMap = new Map();
      const rankingMap = new Map();

      profiles.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      rankings.forEach(ranking => {
        rankingMap.set(ranking.user_id, ranking);
      });

      // Enrich challenges with profile data
      const enrichedChallenges = challengesData?.map(challenge => {
        const challengerProfile = profileMap.get(challenge.challenger_id);
        const opponentProfile = profileMap.get(challenge.opponent_id);
        const challengerRanking = rankingMap.get(challenge.challenger_id);
        const opponentRanking = rankingMap.get(challenge.opponent_id);

        return {
          ...challenge,
          challenger_profile: challengerProfile ? {
            ...challengerProfile,
            spa_points: challengerRanking?.spa_points || 0,
            elo_points: challengerRanking?.elo_points || 1000,
          } : null,
          opponent_profile: opponentProfile ? {
            ...opponentProfile,
            spa_points: opponentRanking?.spa_points || 0,
            elo_points: opponentRanking?.elo_points || 1000,
          } : null,
        };
      }) || [];

      setChallenges(enrichedChallenges as any[]);
      
      console.log('✅ [useEnhancedChallengesV3] Loaded challenges:', {
        total: enrichedChallenges.length,
        byStatus: {
          pending: enrichedChallenges.filter(c => c.status === 'pending').length,
          accepted: enrichedChallenges.filter(c => c.status === 'accepted').length,
          completed: enrichedChallenges.filter(c => c.status === 'completed').length,
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Enhanced challenges fetch error:', err);
      toast.error(`Error loading challenges: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 PHASE 1: CENTRALIZED FILTERING LOGIC
  
  // Community challenges - ALL challenges in system
  const communityKeo = useMemo(() => 
    challenges.filter(c => !c.opponent_id && c.status === 'pending'), 
    [challenges]
  );

  const communityLive = useMemo(() => 
    challenges.filter(c => 
      c.status === 'pending' && c.opponent_id && c.scheduled_time && new Date(c.scheduled_time) <= new Date()
    ), 
    [challenges]
  );

  const communitySapToi = useMemo(() => 
    challenges.filter(c => 
      c.status === 'accepted' && 
      c.opponent_id && 
      c.scheduled_time && 
      new Date(c.scheduled_time) > new Date()
    ), 
    [challenges]
  );

  const communityXong = useMemo(() => 
    challenges.filter(c => c.status === 'completed'), 
    [challenges]
  );

  // My challenges - Only user's challenges
  const myDoiDoiThu = useMemo(() => 
    challenges.filter(c => 
      c.challenger_id === user?.id && 
      !c.opponent_id && 
      c.status === 'pending'
    ), 
    [challenges, user?.id]
  );

  const mySapToi = useMemo(() => 
    challenges.filter(c => 
      (c.challenger_id === user?.id || c.opponent_id === user?.id) && 
      c.status === 'accepted' && 
      c.opponent_id
    ), 
    [challenges, user?.id]
  );

  const myHoanThanh = useMemo(() => 
    challenges.filter(c => 
      (c.challenger_id === user?.id || c.opponent_id === user?.id) && 
      c.status === 'completed'
    ), 
    [challenges, user?.id]
  );

  // Accept challenge function
  const acceptChallenge = async (challengeId: string) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập để tham gia thách đấu');
    }

    try {
      const { data: result, error } = await supabase.rpc('accept_open_challenge', {
        p_challenge_id: challengeId,
        p_user_id: user.id,
      });

      if (error) {
        throw new Error(`Không thể tham gia thách đấu: ${error.message}`);
      }

      toast.success('Tham gia thách đấu thành công! Trận đấu đã được lên lịch.');
      await fetchChallenges(); // Refresh data
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tham gia thách đấu';
      throw new Error(errorMessage);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchChallenges();

    const challengesSubscription = supabase
      .channel('enhanced_challenges_v3_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
        },
        payload => {
          console.log('🔄 Real-time challenge update:', payload);
          setTimeout(() => fetchChallenges(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        payload => {
          // Refresh if profile affects current challenges
          const updatedUserId = (payload.new as any)?.user_id;
          const hasRelevantChallenge = challenges.some(
            c => c.challenger_id === updatedUserId || c.opponent_id === updatedUserId
          );

          if (hasRelevantChallenge) {
            setTimeout(() => fetchChallenges(), 100);
          }
        }
      )
      .subscribe();

    return () => {
      challengesSubscription.unsubscribe();
    };
  }, [user]);

  return {
    // Core data
    challenges,
    loading,
    error,
    
    // Community challenges
    communityKeo,
    communityLive,
    communitySapToi,
    communityXong,
    
    // My challenges
    myDoiDoiThu,
    mySapToi,
    myHoanThanh,
    
    // Actions
    fetchChallenges,
    acceptChallenge,
  };
};
