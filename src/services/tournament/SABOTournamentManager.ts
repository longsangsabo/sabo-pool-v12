import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface MatchData {
  match_id: string;
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
  submitted_by: string;
}

interface AdvancementResult {
  success: boolean;
  winner_id?: string;
  advancement?: {
    success: boolean;
    round_completed?: number;
    semifinal_paired?: boolean;
    grand_final_ready?: boolean;
  };
  error?: string;
}

/**
 * SABO Tournament Engine v2.0
 * Quản lý tournament SABO với 10 functions chính thức
 */
export class SABOTournamentEngine {
  
  /**
   * Submit điểm và xử lý advancement tự động
   * @param {string} tournamentId - Tournament ID
   * @param {MatchData} matchData - Dữ liệu match đã hoàn thành
   * @returns {Promise<AdvancementResult>} - Kết quả advancement
   */
  static async submitScoreAndProcessAdvancement(
    tournamentId: string, 
    matchData: MatchData
  ): Promise<AdvancementResult> {
    try {
      console.log('🎯 SABOTournamentEngine: Starting score submission', {
        tournamentId,
        matchId: matchData.match_id,
        winnerId: matchData.winner_id,
        loserId: matchData.loser_id
      });

      // Lấy thông tin match để xác định players
      const { data: matchInfo, error: matchError } = await supabase
        .from('sabo_tournament_matches')
        .select('player1_id, player2_id')
        .eq('id', matchData.match_id)
        .single();

      if (matchError) {
        if (matchError.code === 'PGRST116') {
          throw new Error(`Match not found: No match with ID ${matchData.match_id}`);
        }
        throw new Error(`Cannot get match info: ${matchError.message}`);
      }

      if (!matchInfo) {
        throw new Error(`Match data is null for ID ${matchData.match_id}`);
      }

      // Map player scores theo đúng vị trí
      const player1_score = matchInfo.player1_id === matchData.winner_id 
        ? matchData.winner_score 
        : matchData.loser_score;
      
      const player2_score = matchInfo.player2_id === matchData.winner_id 
        ? matchData.winner_score 
        : matchData.loser_score;

      console.log('🎯 Player score mapping:', {
        player1_id: matchInfo.player1_id,
        player1_score,
        player2_id: matchInfo.player2_id,
        player2_score,
        winner_id: matchData.winner_id
      });

      // Submit score với format parameters đúng
      const { data, error } = await supabase.rpc('submit_sabo_match_score', {
        p_match_id: matchData.match_id,
        p_player1_score: player1_score,
        p_player2_score: player2_score,
        p_submitted_by: matchData.submitted_by
      });

      if (error) {
        throw new Error(`Score submission failed: ${error.message}`);
      }

      console.log('✅ Score submitted successfully:', data);

      // Xử lý advancement tự động
      const advancementResult = await this.processAutomaticAdvancement(
        tournamentId, 
        matchData.match_id,
        data.winner_id
      );

      return {
        success: true,
        winner_id: data.winner_id,
        advancement: advancementResult
      };

    } catch (error) {
      console.error('❌ SABOTournamentEngine error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Xử lý advancement tự động sau khi submit score
   * @param {string} tournamentId - Tournament ID
   * @param {string} completedMatchId - ID của match vừa hoàn thành
   * @param {string} winnerId - ID của winner
   * @returns {Promise<Object>} - Kết quả advancement
   */
  static async processAutomaticAdvancement(
    tournamentId: string, 
    completedMatchId: string,
    winnerId: string
  ): Promise<any> {
    try {
      console.log('🚀 Processing automatic advancement...', {
        tournamentId,
        completedMatchId,
        winnerId
      });

      // Lấy thông tin match để xác định round
      const { data: matchData, error: matchError } = await supabase
        .from('sabo_tournament_matches')
        .select('round_number, match_number, bracket_type')
        .eq('id', completedMatchId)
        .single();

      if (matchError || !matchData) {
        throw new Error(`Cannot get match data: ${matchError?.message}`);
      }

      const { round_number, match_number, bracket_type } = matchData;
      
      console.log('🎯 Match details:', {
        round_number,
        match_number,
        bracket_type
      });

      // Xử lý theo từng round cụ thể với 10 functions
      switch (true) {
        // Winners Bracket
        case (bracket_type === 'winners' && round_number === 2):
          return await this.callSaboFunction('process_winners_round2_completion', tournamentId);
          
        case (bracket_type === 'winners' && round_number === 3):
          return await this.callSaboFunction('process_winners_round3_completion', tournamentId);

        // Losers Bracket - Round 101-202
        case (bracket_type === 'losers' && round_number === 101):
          return await this.callSaboFunction('process_losers_r101_completion', tournamentId);
          
        case (bracket_type === 'losers' && round_number === 102):
          return await this.callSaboFunction('process_losers_r102_completion', tournamentId);
          
        case (bracket_type === 'losers' && round_number === 201):
          return await this.callSaboFunction('process_losers_r201_completion', tournamentId);
          
        case (bracket_type === 'losers' && round_number === 202):
          return await this.callSaboFunction('process_losers_r202_completion', tournamentId);

        // Semifinals
        case (round_number === 250): // Semifinals
          const semifinalResult = await this.callSaboFunction('process_semifinals_completion', tournamentId);
          
          // Nếu cả 2 semifinals đã xong, setup Grand Final pairings
          if (semifinalResult.success && semifinalResult.both_semifinals_complete) {
            const grandFinalSetup = await this.callSaboFunction('setup_semifinals_pairings', tournamentId);
            return {
              ...semifinalResult,
              grand_final_setup: grandFinalSetup
            };
          }
          return semifinalResult;

        // Grand Final
        case (round_number === 300): // Grand Final
          return await this.callSaboFunction('process_grand_final_completion', tournamentId);

        default:
          console.log('⚠️ No specific advancement function for this round', {
            bracket_type,
            round_number
          });
          return {
            success: true,
            message: 'Match completed, no automatic advancement needed'
          };
      }

    } catch (error) {
      console.error('❌ Advancement processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Helper function để gọi các SABO functions
   * @param {string} functionName - Tên function
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Object>} - Kết quả từ function
   */
  private static async callSaboFunction(
    functionName: string, 
    tournamentId: string
  ): Promise<any> {
    try {
      console.log(`🎯 Calling ${functionName} for tournament ${tournamentId}`);
      
      const { data, error } = await supabase.rpc(functionName, {
        tournament_id: tournamentId
      });

      if (error) {
        throw new Error(`${functionName} failed: ${error.message}`);
      }

      console.log(`✅ ${functionName} completed:`, data);
      return data;

    } catch (error) {
      console.error(`❌ ${functionName} error:`, error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái tournament bracket
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Object>} - Bracket data
   */
  static async getTournamentBracket(tournamentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sabo_tournament_matches')
        .select(`
          *,
          player1:profiles!sabo_tournament_matches_player1_id_fkey(id, username, full_name),
          player2:profiles!sabo_tournament_matches_player2_id_fkey(id, username, full_name)
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number')
        .order('match_number');

      if (error) {
        throw new Error(`Cannot get bracket data: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('❌ Get bracket error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách matches có thể chơi
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Array>} - Playable matches
   */
  static async getPlayableMatches(tournamentId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sabo_tournament_matches')
        .select(`
          *,
          player1:profiles!sabo_tournament_matches_player1_id_fkey(id, username, full_name),
          player2:profiles!sabo_tournament_matches_player2_id_fkey(id, username, full_name)
        `)
        .eq('tournament_id', tournamentId)
        .eq('status', 'ready')
        .not('player1_id', 'is', null)
        .not('player2_id', 'is', null)
        .order('round_number')
        .order('match_number');

      if (error) {
        throw new Error(`Cannot get playable matches: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('❌ Get playable matches error:', error);
      return [];
    }
  }
}
