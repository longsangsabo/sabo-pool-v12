require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdvanceLogicCorrect() {
  console.log('🔧 Fixing advance logic (corrected)...\n');

  try {
    // 1. Lấy Group A Winners Round 2 (đã completed)
    const { data: groupAWinnersR2, error: gaError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_A_WINNERS')
      .eq('round_number', 2)
      .eq('status', 'completed');

    if (gaError) {
      console.log('❌ Error:', gaError);
      return;
    }

    console.log(`📋 Group A Winners R2 completed: ${groupAWinnersR2.length}/4`);
    const groupALosers = [];
    groupAWinnersR2.forEach(match => {
      const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
      groupALosers.push(loserId);
      console.log(`   ${match.sabo_match_id}: Winner:${match.winner_id}, Loser:${loserId}`);
    });

    // 2. Lấy Group A Losers B 
    const { data: groupALosersB, error: galbError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_A_LOSERS_B')
      .order('round_number')
      .order('match_number');

    if (galbError) {
      console.log('❌ Error:', galbError);
      return;
    }

    console.log(`\n📋 Group A Losers B state:`);
    groupALosersB.forEach(match => {
      const p1 = match.player1_id ? '✅' : '❌';
      const p2 = match.player2_id ? '✅' : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1}(${match.player1_id || 'null'}) P2:${p2}(${match.player2_id || 'null'})`);
    });

    // 3. Fix Group A missing advances
    console.log(`\n🔧 FIXING GROUP A:`);
    console.log(`   Need to place ${groupALosers.length} losers: ${groupALosers.join(', ')}`);

    for (const loserId of groupALosers) {
      // Kiểm tra đã được place chưa
      const alreadyPlaced = groupALosersB.some(m => 
        m.player1_id === loserId || m.player2_id === loserId
      );

      if (!alreadyPlaced) {
        console.log(`   🔍 Need to place loser: ${loserId}`);
        
        // Tìm empty slot
        const emptySlot = groupALosersB.find(m => !m.player1_id && !m.player2_id);
        
        if (emptySlot) {
          console.log(`   ➡️  Placing in ${emptySlot.sabo_match_id} as player1`);
          
          const { error: updateError } = await supabase
            .from('sabo32_matches')
            .update({ player1_id: loserId })
            .eq('id', emptySlot.id);

          if (updateError) {
            console.log(`   ❌ Error: ${updateError.message}`);
          } else {
            console.log(`   ✅ Placed ${loserId} in ${emptySlot.sabo_match_id}`);
            // Update local array
            emptySlot.player1_id = loserId;
          }
        } else {
          // Tìm slot có 1 player
          const halfSlot = groupALosersB.find(m => m.player1_id && !m.player2_id);
          
          if (halfSlot) {
            console.log(`   ➡️  Placing in ${halfSlot.sabo_match_id} as player2`);
            
            const { error: updateError } = await supabase
              .from('sabo32_matches')
              .update({ player2_id: loserId })
              .eq('id', halfSlot.id);

            if (updateError) {
              console.log(`   ❌ Error: ${updateError.message}`);
            } else {
              console.log(`   ✅ Placed ${loserId} in ${halfSlot.sabo_match_id} as player2`);
              // Update local array
              halfSlot.player2_id = loserId;
            }
          } else {
            console.log(`   ❌ No slots available for ${loserId}`);
          }
        }
      } else {
        console.log(`   ✅ ${loserId} already placed`);
      }
    }

    // 4. Kiểm tra Group B (nếu có Winners R2 completed)
    const { data: groupBWinnersR2, error: gbError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('bracket_type', 'GROUP_B_WINNERS')
      .eq('round_number', 2)
      .eq('status', 'completed');

    if (!gbError && groupBWinnersR2.length > 0) {
      console.log(`\n📋 Group B Winners R2 completed: ${groupBWinnersR2.length}/4`);
      
      // Similar logic for Group B...
      const groupBLosers = [];
      groupBWinnersR2.forEach(match => {
        const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
        groupBLosers.push(loserId);
      });

      if (groupBLosers.length > 0) {
        const { data: groupBLosersB } = await supabase
          .from('sabo32_matches')
          .select('*')
          .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
          .eq('bracket_type', 'GROUP_B_LOSERS_B')
          .order('round_number')
          .order('match_number');

        console.log(`🔧 FIXING GROUP B: ${groupBLosers.length} losers to place`);
        // Apply same logic...
      }
    } else {
      console.log(`\n📋 Group B Winners R2: Not completed yet (${groupBWinnersR2?.length || 0}/4)`);
    }

    // 5. Final check
    console.log(`\n📋 FINAL STATE:`);
    const { data: finalCheck } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .in('bracket_type', ['GROUP_A_LOSERS_B', 'GROUP_B_LOSERS_B'])
      .order('group_id')
      .order('round_number')
      .order('match_number');

    finalCheck?.forEach(match => {
      const p1 = match.player1_id ? '✅' : '❌';
      const p2 = match.player2_id ? '✅' : '❌';
      console.log(`   ${match.group_id} ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdvanceLogicCorrect();
