import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTournamentMatches } from './useTournamentMatches';
import { SABOLogicCore, type SABOMatch, type SABOOrganizedMatches } from '@/tournaments/sabo/SABOLogicCore';
import { SABOTournamentEngine } from '@/services/tournament/SABOTournamentManager';

interface SubmitScoreParams {
  matchId: string;
  player1Score: number;
  player2Score: number;
}

interface CreateBracketParams {
  tournamentId: string;
}

interface AutomationResult {
  tournamentStatus: string;
  progression: any;
  automationTriggered: boolean;
}

export const useSABOBracket = (tournamentId: string) => {
  const queryClient = useQueryClient();
  const { matches, loading, error, refetch } =
    useTournamentMatches(tournamentId);

  // Create double elimination bracket
  const createBracket = useMutation({
    mutationFn: async ({ tournamentId }: CreateBracketParams) => {
      console.log('🏗️ Creating double elimination bracket:', tournamentId);

      const { data, error } = await supabase.rpc(
        'repair_double_elimination_bracket',
        {
          p_tournament_id: tournamentId,
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Bracket created successfully:', data);

      // Invalidate tournament queries to refresh bracket
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-bracket'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });

      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        data.success
      ) {
        const successData = data as any;
        toast.success(
          `🏆 Bracket created with ${successData.total_matches} matches!`
        );
      } else {
        toast.success('Bracket created successfully!');
      }
    },
    onError: error => {
      console.error('❌ Bracket creation failed:', error);
      toast.error('Failed to create double elimination bracket');
    },
  });

  // Submit score with automatic advancement
  const submitScore = useMutation({
    mutationFn: async ({
      matchId,
      player1Score,
      player2Score,
    }: SubmitScoreParams) => {
      console.log('🎯 Submitting score with SABO Manager:', {
        matchId,
        player1Score,
        player2Score,
      });

      // Get current user for submitted_by parameter
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to submit scores');
      }

      // Get match data
      const { data: matchData, error: matchError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('id', matchId)
        .single();
        
      if (matchError || !matchData) {
        throw new Error('Could not retrieve match data');
      }

      // Determine winner and loser
      if (player1Score === player2Score) {
        throw new Error('Scores cannot be tied in SABO tournament');
      }
      
      const winnerId = player1Score > player2Score ? matchData.player1_id : matchData.player2_id;
      const loserId = player1Score > player2Score ? matchData.player2_id : matchData.player1_id;
      const winnerScore = Math.max(player1Score, player2Score);
      const loserScore = Math.min(player1Score, player2Score);

      // Use SABO Tournament Engine for score submission and advancement
      const result = await SABOTournamentEngine.submitScoreAndProcessAdvancement(tournamentId, {
        match_id: matchId,
        winner_id: winnerId,
        loser_id: loserId,
        winner_score: winnerScore,
        loser_score: loserScore,
        match_number: matchData.match_number,
        round_number: matchData.round_number,
        bracket_type: matchData.bracket_type,
        player1_id: matchData.player1_id,
        player2_id: matchData.player2_id
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit score');
      }

      return result;
    },
    onSuccess: (data, variables) => {
      console.log('✅ SABO Tournament Engine score submission successful:', data);

      // Invalidate queries to refresh bracket
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-bracket'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['sabo-tournament'] });

      if (data && data.success) {
        const message = data.scoreSubmitted 
          ? (data.tournamentAdvanced 
              ? '🏆 Score submitted and tournament advanced!'
              : '🎯 Score submitted successfully!')
          : 'Score processing completed';
        toast.success(message);
      } else {
        toast.success('Score submitted successfully!');
      }

      // Auto-refresh matches
      refetch();
    },
    onError: error => {
      console.error('❌ Score submission failed:', error);
      toast.error('Failed to submit score');
    },
  });

  // Manual advancement function
  const advanceWinner = useMutation({
    mutationFn: async ({ matchId }: { matchId: string }) => {
      console.log('🎯 Manually advancing winner for match:', matchId);

      const { data, error } = await supabase.rpc(
        'repair_double_elimination_bracket',
        {
          p_tournament_id: tournamentId,
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: data => {
      console.log('✅ Manual advancement successful:', data);

      // Invalidate queries to refresh bracket
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-bracket'] });

      toast.success('🏆 Players advanced manually!');
      refetch();
    },
    onError: error => {
      console.error('❌ Manual advancement failed:', error);
      toast.error('Failed to advance players');
    },
  });

  // Check progression and automation
  const checkProgression = async (): Promise<AutomationResult | null> => {
    try {
      // Since get_double_elimination_status was removed in cleanup,
      // we'll use the tournament matches directly to assess status
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .select('status')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;

      return {
        tournamentStatus: tournament?.status || 'unknown',
        progression: {},
        automationTriggered: false,
      };
    } catch (error) {
      console.error('❌ Failed to check progression:', error);
      return null;
    }
  };

  // Repair bracket function
  const repairBracket = async () => {
    try {
      toast.loading('Repairing bracket structure...');

      // Repair the bracket structure
      const { data, error } = await supabase.rpc(
        'repair_double_elimination_bracket',
        {
          p_tournament_id: tournamentId,
        }
      );

      if (error) throw error;

      toast.success('Bracket repaired successfully!');
      refetch();
      return data;
    } catch (error) {
      console.error('❌ Bracket repair failed:', error);
      toast.error('Failed to repair bracket');
      throw error;
    }
  };

  // Organize matches using SABO Logic Core (27 matches total)
  const organizedMatches: SABOOrganizedMatches = SABOLogicCore.organizeMatches(
    matches as SABOMatch[]
  );

  // Validate SABO structure
  const saboValidation = SABOLogicCore.validateSABOStructure(
    matches as SABOMatch[]
  );
  if (!saboValidation.valid) {
    console.warn('⚠️ SABO Structure Validation Errors:', saboValidation.errors);
  }

  // Calculate progress using SABO Logic Core
  const saboProgress = SABOLogicCore.getTournamentProgress(
    matches as SABOMatch[]
  );
  const { totalMatches, completedMatches, progressPercentage, currentStage } =
    saboProgress;

  return {
    // Data
    matches,
    organizedMatches,
    loading,
    error,
    totalMatches,
    completedMatches,
    progressPercentage,
    currentStage,
    saboValidation,

    // Actions
    createBracket: createBracket.mutate,
    isCreatingBracket: createBracket.isPending,

    submitScore: submitScore.mutate,
    isSubmittingScore: submitScore.isPending,

    advanceWinner: advanceWinner.mutate,
    isAdvancing: advanceWinner.isPending,

    // Utilities
    refetch,
    checkProgression,
    repairBracket,

    // Status
    isLoading:
      loading ||
      createBracket.isPending ||
      submitScore.isPending ||
      advanceWinner.isPending,
  };
};
