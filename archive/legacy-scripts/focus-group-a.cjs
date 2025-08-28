require('dotenv').config();    console.log(`   Found ${allGroupA.length} Group A matches`);
    
    // Debug: show all bracket types
    const bracketTypes = [...new Set(allGroupA.map(m => m.bracket_type))];
    console.log(`   Bracket types: ${bracketTypes.join(', ')}`);
    
    // Debug: show round numbers for each type
    bracketTypes.forEach(type => {
      const rounds = [...new Set(allGroupA.filter(m => m.bracket_type === type).map(m => m.round_number))].sort();
      console.log(`   ${type}: rounds ${rounds.join(', ')}`);
    });const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function focusGroupAOnly() {
  console.log('🎯 FOCUS: Group A Losers Branch B ONLY\n');

  try {
    // 1. Debug query - lấy ALL matches của Group A
    console.log('🔍 Step 1: ALL Group A matches');
    const { data: allGroupA, error: allError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('group_id', 'A')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');

    if (allError) {
      console.log('❌ Error:', allError);
      return;
    }

    console.log(`   Found ${allGroupA.length} Group A matches\n`);

    // 2. Focus on Winners Round 2
    console.log('🏆 Step 2: Group A Winners Round 2');
    const winnersR2 = allGroupA.filter(m => 
      m.bracket_type === 'GROUP_A_WINNERS' && 
      m.round_number === 2
    );

    console.log(`   Found ${winnersR2.length} Winners R2 matches:`);
    const losersFromR2 = [];
    
    winnersR2.forEach(match => {
      const hasWinner = match.winner_id ? '✅' : '❌';
      const status = match.status;
      let loserId = null;
      
      if (match.winner_id) {
        loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
        losersFromR2.push(loserId);
      }
      
      console.log(`   ${match.sabo_match_id}: ${status} Winner:${hasWinner} Loser:${loserId || 'TBD'}`);
    });

    console.log(`   Total losers from Winners R2: ${losersFromR2.length}\n`);

    // 3. Focus on Losers Branch B
    console.log('💀 Step 3: Group A Losers Branch B');
    const losersB = allGroupA.filter(m => 
      m.bracket_type === 'GROUP_A_LOSERS_B'
    );

    console.log(`   Found ${losersB.length} Losers B matches:`);
    losersB.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id})` : '❌(null)';
      const p2 = match.player2_id ? `✅(${match.player2_id})` : '❌(null)';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

    // 4. Find missing placements
    console.log(`\n🔧 Step 4: Find missing placements`);
    const missingLosers = losersFromR2.filter(loserId => {
      const placed = losersB.some(m => 
        m.player1_id === loserId || m.player2_id === loserId
      );
      return !placed;
    });

    console.log(`   Missing losers: ${missingLosers.length}`);
    missingLosers.forEach(loserId => {
      console.log(`   - ${loserId} needs placement`);
    });

    // 5. Fix missing placements
    if (missingLosers.length > 0) {
      console.log(`\n✨ Step 5: Fix missing placements`);
      
      for (const loserId of missingLosers) {
        // Find empty slot
        const emptySlot = losersB.find(m => !m.player1_id && !m.player2_id);
        
        if (emptySlot) {
          console.log(`   Placing ${loserId} in ${emptySlot.sabo_match_id} as player1`);
          
          const { error: updateError } = await supabase
            .from('sabo32_matches')
            .update({ player1_id: loserId })
            .eq('id', emptySlot.id);

          if (updateError) {
            console.log(`   ❌ Error: ${updateError.message}`);
          } else {
            console.log(`   ✅ SUCCESS: ${loserId} → ${emptySlot.sabo_match_id}`);
            emptySlot.player1_id = loserId; // Update local state
          }
        } else {
          // Find half-filled slot
          const halfSlot = losersB.find(m => m.player1_id && !m.player2_id);
          
          if (halfSlot) {
            console.log(`   Placing ${loserId} in ${halfSlot.sabo_match_id} as player2`);
            
            const { error: updateError } = await supabase
              .from('sabo32_matches')
              .update({ player2_id: loserId })
              .eq('id', halfSlot.id);

            if (updateError) {
              console.log(`   ❌ Error: ${updateError.message}`);
            } else {
              console.log(`   ✅ SUCCESS: ${loserId} → ${halfSlot.sabo_match_id} (P2)`);
              halfSlot.player2_id = loserId; // Update local state
            }
          } else {
            console.log(`   ❌ No available slots for ${loserId}`);
          }
        }
      }
    } else {
      console.log(`\n✅ All Winners R2 losers already placed correctly`);
    }

    // 6. Final verification
    console.log(`\n📋 FINAL: Group A Losers Branch B`);
    const { data: finalCheck, error: finalError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'GROUP_A_LOSERS_B')
      .order('round_number')
      .order('match_number');

    if (!finalError) {
      finalCheck.forEach(match => {
        const p1 = match.player1_id ? '✅' : '❌';
        const p2 = match.player2_id ? '✅' : '❌';
        console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2} Status:${match.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

focusGroupAOnly();
