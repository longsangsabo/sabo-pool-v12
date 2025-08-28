const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function reviewTournamentLogic() {
  console.log('🏆 REVIEWING COMPLETE TOURNAMENT LOGIC - 32 PLAYERS DOUBLE ELIMINATION\n');
  console.log('=' .repeat(80));
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Tournament Overview
    console.log('\n1. 📊 TOURNAMENT OVERVIEW:');
    console.log('   Format: Double Elimination');
    console.log('   Players: 32 total');
    console.log('   Structure: Two Groups (A & B) + Cross-Bracket Finals');
    
    // Get all matches by bracket type
    const { data: allMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number')
      .order('bracket_type')
      .order('match_number');

    // Count matches by bracket type
    const matchesByType = {};
    allMatches?.forEach(match => {
      const type = match.bracket_type;
      if (!matchesByType[type]) matchesByType[type] = [];
      matchesByType[type].push(match);
    });

    console.log(`\n   Total Matches: ${allMatches?.length || 0}`);
    Object.keys(matchesByType).forEach(type => {
      console.log(`   ${type}: ${matchesByType[type].length} matches`);
    });

    // 2. Group Structure Analysis
    console.log('\n2. 🏗️ GROUP STRUCTURE:');
    
    // Group A
    console.log('\n🅰️ GROUP A:');
    const groupAMatches = allMatches?.filter(m => m.group_id === 'A') || [];
    const groupAByBracket = {};
    groupAMatches.forEach(match => {
      if (!groupAByBracket[match.bracket_type]) groupAByBracket[match.bracket_type] = [];
      groupAByBracket[match.bracket_type].push(match);
    });
    
    Object.keys(groupAByBracket).forEach(bracket => {
      console.log(`   ${bracket}: ${groupAByBracket[bracket].length} matches`);
    });

    // Group B  
    console.log('\n🅱️ GROUP B:');
    const groupBMatches = allMatches?.filter(m => m.group_id === 'B') || [];
    const groupBByBracket = {};
    groupBMatches.forEach(match => {
      if (!groupBByBracket[match.bracket_type]) groupBByBracket[match.bracket_type] = [];
      groupBByBracket[match.bracket_type].push(match);
    });
    
    Object.keys(groupBByBracket).forEach(bracket => {
      console.log(`   ${bracket}: ${groupBByBracket[bracket].length} matches`);
    });

    // 3. Advancement Logic Analysis
    console.log('\n3. 🔄 ADVANCEMENT LOGIC:');
    
    // Winners Bracket Flow
    console.log('\n🏆 WINNERS BRACKET FLOW:');
    console.log('   Round 1 (16 players each group) → Round 2 (8 players) → Round 3 (4 players) → Winners Final (2 players)');
    
    // Losers Bracket Flow
    console.log('\n💔 LOSERS BRACKET FLOW:');
    console.log('   Losers from Winners R1 → Losers R1');
    console.log('   Losers from Winners R2 → Losers R2 (meet Losers R1 winners)');
    console.log('   Losers from Winners R3 → Losers R3 (meet Losers R2 winners)');
    console.log('   Losers from Winners Final → Losers Final (meet Losers R3 winners)');

    // Group Finals Logic
    console.log('\n🎯 GROUP FINALS LOGIC:');
    console.log('   Each group produces 2 finalists:');
    console.log('   - Winners Bracket Champion');
    console.log('   - Losers Bracket Champion');
    console.log('   - If same player: they win the group');
    console.log('   - If different: they play Group Final(s)');

    // 4. Cross-Bracket Finals
    console.log('\n4. 🌉 CROSS-BRACKET FINALS:');
    
    const crossMatches = allMatches?.filter(m => m.bracket_type?.includes('cross')) || [];
    console.log(`   Total Cross-Bracket Matches: ${crossMatches.length}`);
    
    crossMatches.forEach(match => {
      console.log(`   ${match.sabo_match_id}: ${match.bracket_type}`);
    });

    console.log('\n   Logic:');
    console.log('   - 4 players advance from Group Finals (2 from each group)');
    console.log('   - SF1: Group A Winner 1 vs Group B Winner 2');
    console.log('   - SF2: Group A Winner 2 vs Group B Winner 1');
    console.log('   - Final: SF1 Winner vs SF2 Winner');

    // 5. Current State Analysis
    console.log('\n5. 📈 CURRENT TOURNAMENT STATE:');
    
    // Check completion by bracket
    const completionStats = {};
    Object.keys(matchesByType).forEach(type => {
      const matches = matchesByType[type];
      const completed = matches.filter(m => m.status === 'completed').length;
      const pending = matches.filter(m => m.status === 'pending').length;
      completionStats[type] = { total: matches.length, completed, pending };
    });

    console.log('\n   Completion Status:');
    Object.keys(completionStats).forEach(type => {
      const stats = completionStats[type];
      const percentage = Math.round((stats.completed / stats.total) * 100);
      console.log(`   ${type}: ${stats.completed}/${stats.total} (${percentage}%) - ${stats.pending} pending`);
    });

    // 6. Winners Analysis
    console.log('\n6. 🏅 CURRENT WINNERS:');
    
    // Group A Finals Winners
    const groupAFinals = matchesByType['group_a_final'] || [];
    console.log('\n🅰️ Group A Final Winners:');
    for (let i = 0; i < groupAFinals.length; i++) {
      const match = groupAFinals[i];
      if (match.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', match.winner_id)
          .single();
        console.log(`   Match ${i + 1}: ${winner?.player_name || 'Unknown'} (${match.winner_id})`);
      } else {
        console.log(`   Match ${i + 1}: No winner yet`);
      }
    }

    // Group B Finals Winners
    const groupBFinals = matchesByType['group_b_final'] || [];
    console.log('\n🅱️ Group B Final Winners:');
    for (let i = 0; i < groupBFinals.length; i++) {
      const match = groupBFinals[i];
      if (match.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', match.winner_id)
          .single();
        console.log(`   Match ${i + 1}: ${winner?.player_name || 'Unknown'} (${match.winner_id})`);
      } else {
        console.log(`   Match ${i + 1}: No winner yet`);
      }
    }

    // Cross-Bracket Status
    const crossSemis = matchesByType['cross_semifinals'] || [];
    const crossFinal = matchesByType['cross_final'] || [];
    
    console.log('\n🌉 Cross-Bracket Status:');
    console.log(`   Semifinals: ${crossSemis.filter(m => m.status === 'completed').length}/${crossSemis.length} completed`);
    console.log(`   Final: ${crossFinal.filter(m => m.status === 'completed').length}/${crossFinal.length} completed`);

    // 7. Tournament Flow Summary
    console.log('\n7. 🎮 TOURNAMENT FLOW SUMMARY:');
    console.log('   Phase 1: Group Stage (Winners + Losers Brackets)');
    console.log('   Phase 2: Group Finals (Determine 2 representatives per group)');
    console.log('   Phase 3: Cross-Bracket Finals (4 players → 1 champion)');
    
    console.log('\n' + '=' .repeat(80));
    console.log('🏆 DOUBLE ELIMINATION LOGIC REVIEW COMPLETE');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

reviewTournamentLogic();
