require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixGroupASimple() {
  console.log('🎯 Simple Fix: Group A Losers Branch B\n');

  try {
    // 1. Get all Group A matches
    const { data: allMatches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A');

    if (error) {
      console.log('❌ Error:', error);
      return;
    }

    console.log(`📋 Found ${allMatches.length} Group A matches`);
    
    // Debug: show samples
    allMatches.slice(0, 5).forEach(m => {
      console.log(`   Sample: ${m.sabo_match_id} - ${m.bracket_type} R${m.round_number} Status:${m.status}`);
    });
    
    // Debug: check bracket types
    const bracketTypes = [...new Set(allMatches.map(m => m.bracket_type))];
    console.log(`   Bracket types found: ${bracketTypes.join(', ')}`);
    
    // Debug: check Winners R2
    const allWinnersR2 = allMatches.filter(m => 
      m.bracket_type === 'group_a_winners' && 
      m.round_number === 2
    );
    console.log(`   All Winners R2 (any status): ${allWinnersR2.length}`);
    allWinnersR2.forEach(m => {
      console.log(`     ${m.sabo_match_id}: Status:${m.status} Winner:${m.winner_id ? 'YES' : 'NO'}`);
    });

    // 2. Find Winners Round 2
    const winnersR2 = allMatches.filter(m => 
      m.bracket_type === 'group_a_winners' && 
      m.round_number === 2 && 
      m.status === 'completed' && 
      m.winner_id
    );

    console.log(`\n🏆 Winners Round 2 completed: ${winnersR2.length}`);
    const losersFromR2 = [];
    winnersR2.forEach(match => {
      const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
      losersFromR2.push(loserId);
      console.log(`   ${match.sabo_match_id}: Loser ${loserId.slice(0,8)}`);
    });

    // 3. Find Losers Branch B
    const losersB = allMatches.filter(m => 
      m.bracket_type === 'group_a_losers_b'
    );

    console.log(`\n💀 Losers Branch B: ${losersB.length} matches`);
    losersB.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
      const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

    // 4. Check missing
    console.log(`\n🔧 Checking missing advances:`);
    for (const loserId of losersFromR2) {
      const inLosersB = losersB.some(m => 
        m.player1_id === loserId || m.player2_id === loserId
      );
      console.log(`   ${loserId.slice(0,8)}: ${inLosersB ? '✅ Already placed' : '❌ MISSING'}`);
      
      if (!inLosersB) {
        // Find empty slot
        const emptySlot = losersB.find(m => !m.player1_id && !m.player2_id);
        const halfSlot = losersB.find(m => m.player1_id && !m.player2_id);
        
        if (emptySlot) {
          console.log(`     ➡️  Placing in ${emptySlot.sabo_match_id} as P1`);
          
          const { error: updateError } = await supabase
            .from('sabo32_matches')
            .update({ player1_id: loserId })
            .eq('id', emptySlot.id);

          if (!updateError) {
            console.log(`     ✅ Success`);
            emptySlot.player1_id = loserId;
          } else {
            console.log(`     ❌ Error: ${updateError.message}`);
          }
        } else if (halfSlot) {
          console.log(`     ➡️  Placing in ${halfSlot.sabo_match_id} as P2`);
          
          const { error: updateError } = await supabase
            .from('sabo32_matches')
            .update({ player2_id: loserId })
            .eq('id', halfSlot.id);

          if (!updateError) {
            console.log(`     ✅ Success`);
            halfSlot.player2_id = loserId;
          } else {
            console.log(`     ❌ Error: ${updateError.message}`);
          }
        } else {
          console.log(`     ❌ No available slots`);
        }
      }
    }

    // 5. Final check
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
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixGroupASimple();
