const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixCrossBracketAdvancement() {
  console.log('🔧 Fixing Cross-Bracket Finals advancement...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Get the correct winners from Group Finals
    console.log('1. 📊 Getting correct winners from Group Finals:');
    
    const { data: groupAFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_final')
      .eq('group_id', 'A')
      .order('match_number');

    const { data: groupBFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B')
      .order('match_number');

    // Extract winners
    const groupAWinner1 = groupAFinals?.[0]?.winner_id; // A-FINAL Match 1
    const groupAWinner2 = groupAFinals?.[1]?.winner_id; // A-FINAL2 Match 2
    const groupBWinner1 = groupBFinals?.[0]?.winner_id; // B-FINAL Match 1  
    const groupBWinner2 = groupBFinals?.[1]?.winner_id; // B-FINAL2 Match 2

    console.log('Winners identified:');
    console.log(`  Group A Match 1 Winner: ${groupAWinner1}`);
    console.log(`  Group A Match 2 Winner: ${groupAWinner2}`);
    console.log(`  Group B Match 1 Winner: ${groupBWinner1}`);
    console.log(`  Group B Match 2 Winner: ${groupBWinner2}`);

    // Get player names
    const getPlayerName = async (playerId) => {
      if (!playerId) return 'No Winner';
      const { data } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', playerId)
        .single();
      return data?.player_name || 'Unknown';
    };

    const groupAWinner1Name = await getPlayerName(groupAWinner1);
    const groupAWinner2Name = await getPlayerName(groupAWinner2);
    const groupBWinner1Name = await getPlayerName(groupBWinner1);
    const groupBWinner2Name = await getPlayerName(groupBWinner2);

    console.log('\nWinner names:');
    console.log(`  Group A Match 1: ${groupAWinner1Name}`);
    console.log(`  Group A Match 2: ${groupAWinner2Name}`);
    console.log(`  Group B Match 1: ${groupBWinner1Name}`);
    console.log(`  Group B Match 2: ${groupBWinner2Name}`);

    // 2. Update Cross-Bracket Semifinals
    console.log('\n2. 🔄 Updating Cross-Bracket Semifinals:');
    
    // Get current Cross-Bracket matches
    const { data: crossMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'cross_semifinals')
      .order('sabo_match_id');

    if (crossMatches && crossMatches.length >= 2) {
      // SF1: Group A Winner 1 vs Group B Winner 2
      const sf1Match = crossMatches.find(m => m.sabo_match_id === 'SF1');
      if (sf1Match && groupAWinner1 && groupBWinner2) {
        console.log(`Updating SF1: ${groupAWinner1Name} vs ${groupBWinner2Name}`);
        
        const { error: sf1Error } = await serviceSupabase
          .from('sabo32_matches')
          .update({
            player1_id: groupAWinner1,
            player2_id: groupBWinner2,
            updated_at: new Date().toISOString()
          })
          .eq('id', sf1Match.id);

        if (sf1Error) {
          console.error('❌ Error updating SF1:', sf1Error);
        } else {
          console.log('✅ SF1 updated successfully');
        }
      }

      // SF2: Group A Winner 2 vs Group B Winner 1
      const sf2Match = crossMatches.find(m => m.sabo_match_id === 'SF2');
      if (sf2Match && groupAWinner2 && groupBWinner1) {
        console.log(`Updating SF2: ${groupAWinner2Name} vs ${groupBWinner1Name}`);
        
        const { error: sf2Error } = await serviceSupabase
          .from('sabo32_matches')
          .update({
            player1_id: groupAWinner2,
            player2_id: groupBWinner1,
            updated_at: new Date().toISOString()
          })
          .eq('id', sf2Match.id);

        if (sf2Error) {
          console.error('❌ Error updating SF2:', sf2Error);
        } else {
          console.log('✅ SF2 updated successfully');
        }
      }
    }

    // 3. Verify the fix
    console.log('\n3. ✅ Verifying Cross-Bracket Semifinals:');
    
    const { data: updatedCrossMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'cross_semifinals')
      .order('sabo_match_id');

    for (const match of updatedCrossMatches || []) {
      const p1Name = await getPlayerName(match.player1_id);
      const p2Name = await getPlayerName(match.player2_id);
      
      console.log(`  ${match.sabo_match_id}: ${p1Name} vs ${p2Name}`);
    }

    console.log('\n🎉 Cross-Bracket Finals advancement fixed!');
    console.log('🔄 Refresh the frontend to see the correct players in Cross-Bracket Semifinals.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCrossBracketAdvancement();
