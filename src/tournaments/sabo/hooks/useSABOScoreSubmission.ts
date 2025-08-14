import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SABOTournamentEngine } from '@/services/tournament/SABOTournamentManager';

interface MatchScore {
  player1: number;
  player2: number;
}

export const useSABOScoreSubmission = (
  tournamentId: string,
  onRefresh?: () => void
) => {
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async ({
      matchId,
      scores,
      matchData,
    }: {
      matchId: string;
      scores: MatchScore;
      matchData: any;
    }) => {
      console.log('🎯 Submitting SABO match score with new SABO Manager:', { matchId, scores, matchData });

      // Get current user for submitted_by parameter
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to submit scores');
      }

      // Determine winner and loser
      const player1Score = scores.player1;
      const player2Score = scores.player2;
      
      if (player1Score === player2Score) {
        throw new Error('Scores cannot be tied in SABO tournament');
      }
      
      const winnerId = player1Score > player2Score ? matchData.player1_id : matchData.player2_id;
      const loserId = player1Score > player2Score ? matchData.player2_id : matchData.player1_id;
      const winnerScore = Math.max(player1Score, player2Score);
      const loserScore = Math.min(player1Score, player2Score);

      console.log('🔍 Using SABO Manager to submit score and advance tournament');

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

      console.log('✅ SABO Manager completed successfully:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('✅ SABO score submission successful:', data);

      // ✅ AGGRESSIVE CACHE INVALIDATION - Force refresh all tournament data
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['sabo-tournament'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament'] }); // Additional key

      // ✅ FIXED: Handle JSONB response format correctly
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const result = data as any;
        if (result.success) {
          toast.success(result.message || '🎯 Score submitted successfully!');
        } else {
          toast.error(
            `❌ ${result.error || result.message || 'Failed to submit score'}`
          );
        }
      } else {
        toast.success('🎯 Score submitted successfully!');
      }

      // ✅ CRITICAL: Force immediate refresh with scroll preservation
      setTimeout(() => {
        // Use provided refresh callback if available (should preserve scroll)
        if (onRefresh) {
          console.log(
            '🔄 Calling provided refresh callback with scroll preservation'
          );
          onRefresh();
        } else {
          // Fallback: just invalidate queries without scroll preservation
          queryClient.refetchQueries({ queryKey: ['tournament-matches'] });
          queryClient.refetchQueries({ queryKey: ['sabo-tournament'] });
        }
      }, 50); // Faster response for immediate feedback

      // ✅ ADDITIONAL: Force window refresh as emergency fallback if needed
      // Uncomment the line below if UI still doesn't update
      // setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: any) => {
      console.error('❌ SABO score submission failed:', error);

      // Show specific error message if available
      const errorMessage = error?.message || 'Failed to submit score';
      toast.error(`❌ ${errorMessage}`);
    },
  });

  const submitScore = useCallback(
    async (matchId: string, scores: MatchScore, matchData?: any) => {
      if (!matchData) {
        // Get match data if not provided
        const { data: match, error } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('id', matchId)
          .single();
          
        if (error || !match) {
          throw new Error('Could not retrieve match data');
        }
        matchData = match;
      }
      
      return submitScoreMutation.mutateAsync({ matchId, scores, matchData });
    },
    [submitScoreMutation]
  );

  return {
    submitScore,
    isSubmitting: submitScoreMutation.isPending,
  };
};
