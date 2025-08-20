const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournamentProgress() {
  console.log('🔍 CHECKING TOURNAMENT PROGRESS');
  console.log('==============================');

  try {
    // Get all tournaments with their match statistics
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('id, name, status, tournament_type, current_participants')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    for (const tournament of tournaments) {
      console.log(`\n🏆 ${tournament.name}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Type: ${tournament.tournament_type}`);
      console.log(`   Players: ${tournament.current_participants}`);

      // Check matches for this tournament
      const { data: matches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('id, round_number, match_number, status, winner_id, player1_id, player2_id')
        .eq('tournament_id', tournament.id)
        .order('round_number, match_number');

      if (matchError) {
        console.log(`   ❌ Error getting matches: ${matchError.message}`);
        continue;
      }

      if (matches.length === 0) {
        console.log(`   📋 No matches found`);
        continue;
      }

      const totalMatches = matches.length;
      const completedMatches = matches.filter(m => m.status === 'completed').length;
      const pendingMatches = matches.filter(m => m.status === 'pending').length;
      const waitingMatches = matches.filter(m => m.status === 'waiting_for_players').length;

      console.log(`   📊 Matches: ${totalMatches} total`);
      console.log(`      ✅ Completed: ${completedMatches}`);
      console.log(`      ⏳ Pending: ${pendingMatches}`);
      console.log(`      ⏸️ Waiting: ${waitingMatches}`);

      // Check final match (Grand Final for double elimination)
      if (tournament.tournament_type.includes('double_elimination')) {
        const finalMatch = matches.find(m => m.round_number === 300 && m.match_number === 1);
        if (finalMatch) {
          console.log(`   🏁 Grand Final: ${finalMatch.status}`);
          if (finalMatch.status === 'completed') {
            console.log(`      🏅 Winner: ${finalMatch.winner_id}`);
            console.log(`   💡 This tournament can be marked as "completed"!`);
          }
        }
      }

      // Show progress percentage
      const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
      console.log(`   📈 Progress: ${progressPercent}%`);

      // Recommendation
      if (completedMatches > 0 && progressPercent >= 80) {
        console.log(`   🎯 RECOMMENDATION: This tournament has significant progress`);
        console.log(`      Consider testing results calculation with this one`);
      }
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Choose a tournament with completed matches');
    console.log('2. Manually set its status to "completed" in Supabase Dashboard');
    console.log('3. Run the test script again');
    console.log('4. Or use update-tournament-status.cjs to update status programmatically');

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
  }
}

checkTournamentProgress().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('💥 Failed:', error);
  process.exit(1);
});
