import { useState, useEffect } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
// Removed supabase import - migrated to services
import { TournamentResultWithPlayer } from '@/types/tournamentResults';

export const useTournamentResults = (tournamentId?: string) => {
  const [results, setResults] = useState<TournamentResultWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!tournamentId) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🏆 Fetching tournament results for:', tournamentId);

      // First, get tournament results
//       const { data: resultsData, error: resultsError } = await supabase
        .from('tournament_results')
        .select('*')
        .getByTournamentId(tournamentId)
        .order('final_position', { ascending: true });

      if (resultsError) {
        console.error('❌ Error fetching tournament results:', resultsError);
        throw resultsError;
      }

      if (!resultsData || resultsData.length === 0) {
        console.log('📭 No tournament results found');
        setResults([]);
        return;
      }

      console.log('🔍 Raw results data:', resultsData[0]); // Debug log

      // Get prize details for this tournament
//       const { data: prizeData, error: prizeError } = await supabase
        .from('tournament_prizes')
        .select('*')
        .getByTournamentId(tournamentId);

      if (prizeError) {
        console.warn('⚠️ Error fetching prize details:', prizeError);
      }

      // Create prize map for quick lookup
      const prizeMap = new Map();
      prizeData?.forEach(prize => {
        prizeMap.set(prize.prize_position, prize);
      });

      // Get all user IDs
      const userIds = resultsData.map(result => result.user_id);

      // Fetch profiles for these users
//       const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, avatar_url, verified_rank')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of user_id to profile
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      console.log('✅ Tournament results fetched:', resultsData.length);

      // Transform data to match TournamentResultWithPlayer interface
      const transformedResults: TournamentResultWithPlayer[] = resultsData.map(
        result => {
          const profile = profilesMap.get(result.user_id);
          const prizeInfo = prizeMap.get(result.final_position);
          
          return {
            user_id: result.user_id,
            full_name: profile?.full_name || 'Unknown Player',
            display_name:
              profile?.display_name ||
              profile?.full_name ||
              'Unknown Player',
            avatar_url: profile?.avatar_url || '',
            verified_rank: profile?.verified_rank || 'Unranked',
            final_position: result.final_position || 0,
            total_matches: result.matches_played || 0,
            wins: result.matches_won || 0,
            losses: result.matches_lost || 0,
            win_percentage: Number(result.win_percentage) || 0,
            spa_points_earned: result.spa_points_earned || 0,
            elo_points_awarded: result.elo_points_earned || 0,
            prize_amount: Number(result.prize_amount) || Number(prizeInfo?.cash_amount) || 0,
            physical_rewards: prizeInfo?.physical_items || [],
            placement_type: prizeInfo?.position_name || result.placement_type || '',
            id: result.id,
          };
        }
      );

      setResults(transformedResults);
    } catch (err: any) {
      console.error('❌ Error in fetchResults:', err);
      setError(err.message || 'Failed to fetch tournament results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [tournamentId]);

  // Set up real-time subscription for tournament results
  useEffect(() => {
    if (!tournamentId) return;

    console.log(
      '🔄 Setting up real-time subscription for tournament results:',
      tournamentId
    );

//     const channel = supabase
      .channel(`tournament-results-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_results',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        payload => {
          console.log('🔄 Tournament results real-time update:', payload);

          // Immediately refetch results to ensure accuracy
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up tournament results real-time subscription');
      // removeChannel(channel);
    };
  }, [tournamentId]);

  return {
    results,
    loading,
    error,
    refetch: fetchResults,
  };
};
