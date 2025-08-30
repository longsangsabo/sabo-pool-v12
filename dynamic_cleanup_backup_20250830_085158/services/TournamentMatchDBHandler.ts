/**
 * DATABASE ERROR HANDLER FOR TOURNAMENT MATCHES
 * Handles common database issues when saving tournament matches
 * Uses service role to bypass RLS for bracket generation
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
        .from(tableName)
        .insert([testData])
        .select();

      if (error) {
        console.log(`❌ Test insert failed: ${error.message}`);
        return false;
      }

      console.log(`✅ Test insert successful`);
      
      // Clean up test data
      if (data && data.length > 0) {
        await supabaseService
          .from(tableName)
          .delete()
          .eq('id', data[0].id);
      }

      return true;
    } catch (error) {
      console.error(`💥 Test insert exception:`, error);
      return false;
    }
  }

  static sanitizeMatchData(match: any, tournamentId: string) {
    return {
      tournament_id: tournamentId,
      player1_id: match.player1_id || match.player1?.id || null,
      player2_id: match.player2_id || match.player2?.id || null,
      round_number: match.round_number || match.round || 1,
      match_number: match.match_number || match.matchNumber || 1,
      winner_id: match.winner_id || match.winnerId || null,
      status: match.status === 'scheduled' ? 'pending' : (match.status || 'pending'),
      score_player1: match.score_player1 || 0,
      score_player2: match.score_player2 || 0,
      bracket_type: match.bracket_type || match.bracketType || 'winner'
      // Removed: next_match_id (doesn't exist in schema)
      // Removed: created_at, updated_at (auto-generated)
    };
  }

  static async clearExistingMatches(tournamentId: string, tableName: string = 'tournament_matches'): Promise<boolean> {
    console.log('🗑️ Clearing existing matches...');
    
    try {
      const { error } = await supabaseService
        .from(tableName)
        .delete()
        .eq('tournament_id', tournamentId);

      if (error) {
        console.log('⚠️ Clear failed (may be empty):', error.message);
        return false;
      }

      console.log('✅ Existing matches cleared');
      return true;
    } catch (error) {
      console.error('💥 Clear exception:', error);
      return false;
    }
  }

  static async saveMatchesSafely(
    matches: any[], 
    tournamentId: string,
    tableName?: string
  ): Promise<number> {
    console.log('💾 Starting safe matches save...');
    console.log(`📊 Matches to save: ${matches.length}`);

    // 1. Auto-detect table if not provided
    const finalTableName = tableName || await this.findMatchesTable();
    
    // 2. Check table structure
    const { exists } = await this.checkTableStructure(finalTableName);
    if (!exists) {
      console.error('❌ Table not accessible');
      return 0;
    }

    // 3. Test insert permissions
    const canInsert = await this.testInsertPermission(finalTableName);
    if (!canInsert) {
      console.error('❌ No insert permission');
      return 0;
    }

    // 4. Clear existing matches
    await this.clearExistingMatches(tournamentId, finalTableName);

    // 5. Sanitize all match data
    const sanitizedMatches = matches.map(match => 
      this.sanitizeMatchData(match, tournamentId)
    );
    console.log(`📝 Sanitized ${sanitizedMatches.length} matches`);

    // 6. Save in small batches
    let savedCount = 0;
    const batchSize = 3;
    
    for (let i = 0; i < sanitizedMatches.length; i += batchSize) {
      const batch = sanitizedMatches.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(sanitizedMatches.length / batchSize);
      
      console.log(`📤 Batch ${batchNumber}/${totalBatches}`);

      try {
        const { data, error } = await supabaseService
          .from(finalTableName)
          .insert(batch)
          .select();

        if (error) {
          console.error(`❌ Batch ${batchNumber} failed:`, error.message);
          
          // Try individual saves for failed batch
          for (const match of batch) {
            try {
              await supabaseService.from(finalTableName).insert([match]);
              savedCount++;
              console.log(`✅ Individual save successful`);
            } catch (individualError) {
              console.error(`❌ Individual save failed:`, individualError);
            }
          }
        } else {
          savedCount += data.length;
          console.log(`✅ Batch saved: ${data.length} matches`);
        }
      } catch (batchError) {
        console.error(`💥 Batch ${batchNumber} exception:`, batchError);
      }
    }

    console.log(`✅ Total saved: ${savedCount}/${matches.length} matches`);
    return savedCount;
  }
}
