require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixGroupB() {
  console.log('🎯 Fix Group B - Same logic as Group A\n');

  try {
    // 1. Get all Group B matches
    const { data: allMatchesB, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'B');

    if (error) {
      console.log('❌ Error:', error);
      return;
    }

    console.log(`📋 Group B total matches: ${allMatchesB.length}`);

    // 2. Check Winners Round 2 progress
    const winnersR2B = allMatchesB.filter(m => 
      m.bracket_type === 'group_b_winners' && 
      m.round_number === 2
    );

    console.log(`\n🏆 Group B Winners Round 2: ${winnersR2B.length} matches`);
    winnersR2B.forEach(match => {
      const p1 = match.player1_id ? '✅' : '❌';
      const p2 = match.player2_id ? '✅' : '❌';
      const winner = match.winner_id ? '🏆' : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2} W:${winner} Status:${match.status}`);
    });

    const completedWinnersR2B = winnersR2B.filter(m => m.status === 'completed' && m.winner_id);

    // 3. Check Losers Branch B
    const losersBB = allMatchesB.filter(m => 
      m.bracket_type === 'group_b_losers_b'
    );

    console.log(`\n💀 Group B Losers Branch B: ${losersBB.length} matches`);
    losersBB.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
      const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2} Status:${match.status}`);
    });

    // 4. Fix Losers B if Winners R2 completed
    if (completedWinnersR2B.length > 0) {
      console.log(`\n🔧 Fixing Group B Losers Branch B:`);
      console.log(`   ${completedWinnersR2B.length} completed Winners R2 → ${completedWinnersR2B.length} losers`);

      const losersFromR2B = [];
      completedWinnersR2B.forEach(match => {
        const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
        losersFromR2B.push(loserId);
        console.log(`   ${match.sabo_match_id}: Loser ${loserId.slice(0,8)}`);
      });

      // Distribute to Round 201
      const round201B = losersBB.filter(m => m.round_number === 201).sort((a,b) => a.match_number - b.match_number);
      console.log(`   Distributing to ${round201B.length} Round 201 matches`);

      for (let i = 0; i < Math.min(round201B.length, Math.ceil(losersFromR2B.length / 2)); i++) {
        const match = round201B[i];
        const loser1 = losersFromR2B[i * 2];
        const loser2 = losersFromR2B[i * 2 + 1];

        if (loser1 && loser2) {
          console.log(`   ${match.sabo_match_id}: ${loser1.slice(0,8)} vs ${loser2.slice(0,8)}`);
          
          const { error: updateError } = await supabase
            .from('sabo32_matches')
            .update({ 
              player1_id: loser1,
              player2_id: loser2,
              status: 'pending'
            })
            .eq('id', match.id);

          if (!updateError) {
            console.log(`   ✅ Updated ${match.sabo_match_id}`);
          }
        }
      }
    } else {
      console.log(`\n⚠️  Group B Winners R2 not completed yet (${completedWinnersR2B.length}/4)`);
      console.log(`   Need to complete Winners R2 first`);
    }

    // 5. Check Winners R3 and Finals readiness
    const winnersR3B = allMatchesB.filter(m => 
      m.bracket_type === 'group_b_winners' && 
      m.round_number === 3 && 
      m.status === 'completed'
    );

    const losersAFinalB = allMatchesB.filter(m => 
      m.bracket_type === 'group_b_losers_a' && 
      m.round_number === 103 && 
      m.status === 'completed'
    );

    const losersBFinalB = allMatchesB.filter(m => 
      m.bracket_type === 'group_b_losers_b' && 
      m.round_number === 202 && 
      m.status === 'completed'
    );

    console.log(`\n📊 Group B Progress:`);
    console.log(`   Winners R3 completed: ${winnersR3B.length}/2`);
    console.log(`   Losers A Final completed: ${losersAFinalB.length}/1`);
    console.log(`   Losers B Final completed: ${losersBFinalB.length}/1`);

    const readyForGroupFinal = winnersR3B.length + losersAFinalB.length + losersBFinalB.length;
    console.log(`   Ready for Group Final: ${readyForGroupFinal}/4 players`);

    if (readyForGroupFinal === 4) {
      console.log(`   🎯 Group B ready for Final setup!`);
    }

    // 6. Final state
    console.log(`\n📋 CURRENT GROUP B STATE:`);
    ['group_b_winners', 'group_b_losers_a', 'group_b_losers_b', 'group_b_final'].forEach(bracketType => {
      const matches = allMatchesB.filter(m => m.bracket_type === bracketType);
      if (matches.length > 0) {
        console.log(`\n   ${bracketType.toUpperCase()}:`);
        matches.slice(0, 3).forEach(match => {
          const p1 = match.player1_id ? '✅' : '❌';
          const p2 = match.player2_id ? '✅' : '❌';
          const winner = match.winner_id ? '🏆' : '❌';
          console.log(`     ${match.sabo_match_id}: P1:${p1} P2:${p2} W:${winner} (${match.status})`);
        });
        if (matches.length > 3) {
          console.log(`     ... và ${matches.length - 3} matches khác`);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixGroupB();
