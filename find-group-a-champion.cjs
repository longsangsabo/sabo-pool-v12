const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function findGroupAWinnersChampion() {
  console.log('🔍 FINDING GROUP A WINNERS CHAMPION\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // Check all Group A Winners matches
    const { data: allGroupAWinners } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_winners')
      .order('round_number')
      .order('match_number');

    console.log('📊 ALL GROUP A WINNERS MATCHES:');
    
    const byRound = {};
    allGroupAWinners?.forEach(match => {
      if (!byRound[match.round_number]) byRound[match.round_number] = [];
      byRound[match.round_number].push(match);
    });

    Object.keys(byRound).forEach(round => {
      console.log(`\nRound ${round}:`);
      byRound[round].forEach(match => {
        console.log(`   Match ${match.match_number}: ${match.sabo_match_id}`);
        console.log(`     Status: ${match.status}`);
        console.log(`     Winner: ${match.winner_id || 'None'}`);
        if (match.player1_id) {
          console.log(`     Player1: ${match.player1_id}`);
        }
        if (match.player2_id) {
          console.log(`     Player2: ${match.player2_id}`);
        }
      });
    });

    // Find the highest round
    const rounds = Object.keys(byRound).map(r => parseInt(r)).sort((a, b) => b - a);
    const highestRound = rounds[0];
    
    console.log(`\n🏆 HIGHEST ROUND: ${highestRound}`);
    
    const finalMatches = byRound[highestRound];
    console.log(`Final round has ${finalMatches?.length || 0} matches`);
    
    // If there's only 1 match in highest round, that's the winner
    if (finalMatches?.length === 1) {
      const finalMatch = finalMatches[0];
      console.log(`\n🎯 GROUP A WINNERS CHAMPION: ${finalMatch.winner_id || 'Not decided yet'}`);
      
      if (finalMatch.winner_id) {
        const { data: winner } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', finalMatch.winner_id)
          .single();
        
        console.log(`   Name: ${winner?.player_name || 'Unknown'}`);
        
        // Now get the Losers champion and set up Group A Finals
        const { data: losersChamp } = await serviceSupabase
          .from('sabo32_matches')
          .select('winner_id')
          .eq('tournament_id', tournamentId)
          .eq('bracket_type', 'group_a_losers_b')
          .eq('round_number', 202)
          .single();

        if (losersChamp?.winner_id) {
          console.log(`\n🔧 SETTING UP GROUP A FINAL:`);
          console.log(`   Winners Champion: ${finalMatch.winner_id}`);
          console.log(`   Losers Champion: ${losersChamp.winner_id}`);
          
          const { error: setupError } = await serviceSupabase
            .from('sabo32_matches')
            .update({
              player1_id: finalMatch.winner_id,
              player2_id: losersChamp.winner_id,
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('tournament_id', tournamentId)
            .eq('bracket_type', 'group_a_final')
            .eq('match_number', 1);

          if (setupError) {
            console.error('❌ Error setting up Group A Final:', setupError);
          } else {
            console.log('✅ Group A Final Match 1 set up successfully!');
            
            const { data: lc } = await serviceSupabase
              .from('sabo32_tournament_players')
              .select('player_name')
              .eq('player_id', losersChamp.winner_id)
              .single();

            console.log(`   Matchup: ${winner?.player_name || 'Unknown'} vs ${lc?.player_name || 'Unknown'}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findGroupAWinnersChampion();
