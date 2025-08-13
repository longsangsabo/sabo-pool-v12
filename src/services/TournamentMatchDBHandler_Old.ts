/**
 * DATABASE ERROR HANDLER FOR TOURNAMENT MATCHES
 * Handles common database issues when saving tournament matches
 */

import { supabaseService } from '@/integrations/supabase/service';

export class TournamentMatchDBHandler {
  static async checkTableStructure(tableName: string = 'tournament_matches') {
    console.log(`🔍 Checking table structure: ${tableName}`);
    
    try {
      // Test basic access
      const { data, error } = await supabaseService
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table ${tableName} access failed:`, error);
        return { exists: false, error };
      }

      console.log(`✅ Table ${tableName} accessible`);
      return { exists: true, data };
    } catch (error) {
      console.error(`💥 Exception checking table ${tableName}:`, error);
      return { exists: false, error };
    }
  }

  static async findMatchesTable(): Promise<string> {
    console.log('🔍 Auto-detecting matches table...');
    
    const possibleTables = [
      'tournament_matches',
      'matches', 
      'tournament_match',
      'match'
    ];

    for (const tableName of possibleTables) {
      const { exists } = await this.checkTableStructure(tableName);
      if (exists) {
        console.log(`✅ Found matches table: ${tableName}`);
        return tableName;
      }
    }

    console.log('❌ No matches table found, defaulting to tournament_matches');
    return 'tournament_matches';
  }

  static async testInsertPermission(tableName: string = 'tournament_matches'): Promise<boolean> {
    console.log(`🧪 Testing insert to ${tableName}...`);
    
    try {
      const testData = {
        tournament_id: '00000000-0000-0000-0000-000000000000',
        player1_id: '00000000-0000-0000-0000-000000000000',
        player2_id: '00000000-0000-0000-0000-000000000000',
        round_number: -999,
        match_number: -999,
        status: 'test'
      };

      const { data, error } = await supabaseService

  static sanitizeMatchData(match: any, tournamentId: string) {
    // Clean and validate match data
    const sanitized = {
      tournament_id: tournamentId,
      round_number: match.round_number || 1,
      match_number: match.match_number || 1,
      player1_id: match.player1_id || null,
      player2_id: match.player2_id || null,
      winner_id: match.winner_id || null,
      status: match.status || 'scheduled',
      score_player1: match.score_player1 || null,
      score_player2: match.score_player2 || null,
      bracket_type: match.bracket_type || 'winner',
      next_match_id: match.next_match_id || null
    };

    // Remove any null/undefined values that might cause issues
    return Object.fromEntries(
      Object.entries(sanitized).filter(([_, value]) => value !== undefined)
    );
  }

  static async testInsert(tableName: string, tournamentId: string) {
    console.log(`🧪 Testing insert to ${tableName}...`);
    
    const testMatch = this.sanitizeMatchData({
      round_number: 1,
      match_number: 999, // Use high number to avoid conflicts
      status: 'scheduled',
      bracket_type: 'winner'
    }, tournamentId);

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([testMatch])
        .select();

      if (error) {
        console.error('❌ Test insert failed:', error);
        return { success: false, error };
      }

      // Clean up test data
      await supabase
        .from(tableName)
        .delete()
        .eq('match_number', 999)
        .eq('tournament_id', tournamentId);

      console.log('✅ Test insert successful');
      return { success: true, data };
    } catch (error) {
      console.error('💥 Test insert exception:', error);
      return { success: false, error };
    }
  }

  static async saveMatchesSafely(matches: any[], tournamentId: string) {
    console.log('💾 Starting safe matches save...');
    
    // Find working table
    const tableName = await this.findMatchesTable();
    if (!tableName) {
      throw new Error('No accessible matches table found');
    }

    // Test insert
    const testResult = await this.testInsert(tableName, tournamentId);
    if (!testResult.success) {
      throw new Error(`Insert test failed: ${testResult.error?.message}`);
    }

    // Clear existing matches
    console.log('🗑️ Clearing existing matches...');
    try {
      await supabase
        .from(tableName)
        .delete()
        .eq('tournament_id', tournamentId);
    } catch (error) {
      console.warn('⚠️ Could not clear existing matches:', error);
    }

    // Sanitize all matches
    const sanitizedMatches = matches.map(match => 
      this.sanitizeMatchData(match, tournamentId)
    );

    console.log(`📝 Sanitized ${sanitizedMatches.length} matches`);

    // Insert in small batches with error recovery
    const batchSize = 3;
    let totalSaved = 0;

    for (let i = 0; i < sanitizedMatches.length; i += batchSize) {
      const batch = sanitizedMatches.slice(i, i + batchSize);
      console.log(`📤 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sanitizedMatches.length / batchSize)}`);
      
      try {
        const { error } = await supabase
          .from(tableName)
          .insert(batch);

        if (error) {
          console.error(`❌ Batch failed:`, error);
          
          // Try individual inserts
          for (const match of batch) {
            try {
              await supabase.from(tableName).insert([match]);
              totalSaved++;
            } catch (individualError) {
              console.error('❌ Individual match failed:', match, individualError);
            }
          }
        } else {
          totalSaved += batch.length;
          console.log(`✅ Batch saved: ${batch.length} matches`);
        }
      } catch (error) {
        console.error(`💥 Batch exception:`, error);
      }
    }

    console.log(`✅ Total saved: ${totalSaved}/${sanitizedMatches.length} matches`);
    return totalSaved;
  }
}
