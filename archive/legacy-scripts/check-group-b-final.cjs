const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkGroupBMatches() {
  console.log('🔍 Analyzing Group B Final matches...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Check all Group Final matches
    console.log('1. 📊 All Group Final matches:');
    const { data: groupFinalMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .like('bracket_type', '%final%')
      .order('round_number', { ascending: true });
    
    console.log(`Found ${groupFinalMatches?.length || 0} final matches:`);
    groupFinalMatches?.forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.match_id}: ${match.bracket_type}`);
      console.log(`     Group: ${match.group_id}`);
      console.log(`     P1: ${match.player1_id} vs P2: ${match.player2_id}`);
      console.log(`     Round: ${match.round_number}`);
      console.log(`     Status: ${match.status}`);
      console.log('');
    });

    // 2. Get player names for final matches
    console.log('2. 👥 Final matches with player names:');
    for (const match of groupFinalMatches || []) {
      const { data: p1 } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', match.player1_id)
        .single();
      
      const { data: p2 } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', match.player2_id)
        .single();

      console.log(`  ${match.match_id} (${match.bracket_type}):`);
      console.log(`    ${p1?.player_name || 'Unknown'} vs ${p2?.player_name || 'Unknown'}`);
      console.log(`    Group: ${match.group_id}, Round: ${match.round_number}`);
      console.log('');
    }

    // 3. Check what should be Group B Final
    console.log('3. 🎯 Analyzing Group B structure:');
    
    // Check if there are separate A and B final matches
    const groupAFinals = groupFinalMatches?.filter(m => m.group_id === 'A');
    const groupBFinals = groupFinalMatches?.filter(m => m.group_id === 'B');
    
    console.log(`Group A finals: ${groupAFinals?.length || 0}`);
    console.log(`Group B finals: ${groupBFinals?.length || 0}`);

    // 4. Check if the missing match is from a different bracket type
    console.log('\n4. 🔍 All bracket types in tournament:');
    const { data: allMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('bracket_type, group_id, count(*)')
      .eq('tournament_id', tournamentId);
    
    // Group by bracket type
    const bracketGroups = {};
    const { data: allMatchesDetailed } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('bracket_type');

    allMatchesDetailed?.forEach(match => {
      const key = `${match.bracket_type}_${match.group_id}`;
      if (!bracketGroups[key]) {
        bracketGroups[key] = [];
      }
      bracketGroups[key].push(match);
    });

    Object.keys(bracketGroups).forEach(bracketType => {
      console.log(`  ${bracketType}: ${bracketGroups[bracketType].length} matches`);
    });

    // 5. Check recent matches to see what's missing
    console.log('\n5. 🕐 Recent matches (last 10):');
    const { data: recentMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false })
      .limit(10);

    for (const match of recentMatches || []) {
      const { data: p1 } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', match.player1_id)
        .single();
      
      const { data: p2 } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', match.player2_id)
        .single();

      console.log(`  ${match.match_id}: ${p1?.player_name || 'TBD'} vs ${p2?.player_name || 'TBD'}`);
      console.log(`    Type: ${match.bracket_type}, Group: ${match.group_id}`);
      console.log(`    Status: ${match.status}, Round: ${match.round_number}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkGroupBMatches();
