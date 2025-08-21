/**
 * CLIENT-SIDE SABO DOUBLE ELIMINATION BRACKET GENERATOR
 * Based on SABO tournament structure: 27 matches total
 */

import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/integrations/supabase/service';
import { SABOMatchHandler } from './SABOMatchHandler';
import { getDisplayName } from '@/types/unified-profile';

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
  status: 'pending' | 'in_progress' | 'completed';
  bracket_type: 'winner' | 'loser';
  next_winner_match?: number | null;
  next_loser_match?: number | null;
}

export class ClientSideDoubleElimination {
  private tournamentId: string;
  private players: Player[] = [];
  private matches: Match[] = [];

  constructor(tournamentId: string) {
    this.tournamentId = tournamentId;
  }

  async generateBracket(): Promise<{
    success: boolean;
    error?: string;
    matches?: Match[];
    playerCount?: number;
    matchCount?: number;
  }> {
    try {
      console.log('🚀 Starting SABO Double Elimination bracket generation...');
      
      // Step 1: Load players
      const playersLoaded = await this.loadPlayers();
      if (!playersLoaded) {
        return {
          success: false,
          error: 'Failed to load players'
        };
      }

      // Step 2: Seed players
      this.seedPlayers();

      // Step 3: Generate bracket structure
      this.generateWinnerBracket();
      this.generateLoserBracket();
      this.generateSABOFinals();

      console.log(`✅ Generated ${this.matches.length} matches for ${this.players.length} players`);

      // Step 4: Save to database
      const savedCount = await TournamentMatchDBHandler.saveMatchesSafely(
        this.tournamentId,
        this.matches
      );

      if (savedCount === this.matches.length) {
        console.log('🎉 All matches saved successfully!');
        return {
          success: true,
          matches: this.matches,
          playerCount: this.players.length,
          matchCount: this.matches.length
        };
      } else {
        console.warn(`⚠️ Only ${savedCount}/${this.matches.length} matches saved`);
        return {
          success: false,
          error: `Database save incomplete: ${savedCount}/${this.matches.length} matches saved`
        };
      }

    } catch (error) {
      console.error('🚨 Bracket generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async loadPlayers(): Promise<boolean> {
    try {
      console.log('🔍 Loading players for tournament:', this.tournamentId);

      // Get tournament registrations
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('user_id')
        .eq('tournament_id', this.tournamentId)
        .eq('registration_status', 'confirmed')
        .limit(16);

      if (regError) {
        console.error('❌ Registration query error:', regError);
        return false;
      }

      if (!registrations || registrations.length === 0) {
        console.log('⚠️ No confirmed registrations found');
        return false;
      }

      console.log(`📋 Found ${registrations.length} registrations`);

      // Get player profiles
      const userIds = registrations.map(r => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, full_name, elo')
        .in('user_id', userIds);

      if (profileError) {
        console.error('❌ Profile query error:', profileError);
        return false;
      }

      // Create player objects with proper mapping
      this.players = registrations.map(reg => {
        const profile = profiles?.find(p => p.user_id === reg.user_id);
        return {
          user_id: reg.user_id,
          full_name: profile ? getDisplayName(profile) : 'Player',
          elo: profile?.elo || 1000,
          seed: 0
        };
      });

      console.log(`👥 Successfully loaded ${this.players.length} players`);

      // Check if we have exactly 16 players
      if (this.players.length !== 16) {
        console.warn(`⚠️ Expected 16 players, found ${this.players.length}`);
        
        // For SABO Double, we need exactly 16 players
        if (this.players.length < 16) {
          console.log('🔄 Adding dummy players to reach 16...');
          while (this.players.length < 16) {
            this.players.push({
              user_id: `dummy_${this.players.length + 1}`,
              full_name: `Dummy Player ${this.players.length + 1}`,
              elo: 1000,
              seed: 0
            });
          }
        }
      }

      return this.players.length === 16;

    } catch (error) {
      console.error('🚨 Error loading players:', error);
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
      console.log(`  ${i+1}. ${p.full_name} (ELO: ${p.elo})`);
    });
  }

  private generateWinnerBracket(): void {
    console.log('🏆 Generating Winner Bracket (SABO Structure)...');
    
    // SABO Winners: Round 1-3 only (stops at 2 finalists, no WB Finals)
    // Round 1: 8 matches (16 -> 8)
    for (let i = 0; i < 8; i++) {
      const player1 = this.players[i];
      const player2 = this.players[15 - i]; // Traditional seeding
      
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 1,
        match_number: i + 1,
        player1_id: player1.user_id,
        player2_id: player2.user_id,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winner'
      });
    }

    // Round 2: 4 matches (8 -> 4)
    for (let i = 0; i < 4; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 2,
        match_number: i + 1,
        player1_id: null, // TBD from previous round
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winner'
      });
    }

    // Round 3: 2 matches (4 -> 2) - SABO stops here for winners
    for (let i = 0; i < 2; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 3,
        match_number: i + 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winner'
      });
    }

    console.log('✅ Winners bracket: 14 matches (8+4+2, stops at 2 finalists)');
  }
  }

  private generateLoserBracket(): void {
    console.log('🥈 Generating Loser Bracket (SABO Structure)...');
    
    // SABO Losers Branch A: 7 matches (4+2+1)
    // Round 101: 4 matches (losers from WB R1)
    for (let i = 0; i < 4; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 101,
        match_number: i + 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'loser'
      });
    }

    // Round 102: 2 matches 
    for (let i = 0; i < 2; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 102,
        match_number: i + 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'loser'
      });
    }

    // Round 103: 1 match
    this.matches.push({
      tournament_id: this.tournamentId,
      round_number: 103,
      match_number: 1,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'pending',
      bracket_type: 'loser'
    });

    // SABO Losers Branch B: 3 matches (2+1)
    // Round 201: 2 matches (losers from WB R2)
    for (let i = 0; i < 2; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 201,
        match_number: i + 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'loser'
      });
    }

    // Round 202: 1 match
    this.matches.push({
      tournament_id: this.tournamentId,
      round_number: 202,
      match_number: 1,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'pending',
      bracket_type: 'loser'
    });

    console.log('✅ Losers bracket: 10 matches (Branch A: 7, Branch B: 3)');
  }

  private generateSABOFinals(): void {
    console.log('🏅 Generating SABO Finals (4-person knockout)...');
    
    // SABO Finals: 3 matches total
    // Semifinals: 2 matches (4 people -> 2)
    for (let i = 0; i < 2; i++) {
      this.matches.push({
        tournament_id: this.tournamentId,
        round_number: 250, // Semifinal round
        match_number: i + 1,
        player1_id: null, // 2 from WB + 1 from LA + 1 from LB
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winner' // Finals counted as winner bracket
      });
    }

    // Final: 1 match (2 -> 1)
    this.matches.push({
      tournament_id: this.tournamentId,
      round_number: 300, // Final round
      match_number: 1,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'pending',
      bracket_type: 'winner'
    });

    console.log('✅ Finals: 3 matches (2 semifinals + 1 final)');
  }
  }
}
