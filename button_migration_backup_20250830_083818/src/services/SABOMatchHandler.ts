/**
 * SABO TOURNAMENT MATCH HANDLER
 * Handles SABO-specific tournament matches with proper bracket structure
 * Uses unified tournament_matches table (renamed from tournament_matches)
 */

import { supabaseService } from '@/integrations/supabase/service';

interface SABOMatch {
  id?: string;
  tournament_id: string;
  club_id?: string | undefined;
  bracket_type: 'winner' | 'loser' | 'finals';
  branch_type?: 'A' | 'B' | null;
  round_number: number;
  match_number: number;
  sabo_match_id: string;
  player1_id?: string | undefined;
  player2_id?: string | undefined;
  player1_name?: string | undefined;
  player2_name?: string | undefined;
  winner_id?: string | undefined;
  loser_id?: string | undefined;
  score_player1?: number;
  score_player2?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'bye';
  advances_to_match_id?: string | undefined;
  feeds_loser_to_match_id?: string | undefined;
  is_bye_match?: boolean;
  notes?: string | undefined;
}

export class SABOMatchHandler {
  private static readonly TABLE_NAME = 'tournament_matches';

  // Columns actually existing in unified tournament_matches schema
  private static readonly ALLOWED_COLUMNS = new Set([
    'tournament_id',
    'club_id',
    'round_number',
    'match_number',
    'bracket_type',
    'branch_type',
    'sabo_match_id',
    'player1_id',
    'player2_id',
    'winner_id',
    'score_player1',
    'score_player2',
    'status'
  ]);

  /**
   * Check if SABO matches table exists and is accessible
   */
  static async checkTableAccess(): Promise<boolean> {
    try {
  const client: any = supabaseService || (await import('@/integrations/supabase/client')).supabase;
  const { error } = await client.from(this.TABLE_NAME).select('id').limit(1);

      if (error) {
        console.error('❌ SABO matches table not accessible:', error.message);
        return false;
      }

      console.log('✅ SABO matches table accessible');
      return true;
    } catch (error) {
      console.error('💥 SABO table check exception:', error);
      return false;
    }
  }

  /**
   * Generate SABO match ID based on bracket structure
   */
  static generateSABOMatchId(
    bracketType: string,
    roundNumber: number,
    matchNumber: number,
    branchType?: string
  ): string {
    switch (bracketType) {
      case 'winner':
        return `WR${roundNumber}M${matchNumber}`;
      case 'loser':
        if (branchType === 'A') {
          return `LAR${roundNumber}M${matchNumber}`;
        } else if (branchType === 'B') {
          return `LBR${roundNumber}M${matchNumber}`;
        } else {
          return `LR${roundNumber}M${matchNumber}`;
        }
      case 'finals':
        return `FR${roundNumber}M${matchNumber}`;
      default:
        return `${bracketType.toUpperCase()}R${roundNumber}M${matchNumber}`;
    }
  }

  /**
   * Convert generic match to SABO match format
   */
  static convertToSABOMatch(match: any, tournamentId: string, clubId?: string): SABOMatch {
    // Determine bracket structure from match properties
    let bracketType: 'winner' | 'loser' | 'finals' = 'winner';
    let branchType: 'A' | 'B' | null = null;
    let roundNumber = match.round_number || match.round || 1;
    let matchNumber = match.match_number || match.matchNumber || 1;

    // Analyze round number to determine bracket type
    if (roundNumber >= 101 && roundNumber <= 199) {
      // Loser Branch A (rounds 101, 102, 103)
      bracketType = 'loser';
      branchType = 'A';
    } else if (roundNumber >= 201 && roundNumber <= 299) {
      // Loser Branch B (rounds 201, 202)
      bracketType = 'loser';
      branchType = 'B';
    } else if (roundNumber >= 301 && roundNumber <= 499) {
      // Finals (rounds 301, 401)
      bracketType = 'finals';
    } else if (roundNumber >= 1 && roundNumber <= 10) {
      // Winner bracket (rounds 1, 2, 3)
      bracketType = 'winner';
    }

    const saboMatchId = this.generateSABOMatchId(
      bracketType,
      roundNumber,
      matchNumber,
      branchType || undefined
    );

    return {
      tournament_id: tournamentId,
      club_id: clubId || null,
      bracket_type: bracketType,
      branch_type: branchType,
      round_number: roundNumber,
      match_number: matchNumber,
      sabo_match_id: saboMatchId,
      player1_id: match.player1_id || match.player1?.user_id || null,
      player2_id: match.player2_id || match.player2?.user_id || null,
      player1_name: match.player1_name || match.player1?.full_name || null,
      player2_name: match.player2_name || match.player2?.full_name || null,
      winner_id: match.winner_id || null,
      loser_id: match.loser_id || null,
      score_player1: match.score_player1 || 0,
      score_player2: match.score_player2 || 0,
      status: (match.status === 'scheduled' ? 'pending' : match.status) || 'pending',
      advances_to_match_id: match.advances_to_match_id || null,
      feeds_loser_to_match_id: match.feeds_loser_to_match_id || null,
      is_bye_match: match.is_bye_match || false,
      notes: match.notes || null
    };
  }

  /**
   * Clear existing SABO matches for a tournament
   */
  static async clearExistingMatches(tournamentId: string): Promise<boolean> {
    try {
      console.log('🗑️ Clearing existing SABO matches...');
  const client: any = supabaseService || (await import('@/integrations/supabase/client')).supabase;
  const { error } = await client.from(this.TABLE_NAME).delete().eq('tournament_id', tournamentId);

      if (error) {
        console.error('❌ Clear SABO matches failed:', error.message);
        return false;
      }

      console.log('✅ SABO matches cleared');
      return true;
    } catch (error) {
      console.error('💥 Clear SABO matches exception:', error);
      return false;
    }
  }

  /**
   * Save SABO matches in optimized batches
   */
  static async saveMatches(
    matches: any[],
    tournamentId: string
  ): Promise<number> {
    console.log('💾 Starting SABO matches save...');
    console.log(`📊 SABO matches to save: ${matches.length}`);

    // 1. Check table access
    const hasAccess = await this.checkTableAccess();
    if (!hasAccess) {
      console.error('❌ SABO table not accessible');
      return 0;
    }

    // 2. Clear existing matches
    await this.clearExistingMatches(tournamentId);

    // 3. Get club_id from tournament
    const client: any = supabaseService || (await import('@/integrations/supabase/client')).supabase;
    const { data: tournament, error: tournamentError } = await client
      .from('tournaments')
      .select('club_id')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      console.error('❌ Could not fetch tournament club_id:', tournamentError?.message);
      return 0;
    }

    const clubId = tournament.club_id;
    console.log('🏢 Using club_id:', clubId);

    // 4. Convert to SABO format
    const saboMatches = matches.map(match => 
      this.convertToSABOMatch(match, tournamentId, clubId)
    );

    console.log(`📝 Converted ${saboMatches.length} matches to SABO format`);

    // 5. Validate SABO structure
    const brackets = this.validateSABOStructure(saboMatches);
    console.log('🎯 SABO bracket validation:', brackets);

    // 6. Sanitize matches to only allowed columns (remove sabo_match_id, notes, etc.)
    const sanitized = saboMatches.map(raw => {
      const obj: Record<string, any> = {};
      for (const k of Object.keys(raw)) {
        if (this.ALLOWED_COLUMNS.has(k) && raw[k] !== undefined) obj[k] = raw[k];
      }
      return obj;
    });

    // 7. Save in batches
    let savedCount = 0;
    const batchSize = 5; // Smaller batches for complex data

    for (let i = 0; i < sanitized.length; i += batchSize) {
      const batch = sanitized.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(sanitized.length / batchSize);

      console.log(`📤 SABO Batch ${batchNumber}/${totalBatches} (${batch.length} matches)`);

      try {
        const { data, error } = await client
          .from(this.TABLE_NAME)
          .insert(batch)
          .select('id');

        if (error) {
          console.error(`❌ SABO Batch ${batchNumber} failed:`, error.message);
          console.error('🧪 First row of failed batch:', batch[0]);
          
          // Try individual saves for failed batch
          for (const match of batch) {
            try {
              const { error: individualError } = await client
                .from(this.TABLE_NAME)
                .insert([match]);
                
              if (individualError) {
                console.error(`❌ Individual SABO save failed (match_number=${match.match_number}, round=${match.round_number}):`, individualError.message);
              } else {
                savedCount++;
                console.log(`✅ Individual SABO save: round ${match.round_number} match ${match.match_number}`);
              }
            } catch (individualException) {
              console.error(`💥 Individual SABO exception:`, individualException);
            }
          }
        } else {
          savedCount += data.length;
          console.log(`✅ SABO Batch saved: ${data.length} matches`);
        }
      } catch (batchError) {
        console.error(`💥 SABO Batch ${batchNumber} exception:`, batchError);
      }
    }

    console.log(`✅ SABO Total saved: ${savedCount}/${matches.length} matches`);
    if (savedCount !== matches.length) {
      console.warn('⚠️ Some matches failed to save. Verify table schema or RLS policies.');
    }
    return savedCount;
  }

  /**
   * Validate SABO tournament structure
   */
  static validateSABOStructure(matches: SABOMatch[]): any {
    const structure = {
      winner: { rounds: new Set(), total: 0 },
      loser_A: { rounds: new Set(), total: 0 },
      loser_B: { rounds: new Set(), total: 0 },
      finals: { rounds: new Set(), total: 0 },
      total: matches.length
    };

    matches.forEach(match => {
      if (match.bracket_type === 'winner') {
        structure.winner.rounds.add(match.round_number);
        structure.winner.total++;
      } else if (match.bracket_type === 'loser' && match.branch_type === 'A') {
        structure.loser_A.rounds.add(match.round_number);
        structure.loser_A.total++;
      } else if (match.bracket_type === 'loser' && match.branch_type === 'B') {
        structure.loser_B.rounds.add(match.round_number);
        structure.loser_B.total++;
      } else if (match.bracket_type === 'finals') {
        structure.finals.rounds.add(match.round_number);
        structure.finals.total++;
      }
    });

    // Convert Sets to Arrays for logging
    return {
      winner: { rounds: Array.from(structure.winner.rounds), total: structure.winner.total },
      loser_A: { rounds: Array.from(structure.loser_A.rounds), total: structure.loser_A.total },
      loser_B: { rounds: Array.from(structure.loser_B.rounds), total: structure.loser_B.total },
      finals: { rounds: Array.from(structure.finals.rounds), total: structure.finals.total },
      total: structure.total,
      isValid: structure.total === 27 && 
               structure.winner.total === 14 && 
               structure.loser_A.total + structure.loser_B.total === 10 && 
               structure.finals.total === 3
    };
  }

  /**
   * Get SABO matches for a tournament
   */
  static async getMatches(tournamentId: string): Promise<SABOMatch[]> {
    try {
      const { data, error } = await supabaseService
        .from(this.TABLE_NAME)
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('bracket_type')
        .order('round_number')
        .order('match_number');

      if (error) {
        console.error('❌ Failed to get SABO matches:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('💥 Get SABO matches exception:', error);
      return [];
    }
  }
}
