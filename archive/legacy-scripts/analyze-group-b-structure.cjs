const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixGroupBFinal() {
  console.log('🔧 Analyzing and fixing Group B Final structure...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Check Group B losers bracket to see who should advance
    console.log('1. 📊 Group B Losers Bracket analysis:');
    
    const { data: groupBLosersA } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_losers_a')
      .eq('group_id', 'B')
      .order('round_number', { ascending: false });

    const { data: groupBLosersB } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_losers_b')
      .eq('group_id', 'B')
      .order('round_number', { ascending: false });

    console.log(`Group B Losers A: ${groupBLosersA?.length || 0} matches`);
    console.log(`Group B Losers B: ${groupBLosersB?.length || 0} matches`);

    // Find the latest completed matches in each bracket
    const latestLosersA = groupBLosersA?.find(m => m.status === 'completed');
    const latestLosersB = groupBLosersB?.find(m => m.status === 'completed');

    if (latestLosersA) {
      console.log(`\nLatest Losers A match (Round ${latestLosersA.round_number}):`);
      console.log(`  Winner: ${latestLosersA.winner_id}`);
      console.log(`  Status: ${latestLosersA.status}`);
    }

    if (latestLosersB) {
      console.log(`\nLatest Losers B match (Round ${latestLosersB.round_number}):`);
      console.log(`  Winner: ${latestLosersB.winner_id}`);
      console.log(`  Status: ${latestLosersB.status}`);
    }

    // 2. Check current Group B Final match
    console.log('\n2. 🔍 Current Group B Final match:');
    const { data: currentGroupBFinal } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B');

    console.log(`Current Group B Final matches: ${currentGroupBFinal?.length || 0}`);
    currentGroupBFinal?.forEach((match, index) => {
      console.log(`  ${index + 1}. Match ${match.match_id || 'undefined'}`);
      console.log(`     P1: ${match.player1_id}`);
      console.log(`     P2: ${match.player2_id}`);
      console.log(`     Round: ${match.round_number}`);
      console.log(`     Status: ${match.status}`);
    });

    // 3. Get player names for better understanding
    console.log('\n3. 👥 Player names in Group B Final:');
    if (currentGroupBFinal && currentGroupBFinal.length > 0) {
      for (const match of currentGroupBFinal) {
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

        console.log(`  Match: ${p1?.player_name || 'Unknown'} vs ${p2?.player_name || 'Unknown'}`);
      }
    }

    // 4. Check if we need to create the missing second match
    console.log('\n4. 💡 Analysis and solution:');
    
    if (latestLosersA && latestLosersA.winner_id && latestLosersB && latestLosersB.winner_id) {
      console.log('✅ Both losers brackets have winners');
      console.log(`   Losers A winner: ${latestLosersA.winner_id}`);
      console.log(`   Losers B winner: ${latestLosersB.winner_id}`);
      
      // Check if there should be a second Group B Final match
      if (currentGroupBFinal && currentGroupBFinal.length === 1) {
        console.log('\n💭 Potential solution:');
        console.log('   Create second Group B Final match with:');
        console.log(`   - Player 1: ${latestLosersA.winner_id}`);
        console.log(`   - Player 2: ${latestLosersB.winner_id}`);
        console.log('   - Bracket type: group_b_final');
        console.log('   - Group: B');
        console.log('   - Round: 250');
        
        // Ask if we should create the match
        console.log('\n🚀 Would you like to create this missing match?');
        console.log('   This would balance Group B structure to match Group A');
      }
    } else {
      console.log('❌ Missing winners from losers brackets');
      console.log('   Need to complete losers bracket matches first');
    }

    // 5. Compare with Group A structure
    console.log('\n5. 📊 Comparison with Group A:');
    const { data: groupAFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_final')
      .eq('group_id', 'A');

    console.log(`Group A Final matches: ${groupAFinals?.length || 0}`);
    console.log(`Group B Final matches: ${currentGroupBFinal?.length || 0}`);
    console.log(`Difference: ${(groupAFinals?.length || 0) - (currentGroupBFinal?.length || 0)} matches`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixGroupBFinal();
