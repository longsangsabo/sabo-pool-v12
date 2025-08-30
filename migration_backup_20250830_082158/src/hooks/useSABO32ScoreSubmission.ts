// =============================================
// SABO-32 SCORE SUBMISSION HOOK
// Handle score submission and automatic advancement
// =============================================

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { withScrollPreservation } from '@/utils/scrollPreservation';

export interface SABO32ScoreSubmission {
  matchId: string;
  score_player1: number;
  score_player2: number;
  winner_id: string;
}

export const useSABO32ScoreSubmission = (tournamentId: string, onMatchUpdate?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitScore = async (submission: SABO32ScoreSubmission) => {
    setIsSubmitting(true);
    
    try {
      // 1. Update match with score and winner
      const { error: updateError } = await (supabase as any)
        .from('sabo32_matches')
        .update({
          score_player1: submission.score_player1,
          score_player2: submission.score_player2,
          winner_id: submission.winner_id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', submission.matchId);

      if (updateError) throw updateError;

      // 2. Get the completed match details for advancement
      const { data: completedMatch, error: matchError } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('id', submission.matchId)
        .single();

      if (matchError) throw matchError;

      // 3. Handle advancement logic
      await handleAdvancement(completedMatch, tournamentId);

      // 4. ENHANCED SCROLL PRESERVATION: Use utility for consistent behavior
      if (onMatchUpdate) {
        await withScrollPreservation(
          async () => {
            onMatchUpdate();
            // Small delay to ensure DOM updates are complete
            await new Promise(resolve => setTimeout(resolve, 50));
          },
          { delayMs: 150, restoreFocus: true }
        );
      }

      toast.success('Tỷ số đã được cập nhật!', {
        duration: 2000,
        position: 'top-center'
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error(`Lỗi cập nhật tỷ số: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvancement = async (completedMatch: any, tournamentId: string) => {
    const { group_id, bracket_type, round_number, match_number, winner_id } = completedMatch;
    const loser_id = completedMatch.player1_id === winner_id ? 
      completedMatch.player2_id : completedMatch.player1_id;

    // Get all matches for advancement logic
    const { data: allMatches } = await (supabase as any)
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId);

    if (!allMatches) return;

    const updates = [];

    // SABO-32 Advancement Logic
    if (group_id === 'A' || group_id === 'B') {
      // Group stage advancement
      if (bracket_type.includes('winners')) {
        // Winners bracket advancement
        const nextWinnersMatch = allMatches.find(m => 
          m.group_id === group_id && 
          m.bracket_type === bracket_type &&
          m.round_number === round_number + 1 &&
          Math.floor((match_number - 1) / 2) + 1 === m.match_number
        );

        if (nextWinnersMatch) {
          const playerField = (match_number % 2 === 1) ? 'player1_id' : 'player2_id';
          updates.push({
            id: nextWinnersMatch.id,
            [playerField]: winner_id
          });
        }

        // Send loser to losers bracket
        const losersMatch = allMatches.find(m =>
          m.group_id === group_id && 
          m.bracket_type === `group_${group_id.toLowerCase()}_losers_a` &&
          m.round_number === 101 + Math.floor((round_number - 1) / 2)
        );

        if (losersMatch && !losersMatch.player1_id) {
          updates.push({
            id: losersMatch.id,
            player1_id: loser_id
          });
        } else if (losersMatch && !losersMatch.player2_id) {
          updates.push({
            id: losersMatch.id,
            player2_id: loser_id
          });
        }
      } else if (bracket_type.includes('losers')) {
        // Losers bracket advancement
        const nextLosersMatch = allMatches.find(m =>
          m.group_id === group_id &&
          m.bracket_type === bracket_type &&
          m.round_number === round_number + 1
        );

        if (nextLosersMatch) {
          const playerField = !nextLosersMatch.player1_id ? 'player1_id' : 'player2_id';
          updates.push({
            id: nextLosersMatch.id,
            [playerField]: winner_id
          });
        }
      } else if (bracket_type.includes('final')) {
        // Group final - send winner to cross-bracket
        const groupLetter = group_id.toLowerCase();
        const crossMatch = allMatches.find(m =>
          m.group_id === null &&
          m.bracket_type === 'cross_semifinals' &&
          m.sabo_match_id === (groupLetter === 'a' ? 'SF1' : 'SF2')
        );

        if (crossMatch && groupLetter === 'a') {
          updates.push({
            id: crossMatch.id,
            player1_id: winner_id // Winner A vs Runner-up B
          });
        } else if (crossMatch && groupLetter === 'b') {
          updates.push({
            id: crossMatch.id,
            player1_id: winner_id // Winner B vs Runner-up A  
          });
        }

        // Send runner-up to cross-bracket
        const runnerUpMatch = allMatches.find(m =>
          m.group_id === null &&
          m.bracket_type === 'cross_semifinals' &&
          m.sabo_match_id === (groupLetter === 'a' ? 'SF2' : 'SF1')
        );

        if (runnerUpMatch && groupLetter === 'a') {
          updates.push({
            id: runnerUpMatch.id,
            player2_id: loser_id // Winner B vs Runner-up A
          });
        } else if (runnerUpMatch && groupLetter === 'b') {
          updates.push({
            id: runnerUpMatch.id,
            player2_id: loser_id // Winner A vs Runner-up B
          });
        }
      }
    } else {
      // Cross-bracket advancement
      if (bracket_type === 'cross_semifinals') {
        const finalMatch = allMatches.find(m =>
          m.group_id === null &&
          m.bracket_type === 'cross_final'
        );

        if (finalMatch) {
          const playerField = !finalMatch.player1_id ? 'player1_id' : 'player2_id';
          updates.push({
            id: finalMatch.id,
            [playerField]: winner_id
          });
        }
      }
    }

    // Apply all updates
    for (const update of updates) {
      await (supabase as any)
        .from('sabo32_matches')
        .update(update)
        .eq('id', update.id);
    }

    console.log(`✅ Advancement completed: ${updates.length} matches updated`);
  };

  return {
    submitScore,
    isSubmitting
  };
};
