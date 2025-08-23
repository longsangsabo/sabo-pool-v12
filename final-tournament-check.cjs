require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkFinalTournament() {
  console.log('🏆 FINAL TOURNAMENT STATE CHECK');
  console.log('='.repeat(60));

  const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';

  // Get all matches by group and bracket
  const { data: matches, error } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('group_id')
    .order('bracket_type')
    .order('round_number')
    .order('match_number');

  if (error) {
    console.error('❌ Error fetching matches:', error);
    return;
  }

  // Group by group_id and bracket_type
  const groups = {};
  matches.forEach(match => {
    const key = `${match.group_id}_${match.bracket_type}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  });

  console.log('\n📊 TOURNAMENT SUMMARY:');
  Object.keys(groups).sort().forEach(key => {
    const [groupId, bracketType] = key.split('_');
    const bracketMatches = groups[key];
    
    const completed = bracketMatches.filter(m => m.status === 'completed').length;
    const pending = bracketMatches.filter(m => m.status === 'pending' && m.player1_id && m.player2_id).length;
    const empty = bracketMatches.filter(m => !m.player1_id || !m.player2_id).length;
    
    console.log(`\n🏟️  ${groupId.toUpperCase()} ${bracketType.replace(groupId + '_', '').toUpperCase()}:`);
    console.log(`   ✅ Completed: ${completed}`);
    console.log(`   ⏳ Pending: ${pending}`);
    console.log(`   ❌ Empty: ${empty}`);
    console.log(`   📊 Total: ${bracketMatches.length}`);
  });

  // Check for any issues
  console.log('\n🔍 ISSUE ANALYSIS:');
  
  // Check for empty matches that should have players
  const emptyMatches = matches.filter(m => !m.player1_id || !m.player2_id);
  if (emptyMatches.length > 0) {
    console.log(`❌ Found ${emptyMatches.length} empty matches that should have players:`);
    emptyMatches.forEach(match => {
      console.log(`   ${match.group_id}-${match.bracket_type}-R${match.round_number}M${match.match_number}`);
    });
  } else {
    console.log('✅ All matches have players assigned');
  }

  // Check Group Finals specifically
  const groupAFinals = matches.filter(m => m.bracket_type === 'group_a_final');
  const groupBFinals = matches.filter(m => m.bracket_type === 'group_b_final');
  
  console.log('\n🏆 GROUP FINALS STATUS:');
  console.log(`Group A Finals: ${groupAFinals.length} matches`);
  groupAFinals.forEach(match => {
    const status = match.player1_id && match.player2_id ? '✅' : '❌';
    console.log(`   ${status} R${match.round_number}M${match.match_number}: ${match.status}`);
  });
  
  console.log(`Group B Finals: ${groupBFinals.length} matches`);
  groupBFinals.forEach(match => {
    const status = match.player1_id && match.player2_id ? '✅' : '❌';
    console.log(`   ${status} R${match.round_number}M${match.match_number}: ${match.status}`);
  });

  console.log('\n🎯 NEXT STEPS:');
  if (emptyMatches.length === 0) {
    console.log('✅ Tournament structure is complete!');
    console.log('🎮 Ready for players to complete their matches');
    console.log('🏆 Group Finals are properly set up');
  } else {
    console.log('❌ Still need to fix empty matches');
    console.log('🔧 Run additional fixes as needed');
  }
}

checkFinalTournament().catch(console.error);
