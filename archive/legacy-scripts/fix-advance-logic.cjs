require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdvanceLogic() {
  console.log('🔧 Fixing advance logic for SABO-32...\n');

  try {
    // 1. Lấy tất cả Winners Round 2 completed matches
    const { data: winnersR2, error: winnersError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .in('bracket_type', ['GROUP_A_WINNERS', 'GROUP_B_WINNERS'])
      .eq('round_number', 2)
      .eq('status', 'completed');

    if (winnersError) {
      console.log('❌ Error fetching Winners R2:', winnersError);
      return;
    }

    console.log(`📋 Found ${winnersR2.length} completed Winners R2 matches:`);
    winnersR2.forEach(match => {
      const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
      console.log(`   ${match.group_id} ${match.sabo_match_id}: Winner:${match.winner_id}, Loser:${loserId}`);
    });

    // 2. Lấy tất cả Losers Branch B matches
    const { data: losersB, error: losersBError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .in('bracket_type', ['GROUP_A_LOSERS_B', 'GROUP_B_LOSERS_B'])
      .order('group_id')
      .order('round_number')
      .order('match_number');

    if (losersBError) {
      console.log('❌ Error fetching Losers B:', losersBError);
      return;
    }

    console.log(`\n📋 Losers Branch B current state:`);
    losersB.forEach(match => {
      const p1 = match.player1_id ? '✅' : '❌';
      const p2 = match.player2_id ? '✅' : '❌';
      console.log(`   ${match.group_id} ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

    // 3. Fix missing advances
    console.log(`\n🔧 FIXING MISSING ADVANCES:`);

    for (const winnersMatch of winnersR2) {
      const loserId = winnersMatch.player1_id === winnersMatch.winner_id ? 
        winnersMatch.player2_id : winnersMatch.player1_id;
      
      // Kiểm tra loser đã được advance chưa
      const alreadyAdvanced = losersB.some(m => 
        m.group_id === winnersMatch.group_id &&
        (m.player1_id === loserId || m.player2_id === loserId)
      );

      if (!alreadyAdvanced) {
        console.log(`   🔍 Loser ${loserId} from ${winnersMatch.sabo_match_id} needs advance`);
        
        // Tìm empty slot trong Losers B cùng group
        const emptySlot = losersB.find(m => 
          m.group_id === winnersMatch.group_id &&
          !m.player1_id && !m.player2_id
        );

        if (emptySlot) {
          console.log(`   ➡️  Advancing to ${emptySlot.sabo_match_id}`);
          
          const { error: updateError } = await supabase
            .from('sabo32_matches')
            .update({ 
              player1_id: loserId,
              status: 'pending'
            })
            .eq('id', emptySlot.id);

          if (updateError) {
            console.log(`   ❌ Error: ${updateError.message}`);
          } else {
            console.log(`   ✅ Advanced ${loserId} to ${emptySlot.sabo_match_id}`);
          }
        } else {
          // Tìm slot có 1 player để làm player2
          const halfFullSlot = losersB.find(m => 
            m.group_id === winnersMatch.group_id &&
            m.player1_id && !m.player2_id
          );

          if (halfFullSlot) {
            console.log(`   ➡️  Adding as player2 to ${halfFullSlot.sabo_match_id}`);
            
            const { error: updateError } = await supabase
              .from('sabo32_matches')
              .update({ 
                player2_id: loserId,
                status: 'pending'
              })
              .eq('id', halfFullSlot.id);

            if (updateError) {
              console.log(`   ❌ Error: ${updateError.message}`);
            } else {
              console.log(`   ✅ Added ${loserId} as player2 to ${halfFullSlot.sabo_match_id}`);
            }
          } else {
            console.log(`   ❌ No empty slots found for ${loserId} in group ${winnersMatch.group_id}`);
          }
        }
      } else {
        console.log(`   ✅ Loser ${loserId} already advanced`);
      }
    }

    // 4. Final verification
    console.log(`\n📋 FINAL VERIFICATION:`);
    const { data: finalLosersB, error: finalError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .in('bracket_type', ['GROUP_A_LOSERS_B', 'GROUP_B_LOSERS_B'])
      .order('group_id')
      .order('round_number')
      .order('match_number');

    if (!finalError) {
      finalLosersB.forEach(match => {
        const p1 = match.player1_id ? '✅' : '❌';
        const p2 = match.player2_id ? '✅' : '❌';
        console.log(`   ${match.group_id} ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdvanceLogic();
