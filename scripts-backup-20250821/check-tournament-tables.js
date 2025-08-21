import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournamentTables() {
  console.log('🔍 Checking tournament-related tables...');
  
  try {
    // Try to query tournament_matches table
    console.log('1. Checking tournament_matches table...');
    const { data: tournamentMatches, error: tmError } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, round_number, match_number, status, score_player1, score_player2')
      .limit(5);

    if (tmError) {
      console.log('❌ tournament_matches error:', tmError.message);
    } else {
      console.log('✅ tournament_matches exists:', tournamentMatches?.length || 0, 'records');
      if (tournamentMatches?.length > 0) {
        console.log('   Sample record:', tournamentMatches[0]);
      }
    }

    // Try to query tournament_matches table
    console.log('\n2. Checking tournament_matches table...');
    const { data: saboMatches, error: stmError } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, round_number, match_number, status')
      .limit(5);

    if (stmError) {
      console.log('❌ tournament_matches error:', stmError.message);
    } else {
      console.log('✅ tournament_matches exists:', saboMatches?.length || 0, 'records');
      if (saboMatches?.length > 0) {
        console.log('   Sample record:', saboMatches[0]);
      }
    }

    // Check tournaments table
    console.log('\n3. Checking tournaments table...');
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status')
      .limit(5);

    if (tError) {
      console.log('❌ tournaments error:', tError.message);
    } else {
      console.log('✅ tournaments exists:', tournaments?.length || 0, 'records');
      if (tournaments?.length > 0) {
        console.log('   Sample record:', tournaments[0]);
      }
    }

    // Test RPC function
    console.log('\n4. Testing submit_sabo_match_score function...');
    try {
      const { data: funcData, error: funcError } = await supabase
        .rpc('submit_sabo_match_score', {
          p_match_id: '00000000-0000-0000-0000-000000000000', // fake UUID
          p_player1_score: 1,
          p_player2_score: 0,
          p_submitted_by: '00000000-0000-0000-0000-000000000000'
        });

      if (funcError) {
        console.log('❌ Function error (expected):', funcError.message);
        if (funcError.message.includes('Match not found')) {
          console.log('✅ Function exists and works (just no match found)');
        }
      } else {
        console.log('Function result:', funcData);
      }
    } catch (e) {
      console.log('❌ Function test error:', e.message);
    }

  } catch (e) {
    console.error('💥 Check error:', e);
  }
}

checkTournamentTables();
