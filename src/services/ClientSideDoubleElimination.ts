/**
 * CLIENT-SIDE DOUBLE ELIMINATION BRACKET GENERATOR
 * Fallback solution when database functions fail
 */

import { supabase } from '@/integrations/supabase/client';

interface Player {
  user_id: string;
  full_name: string;
  elo: number;
  seed: number;
}

interface Match {
  id?: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  status: 'scheduled' | 'in_progress' | 'completed';
  score_player1: number | null;
  score_player2: number | null;
  bracket_type: 'winner' | 'loser';
  next_match_id: string | null;
}

export class ClientSideDoubleElimination {
  private tournamentId: string;
  private players: Player[] = [];
  private matches: Match[] = [];

  constructor(tournamentId: string) {
    this.tournamentId = tournamentId;
  }

  async generateBracket(): Promise<{ success: boolean; matches_created?: number; error?: string }> {
    try {
      console.log('🔧 Client-side double elimination bracket generation starting...');

      // 1. Load and validate players
      const playersLoaded = await this.loadPlayers();
      if (!playersLoaded) {
        return { success: false, error: 'Failed to load players' };
      }

      if (this.players.length !== 16) {
        return { success: false, error: `Double elimination requires exactly 16 players, found ${this.players.length}` };
      }

      // 2. Seed players by ELO
      this.seedPlayers();

      // 3. Generate bracket structure
      this.generateWinnerBracket();
      this.generateLoserBracket();
      this.generateFinals();

      // 4. Save matches to database
      const saved = await this.saveMatches();
      if (!saved) {
        return { success: false, error: 'Failed to save matches to database' };
      }

      // 5. Update tournament status
      await this.updateTournamentStatus();

      console.log(`✅ Client-side bracket generated: ${this.matches.length} matches created`);
      return { success: true, matches_created: this.matches.length };

    } catch (error) {
      console.error('❌ Client-side bracket generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  private async loadPlayers(): Promise<boolean> {
    try {
      const { data: registrations, error } = await supabase
        .from('tournament_registrations')
        .select(`
          user_id,
          profiles:user_id (
            full_name,
            elo
          )
        `)
        .eq('tournament_id', this.tournamentId)
        .eq('registration_status', 'confirmed')
        .limit(16);

      if (error) {
        console.error('Error loading players:', error);
        return false;
      }

      this.players = registrations?.map((reg, index) => ({
        user_id: reg.user_id,
        full_name: reg.profiles?.full_name || `Player ${index + 1}`,
        elo: reg.profiles?.elo || 1000,
        seed: 0 // Will be set in seedPlayers
      })) || [];

      return this.players.length === 16;
    } catch (error) {
      console.error('Exception loading players:', error);
      return false;
    }
  }

  private seedPlayers(): void {
    // Sort by ELO descending, then assign seeds
    this.players.sort((a, b) => b.elo - a.elo);
    this.players.forEach((player, index) => {
      player.seed = index + 1;
    });

    console.log('🎯 Players seeded by ELO:');
    this.players.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.full_name} (ELO: ${p.elo})`);
    });
  }

  private generateWinnerBracket(): void {
    // Winner Bracket Round 1 (8 matches)
    for (let i = 0; i < 8; i++) {
      const player1 = this.players[i * 2];
      const player2 = this.players[i * 2 + 1];
      
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 1,
        match_number: i + 1,
        player1_id: player1.user_id,
        player2_id: player2.user_id,
        winner_id: null,
        status: 'scheduled',
        score_player1: null,
        score_player2: null,
        bracket_type: 'winner',
        next_match_id: null
      });
    }

    // Winner Bracket Round 2 (4 matches)
    for (let i = 0; i < 4; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round: 2,
        match_number: i + 9,
        player1_id: null, // From Round 1 winners
        player2_id: null,
        winner_id: null,
        status: 'scheduled',
        score_player1: null,
        score_player2: null,
        bracket_type: 'winner',
        next_match_id: null,
        loser_next_match_id: null
      });
    }

    // Winner Bracket Round 3 (2 matches)
    for (let i = 0; i < 2; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round: 3,
        match_number: i + 13,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'scheduled',
        score_player1: null,
        score_player2: null,
        bracket_type: 'winner',
        next_match_id: null,
        loser_next_match_id: null
      });
    }

    // Winner Bracket Final (1 match)
    this.matches.push({
      tournament_id: this.tournamentId,
      round: 4,
      match_number: 15,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'scheduled',
      score_player1: null,
      score_player2: null,
      bracket_type: 'winner',
      next_match_id: null,
      loser_next_match_id: null
    });
  }

  private generateLoserBracket(): void {
    // Loser Bracket - simplified structure
    // This would contain the complex loser bracket logic
    // For now, create placeholder matches
    for (let round = 1; round <= 6; round++) {
      const matchesInRound = round <= 3 ? 4 : round === 4 ? 2 : 1;
      
      for (let i = 0; i < matchesInRound; i++) {
        this.matches.push({
          tournament_id: this.tournamentId,
          round: round,
          match_number: 16 + this.matches.filter(m => m.bracket_type === 'loser').length,
          player1_id: null,
          player2_id: null,
          winner_id: null,
          status: 'scheduled',
          score_player1: null,
          score_player2: null,
          bracket_type: 'loser',
          next_match_id: null,
          loser_next_match_id: null
        });
      }
    }
  }

  private generateFinals(): void {
    // Grand Final (potential 2 matches if loser bracket winner beats winner bracket winner)
    this.matches.push({
      tournament_id: this.tournamentId,
      round: 7,
      match_number: 26,
      player1_id: null, // Winner bracket champion
      player2_id: null, // Loser bracket champion
      winner_id: null,
      status: 'scheduled',
      score_player1: null,
      score_player2: null,
      bracket_type: 'winner',
      next_match_id: null,
      loser_next_match_id: null
    });

    // Grand Final Reset (if needed)
    this.matches.push({
      tournament_id: this.tournamentId,
      round: 8,
      match_number: 27,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'scheduled',
      score_player1: null,
      score_player2: null,
      bracket_type: 'winner',
      next_match_id: null,
      loser_next_match_id: null
    });
  }

  private async saveMatches(): Promise<boolean> {
    try {
      // Clear existing matches first
      await supabase
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', this.tournamentId);

      // Insert new matches in batches
      const batchSize = 10;
      for (let i = 0; i < this.matches.length; i += batchSize) {
        const batch = this.matches.slice(i, i + batchSize);
        const { error } = await supabase
          .from('tournament_matches')
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
          return false;
        }
      }

      console.log(`✅ Saved ${this.matches.length} matches to database`);
      return true;
    } catch (error) {
      console.error('Exception saving matches:', error);
      return false;
    }
  }

  private async updateTournamentStatus(): Promise<void> {
    try {
      await supabase
        .from('tournaments')
        .update({
          status: 'ongoing',
          management_status: 'bracket_generated',
          updated_at: new Date().toISOString()
        })
        .eq('id', this.tournamentId);

      console.log('✅ Tournament status updated');
    } catch (error) {
      console.error('Error updating tournament status:', error);
    }
  }
}

export default ClientSideDoubleElimination;
