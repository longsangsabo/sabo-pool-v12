const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function correctLosersBracketLogic() {
  console.log('🔧 ĐÍNH CHÍNH LOSERS BRACKET LOGIC\n');
  console.log('=' .repeat(70));
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    console.log('\n📊 CORRECT LOSERS BRACKET STRUCTURE:');
    console.log('\n🏆 WINNERS BRACKET (mỗi group):');
    console.log('   Round 1: 8 matches (16→8 players) - 8 losers');
    console.log('   Round 2: 4 matches (8→4 players) - 4 losers'); 
    console.log('   Round 3: 2 matches (4→2 players) - 2 losers');
    console.log('   Winners Final: 1 match (2→1 winner) - 1 loser');

    console.log('\n💔 LOSERS BRACKET A (mỗi group):');
    console.log('   Input: 8 losers từ Winners R1');
    console.log('   Structure: 7 matches total');
    console.log('   - Round 1: 4 matches (8→4 players)');
    console.log('   - Round 2: 2 matches (4→2 players)'); 
    console.log('   - Round 3: 1 match (2→1 winner)');
    console.log('   Output: 1 người thắng Losers A');

    console.log('\n💔 LOSERS BRACKET B (mỗi group):');
    console.log('   Input: 4 losers từ Winners R2');
    console.log('   Structure: 3 matches total');
    console.log('   - Round 1: 2 matches (4→2 players)');
    console.log('   - Round 2: 1 match (2→1 winner)');
    console.log('   Output: 1 người thắng Losers B');

    console.log('\n🔄 LOSERS BRACKET INTEGRATION:');
    console.log('   - Losers A Winner vs 2 losers từ Winners R3');
    console.log('   - Losers B Winner joins above');
    console.log('   - Final elimination rounds → 1 Losers Champion');

    // Verify actual data
    console.log('\n📈 VERIFICATION WITH ACTUAL DATA:');
    
    const { data: allMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('bracket_type')
      .order('round_number');

    // Group by bracket type
    const matchesByType = {};
    allMatches?.forEach(match => {
      const type = match.bracket_type;
      if (!matchesByType[type]) matchesByType[type] = [];
      matchesByType[type].push(match);
    });

    console.log('\n🅰️ GROUP A VERIFICATION:');
    console.log(`   Winners Bracket: ${matchesByType['group_a_winners']?.length || 0} matches`);
    console.log(`   Losers A: ${matchesByType['group_a_losers_a']?.length || 0} matches (từ Winners R1)`);
    console.log(`   Losers B: ${matchesByType['group_a_losers_b']?.length || 0} matches (từ Winners R2)`);
    console.log(`   Group Final: ${matchesByType['group_a_final']?.length || 0} matches`);

    console.log('\n🅱️ GROUP B VERIFICATION:');
    console.log(`   Winners Bracket: ${matchesByType['group_b_winners']?.length || 0} matches`);
    console.log(`   Losers A: ${matchesByType['group_b_losers_a']?.length || 0} matches (từ Winners R1)`);
    console.log(`   Losers B: ${matchesByType['group_b_losers_b']?.length || 0} matches (từ Winners R2)`);
    console.log(`   Group Final: ${matchesByType['group_b_final']?.length || 0} matches`);

    console.log('\n🎯 CORRECTED LOGIC SUMMARY:');
    console.log('   Phase 1: Winners Bracket (16→2 players)');
    console.log('   Phase 2a: Losers A (8 losers từ Winners R1 → 1 survivor)');
    console.log('   Phase 2b: Losers B (4 losers từ Winners R2 → 1 survivor)');
    console.log('   Phase 3: Losers Integration + Final Rounds');
    console.log('   Phase 4: Group Finals (Winners Champ vs Losers Champ)');
    console.log('   Phase 5: Cross-Bracket Finals (4 players → 1 champion)');

    console.log('\n✅ ĐÍNH CHÍNH COMPLETED:');
    console.log('   - Losers A: xử lý losers từ Winners R1 only');
    console.log('   - Losers B: xử lý losers từ Winners R2 only'); 
    console.log('   - Separate processing, then integration later');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

correctLosersBracketLogic();
