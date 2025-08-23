const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeCrossBracketAdvancement() {
  console.log('🔍 Analyzing Cross-Bracket Finals advancement logic...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Check current Cross-Bracket Finals
    console.log('1. 📊 Current Cross-Bracket Finals:');
    const { data: crossBracketMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .like('bracket_type', '%cross%')
      .order('round_number');

    console.log(`Found ${crossBracketMatches?.length || 0} cross-bracket matches:`);
    for (const match of crossBracketMatches || []) {
      console.log(`  ${match.sabo_match_id}: ${match.bracket_type}`);
      
      // Get player names
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
      
      console.log(`    Players: ${p1?.player_name || 'Unknown'} vs ${p2?.player_name || 'Unknown'}`);
    }

    // 2. Check who should advance from Group Finals
    console.log('\n2. 🏆 Who should advance from Group Finals:');
    
    // Group A Finals
    console.log('\n🅰️ Group A Finals:');
    const { data: groupAFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_final')
      .eq('group_id', 'A')
      .order('match_number');

    for (const match of groupAFinals || []) {
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
      
      console.log(`  ${match.sabo_match_id}: ${p1?.player_name || 'Unknown'} vs ${p2?.player_name || 'Unknown'}`);
      console.log(`    Winner: ${match.winner_id ? 'Decided' : 'Pending'}, Status: ${match.status}`);
      
      if (match.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', match.winner_id)
          .single();
        console.log(`    Winner: ${winner?.player_name || 'Unknown'} (${match.winner_id})`);
      }
    }

    // Group B Finals  
    console.log('\n🅱️ Group B Finals:');
    const { data: groupBFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B')
      .order('match_number');

    for (const match of groupBFinals || []) {
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
      
      console.log(`  ${match.sabo_match_id}: ${p1?.player_name || 'Unknown'} vs ${p2?.player_name || 'Unknown'}`);
      console.log(`    Winner: ${match.winner_id ? 'Decided' : 'Pending'}, Status: ${match.status}`);
      
      if (match.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', match.winner_id)
          .single();
        console.log(`    Winner: ${winner?.player_name || 'Unknown'} (${match.winner_id})`);
      }
    }

    // 3. Expected Cross-Bracket Logic
    console.log('\n3. 💡 Expected Cross-Bracket Logic:');
    console.log('  Should advance to Cross-Bracket:');
    console.log('  - Winner of Group A Final Match 1');
    console.log('  - Winner of Group A Final Match 2'); 
    console.log('  - Winner of Group B Final Match 1');
    console.log('  - Winner of Group B Final Match 2');
    console.log('\n  Cross-Bracket Semifinals should be:');
    console.log('  - SF1: Group A Winner 1 vs Group B Winner 2');
    console.log('  - SF2: Group A Winner 2 vs Group B Winner 1');

    // 4. Check advancement system
    console.log('\n4. 🔧 Checking advancement system:');
    
    const allWinners = [];
    
    // Collect Group A winners
    for (const match of groupAFinals || []) {
      if (match.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', match.winner_id)
          .single();
        allWinners.push({
          group: 'A',
          match_number: match.match_number,
          player_id: match.winner_id,
          player_name: winner?.player_name || 'Unknown'
        });
      }
    }
    
    // Collect Group B winners  
    for (const match of groupBFinals || []) {
      if (match.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', match.winner_id)
          .single();
        allWinners.push({
          group: 'B',
          match_number: match.match_number,
          player_id: match.winner_id,
          player_name: winner?.player_name || 'Unknown'
        });
      }
    }

    console.log('\nAdvanced players from Group Finals:');
    allWinners.forEach(winner => {
      console.log(`  Group ${winner.group} Match ${winner.match_number}: ${winner.player_name} (${winner.player_id})`);
    });

    console.log(`\n📈 Total advanced: ${allWinners.length}/4 players`);
    
    if (allWinners.length === 4) {
      console.log('\n🎯 Suggested Cross-Bracket matchups:');
      const groupA = allWinners.filter(w => w.group === 'A').sort((a, b) => a.match_number - b.match_number);
      const groupB = allWinners.filter(w => w.group === 'B').sort((a, b) => a.match_number - b.match_number);
      
      if (groupA.length === 2 && groupB.length === 2) {
        console.log(`  SF1: ${groupA[0].player_name} vs ${groupB[1].player_name}`);
        console.log(`  SF2: ${groupA[1].player_name} vs ${groupB[0].player_name}`);
      }
    } else {
      console.log('⚠️ Not all Group Finals completed yet');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeCrossBracketAdvancement();
