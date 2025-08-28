require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function getFullUUIDs() {
  console.log('🔍 Get full UUIDs for Group Final\n');

  try {
    // 1. Winners R3 winners
    const { data: winnersR3, error: wr3Error } = await supabase
      .from('sabo32_matches')
      .select('sabo_match_id, winner_id')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_winners')
      .eq('round_number', 3)
      .eq('status', 'completed')
      .order('match_number');

    console.log(`📋 Winners R3:`);
    winnersR3?.forEach(match => {
      console.log(`   ${match.sabo_match_id}: ${match.winner_id}`);
    });

    // 2. Losers A final
    const { data: losersA, error: laError } = await supabase
      .from('sabo32_matches')
      .select('sabo_match_id, winner_id')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_a')
      .eq('round_number', 103)
      .eq('status', 'completed');

    console.log(`\n📋 Losers A Final:`);
    losersA?.forEach(match => {
      console.log(`   ${match.sabo_match_id}: ${match.winner_id}`);
    });

    // 3. Losers B final
    const { data: losersB, error: lbError } = await supabase
      .from('sabo32_matches')
      .select('sabo_match_id, winner_id')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_b')
      .eq('round_number', 202)
      .eq('status', 'completed');

    console.log(`\n📋 Losers B Final:`);
    losersB?.forEach(match => {
      console.log(`   ${match.sabo_match_id}: ${match.winner_id}`);
    });

    // 4. Setup with correct UUIDs
    if (winnersR3?.length >= 2 && losersA?.length >= 1 && losersB?.length >= 1) {
      const players = {
        winner1: winnersR3[0].winner_id,
        winner2: winnersR3[1].winner_id,
        loserA: losersA[0].winner_id,
        loserB: losersB[0].winner_id
      };

      console.log(`\n🔧 Setting up Group Final with correct UUIDs:`);

      // Update A-FINAL (Match 1)
      const { error: update1Error } = await supabase
        .from('sabo32_matches')
        .update({
          player1_id: players.winner1,
          player2_id: players.loserA,
          status: 'pending'
        })
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('sabo_match_id', 'A-FINAL');

      if (update1Error) {
        console.log(`❌ Error A-FINAL: ${update1Error.message}`);
      } else {
        console.log(`✅ A-FINAL: Winner1 vs LoserA`);
      }

      // Update A-FINAL2 (Match 2)
      const { error: update2Error } = await supabase
        .from('sabo32_matches')
        .update({
          player1_id: players.winner2,
          player2_id: players.loserB,
          status: 'pending'
        })
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('sabo_match_id', 'A-FINAL2');

      if (update2Error) {
        console.log(`❌ Error A-FINAL2: ${update2Error.message}`);
      } else {
        console.log(`✅ A-FINAL2: Winner2 vs LoserB`);
      }

      // Verify
      console.log(`\n📋 VERIFICATION:`);
      const { data: verification } = await supabase
        .from('sabo32_matches')
        .select('sabo_match_id, player1_id, player2_id')
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('group_id', 'A')
        .eq('bracket_type', 'group_a_final')
        .order('match_number');

      verification?.forEach(match => {
        const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
        const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
        console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getFullUUIDs();
