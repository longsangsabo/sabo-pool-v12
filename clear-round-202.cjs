require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function clearRound202() {
  console.log('🔧 Clear A-LB202M1 - should wait for Round 201 winners\n');

  try {
    // Find A-LB202M1 
    const { data: round202, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_b')
      .eq('round_number', 202);

    if (error) {
      console.log('❌ Error:', error);
      return;
    }

    console.log(`📋 Found ${round202.length} Round 202 matches:`);
    round202.forEach(match => {
      const p1 = match.player1_id ? `${match.player1_id.slice(0,8)}` : 'NULL';
      const p2 = match.player2_id ? `${match.player2_id.slice(0,8)}` : 'NULL';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

    // Clear A-LB202M1
    if (round202.length > 0) {
      const match = round202[0]; // A-LB202M1
      
      console.log(`\n🔧 Clearing ${match.sabo_match_id}...`);
      
      const { error: clearError } = await supabase
        .from('sabo32_matches')
        .update({ 
          player1_id: null,
          player2_id: null,
          winner_id: null,
          score_player1: 0,
          score_player2: 0,
          status: 'pending'
        })
        .eq('id', match.id);

      if (clearError) {
        console.log(`❌ Error clearing: ${clearError.message}`);
      } else {
        console.log(`✅ Cleared ${match.sabo_match_id} - now waiting for Round 201 winners`);
      }
    }

    // Verify final state
    console.log(`\n📋 FINAL STATE:`);
    const { data: finalCheck } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_b')
      .order('round_number')
      .order('match_number');

    finalCheck?.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
      const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2} Status:${match.status}`);
    });

    console.log(`\n✅ Logic hoàn chỉnh:`);
    console.log(`   Round 201: 4 losers từ Winners R2 → 2 matches`);
    console.log(`   Round 202: 2 winners từ Round 201 → 1 match (chờ complete)`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearRound202();
