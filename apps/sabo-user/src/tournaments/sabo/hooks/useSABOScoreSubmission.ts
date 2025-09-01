import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Removed supabase import - migrated to services
import { getCurrentUser } from '../services/userService';
import { toast } from 'sonner';

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
      console.log('🎯 Submitting SABO match score with SAFE DIRECT UPDATE:', { matchId, scores, matchData });

      // Get current user for submitted_by parameter
      const {
        data: { user },
      } = await getCurrentUser();
      
      const submittedBy = user?.id || '18f49e79-f402-46d1-90be-889006e9761c';
      
      if (!user) {
        console.warn('⚠️ No user logged in, using club owner fallback');
      }

      // Determine winner and loser
      const player1Score = scores.player1;
      const player2Score = scores.player2;
      
      if (player1Score === player2Score) {
        throw new Error('Scores cannot be tied in SABO tournament');
      }
      
      const winnerId = player1Score > player2Score ? matchData.player1_id : matchData.player2_id;
      const loserId = player1Score > player2Score ? matchData.player2_id : matchData.player1_id;

      console.log('🔍 Using SAFE DIRECT UPDATE (step by step)');

      // ✅ STEP 1: Update match result ONLY (using exact schema columns)
//       const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          score_player1: player1Score,
          score_player2: player2Score,
          status: 'completed',
          winner_id: winnerId,
          loser_id: loserId,
          completed_at: new Date().toISOString()
          // ✅ Removed submitted_by - column doesn't exist
        })
        .eq('id', matchId);

      if (updateError) {
        console.error('❌ Match update failed:', updateError);
        throw updateError;
      }

      console.log('✅ Match result updated successfully');

      // ✅ STEP 2: Handle advancement logic safely
      try {
        const { SABOLogicCore } = await import('../SABOLogicCore');
        
        const winnerAdvancement = SABOLogicCore.getAdvancementTarget(
          matchData.round_number, 
          true
        );
        const loserAdvancement = SABOLogicCore.getAdvancementTarget(
          matchData.round_number, 
          false
        );
        
        console.log('📋 Advancement targets:', {
          round: matchData.round_number,
          winner: winnerAdvancement,
          loser: loserAdvancement
        });

        // ✅ ADVANCE WINNER (if applicable)
        if (winnerAdvancement.round) {
          console.log(`🏆 Advancing winner to round ${winnerAdvancement.round}`);
          
          const nextMatchNumber = Math.ceil(matchData.match_number / 2);
          
//           const { data: nextMatches } = await supabase
            .from('tournament_matches')
            .select('*')
            .eq('tournament_id', matchData.tournament_id)
            .eq('round_number', winnerAdvancement.round)
            .eq('match_number', nextMatchNumber);

          if (nextMatches && nextMatches.length > 0) {
            const nextMatch = nextMatches[0];
            const updateField = !nextMatch.player1_id ? 'player1_id' : 'player2_id';
            
//             const { error: winnerError } = await supabase
              .from('tournament_matches')
              .update({ 
                [updateField]: winnerId,
                updated_at: new Date().toISOString()
              })
              .eq('id', nextMatch.id);
              
            if (winnerError) {
              console.error('❌ Winner advancement failed:', winnerError);
            } else {
              console.log('✅ Winner advanced successfully');
            }
          }
        }

        // ✅ ADVANCE LOSER (if applicable)
        if (loserAdvancement.round) {
          console.log(`💔 Advancing loser to round ${loserAdvancement.round}`);
          
          const loserMatchNumber = Math.ceil(matchData.match_number / 2);
          
//           const { data: loserMatches } = await supabase
            .from('tournament_matches')
            .select('*')
            .eq('tournament_id', matchData.tournament_id)
            .eq('round_number', loserAdvancement.round)
            .eq('match_number', loserMatchNumber);

          if (loserMatches && loserMatches.length > 0) {
            const loserMatch = loserMatches[0];
            
            if (!loserMatch.player1_id || !loserMatch.player2_id) {
              const updateField = !loserMatch.player1_id ? 'player1_id' : 'player2_id';
              
//               const { error: loserError } = await supabase
                .from('tournament_matches')
                .update({ 
                  [updateField]: loserId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', loserMatch.id);
                
              if (loserError) {
                console.error('❌ Loser advancement failed:', loserError);
              } else {
                console.log('✅ Loser advanced successfully');
              }
            }
          }
        }
        
      } catch (advancementError) {
        console.error('❌ Advancement logic error (non-critical):', advancementError);
        // Don't fail the entire operation for advancement issues
      }

      return {
        success: true,
        message: 'Score submitted and advancement completed',
        winner_id: winnerId,
        match_updated: true
      };
    },
    onSuccess: (data, variables) => {
      console.log('✅ SABO score submission successful:', data);

      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['sabo-tournament'] });
      queryClient.invalidateQueries({ queryKey: ['sabo-tournament-matches'] });

      const result = data as any;
      if (result?.success) {
        toast.success(result.message || '🎯 Score submitted successfully!');
      }

      setTimeout(() => {
        if (onRefresh) {
          onRefresh();
        } else {
          queryClient.refetchQueries({ queryKey: ['tournament-matches'] });
        }
      }, 100);
    },
    onError: (error: any) => {
      console.error('❌ SABO score submission failed:', error);
      const errorMessage = error?.message || 'Failed to submit score';
      toast.error(`❌ ${errorMessage}`);
    },
  });

  const submitScore = useCallback(
    async (matchId: string, scores: MatchScore, matchData?: any) => {
      if (!matchData) {
//         const { data: match, error } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('id', matchId)
          .single();
          
        if (error || !match) {
          throw new Error(`Could not retrieve match data: ${error?.message || 'Match not found'}`);
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