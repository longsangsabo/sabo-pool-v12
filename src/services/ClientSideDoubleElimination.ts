/**
 * CLIENT-SIDE SABO DOUBLE ELIMINATION BRACKET GENERATOR
 * Based on SABO tournament structure: 27 matches total
 */

import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/integrations/supabase/service';
import { SABOMatchHandler } from './SABOMatchHandler';

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
      // =============================================================
      // ✅ Step 0: Thử gọi RPC server-side (ưu tiên) nếu đã tạo function trên DB
      // =============================================================
      try {
        console.log('🔌 Trying server-side RPC: generate_tournament_matches');
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('generate_tournament_matches' as any, { p_tournament_id: this.tournamentId });
        if (!rpcError && rpcData && (rpcData as any).success) {
          console.log('✅ Server-side generation success:', rpcData);
          // Load matches vừa tạo
          const { data: createdMatches } = await supabase
            .from('tournament_matches')
            .select('id, round_number, match_number, player1_id, player2_id, status, bracket_type')
            .eq('tournament_id', this.tournamentId)
            .order('round_number')
            .order('match_number');
          return {
            success: true,
            matches: (createdMatches as any) || [],
            playerCount: (rpcData as any).player_count || 16,
            matchCount: (rpcData as any).match_count || ((createdMatches as any)?.length || 27)
          };
        } else if (rpcError) {
          console.warn('⚠️ RPC generate_tournament_matches failed, fallback to client generator:', rpcError.message);
        } else {
          console.warn('⚠️ RPC did not return success flag, fallback to client generator');
        }
      } catch (e) {
        console.warn('⚠️ RPC call exception, fallback to client generation:', e);
      }
      
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

      // Step 3: Generate SABO bracket structure (27 matches)
      this.generateSABOWinnerBracket();    // 14 matches
      this.generateSABOLoserBrackets();    // 10 matches
      this.generateSABOFinals();           // 3 matches

      console.log(`✅ Generated ${this.matches.length} matches for ${this.players.length} players`);

      // Step 4: Save to SABO matches table
      const savedCount = await SABOMatchHandler.saveMatches(
        this.matches,
        this.tournamentId
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
      console.log('🔍 Tournament ID type:', typeof this.tournamentId);
      console.log('🔍 Tournament ID length:', this.tournamentId?.length);

      // Try multiple approaches to avoid schema cache issues
      let registrations: any[] = [];
      let regError: any = null;

      // Approach 1: Try the standard query
      console.log('🔍 Approach 1: Standard query...');
      try {
        const result = await supabase
          .from('tournament_registrations')
          .select('user_id')
          .eq('tournament_id', this.tournamentId)
          .eq('registration_status', 'confirmed')
          .limit(16);
          
        if (result.error) {
          console.warn('⚠️ Standard query failed:', result.error);
          regError = result.error;
        } else {
          registrations = result.data || [];
          console.log('✅ Standard query success:', registrations.length);
        }
      } catch (error) {
        console.warn('⚠️ Standard query exception:', error);
        regError = error;
      }

      // Approach 2: If standard failed, try simplified query
      if (regError && registrations.length === 0) {
        console.log('� Approach 2: Simplified query (no status filter)...');
        try {
          const result = await supabase
            .from('tournament_registrations')
            .select('user_id')
            .eq('tournament_id', this.tournamentId)
            .limit(16);
            
          if (result.error) {
            console.warn('⚠️ Simplified query failed:', result.error);
          } else {
            registrations = result.data || [];
            console.log('✅ Simplified query success:', registrations.length);
            regError = null; // Clear the error since we got results
          }
        } catch (error) {
          console.warn('⚠️ Simplified query exception:', error);
        }
      }

      // Approach 3: If still failed, try with explicit select
      if (regError && registrations.length === 0) {
        console.log('� Approach 3: Explicit column query...');
        try {
          const result = await supabase
            .from('tournament_registrations')
            .select('user_id, registration_status')
            .eq('tournament_id', this.tournamentId);
            
          if (result.error) {
            console.error('❌ All query approaches failed. Final error:', result.error);
            return false;
          } else {
            // Filter confirmed manually
            const allRegs = result.data || [];
            registrations = allRegs
              .filter(r => r.registration_status === 'confirmed')
              .slice(0, 16);
            console.log('✅ Explicit query success, filtered to:', registrations.length);
            regError = null;
          }
        } catch (error) {
          console.error('❌ All approaches failed. Final exception:', error);
          return false;
        }
      }

      if (registrations.length === 0) {
        console.log('⚠️ No registrations found after all approaches');
        return false;
      }

      console.log(`📋 Final registration count: ${registrations.length}`);

      // Get player profiles with the user IDs we found
      const userIds = registrations.map(r => r.user_id);
      console.log('🔍 Querying profiles for user IDs:', userIds.slice(0, 3));
      
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
          full_name: profile?.display_name || profile?.full_name || 'Player',
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

  private generateSABOWinnerBracket(): void {
    console.log('🏆 Generating SABO Winner Bracket (14 matches)...');
    
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

    console.log('✅ Winner bracket: 14 matches (8+4+2, stops at 2 finalists)');
  }

  private generateSABOLoserBrackets(): void {
    console.log('🥈 Generating SABO Loser Brackets (10 matches)...');
    
    // Losers Branch A: 7 matches (4+2+1)
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

    // Losers Branch B: 3 matches (2+1)
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

    console.log('✅ Loser brackets: 10 matches (Branch A: 7, Branch B: 3)');
  }

  private generateSABOFinals(): void {
    console.log('🏅 Generating SABO Finals (3 matches)...');
    
    // SABO Finals: 4-person knockout (2 from WB + 1 from LA + 1 from LB)
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
