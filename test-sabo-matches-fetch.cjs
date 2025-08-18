// Test script để kiểm tra hook useSABOTournamentMatches
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchMatches() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f'; // test1 tournament
  
  console.log('🎯 Testing SABO matches fetch for tournament:', tournamentId);
  
  try {
    // Test 1: Direct query like in hook
    console.log('\n📡 Test 1: Direct query from sabo_tournament_matches');
    const result1 = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });
      
    console.log('Result 1:', {
      data: result1.data?.length || 0,
      error: result1.error?.message || 'none'
    });
    
    if (result1.data && result1.data.length > 0) {
      console.log('✅ First match sample:', result1.data[0]);
      console.log('🔍 Fields available:', Object.keys(result1.data[0]));
    }
    
    // Test 2: Alternative query with specific columns
    console.log('\n📡 Test 2: Alternative query with specific columns');
    const result2 = await supabase
      .from('sabo_tournament_matches')
      .select(`
        id,
        tournament_id,
        round_number,
        match_number,
        player1_id,
        player2_id,
        winner_id,
        status,
        bracket_type,
        branch_type,
        score_player1,
        score_player2,
        sabo_match_id
      `)
      .eq('tournament_id', tournamentId);
      
    console.log('Result 2:', {
      data: result2.data?.length || 0,
      error: result2.error?.message || 'none'
    });
    
    // Test 3: Count total matches
    console.log('\n📊 Test 3: Count total matches');
    const countResult = await supabase
      .from('sabo_tournament_matches')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId);
      
    console.log('Total matches count:', countResult.count);
    
    // Test 4: Group by bracket type
    console.log('\n📊 Test 4: Group by bracket type');
    const groupResult = await supabase
      .from('sabo_tournament_matches')
      .select('bracket_type, id')
      .eq('tournament_id', tournamentId);
      
    if (groupResult.data) {
      const grouped = groupResult.data.reduce((acc, match) => {
        acc[match.bracket_type] = (acc[match.bracket_type] || 0) + 1;
        return acc;
      }, {});
      console.log('Matches by bracket type:', grouped);
    }
    
  } catch (error) {
    console.error('❌ Error testing matches fetch:', error);
  }
}

testFetchMatches();
