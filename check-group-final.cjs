require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkGroupFinal() {
  console.log('🏆 Check Group Final Structure\n');

  try {
    // 1. Check current Group Final matches
    const { data: groupFinal, error: gfError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_final')
      .order('round_number')
      .order('match_number');

    if (gfError) {
      console.log('❌ Error:', gfError);
      return;
    }

    console.log(`📋 Current Group Final matches: ${groupFinal.length}`);
    groupFinal.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
      const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2} Round:${match.round_number}`);
    });

    // 2. Check potential players for Group Final
    console.log(`\n📋 Potential players for Group Final:`);

    // Winners R3 winners (should be 2)
    const { data: winnersR3, error: wr3Error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_winners')
      .eq('round_number', 3)
      .eq('status', 'completed');

    console.log(`   Winners R3 completed: ${winnersR3?.length || 0}/2`);
    winnersR3?.forEach(match => {
      if (match.winner_id) {
        console.log(`     ${match.sabo_match_id}: Winner ${match.winner_id.slice(0,8)}`);
      }
    });

    // Losers A final winner
    const { data: losersAFinal, error: lafError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_a')
      .eq('status', 'completed')
      .order('round_number', { ascending: false })
      .limit(1);

    console.log(`   Losers A final: ${losersAFinal?.length || 0}`);
    if (losersAFinal && losersAFinal.length > 0) {
      const finalMatch = losersAFinal[0];
      console.log(`     ${finalMatch.sabo_match_id}: Winner ${finalMatch.winner_id?.slice(0,8) || 'TBD'}`);
    }

    // Losers B final winner (A-LB202M1)
    const { data: losersBFinal, error: lbfError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_b')
      .eq('round_number', 202)
      .eq('status', 'completed');

    console.log(`   Losers B final: ${losersBFinal?.length || 0}`);
    if (losersBFinal && losersBFinal.length > 0) {
      const finalMatch = losersBFinal[0];
      console.log(`     ${finalMatch.sabo_match_id}: Winner ${finalMatch.winner_id?.slice(0,8) || 'TBD'}`);
    }

    // 3. Suggest structure
    console.log(`\n💡 Suggested Group Final structure:`);
    console.log(`   Current: 1 match (A-FINAL)`);
    console.log(`   Logic: Need 4 players → 2 semifinal matches + 1 final?`);
    console.log(`   Or: 1 match with special seeding logic?`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkGroupFinal();
