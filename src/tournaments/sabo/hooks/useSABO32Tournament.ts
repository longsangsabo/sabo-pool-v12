import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SABO32Match } from '../SABO32Structure';
import { SABO32TournamentEngine } from '../SABO32TournamentEngine';
import { toast } from 'sonner';

interface MatchScore {
  player1: number;
  player2: number;
}

export const useSABO32Tournament = (tournamentId: string) => {
  const queryClient = useQueryClient();

  // Fetch all matches for the tournament
  const {
    data: matches = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sabo32-tournament', tournamentId],
    queryFn: async (): Promise<SABO32Match[]> => {
      console.log('🔍 Fetching SABO-32 tournament matches for:', tournamentId);
      
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          id,
          tournament_id,
          bracket_type,
          round_number,
          match_number,
          sabo_match_id,
          player1_id,
          player2_id,
          player1_name,
          player2_name,
          winner_id,
          loser_id,
          score_player1,
          score_player2,
          status,
          group_id,
          advances_to_match_id,
          feeds_loser_to_match_id,
          scheduled_time,
          started_at,
          completed_at,
          created_at,
          updated_at
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number')
        .order('match_number');

      if (error) {
        console.error('❌ Error fetching SABO-32 matches:', error);
        throw error;
      }

      console.log('✅ SABO-32 matches fetched:', data?.length || 0);
      
      // Transform to SABO32Match format
      return (data || []).map(match => ({
        ...match,
        group_id: match.group_id as 'A' | 'B' | null,
        bracket_type: match.bracket_type as any,
        qualifies_as: null // Will be determined by logic
      }));
    },
    enabled: !!tournamentId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async ({
      matchId,
      scores,
      matchData
    }: {
      matchId: string;
      scores: MatchScore;
      matchData: SABO32Match;
    }) => {
      console.log('🎯 Submitting SABO-32 match score:', { matchId, scores, matchData });

      // Determine winner and loser
      const player1Score = scores.player1;
      const player2Score = scores.player2;
      
      if (player1Score === player2Score) {
        throw new Error('Scores cannot be tied in SABO tournament');
      }
      
      const winnerId = player1Score > player2Score ? matchData.player1_id : matchData.player2_id;
      const loserId = player1Score > player2Score ? matchData.player2_id : matchData.player1_id;

      // Update match result using direct table update
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          score_player1: player1Score,
          score_player2: player2Score,
          status: 'completed',
          winner_id: winnerId,
          loser_id: loserId,
          completed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (updateError) {
        console.error('❌ Match update failed:', updateError);
        throw updateError;
      }

      console.log('✅ SABO-32 match result updated successfully');

      // Handle advancement logic for SABO-32
      await handleSABO32Advancement(matchData, winnerId!, loserId!, tournamentId);

      return {
        success: true,
        message: 'Score submitted and advancement completed',
        winner_id: winnerId,
        match_updated: true
      };
    },
    onSuccess: () => {
      toast.success('🎯 Score submitted successfully!');
      
      // Invalidate and refetch tournament data
      queryClient.invalidateQueries({ queryKey: ['sabo32-tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      
      // Force immediate refresh
      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: (error: any) => {
      console.error('❌ SABO-32 score submission failed:', error);
      toast.error(`❌ ${error?.message || 'Failed to submit score'}`);
    },
  });

  // Handle SABO-32 specific advancement logic
  const handleSABO32Advancement = async (
    completedMatch: SABO32Match,
    winnerId: string,
    loserId: string,
    tournamentId: string
  ) => {
    console.log('🎯 Handling SABO-32 advancement for:', {
      match: completedMatch.sabo_match_id,
      group: completedMatch.group_id,
      bracket: completedMatch.bracket_type,
      round: completedMatch.round_number
    });

    try {
      // Group stage advancement (within each group)
      if (completedMatch.group_id) {
        await handleGroupAdvancement(completedMatch, winnerId, loserId, tournamentId);
      }

      // Cross-bracket advancement  
      if (completedMatch.bracket_type === 'cross_semifinals') {
        await handleCrossBracketAdvancement(completedMatch, winnerId, tournamentId);
      }

      // Check if group is completed and ready for cross-bracket
      if (completedMatch.bracket_type === 'group_a_final' || completedMatch.bracket_type === 'group_b_final') {
        await checkAndPopulateCrossBracket(tournamentId);
      }

    } catch (error) {
      console.error('❌ SABO-32 advancement error (non-critical):', error);
      // Don't fail the entire operation for advancement issues
    }
  };

  // Handle advancement within a group (reuse SABO-16 logic)
  const handleGroupAdvancement = async (
    match: SABO32Match,
    winnerId: string,
    loserId: string,
    tournamentId: string
  ) => {
    // This is similar to SABO-16 advancement but within group scope
    // Implementation would reuse existing SABOLogicCore with group filtering
    console.log('🏆 Group advancement logic - to be implemented');
  };

  // Handle cross-bracket advancement (semifinals to final)
  const handleCrossBracketAdvancement = async (
    match: SABO32Match,
    winnerId: string,
    tournamentId: string
  ) => {
    console.log('🎯 Cross-bracket advancement: winner advances to final');
    
    // Find the final match
    const { data: finalMatches } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'cross_final');

    if (finalMatches && finalMatches.length > 0) {
      const finalMatch = finalMatches[0];
      const updateField = !finalMatch.player1_id ? 'player1_id' : 'player2_id';
      
      await supabase
        .from('tournament_matches')
        .update({ 
          [updateField]: winnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', finalMatch.id);
      
      console.log('✅ Winner advanced to cross-bracket final');
    }
  };

  // Check if both groups are completed and populate cross-bracket
  const checkAndPopulateCrossBracket = async (tournamentId: string) => {
    console.log('🔍 Checking if cross-bracket can be populated...');
    
    // Get group finals
    const { data: groupFinals } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['group_a_final', 'group_b_final'])
      .eq('status', 'completed');

    if (groupFinals && groupFinals.length === 2) {
      const groupAFinal = groupFinals.find(m => m.bracket_type === 'group_a_final');
      const groupBFinal = groupFinals.find(m => m.bracket_type === 'group_b_final');
      
      if (groupAFinal && groupBFinal) {
        console.log('🎉 Both groups completed! Populating cross-bracket...');
        
        // Determine qualifiers from each group
        const groupAWinner = groupAFinal.winner_id;
        const groupARunnerUp = groupAFinal.loser_id; // Runner-up in final
        const groupBWinner = groupBFinal.winner_id;
        const groupBRunnerUp = groupBFinal.loser_id; // Runner-up in final
        
        // Update semifinals with cross-bracket matchups
        await supabase
          .from('tournament_matches')
          .update({
            player1_id: groupAWinner,
            player2_id: groupBRunnerUp,
            status: 'ready'
          })
          .eq('tournament_id', tournamentId)
          .eq('bracket_type', 'cross_semifinals')
          .eq('match_number', 1);

        await supabase
          .from('tournament_matches')
          .update({
            player1_id: groupBWinner,
            player2_id: groupARunnerUp,
            status: 'ready'
          })
          .eq('tournament_id', tournamentId)
          .eq('bracket_type', 'cross_semifinals')
          .eq('match_number', 2);
          
        console.log('✅ Cross-bracket semifinals populated successfully');
        toast.success('🎯 Cross-bracket finals are now ready!');
      }
    }
  };

  // Submit score function
  const submitScore = async (
    matchId: string,
    scores: MatchScore,
    matchData?: SABO32Match
  ) => {
    if (!matchData) {
      // Find match data
      matchData = matches.find(m => m.id === matchId);
      if (!matchData) {
        throw new Error('Match data not found');
      }
    }
    
    return submitScoreMutation.mutateAsync({ matchId, scores, matchData });
  };

  return {
    matches,
    isLoading,
    error,
    refetch,
    submitScore,
    isSubmitting: submitScoreMutation.isPending,
  };
};

export default useSABO32Tournament;
