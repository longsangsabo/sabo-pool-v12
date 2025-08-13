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
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const { user } = useAuth();

  // Helper function to check if challenge is expired
  const isExpiredChallenge = (challenge: Challenge): boolean => {
    if (challenge.status !== 'pending' || challenge.opponent_id) {
      return false; // Only check pending challenges without opponent
    }

    const now = new Date();
    
    // Check expires_at first (explicit expiration)
    if (challenge.expires_at) {
      return new Date(challenge.expires_at) < now;
    }
    
    // Check scheduled_time (if scheduled time passed without opponent)
    if (challenge.scheduled_time) {
      return new Date(challenge.scheduled_time) < now;
    }
    
    // Default: expire after 48 hours if no explicit expiration
    if (challenge.created_at) {
      const created = new Date(challenge.created_at);
      const expiry = new Date(created.getTime() + 48 * 60 * 60 * 1000); // 48 hours
      return expiry < now;
    }
    
    return false;
  };

  // Auto-expire challenges function
  const autoExpireChallenges = async () => {
    if (!user) return;

    try {
      const expiredChallenges = challenges.filter(isExpiredChallenge);
      
      if (expiredChallenges.length > 0) {
        console.log(`🗑️ Auto-expiring ${expiredChallenges.length} challenges...`);
        
        // Update expired challenges in database
        const { error } = await supabase
          .from('challenges')
          .update({ status: 'expired' })
          .in('id', expiredChallenges.map(c => c.id))
          .eq('status', 'pending'); // Only update pending challenges

        if (error) {
          console.error('Error auto-expiring challenges:', error);
        } else {
          console.log('✅ Auto-expired challenges updated');
          // Refresh data to reflect changes
          await fetchChallenges();
        }
      }
    } catch (error) {
      console.error('Error in auto-expire logic:', error);
    }
  };

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

      let tempCurrentUserProfile = null;
      
      profiles.forEach(profile => {
        profileMap.set(profile.user_id, profile);
        
        // Save current user profile
        if (profile.user_id === user?.id) {
          console.log('✅ Found current user profile:', {
            user_id: profile.user_id,
            display_name: profile.display_name
          });
          tempCurrentUserProfile = profile;
        }
      });

      rankings.forEach(ranking => {
        rankingMap.set(ranking.user_id, ranking);
        
        // Update current user profile with ranking data
        if (ranking.user_id === user?.id && tempCurrentUserProfile) {
          tempCurrentUserProfile = {
            ...tempCurrentUserProfile,
            spa_points: ranking.spa_points || 0
          };
          console.log('✅ Updated current user with SPA:', {
            user_id: ranking.user_id,
            spa_points: ranking.spa_points
          });
        }
      });
      
      // Set the final profile with SPA data
      if (tempCurrentUserProfile) {
        setCurrentUserProfile(tempCurrentUserProfile);
      }

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
  
  // Community challenges - Available challenges (exclude user's own and already joined)
  const communityKeo = useMemo(() => 
    challenges.filter(c => 
      !c.opponent_id && 
      c.status === 'pending' && 
      c.challenger_id !== user?.id && // Exclude user's own challenges
      !isExpiredChallenge(c) // Exclude expired challenges
    ), 
    [challenges, user?.id]
  );

  const communityLive = useMemo(() => 
    challenges.filter(c => 
      (c.status === 'accepted' || c.status === 'ongoing') && 
      c.opponent_id && 
      c.scheduled_time && 
      new Date(c.scheduled_time) <= new Date()
    ), 
    [challenges]
  );

  const communitySapToi = useMemo(() => 
    challenges.filter(c => 
      c.status === 'accepted' && 
      c.opponent_id && 
      (!c.scheduled_time || new Date(c.scheduled_time) > new Date())
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

  // Accept challenge function with confirmation
  const acceptChallengeWithConfirmation = async (challengeId: string, onSuccess?: () => void) => {
    return new Promise<void>((resolve, reject) => {
      // This will be handled by the component that shows confirmation dialog
      // Component will call the actual acceptChallenge function after confirmation
      resolve();
    });
  };

  // Internal accept challenge function (called after confirmation)
  const acceptChallenge = async (challengeId: string, onSuccess?: () => void) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập để tham gia thách đấu');
    }

    // Find the challenge to get bet_points
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      throw new Error('Không tìm thấy thách đấu');
    }

    const requiredSpa = challenge.bet_points || 0;
    const userSpa = currentUserProfile?.spa_points || 0;

    // Debug: Log current user profile and SPA
    console.log('🔍 SPA Validation Debug:', {
      currentUserProfile,
      userSpa,
      requiredSpa,
      userId: user.id
    });

    // Frontend validation - check SPA before API call
    if (requiredSpa > 0 && userSpa < requiredSpa) {
      // If we don't have profile data, don't show fake numbers
      if (!currentUserProfile) {
        throw new Error(`Không đủ SPA để tham gia (cần ${requiredSpa} SPA)`);
      }
      throw new Error(`Không đủ SPA để tham gia (cần ${requiredSpa}, có ${userSpa})`);
    }

    try {
      const { data: result, error } = await supabase.rpc('accept_open_challenge', {
        p_challenge_id: challengeId,
        p_user_id: user.id,
      });

      if (error) {
        throw new Error(`Không thể tham gia thách đấu: ${error.message}`);
      }

      // Cast result to expected type with SPA validation info
      const response = result as { 
        success: boolean; 
        error?: string; 
        required_spa?: number;
        user_spa?: number;
        shortage?: number;
      };
      
      if (response?.success) {
        toast.success('Tham gia thách đấu thành công! Trận đấu đã được lên lịch.');
        
        // Force refresh data immediately
        await fetchChallenges();
        
        // Call success callback (e.g., switch to "Sắp diễn ra" tab)
        onSuccess?.();
        
        return result;
      } else {
        // Handle SPA-specific errors with better messaging
        if (response?.error?.includes('không đủ SPA')) {
          const requiredSpa = response.required_spa || 0;
          const userSpa = response.user_spa || 0;
          
          throw new Error(`Không đủ SPA để tham gia (cần ${requiredSpa}, có ${userSpa})`);
        }
        
        throw new Error(response?.error || 'Không thể tham gia thách đấu');
      }
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

  // Auto-expire challenges every 5 minutes
  useEffect(() => {
    if (!user || challenges.length === 0) return;

    const interval = setInterval(() => {
      autoExpireChallenges();
    }, 5 * 60 * 1000); // 5 minutes

    // Also run once immediately when challenges change
    const timeoutId = setTimeout(() => {
      autoExpireChallenges();
    }, 1000); // 1 second delay to avoid rapid firing

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [user, challenges]);

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
    
    // User profile data
    currentUserProfile,
    
    // Actions
    fetchChallenges,
    acceptChallenge,
    acceptChallengeWithConfirmation,
    autoExpireChallenges,
    // Helper for debugging
    isExpiredChallenge,
  };
};
