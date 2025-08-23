require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function advanceToRound202() {
  console.log('🎯 Advance winners from Round 201 to Round 202\n');

  try {
    // 1. Get Round 201 completed matches
    const { data: round201, error: r201Error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_b')
      .eq('round_number', 201)
      .eq('status', 'completed')
      .order('match_number');

    if (r201Error) {
      console.log('❌ Error:', r201Error);
      return;
    }

    console.log(`📋 Round 201 completed matches: ${round201.length}`);
    const winnersFromR201 = [];
    
    round201.forEach(match => {
      if (match.winner_id) {
        winnersFromR201.push(match.winner_id);
        console.log(`   ${match.sabo_match_id}: Winner ${match.winner_id.slice(0,8)}`);
      } else {
        console.log(`   ${match.sabo_match_id}: ❌ No winner yet`);
      }
    });

    // 2. Get Round 202 match
    const { data: round202, error: r202Error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_losers_b')
      .eq('round_number', 202);

    if (r202Error) {
      console.log('❌ Error:', r202Error);
      return;
    }

    console.log(`\n📋 Round 202 matches: ${round202.length}`);
    if (round202.length > 0) {
      const match202 = round202[0]; // A-LB202M1
      const p1 = match202.player1_id ? `${match202.player1_id.slice(0,8)}` : 'NULL';
      const p2 = match202.player2_id ? `${match202.player2_id.slice(0,8)}` : 'NULL';
      console.log(`   ${match202.sabo_match_id}: P1:${p1} P2:${p2}`);
    }

    // 3. Advance winners if we have 2
    if (winnersFromR201.length === 2 && round202.length > 0) {
      const match202 = round202[0];
      const winner1 = winnersFromR201[0];
      const winner2 = winnersFromR201[1];
      
      console.log(`\n🔧 Advancing to ${match202.sabo_match_id}:`);
      console.log(`   ${winner1.slice(0,8)} vs ${winner2.slice(0,8)}`);
      
      const { error: updateError } = await supabase
        .from('sabo32_matches')
        .update({ 
          player1_id: winner1,
          player2_id: winner2,
          status: 'pending'
        })
        .eq('id', match202.id);

      if (updateError) {
        console.log(`❌ Error: ${updateError.message}`);
      } else {
        console.log(`✅ Successfully advanced 2 winners to Round 202`);
      }
    } else {
      console.log(`\n⚠️  Cannot advance:`);
      console.log(`   Winners from R201: ${winnersFromR201.length}/2`);
      console.log(`   Round 202 matches: ${round202.length}/1`);
    }

    // 4. Final verification
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
      const winner = match.winner_id ? `🏆(${match.winner_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2} Winner:${winner} Status:${match.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

advanceToRound202();
