require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Service key từ env
);

async function comprehensiveAdvanceCheck() {
  console.log('🔍 Kiểm tra toàn diện logic advance với service key...\n');

  try {
    // 1. Kiểm tra tất cả matches trong tournament
    console.log('📋 1. CHECKING CURRENT TOURNAMENT STATE:');
    const { data: allMatches, error: matchError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .order('group_id')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');

    if (matchError) {
      console.log('   ❌ Error:', matchError);
      return;
    }

    console.log(`   Total matches: ${allMatches.length}`);

    // 2. Phân tích Winners Round 2 
    console.log('\n📋 2. WINNERS ROUND 2 ANALYSIS:');
    const winnersR2 = allMatches.filter(m => m.bracket_type === 'winners' && m.round_number === 2);
    
    console.log(`   Total Winners R2 matches: ${winnersR2.length}`);
    
    winnersR2.forEach(match => {
      const hasWinner = match.winner_id ? '✅' : '❌';
      const loserId = match.winner_id ? 
        (match.player1_id === match.winner_id ? match.player2_id : match.player1_id) : 
        null;
      console.log(`   ${match.group_id} M${match.match_number}: ${match.status} Winner:${hasWinner} Loser:${loserId || 'TBD'}`);
    });

    // 3. Phân tích Losers Branch B
    console.log('\n📋 3. LOSERS BRANCH B ANALYSIS:');
    const losersB = allMatches.filter(m => 
      m.bracket_type === 'losers' && 
      m.round_number >= 201 && 
      m.round_number <= 202
    );
    
    console.log(`   Total Losers B matches: ${losersB.length}`);
    
    losersB.forEach(match => {
      const p1 = match.player1_id ? '✅' : '❌';
      const p2 = match.player2_id ? '❌' : '❌';
      console.log(`   ${match.group_id} R${match.round_number} M${match.match_number}: P1:${p1} P2:${p2} Status:${match.status}`);
    });

    // 4. Kiểm tra logic advance gap
    console.log('\n📋 4. ADVANCE LOGIC GAP ANALYSIS:');
    const completedWinnersR2 = winnersR2.filter(m => m.status === 'completed');
    console.log(`   Completed Winners R2: ${completedWinnersR2.length}/${winnersR2.length}`);

    const losersFromWinnersR2 = [];
    completedWinnersR2.forEach(match => {
      if (match.winner_id) {
        const loserId = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
        losersFromWinnersR2.push({
          loserId,
          fromMatch: match.match_id || match.id,
          group: match.group_id
        });
      }
    });

    console.log(`   Losers from Winners R2: ${losersFromWinnersR2.length}`);
    
    // Kiểm tra xem những losers này đã được advance chưa
    for (const loser of losersFromWinnersR2) {
      const inLosersB = losersB.some(m => 
        m.group_id === loser.group &&
        (m.player1_id === loser.loserId || m.player2_id === loser.loserId)
      );
      console.log(`   Loser ${loser.loserId} from ${loser.group}: ${inLosersB ? '✅ In Losers B' : '❌ Missing from Losers B'}`);
    }

    // 5. Kiểm tra empty slots trong Losers B
    console.log('\n📋 5. EMPTY SLOTS IN LOSERS B:');
    const emptyLosersB = losersB.filter(m => !m.player1_id && !m.player2_id);
    console.log(`   Empty Losers B matches: ${emptyLosersB.length}`);
    
    emptyLosersB.forEach(match => {
      console.log(`   ${match.group_id} R${match.round_number} M${match.match_number}: ${match.id}`);
    });

    // 6. Tự động fix missing advances
    console.log('\n📋 6. ATTEMPTING AUTO-FIX:');
    
    const missingAdvances = losersFromWinnersR2.filter(loser => {
      return !losersB.some(m => 
        m.group_id === loser.group &&
        (m.player1_id === loser.loserId || m.player2_id === loser.loserId)
      );
    });

    console.log(`   Missing advances to fix: ${missingAdvances.length}`);

    for (const missing of missingAdvances) {
      // Tìm empty slot trong cùng group
      const emptySlot = emptyLosersB.find(m => m.group_id === missing.group);
      
      if (emptySlot) {
        console.log(`   Fixing: Moving ${missing.loserId} to ${emptySlot.id}`);
        
        const { error: updateError } = await supabase
          .from('sabo32_matches')
          .update({ 
            player1_id: missing.loserId,
            status: 'pending'
          })
          .eq('id', emptySlot.id);

        if (updateError) {
          console.log(`   ❌ Fix error: ${updateError.message}`);
        } else {
          console.log(`   ✅ Fixed: ${missing.loserId} → ${emptySlot.id}`);
        }
      } else {
        console.log(`   ❌ No empty slot found for ${missing.loserId} in ${missing.group}`);
      }
    }

    // 7. Final state check
    console.log('\n📋 7. FINAL STATE AFTER FIX:');
    const { data: finalMatches, error: finalError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .in('bracket_type', ['losers'])
      .gte('round_number', 201)
      .lte('round_number', 202)
      .order('group_id')
      .order('round_number')
      .order('match_number');

    if (!finalError) {
      finalMatches.forEach(match => {
        const p1 = match.player1_id ? '✅' : '❌';
        const p2 = match.player2_id ? '✅' : '❌';
        console.log(`   ${match.group_id} R${match.round_number} M${match.match_number}: P1:${p1} P2:${p2}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

comprehensiveAdvanceCheck();
