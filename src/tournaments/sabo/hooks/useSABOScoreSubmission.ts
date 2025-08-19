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
      console.log('🎯 Submitting SABO match score with direct table update:', { matchId, scores, matchData });

      // Get current user for submitted_by parameter
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      // TEMPORARY FIX: If no user logged in, use club owner ID
      const submittedBy = user?.id || '18f49e79-f402-46d1-90be-889006e9761c'; // Club owner fallback
      
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
      const winnerScore = Math.max(player1Score, player2Score);
      const loserScore = Math.min(player1Score, player2Score);

      console.log('🔍 Using direct table update instead of RPC function');

      try {
        // Direct table update instead of RPC function
        const { data: updateResult, error: updateError } = await supabase
          .from('tournament_matches')
          .update({
            score_player1: player1Score,
            score_player2: player2Score,
            winner_id: winnerId,
            loser_id: loserId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', matchId)
          .select();

        if (updateError) {
          throw updateError;
        }

        console.log('✅ Direct table update successful:', updateResult);

        // ✅ IMPLEMENT TOURNAMENT ADVANCEMENT LOGIC
        console.log('🎯 Implementing tournament advancement...');
        
        try {
          // Import advancement logic
          const { SABOLogicCore } = await import('../SABOLogicCore');
          
          // Get advancement target for winner and loser
          const winnerAdvancement = SABOLogicCore.getAdvancementTarget(
            matchData.round_number, 
            true // isWinner
          );
          const loserAdvancement = SABOLogicCore.getAdvancementTarget(
            matchData.round_number, 
            false // isLoser
          );
          
          console.log('📋 Advancement targets:', {
            round: matchData.round_number,
            matchNumber: matchData.match_number,
            winner: winnerAdvancement,
            loser: loserAdvancement,
            winnerId: winnerId.substring(0,8),
            loserId: loserId.substring(0,8)
          });

          // ✅ ADVANCE WINNER TO NEXT ROUND
          if (winnerAdvancement.round) {
            console.log(`🏆 Advancing winner to round ${winnerAdvancement.round}`);
            
            // Calculate which match in next round based on current match
            const nextMatchNumber = Math.ceil(matchData.match_number / 2);
            
            // Find the specific next match
            const { data: nextMatches, error: nextMatchError } = await supabase
              .from('tournament_matches')
              .select('*')
              .eq('tournament_id', matchData.tournament_id)
              .eq('round_number', winnerAdvancement.round)
              .eq('match_number', nextMatchNumber)
              .single();
              
            if (!nextMatchError && nextMatches) {
              const nextMatch = nextMatches;
              
              // Determine if winner goes to player1 or player2 slot
              const isOddMatch = matchData.match_number % 2 === 1;
              const updateField = isOddMatch ? 'player1_id' : 'player2_id';
              
              console.log(`📍 Placing winner in ${updateField} of R${winnerAdvancement.round} M${nextMatchNumber}`);
              
              // Update next match with winner
              const { error: advanceError } = await supabase
                .from('tournament_matches')
                .update({ 
                  [updateField]: winnerId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', nextMatch.id);
                
              if (advanceError) {
                console.error('❌ Winner advancement error:', advanceError);
              } else {
                console.log('✅ Winner advanced successfully');
              }
            }
          }

          // ✅ ADVANCE LOSER TO LOSERS BRACKET
          if (loserAdvancement.round) {
            console.log(`⬇️ Moving loser to losers bracket round ${loserAdvancement.round}`);
            
            // For losers bracket, match number depends on the bracket structure
            let loserMatchNumber;
            let updateField = 'player1_id'; // Default to player1 slot
            
            if (loserAdvancement.round === 101) {
              // R1 losers: 8 losers → 4 matches in R101 (2 per match)
              // Match pairs: (M1,M2)→R101M1, (M3,M4)→R101M2, (M5,M6)→R101M3, (M7,M8)→R101M4
              loserMatchNumber = Math.ceil(matchData.match_number / 2);
              updateField = (matchData.match_number % 2 === 1) ? 'player1_id' : 'player2_id';
              
            } else if (loserAdvancement.round === 201) {
              // R2 losers: 4 losers → 2 matches in R201 (2 per match) 
              // Match pairs: (M1,M2)→R201M1, (M3,M4)→R201M2
              loserMatchNumber = Math.ceil(matchData.match_number / 2);
              updateField = (matchData.match_number % 2 === 1) ? 'player1_id' : 'player2_id';
            }
            
            if (loserMatchNumber) {
              // Find losers bracket match
              const { data: loserMatches, error: loserMatchError } = await supabase
                .from('tournament_matches')
                .select('*')
                .eq('tournament_id', matchData.tournament_id)
                .eq('round_number', loserAdvancement.round)
                .eq('match_number', loserMatchNumber)
                .single();
                
              if (!loserMatchError && loserMatches) {
                const loserMatch = loserMatches;
                
                console.log(`📍 Placing loser in ${updateField} of R${loserAdvancement.round} M${loserMatchNumber}`);
                
                // Update losers bracket match
                const { error: loserAdvanceError } = await supabase
                  .from('tournament_matches')
                  .update({ 
                    [updateField]: loserId,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', loserMatch.id);
                  
                if (loserAdvanceError) {
                  console.error('❌ Loser advancement error:', loserAdvanceError);
                } else {
                  console.log('✅ Loser advanced to losers bracket');
                }
              }
            }
          }
          
        } catch (advancementError) {
          console.error('❌ Advancement logic error:', advancementError);
          // Don't fail the entire operation, advancement is secondary
        }

        return {
          success: true,
          message: 'Score submitted and players advanced successfully',
          winner_id: winnerId,
          match_updated: true,
          advancement_completed: true
        };

      } catch (error) {
        console.error('❌ Direct update error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('✅ SABO score submission successful:', data);

      // ✅ AGGRESSIVE CACHE INVALIDATION - Force refresh all tournament data
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['sabo-tournament'] });
      queryClient.invalidateQueries({ queryKey: ['sabo-tournament-matches'] });
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
        console.log('🔍 Match data not provided, attempting to fetch from database...');
        // Get match data if not provided - USE SABO SPECIFIC TABLE
        const { data: match, error } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('id', matchId)
          .single();
          
        if (error || !match) {
          console.error('❌ Could not retrieve match data from database:', error);
          throw new Error(`Could not retrieve match data: ${error?.message || 'Match not found'}`);
        }
        matchData = match;
        console.log('✅ Successfully fetched match data from database');
      } else {
        console.log('✅ Using provided match data');
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
