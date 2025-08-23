require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixLosersRound201() {
  console.log('🎯 Fix Losers Branch B Round 201 Logic\n');

  try {
    const { data: allMatches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A');

    if (error) {
      console.log('❌ Error:', error);
      return;
    }

    // 1. Get 4 losers from Winners R2
    const winnersR2 = allMatches.filter(m => 
      m.bracket_type === 'group_a_winners' && 
      m.round_number === 2 && 
      m.status === 'completed' && 
      m.winner_id
    );

    console.log(`🏆 Winners R2 completed: ${winnersR2.length}/4`);
    const losersFromR2 = [];
    winnersR2.forEach(match => {
      const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
      losersFromR2.push(loserId);
      console.log(`   ${match.sabo_match_id}: Loser ${loserId.slice(0,8)}`);
    });

    // 2. Get Round 201 matches (should be 2 matches)
    const round201 = allMatches.filter(m => 
      m.bracket_type === 'group_a_losers_b' && 
      m.round_number === 201
    ).sort((a, b) => a.match_number - b.match_number);

    console.log(`\n💀 Round 201 matches: ${round201.length}`);
    round201.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
      const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

    // 3. Distribute 4 losers to 2 matches (2 each)
    console.log(`\n🔧 Distributing ${losersFromR2.length} losers to ${round201.length} matches:`);
    
    if (losersFromR2.length === 4 && round201.length === 2) {
      // Match 1: losers[0] vs losers[1]
      // Match 2: losers[2] vs losers[3]
      
      for (let i = 0; i < round201.length; i++) {
        const match = round201[i];
        const loser1 = losersFromR2[i * 2];
        const loser2 = losersFromR2[i * 2 + 1];
        
        console.log(`   ${match.sabo_match_id}: ${loser1.slice(0,8)} vs ${loser2.slice(0,8)}`);
        
        // Update match
        const { error: updateError } = await supabase
          .from('sabo32_matches')
          .update({ 
            player1_id: loser1,
            player2_id: loser2,
            status: 'pending'
          })
          .eq('id', match.id);

        if (updateError) {
          console.log(`   ❌ Error updating ${match.sabo_match_id}: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated ${match.sabo_match_id}`);
        }
      }
    } else {
      console.log(`   ❌ Mismatch: ${losersFromR2.length} losers for ${round201.length} matches`);
    }

    // 4. Verify final state
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

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixLosersRound201();
