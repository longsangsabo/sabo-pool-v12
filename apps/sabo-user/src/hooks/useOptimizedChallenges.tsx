import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getMatches } from "../services/matchService";
import { getTournament } from "../services/tournamentService";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Challenge, CreateChallengeData } from '@/types/challenge';

interface UseOptimizedChallengesReturn {
 challenges: Challenge[];
 receivedChallenges: Challenge[];
 sentChallenges: Challenge[];
 openChallenges: Challenge[];
 loading: boolean;
 error: string | undefined;
 fetchChallenges: (reset?: boolean) => Promise<void>;
 loadMoreChallenges: () => Promise<void>;
 hasMore: boolean;
 page: number;
 pageSize: number;
 createChallenge: (data: CreateChallengeData) => Promise<any>;
 acceptChallenge: (challengeId: string) => Promise<any>;
 declineChallenge: (challengeId: string) => Promise<any>;
 cancelChallenge: (challengeId: string) => Promise<void>;
 getPendingChallenges: () => Challenge[];
 getAcceptedChallenges: () => Challenge[];
 submitScore: (
  challengeId: string,
  challengerScore: number,
  opponentScore: number
 ) => Promise<any>;
 isSubmittingScore: boolean;
 getWinRate: (userId: string) => Promise<{
  winRate: number;
  wins: number;
  losses: number;
  total: number;
 } | null>;
 isWinRateLoading: (userId: string) => boolean;
 /** Optimistic local update helper */
 applyLocalPatch: (patch: Partial<Challenge> & { id: string }) => void;
}

// Cache for profiles to avoid re-fetching
const profileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useOptimizedChallenges = (): UseOptimizedChallengesReturn => {
 const [challenges, setChallenges] = useState<Challenge[]>([]);
 const [page, setPage] = useState(0);
 const pageSize = 30;
 const [hasMore, setHasMore] = useState(true);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const { user } = useAuth();
 const queryClient = useQueryClient();

 // Win rate cache
 const winRateCache = useMemo(
  () =>
   new Map<
    string,
    {
     wins: number;
     losses: number;
     total: number;
     winRate: number;
     timestamp: number;
    }
   >(),
  []
 );
 const winRateLoading = useRef(new Set<string>());

 // Helper: fetch & cache profiles for user ids (used in diff insert/update)
 const fetchProfilesForUserIds = useCallback(async (userIds: string[]) => {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (!unique.length) return {} as Record<string, any>;
  const now = Date.now();
  const results: Record<string, any> = {};
  const toFetch: string[] = [];
  unique.forEach(uid => {
   const cached = profileCache.get(uid);
   if (cached && now - cached.timestamp < CACHE_DURATION) {
    results[uid] = cached.data;
   } else {
    toFetch.push(uid);
   }
  });
  if (toFetch.length) {
//    const { data: profilesRes } = await supabase
    .from('profiles')
    .select(
     'user_id, full_name, display_name, verified_rank, elo, avatar_url'
    )
    .in('user_id', toFetch);
//    const { data: rankingsRes } = await supabase
    .from('player_rankings')
    .select('user_id, spa_points, elo_points')
    .in('user_id', toFetch);
   (profilesRes || []).forEach(p => {
    const ranking = (rankingsRes || []).find(r => r.user_id === p.user_id);
    const merged = {
     ...p,
     spa_points: ranking?.spa_points || 0,
     elo_points: ranking?.elo_points || 1000,
    };
    profileCache.set(p.user_id, { data: merged, timestamp: now });
    results[p.user_id] = merged;
   });
  }
  return results;
 }, []);

 // Differential apply for realtime changes
 const applyRealtimeDiff = useCallback(
  async (payload: any) => {
   setChallenges(prev => {
    const list = [...prev];
    const idx = list.findIndex(
     c => c.id === payload.new?.id || payload.old?.id
    );
    if (payload.eventType === 'INSERT' && payload.new) {
     if (idx === -1) {
      // Enrich later asynchronously
      list.unshift(payload.new as Challenge);
     }
    } else if (payload.eventType === 'UPDATE' && payload.new) {
     if (idx !== -1) {
      list[idx] = { ...list[idx], ...(payload.new as any) };
     } else {
      list.unshift(payload.new as Challenge);
     }
    } else if (payload.eventType === 'DELETE' && payload.old) {
     if (idx !== -1) list.splice(idx, 1);
    }
    return list.sort(
     (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
   });

   // Enrich profiles for inserted/updated rows if needed
   const target = payload.new || payload.old;
   if (target) {
    await fetchProfilesForUserIds(
     [target.challenger_id, target.opponent_id].filter(Boolean)
    );
    // Rebuild enriched objects for affected ids only
    setChallenges(prev =>
     prev.map(ch => {
      if (ch.id !== target.id) return ch;
      const enrich = (uid?: string | undefined) => {
       if (!uid) return null;
       const p = profileCache.get(uid)?.data;
       return p
        ? {
          user_id: uid,
          full_name: p.full_name || '',
          display_name: p.display_name,
          verified_rank: p.verified_rank,
          current_rank: p.verified_rank,
          spa_points: p.spa_points || 0,
          elo_points: p.elo_points || 1000,
          avatar_url: p.avatar_url,
          elo: p.elo || 1000,
         }
        : null;
      };
      return {
       ...ch,
       challenger_profile: enrich(ch.challenger_id),
       opponent_profile: enrich(ch.opponent_id),
      } as Challenge;
     })
    );
   }
  },
  [fetchProfilesForUserIds]
 );

 // Debounced fetch with pagination and smart caching
 const fetchChallenges = useCallback(
  async (reset: boolean = false) => {
   if (!user) {
    setLoading(false);
    return;
   }

   try {
    // Check cache freshness to prevent unnecessary fetches
    if (!reset) {
     const lastFetch = localStorage.getItem('lastChallengeFetch');
     const cacheAge = lastFetch
      ? Date.now() - parseInt(lastFetch)
      : Infinity;

     // Use cached data if fetch happened within last 30 seconds
     if (cacheAge < 30000 && challenges.length > 0) {
      console.log(
       '🚀 Using cached challenge data to prevent excessive fetching'
      );
      setLoading(false);
      return;
     }
    }

    setLoading(true);
    setError(null);
    const currentPage = reset ? 0 : page;
    if (reset) {
     setPage(0);
     setHasMore(true);
    }
    const from = currentPage * pageSize;
    const to = from + pageSize - 1;

    const {
     data: challengesData,
     error: fetchError,
     count,
//     } = await supabase
     .from('challenges')
     .select('*', { count: 'exact' })
     .order('created_at', { ascending: false })
     .range(from, to);

    if (fetchError) throw fetchError;

    // Update cache timestamp
    localStorage.setItem('lastChallengeFetch', Date.now().toString());

    // Collect unique user IDs
    const userIds = new Set<string>();
    challengesData?.forEach(challenge => {
     if (challenge.challenger_id) userIds.add(challenge.challenger_id);
     if (challenge.opponent_id) userIds.add(challenge.opponent_id);
    });

    // Use cached profiles if available and recent
    const now = Date.now();
    const cachedProfiles = new Map();
    const uncachedUserIds = new Set<string>();

    userIds.forEach(userId => {
     const cached = profileCache.get(userId);
     if (cached && now - cached.timestamp < CACHE_DURATION) {
      cachedProfiles.set(userId, cached.data);
     } else {
      uncachedUserIds.add(userId);
     }
    });

    // Fetch only uncached profiles
    let freshProfiles: any[] = [];
    if (uncachedUserIds.size > 0) {
     const [profilesRes, rankingsRes] = await Promise.all([
//       supabase
       .from('profiles')
       .select(
        'user_id, full_name, display_name, verified_rank, elo, avatar_url'
       )
       .in('user_id', Array.from(uncachedUserIds)),
//       supabase
       .from('player_rankings')
       .select('user_id, spa_points, elo_points')
       .in('user_id', Array.from(uncachedUserIds)),
     ]);

     if (profilesRes.data) {
      freshProfiles = profilesRes.data.map(profile => {
       const ranking = (rankingsRes.data || []).find(
        r => r.user_id === profile.user_id
       );
       return {
        ...profile,
        spa_points: ranking?.spa_points || 0,
        elo_points: ranking?.elo_points || 1000,
       };
      });
     }

     // Cache fresh profiles
     freshProfiles.forEach(profile => {
      profileCache.set(profile.user_id, {
       data: profile,
       timestamp: now,
      });
      cachedProfiles.set(profile.user_id, profile);
     });
    }

    // Enrich challenges with cached + fresh profile data
    const enrichedChallenges =
     challengesData?.map(challenge => ({
      ...challenge,
      // Convert string values to numbers where needed for type compatibility
      handicap_1_rank: challenge.handicap_1_rank
       ? parseFloat(challenge.handicap_1_rank)
       : undefined,
      handicap_05_rank: challenge.handicap_05_rank
       ? parseFloat(challenge.handicap_05_rank)
       : undefined,
      // Add properly typed profile data
      challenger_profile: cachedProfiles.get(challenge.challenger_id)
       ? {
         user_id: challenge.challenger_id,
         full_name:
          cachedProfiles.get(challenge.challenger_id)?.full_name ||
          '',
         display_name: cachedProfiles.get(challenge.challenger_id)
          ?.display_name,
         verified_rank: cachedProfiles.get(challenge.challenger_id)
          ?.verified_rank,
         current_rank: cachedProfiles.get(challenge.challenger_id)
          ?.verified_rank,
         spa_points:
          cachedProfiles.get(challenge.challenger_id)?.spa_points ||
          0,
         elo_points:
          cachedProfiles.get(challenge.challenger_id)?.elo_points ||
          1000,
         avatar_url: cachedProfiles.get(challenge.challenger_id)
          ?.avatar_url,
         elo: cachedProfiles.get(challenge.challenger_id)?.elo || 1000,
        }
       : null,
      opponent_profile: cachedProfiles.get(challenge.opponent_id)
       ? {
         user_id: challenge.opponent_id,
         full_name:
          cachedProfiles.get(challenge.opponent_id)?.full_name || '',
         display_name: cachedProfiles.get(challenge.opponent_id)
          ?.display_name,
         verified_rank: cachedProfiles.get(challenge.opponent_id)
          ?.verified_rank,
         current_rank: cachedProfiles.get(challenge.opponent_id)
          ?.verified_rank,
         spa_points:
          cachedProfiles.get(challenge.opponent_id)?.spa_points || 0,
         elo_points:
          cachedProfiles.get(challenge.opponent_id)?.elo_points ||
          1000,
         avatar_url: cachedProfiles.get(challenge.opponent_id)
          ?.avatar_url,
         elo: cachedProfiles.get(challenge.opponent_id)?.elo || 1000,
        }
       : null,
     })) || [];

    setChallenges(prev => {
     if (reset || currentPage === 0)
      return enrichedChallenges as Challenge[];
     // merge unique
     const existingIds = new Set(prev.map(c => c.id));
     const merged = [...prev];
     enrichedChallenges.forEach(c => {
      if (!existingIds.has(c.id)) merged.push(c as Challenge);
     });
     return merged.sort(
      (a, b) =>
       new Date(b.created_at).getTime() -
       new Date(a.created_at).getTime()
     );
    });
    // hasMore determination
    if (count !== null && count !== undefined) {
     const loaded = (currentPage + 1) * pageSize;
     setHasMore(loaded < count);
    } else if (challengesData && challengesData.length < pageSize) {
     setHasMore(false);
    }
    if (!reset) setPage(p => (p === currentPage ? p : currentPage));
   } catch (err) {
    const errorMessage =
     err instanceof Error ? err.message : 'Unknown error occurred';
    setError(errorMessage);
    console.error('❌ Challenge fetch error:', err);
   } finally {
    setLoading(false);
   }
  },
  [user, page, pageSize]
 );

 const loadMoreChallenges = useCallback(async () => {
  if (loading || !hasMore) return;
  setPage(p => p + 1);
  await fetchChallenges(false);
 }, [loading, hasMore, fetchChallenges]);

 // Win rate retrieval
 const getWinRate = useCallback(
  async (userId: string) => {
   if (!userId) return null;
   const cached = winRateCache.get(userId);
   const now = Date.now();
   if (cached && now - cached.timestamp < 5 * 60_000) {
    return {
     winRate: cached.winRate,
     wins: cached.wins,
     losses: cached.losses,
     total: cached.total,
    };
   }
   if (winRateLoading.current.has(userId)) return null;
   winRateLoading.current.add(userId);
   try {
    // TODO: Replace with service call - const { data, error } = await supabase
     .from('matches')
     .select('player1_id, player2_id, winner_id, status')
     .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
     .eq('status', 'completed')
     .limit(100);
    if (error) throw error;
    const wins = (data || []).filter(m => m.winner_id === userId).length;
    const total = data?.length || 0;
    const losses = total - wins;
    const winRate = total ? wins / total : 0;
    winRateCache.set(userId, {
     wins,
     losses,
     total,
     winRate,
     timestamp: now,
    });
    return { winRate, wins, losses, total };
   } catch (e) {
    console.warn('Win rate fetch failed', e);
    return null;
   } finally {
    winRateLoading.current.delete(userId);
   }
  },
  [winRateCache]
 );

 const isWinRateLoading = useCallback(
  (userId: string) => winRateLoading.current.has(userId),
  []
 );

 // Optimistic local patch
 const applyLocalPatch = useCallback(
  (patch: Partial<Challenge> & { id: string }) => {
   setChallenges(prev =>
    prev.map(c =>
     c.id === patch.id ? ({ ...c, ...patch } as Challenge) : c
    )
   );
  },
  []
 );

 // Memoized derived data
 const { receivedChallenges, sentChallenges, openChallenges } = useMemo(() => {
  if (!user)
   return { receivedChallenges: [], sentChallenges: [], openChallenges: [] };

  return {
   receivedChallenges: challenges.filter(c => c.opponent_id === user.id),
   sentChallenges: challenges.filter(c => c.challenger_id === user.id),
   openChallenges: challenges.filter(
    c =>
     !c.opponent_id &&
     c.status === 'pending' &&
     c.challenger_id !== user.id
   ),
  };
 }, [challenges, user]);

 const createChallenge = useCallback(
  async (challengeData: CreateChallengeData) => {
   if (!user) throw new Error('User not authenticated');

   try {
    // Check daily limit efficiently
    const today = new Date().toISOString().split('T')[0];
//     const { count } = await supabase
     .from('challenges')
     .select('*', { count: 'exact', head: true })
     .eq('challenger_id', user.id)
     .gte('created_at', `${today}T00:00:00`)
     .lt('created_at', `${today}T23:59:59`);

    if (count && count >= 2) {
     throw new Error(
      'Daily challenge limit reached (2 challenges per day)'
     );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const newChallenge = {
     challenger_id: user.id,
     opponent_id: challengeData.opponent_id,
     bet_points: challengeData.bet_points,
     race_to: challengeData.race_to || 5,
     handicap_1_rank: challengeData.handicap_1_rank?.toString() || null,
     handicap_05_rank: challengeData.handicap_05_rank?.toString() || null,
     message: challengeData.message,
     scheduled_time: challengeData.scheduled_time,
     status: 'pending' as const,
     expires_at: expiresAt.toISOString(),
    };

    // TODO: Replace with service call - const { data, error } = await supabase
     .from('challenges')
     .create([newChallenge])
     .select('*')
     .single();

    if (error) throw error;

    toast.success('Challenge created successfully!');
    await fetchChallenges(); // Refresh to update state

    return data;
   } catch (err) {
    const errorMessage =
     err instanceof Error ? err.message : 'Failed to create challenge';
    toast.error(errorMessage);
    throw new Error(errorMessage);
   }
  },
  [user, fetchChallenges]
 );

 const acceptChallenge = useCallback(
  async (challengeId: string) => {
   if (!user) throw new Error('User not authenticated');

   try {
//     const { data: challengeData, error: fetchError } = await supabase
     .from('challenges')
     .select('*')
     .eq('id', challengeId)
     .eq('status', 'pending')
     .maybeSingle();

    if (fetchError) throw fetchError;
    if (!challengeData)
     throw new Error('Challenge not found or already processed');

    const isOpenChallenge = !challengeData.opponent_id;
    const isSpecificChallenge = challengeData.opponent_id === user.id;
    const isMyOwnChallenge = challengeData.challenger_id === user.id;

    if (isMyOwnChallenge)
     throw new Error('Cannot accept your own challenge');
    if (!isOpenChallenge && !isSpecificChallenge)
     throw new Error('Not authorized to accept this challenge');

    const updateData = isOpenChallenge
     ? {
       status: 'accepted' as const,
       opponent_id: user.id,
       responded_at: new Date().toISOString(),
      }
     : {
       status: 'accepted' as const,
       responded_at: new Date().toISOString(),
      };

    // TODO: Replace with service call - const { data, error } = await supabase
     .from('challenges')
     .update(updateData)
     .eq('id', challengeId)
     .eq('status', 'pending')
     .select('*')
     .maybeSingle();

    if (error) throw error;
    if (!data)
     throw new Error('Challenge was already accepted by someone else');

    // ✅ CRITICAL: Create match record automatically when challenge is accepted
    console.log('🏆 Creating match record for accepted challenge...');

    const finalOpponentId = isOpenChallenge
     ? user.id
     : challengeData.opponent_id;
    const matchData = {
     player1_id: challengeData.challenger_id,
     player2_id: finalOpponentId,
     challenge_id: challengeId,
     status: 'scheduled' as const,
     match_type: 'challenge' as const,
     scheduled_time: new Date().toISOString(),
     score_player1: 0,
     score_player2: 0,
    };

//     const { data: matchRecord, error: matchError } = await supabase
     .from('matches')
     .create([matchData])
     .select('*')
     .maybeSingle();

    if (matchError) {
     console.error('❌ Error creating match record:', matchError);
     console.warn(
      '⚠️ Challenge accepted but match record creation failed'
     );
    } else {
     console.log('✅ Match record created successfully:', matchRecord);
    }

    // ✅ Send notification to challenger when someone joins their open challenge
    if (isOpenChallenge) {
     try {
      console.log('📬 Sending notification to challenger...');

      // Get participant profile for notification metadata
//       const { data: participantProfile } = await supabase
       .from('profiles')
       .select(
        'full_name, display_name, avatar_url, verified_rank, current_rank'
       )
       .getByUserId(user.id)
       .single();

      const { error: notificationError } =
// // //        // TODO: Replace with service call - await supabase.functions.invoke('send-notification', {
        body: {
         user_id: challengeData.challenger_id,
         type: 'challenge_accepted',
         title: '🎯 Có người tham gia thách đấu!',
         message: `${participantProfile?.display_name || participantProfile?.full_name || 'Một đối thủ'} vừa tham gia thách đấu mở của bạn. Trận đấu đã được tạo và sẵn sàng diễn ra!`,
         priority: 'high',
         metadata: {
          challenge_id: challengeId,
          participant_name:
           participantProfile?.display_name ||
           participantProfile?.full_name ||
           'Đối thủ ẩn danh',
          participant_avatar: participantProfile?.avatar_url,
          participant_rank:
           participantProfile?.verified_rank ||
           participantProfile?.current_rank,
          bet_points: challengeData.bet_points,
          race_to: challengeData.race_to,
          message: challengeData.message,
          location:
           challengeData.challenge_message || challengeData.message,
         },
        },
       });

      if (notificationError) {
       console.error(
        '❌ Error sending notification:',
        notificationError
       );
      } else {
       console.log('✅ Notification sent successfully to challenger');
      }
     } catch (notificationErr) {
      console.error('❌ Failed to send notification:', notificationErr);
     }
    }

    await fetchChallenges(); // Refresh to update state
    return { challenge: data, match: matchRecord };
   } catch (err) {
    const errorMessage =
     err instanceof Error ? err.message : 'Failed to accept challenge';
    throw new Error(errorMessage);
   }
  },
  [user, fetchChallenges]
 );

 const declineChallenge = useCallback(
  async (challengeId: string) => {
   if (!user) throw new Error('User not authenticated');

   try {
    // TODO: Replace with service call - const { data, error } = await supabase
     .from('challenges')
     .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
     })
     .eq('id', challengeId)
     .eq('opponent_id', user.id)
     .eq('status', 'pending')
     .getAll()
     .single();

    if (error) throw error;
    if (!data) throw new Error('Challenge not found or already processed');

    await fetchChallenges(); // Refresh to update state
    toast.success('Challenge declined');
    return data;
   } catch (err) {
    const errorMessage =
     err instanceof Error ? err.message : 'Failed to decline challenge';
    toast.error(errorMessage);
    throw new Error(errorMessage);
   }
  },
  [user, fetchChallenges]
 );

 const cancelChallenge = useCallback(
  async (challengeId: string) => {
   try {
    // TODO: Replace with service call - const { error } = await supabase
     .from('challenges')
     .delete()
     .eq('id', challengeId);

    if (error) throw error;
    await fetchChallenges();
    toast.success('Challenge cancelled');
   } catch (err) {
    toast.error('Error cancelling challenge');
    throw err;
   }
  },
  [fetchChallenges]
 );

 const getPendingChallenges = useCallback(() => {
  return challenges.filter(c => c.status === 'pending');
 }, [challenges]);

 const getAcceptedChallenges = useCallback(() => {
  return challenges.filter(c => c.status === 'accepted');
 }, [challenges]);

 // Submit score for challenge
 const submitScoreMutation = useMutation({
  mutationFn: async ({
   challengeId,
   challengerScore,
   opponentScore,
  }: {
   challengeId: string;
   challengerScore: number;
   opponentScore: number;
  }) => {
   if (!user) throw new Error('User not authenticated');

   console.log('🎯 Submitting score for challenge:', challengeId, {
    challengerScore,
    opponentScore,
   });

   // Get challenge details
   const challenge = challenges.find(c => c.id === challengeId);
   if (!challenge) throw new Error('Challenge not found');

   // Determine winner
   const winnerId =
    challengerScore > opponentScore
     ? challenge.challenger_id
     : challenge.opponent_id;

   // Update challenge with scores and status
//    const { data: challengeData, error: challengeError } = await supabase
    .from('challenges')
    .update({
     challenger_score: challengerScore,
     opponent_score: opponentScore,
     status: 'completed',
     completed_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
    .getAll()
    .maybeSingle();

   if (challengeError) throw challengeError;
   if (!challengeData) throw new Error('Challenge not found');

   // Create or update match record
//    const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .upsert(
     {
      challenge_id: challengeId,
      player1_id: challengeData.challenger_id,
      player2_id: challengeData.opponent_id,
      score_player1: challengerScore,
      score_player2: opponentScore,
      winner_id: winnerId,
      status: 'completed',
      played_at: new Date().toISOString(),
      match_type: 'challenge',
     },
     {
      onConflict: 'challenge_id',
     }
    )
    .getAll()
    .single();

   if (matchError) throw matchError;

   // Process SPA points and ELO
   try {
    const { data: spaResult, error: spaError } = await tournamentService.callRPC(
     'credit_spa_points',
     {
      p_user_id: winnerId,
      p_points: challengeData.bet_points || 100,
      p_description: `Challenge victory - ${challengerScore}:${opponentScore}`,
     }
    );

    if (spaError) {
     console.warn('Failed to credit SPA points:', spaError);
    }
   } catch (error) {
    console.warn('SPA points processing failed:', error);
   }

   // Send notification to opponent
   const opponentId =
    challengeData.challenger_id === user?.id
     ? challengeData.opponent_id
     : challengeData.challenger_id;

   if (opponentId) {
    try {
// // //      // TODO: Replace with service call - await supabase.functions.invoke('send-notification', {
      body: {
       user_id: opponentId,
       type: 'challenge_completed',
       title: '🏆 Trận đấu đã hoàn thành!',
       message: `Tỷ số trận đấu của bạn: ${challengerScore}-${opponentScore}. Kiểm tra kết quả chi tiết.`,
       metadata: {
        challenge_id: challengeId,
        final_score: `${challengerScore}-${opponentScore}`,
        winner_id: winnerId,
       },
      },
     });
    } catch (error) {
     console.warn('Failed to send notification:', error);
    }
   }

   return { challengeData, matchData };
  },
  onSuccess: () => {
   // Refresh challenges and invalidate related queries
   queryClient.invalidateQueries({ queryKey: ['challenges'] });
   queryClient.invalidateQueries({ queryKey: ['matches'] });
   queryClient.invalidateQueries({ queryKey: ['player-rankings'] });
   queryClient.invalidateQueries({ queryKey: ['wallets'] });
   fetchChallenges();
   toast.success('Đã ghi nhận tỷ số thành công!');
  },
  onError: error => {
   console.error('Error submitting score:', error);
   toast.error('Lỗi khi ghi nhận tỷ số');
  },
 });

 // Enhanced real-time subscription with smart debouncing
 useEffect(() => {
  if (!user) return;

  console.log(
   '🔄 Setting up optimized real-time subscription for user:',
   user.id
  );
  fetchChallenges(true);

  // Debounced refresh to prevent excessive calls
  let refreshTimeout: NodeJS.Timeout;
  const debouncedApplyDiff = (payload: any) => {
   if (refreshTimeout) clearTimeout(refreshTimeout);
   refreshTimeout = setTimeout(() => {
    console.log('🔄 Applying debounced diff:', payload?.eventType);
    applyRealtimeDiff(payload);
   }, 500); // 500ms debounce to group rapid changes
  };

//   const subscription = supabase
   .channel(`optimized_challenges_${user.id}`)
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'challenges',
     // Only listen to changes relevant to this user
     filter: `or(challenger_id.eq.${user.id},opponent_id.eq.${user.id},opponent_id.is.null)`,
    },
    (payload: any) => {
     const changedId =
      (payload?.new && (payload.new as any).id) ||
      (payload?.old && (payload.old as any).id);
     console.log(
      '🔄 Challenge event:',
      payload?.eventType,
      changedId?.slice(-8)
     );

     // Only process meaningful changes
     if (
      payload?.eventType === 'INSERT' ||
      payload?.eventType === 'UPDATE' ||
      payload?.eventType === 'DELETE'
     ) {
      debouncedApplyDiff(payload);
     }
    }
   )
   .subscribe();

  return () => {
   if (refreshTimeout) clearTimeout(refreshTimeout);
   // removeChannel(subscription);
  };
 }, [user?.id]); // Only depend on user.id to prevent unnecessary re-subscriptions

 const submitScore = useCallback(
  async (
   challengeId: string,
   challengerScore: number,
   opponentScore: number
  ) => {
   return submitScoreMutation.mutateAsync({
    challengeId,
    challengerScore,
    opponentScore,
   });
  },
  [submitScoreMutation]
 );

 return {
  challenges,
  receivedChallenges,
  sentChallenges,
  openChallenges,
  loading,
  error,
  fetchChallenges,
  loadMoreChallenges,
  hasMore,
  page,
  pageSize,
  createChallenge,
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  getPendingChallenges,
  getAcceptedChallenges,
  submitScore,
  isSubmittingScore: submitScoreMutation.isPending,
  getWinRate,
  isWinRateLoading,
  applyLocalPatch,
 };
};
