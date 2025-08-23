require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugQuery() {
  console.log('🔍 Debug query issues...\n');

  try {
    // Test 1: Basic connection
    const { data: count, error: countError } = await supabase
      .from('sabo32_matches')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019');

    console.log(`📋 Total matches in tournament: ${count?.length || 'Error'}`);
    if (countError) console.log('   Error:', countError);

    // Test 2: Check Group A Winners  
    const { data: gaWinners, error: gaError } = await supabase
      .from('sabo32_matches')
      .select('bracket_type, round_number, status, sabo_match_id')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_A_WINNERS');

    console.log(`\n📋 Group A Winners matches: ${gaWinners?.length || 0}`);
    gaWinners?.forEach(m => {
      console.log(`   ${m.sabo_match_id}: R${m.round_number} - ${m.status}`);
    });

    // Test 3: Check Round 2 specifically  
    const { data: r2Matches, error: r2Error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_A_WINNERS')
      .eq('round_number', 2);

    console.log(`\n📋 Group A Winners Round 2: ${r2Matches?.length || 0}`);
    r2Matches?.forEach(m => {
      console.log(`   ${m.sabo_match_id}: ${m.status} - W:${m.winner_id ? '✅' : '❌'}`);
    });

    // Test 4: Check completed specifically
    const { data: completedR2, error: compError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_A_WINNERS')
      .eq('round_number', 2)
      .eq('status', 'completed');

    console.log(`\n📋 Group A Winners R2 COMPLETED: ${completedR2?.length || 0}`);
    completedR2?.forEach(m => {
      const loserId = m.player1_id === m.winner_id ? m.player2_id : m.player1_id;
      console.log(`   ${m.sabo_match_id}: Winner:${m.winner_id}, Loser:${loserId}`);
    });

    // Test 5: Check Losers B
    const { data: losersB, error: lbError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_A_LOSERS_B');

    console.log(`\n📋 Group A Losers B: ${losersB?.length || 0}`);
    losersB?.forEach(m => {
      const p1 = m.player1_id ? '✅' : '❌';
      const p2 = m.player2_id ? '✅' : '❌';
      console.log(`   ${m.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugQuery();
