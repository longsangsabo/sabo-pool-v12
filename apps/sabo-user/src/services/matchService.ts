import { userService } from '../services/userService';
import { profileService } from '../services/profileService';
import { tournamentService } from '../services/tournamentService';
import { clubService } from '../services/clubService';
import { rankingService } from '../services/rankingService';
import { statisticsService } from '../services/statisticsService';
import { dashboardService } from '../services/dashboardService';
import { notificationService } from '../services/notificationService';
import { challengeService } from '../services/challengeService';
import { verificationService } from '../services/verificationService';
import { matchService } from '../services/matchService';
import { walletService } from '../services/walletService';
import { storageService } from '../services/storageService';
import { settingsService } from '../services/settingsService';
import { milestoneService } from '../services/milestoneService';
// Removed supabase import - migrated to services

export const getMatches = async (tournamentId?: string, userId?: string) => {
  try {
//     let query = supabase
      .from('tournament_matches')
      .select(`
        *,
        player1:profiles!tournament_matches_player1_id_fkey(*),
        player2:profiles!tournament_matches_player2_id_fkey(*),
        tournament:tournaments(*)
      `)
      .order('created_at', { ascending: false });

    if (tournamentId) {
      query = query.getByTournamentId(tournamentId);
    }
    if (userId) {
      query = query.or(`player1_id.eq.${userId},player2_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateMatchScore = async (matchId: string, scoreData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_matches')
      .update(scoreData)
      .eq('id', matchId)
      .getAll()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const emergencyCompleteMatch = async (matchId: string, winnerId: string) => {
  try {
    const { data, error } = await tournamentService.callRPC('emergency_complete_match', {
      p_match_id: matchId,
      p_winner_id: winnerId
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
