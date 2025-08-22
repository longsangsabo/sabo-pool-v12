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

  // Helper function to check if challenge is expired - ENHANCED
  const isExpiredChallenge = (challenge: Challenge): boolean => {
    // Skip if already expired, completed, or cancelled
    if (['expired', 'completed', 'cancelled'].includes(challenge.status)) {
      return false;
    }
    
    const now = new Date();
    
    // CASE 1: Pending challenges without opponent - check multiple expiry conditions
    if (challenge.status === 'pending' && !challenge.opponent_id) {
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
    }
    
    // CASE 2: Open challenges without opponent - check if scheduled time has passed
    if (challenge.status === 'open' && !challenge.opponent_id && challenge.scheduled_time) {
      const scheduledTime = new Date(challenge.scheduled_time);
      // Allow 15 minutes grace period after scheduled time
      const graceTime = new Date(scheduledTime.getTime() + 15 * 60 * 1000);
      return now > graceTime;
    }
    
    // CASE 3: Accepted challenges that should have started (scheduled time passed)
    if (challenge.status === 'accepted' && challenge.scheduled_time && challenge.opponent_id) {
      const scheduledTime = new Date(challenge.scheduled_time);
      // Allow 30 minutes grace period for accepted challenges
      const graceTime = new Date(scheduledTime.getTime() + 30 * 60 * 1000);
      return now > graceTime;
    }
    
    return false;
  };

  // Auto-expire challenges function - ENHANCED with comprehensive expiry logic
  const autoExpireChallenges = async () => {
    if (!user) return;

    try {
      // Filter expired challenges that are still active
      const expiredChallenges = challenges.filter(challenge => 
        isExpiredChallenge(challenge) && 
        !['expired', 'completed', 'cancelled'].includes(challenge.status)
      );
      
      if (expiredChallenges.length > 0) {
        console.log(`🗑️ Auto-expiring ${expiredChallenges.length} challenges...`, {
          expiredIds: expiredChallenges.map(c => c.id),
          expiredData: expiredChallenges.map(c => ({ 
            id: c.id, 
            status: c.status, 
            expires_at: c.expires_at,
            scheduled_time: c.scheduled_time,
            has_opponent: !!c.opponent_id,
            reason: getExpiryReason(c)
          }))
        });
        
        // Update expired challenges in database
        const { error } = await supabase
          .from('challenges')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .in('id', expiredChallenges.map(c => c.id));

        if (error) {
          console.error('❌ Error auto-expiring challenges:', error);
        } else {
          console.log('✅ Auto-expired challenges updated in database');
          
          // Update local state to remove expired challenges from UI
          setChallenges(prev => prev.filter(c => 
            !expiredChallenges.some(exp => exp.id === c.id)
          ));
          
          // Show user-friendly notification for cleanup
          if (expiredChallenges.length > 0) {
            console.log(`🧹 Cleaned up ${expiredChallenges.length} expired challenge(s)`);
            // Optional: Show toast notification to user
            // toast.info(`Đã ẩn ${expiredChallenges.length} thách đấu hết hạn`);
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-expire logic:', error);
    }
  };

  // Helper function to get expiry reason for debugging
  const getExpiryReason = (challenge: Challenge): string => {
    const now = new Date();
    
    if (challenge.status === 'pending' && !challenge.opponent_id) {
      if (challenge.expires_at && new Date(challenge.expires_at) < now) {
        return 'explicit_expiry';
      }
      if (challenge.scheduled_time && new Date(challenge.scheduled_time) < now) {
        return 'scheduled_time_passed';
      }
      return 'default_48h_expiry';
    }
    
    if (challenge.status === 'open' && !challenge.opponent_id && challenge.scheduled_time) {
      return 'open_scheduled_time_passed';
    }
    
    if (challenge.status === 'accepted' && challenge.scheduled_time && challenge.opponent_id) {
      return 'accepted_grace_period_exceeded';
    }
    
    return 'unknown';
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

      // ✅ ALWAYS include current user to fix SPA validation issue
      if (user?.id) {
        userIds.add(user.id);
      }

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
      } else if (user?.id) {
        // ✅ Fallback: Direct load current user if not found in batch
        console.log('⚠️ Current user not found in batch, loading directly...');
        const [directProfile, directRanking] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id, full_name, display_name, verified_rank, elo, avatar_url, current_rank')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('player_rankings')
            .select('spa_points, elo_points')
            .eq('user_id', user.id)
            .single()
        ]);

        if (directProfile.data && !directProfile.error) {
          const fallbackProfile = {
            ...directProfile.data,
            spa_points: directRanking.data?.spa_points || 0,
            elo_points: directRanking.data?.elo_points || 1000
          };
          setCurrentUserProfile(fallbackProfile);
          console.log('✅ Loaded current user profile via fallback:', {
            display_name: fallbackProfile.display_name,
            spa_points: fallbackProfile.spa_points
          });
        }
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
        },
        rawChallengesData: challengesData?.length || 0,
        firstFewChallenges: challengesData?.slice(0, 3).map(c => ({
          id: c.id,
          challenger_id: c.challenger_id,
          opponent_id: c.opponent_id,
          status: c.status,
          created_at: c.created_at
        })),
        currentUserId: user?.id
      });

      // 🚀 Auto-expire challenges immediately after loading
      setTimeout(() => {
        autoExpireChallenges();
      }, 1000); // Small delay to ensure state is updated

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
  const communityKeo = useMemo(() => {
    const filtered = challenges.filter(c => 
      !c.opponent_id && 
      (c.status === 'pending' || c.status === 'open') && // ✅ FIXED: Include both 'pending' and 'open' status
      c.challenger_id !== user?.id && // Exclude user's own challenges
      !isExpiredChallenge(c) // Exclude expired challenges
    );
    
    console.log('🎯 [communityKeo] Filtered challenges:', {
      total: challenges.length,
      filtered: filtered.length,
      userId: user?.id,
      noOpponent: challenges.filter(c => !c.opponent_id).length,
      pending: challenges.filter(c => c.status === 'pending').length,
      open: challenges.filter(c => c.status === 'open').length, // ✅ Added open status check
      notMyChallenge: challenges.filter(c => c.challenger_id !== user?.id).length,
      notExpired: challenges.filter(c => !isExpiredChallenge(c)).length,
      finalFiltered: filtered.map(c => ({ id: c.id, challenger_id: c.challenger_id, status: c.status }))
    });
    
    return filtered;
  }, [challenges, user?.id]);

  const communityLive = useMemo(() => 
    challenges.filter(c => 
      (c.status === 'accepted' || c.status === 'ongoing') && 
      c.opponent_id && 
      c.scheduled_time && 
      new Date(c.scheduled_time) <= new Date() &&
      !isExpiredChallenge(c) // Exclude expired challenges
    ), 
    [challenges]
  );

  const communitySapToi = useMemo(() => 
    challenges.filter(c => 
      c.status === 'accepted' && 
      c.opponent_id && 
      (!c.scheduled_time || new Date(c.scheduled_time) > new Date()) &&
      !isExpiredChallenge(c) // Exclude expired challenges
    ), 
    [challenges]
  );

  const communityXong = useMemo(() => 
    challenges.filter(c => c.status === 'completed'), 
    [challenges]
  );

  // My challenges - Only user's challenges WITH EXPIRY FILTERING
  const myDoiDoiThu = useMemo(() => {
    const filtered = challenges.filter(c => 
      c.challenger_id === user?.id && 
      !c.opponent_id && 
      (c.status === 'pending' || c.status === 'open') && // ✅ Added 'open' status support
      !isExpiredChallenge(c) // ✅ ENHANCED: Exclude expired challenges
    );
    
    console.log('🔍 [useEnhancedChallengesV3] myDoiDoiThu filtering:', {
      total: challenges.length,
      userId: user?.id,
      userChallenges: challenges.filter(c => c.challenger_id === user?.id).length,
      noOpponent: challenges.filter(c => c.challenger_id === user?.id && !c.opponent_id).length,
      pendingStatus: challenges.filter(c => c.challenger_id === user?.id && !c.opponent_id && c.status === 'pending').length,
      openStatus: challenges.filter(c => c.challenger_id === user?.id && !c.opponent_id && c.status === 'open').length,
      notExpired: challenges.filter(c => c.challenger_id === user?.id && !c.opponent_id && (c.status === 'pending' || c.status === 'open') && !isExpiredChallenge(c)).length,
      filtered: filtered.length,
      filteredDetails: filtered.map(c => ({ id: c.id, status: c.status, opponent_id: c.opponent_id, expired: isExpiredChallenge(c) }))
    });
    
    return filtered;
  }, [challenges, user?.id]);

  const mySapToi = useMemo(() => {
    const filtered = challenges.filter(c => 
      (c.challenger_id === user?.id || c.opponent_id === user?.id) && 
      (c.status === 'accepted' || c.status === 'ongoing') && // ✅ Added 'ongoing' status
      c.opponent_id &&
      !isExpiredChallenge(c) // ✅ ENHANCED: Exclude expired challenges
    );
    
    console.log('🔍 [useEnhancedChallengesV3] mySapToi filtering:', {
      total: challenges.length,
      userId: user?.id,
      involvingUser: challenges.filter(c => c.challenger_id === user?.id || c.opponent_id === user?.id).length,
      withOpponent: challenges.filter(c => (c.challenger_id === user?.id || c.opponent_id === user?.id) && c.opponent_id).length,
      acceptedStatus: challenges.filter(c => (c.challenger_id === user?.id || c.opponent_id === user?.id) && c.status === 'accepted' && c.opponent_id).length,
      ongoingStatus: challenges.filter(c => (c.challenger_id === user?.id || c.opponent_id === user?.id) && c.status === 'ongoing' && c.opponent_id).length,
      notExpired: challenges.filter(c => (c.challenger_id === user?.id || c.opponent_id === user?.id) && (c.status === 'accepted' || c.status === 'ongoing') && c.opponent_id && !isExpiredChallenge(c)).length,
      filtered: filtered.length,
      filteredDetails: filtered.map(c => ({ id: c.id, status: c.status, opponent_id: c.opponent_id, expired: isExpiredChallenge(c) }))
    });
    
    return filtered;
  }, [challenges, user?.id]);

  const myHoanThanh = useMemo(() => {
    const filtered = challenges.filter(c => 
      (c.challenger_id === user?.id || c.opponent_id === user?.id) && 
      c.status === 'completed'
    );
    
    console.log('🔍 [useEnhancedChallengesV3] myHoanThanh filtering:', {
      total: challenges.length,
      userId: user?.id,
      involvingUser: challenges.filter(c => c.challenger_id === user?.id || c.opponent_id === user?.id).length,
      completedStatus: challenges.filter(c => (c.challenger_id === user?.id || c.opponent_id === user?.id) && c.status === 'completed').length,
      filtered: filtered.length,
      filteredDetails: filtered.map(c => ({ id: c.id, status: c.status, opponent_id: c.opponent_id }))
    });
    
    return filtered;
  }, [challenges, user?.id]);

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

    // ✅ SIMPLIFIED FIX: Skip frontend validation, let server handle it
    // This prevents "currentUserProfile null" issues
    console.log('⚠️ Skipping frontend SPA validation - let server handle it');

    // Frontend validation - check SPA before API call
    // DISABLED: if (requiredSpa > 0 && userSpa < requiredSpa) {
    //   // If we don't have profile data, don't show fake numbers
    //   if (!currentUserProfile) {
    //     throw new Error(`Không đủ SPA để tham gia (cần ${requiredSpa} SPA)`);
    //   }
    //   throw new Error(`Không đủ SPA để tham gia (cần ${requiredSpa}, có ${userSpa})`);
    // }

    try {
      console.log('🎯 Calling accept_open_challenge with:', {
        challengeId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // First, let's check the challenge status before calling the function
      const { data: challengeCheck } = await supabase
        .from('challenges')
        .select('id, status, opponent_id, challenger_id, expires_at, bet_points')
        .eq('id', challengeId)
        .single();
      
      console.log('🔍 Pre-validation challenge data:', challengeCheck);

      const { data: result, error } = await supabase.rpc('accept_open_challenge', {
        p_challenge_id: challengeId,
        p_user_id: user.id,
      });

      console.log('🎯 accept_open_challenge result:', { result, error });

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
          
          // ✅ Show actual server response for debugging
          console.log('🚨 Server SPA Error:', {
            response,
            requiredSpa,
            userSpa,
            currentUserProfile,
            profileSpa: currentUserProfile?.spa_points
          });
          
          throw new Error(`Không đủ SPA để tham gia (cần ${requiredSpa}, có ${userSpa})`);
        }
        
        throw new Error(response?.error || 'Không thể tham gia thách đấu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tham gia thách đấu';
      throw new Error(errorMessage);
    }
  };

  // Real-time subscription - THROTTLED to prevent infinite loop
  useEffect(() => {
    if (!user) return;

    fetchChallenges();

    let refreshTimer: NodeJS.Timeout | null = null;
    
    const throttledRefresh = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      refreshTimer = setTimeout(() => {
        fetchChallenges();
        refreshTimer = null;
      }, 2000); // Wait 2 seconds before refreshing
    };

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
          console.log('🔄 Real-time challenge update (throttled):', payload);
          throttledRefresh();
        }
      )
      .subscribe();

    return () => {
      challengesSubscription.unsubscribe();
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [user]); // Remove challenges dependency

  // Auto-expire challenges - ENHANCED with more frequent checks
  useEffect(() => {
    if (!user || challenges.length === 0) return;

    // Check if there are any challenges that might need expiring
    const hasExpiringChallenges = challenges.some(c => 
      !['expired', 'completed', 'cancelled'].includes(c.status) && 
      (
        (c.status === 'pending' && !c.opponent_id) ||
        (c.status === 'open' && !c.opponent_id && c.scheduled_time) ||
        (c.status === 'accepted' && c.scheduled_time && c.opponent_id)
      )
    );
    
    if (!hasExpiringChallenges) return; // Skip if no challenges need checking

    // Run initial check after 3 seconds
    const initialCheck = setTimeout(() => {
      autoExpireChallenges();
    }, 3000);

    // Run periodic checks every 2 minutes for more responsive cleanup
    const interval = setInterval(() => {
      autoExpireChallenges();
    }, 2 * 60 * 1000); // 2 minutes for faster response

    console.log('🔄 [useEnhancedChallengesV3] Started auto-expire monitoring', {
      challengesCount: challenges.length,
      hasExpiringChallenges,
      checkInterval: '2 minutes'
    });

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [user, challenges.length, challenges.map(c => c.status).join('-')]); // React to status changes

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
