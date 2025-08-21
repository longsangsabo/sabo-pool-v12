const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTournamentData() {
  console.log('🔍 DEBUGGING TOURNAMENT DATA');
  console.log('============================');

  try {
    // 1. Check completed tournaments
    console.log('1️⃣ CHECKING COMPLETED TOURNAMENTS');
    console.log('----------------------------------');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, status, tournament_type, created_at, current_participants')
      .in('status', ['completed', 'finished'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      return;
    }

    console.log(`📊 Found ${tournaments.length} completed tournaments`);
    console.log('');

    // 2. Check each tournament in detail
    for (const tournament of tournaments) {
      console.log(`🏆 TOURNAMENT: ${tournament.name}`);
      console.log(`   - ID: ${tournament.id}`);
      console.log(`   - Type: ${tournament.tournament_type}`);
      console.log(`   - Status: ${tournament.status}`);
      console.log(`   - Participants: ${tournament.current_participants}`);

      // Check participants
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('user_id, status')
        .eq('tournament_id', tournament.id);

      if (participantsError) {
        console.error(`   ❌ Error fetching participants: ${participantsError.message}`);
      } else {
        console.log(`   👥 Participants found: ${participants.length}`);
        console.log(`   👥 Status breakdown:`, participants.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {}));
      }

      // Check matches
      const { data: matches, error: matchesError } = await supabase
        .from('tournament_matches')
        .select('id, round_number, match_number, status, player1_id, player2_id, winner_id')
        .eq('tournament_id', tournament.id)
        .order('round_number', { ascending: true });

      if (matchesError) {
        console.error(`   ❌ Error fetching matches: ${matchesError.message}`);
      } else {
        console.log(`   🎯 Matches found: ${matches.length}`);
        
        const matchStats = matches.reduce((acc, m) => {
          acc.total++;
          if (m.status === 'completed') acc.completed++;
          if (m.status === 'pending') acc.pending++;
          if (m.status === 'waiting_for_players') acc.waiting++;
          return acc;
        }, { total: 0, completed: 0, pending: 0, waiting: 0 });
        
        console.log(`   🎯 Match status:`, matchStats);

        // Show some key matches for SABO tournaments
        if (tournament.tournament_type.includes('sabo') || tournament.tournament_type.includes('double_elimination')) {
          console.log(`   🔍 Key matches:`);
          
          // Final match (R300)
          const finalMatch = matches.find(m => m.round_number === 300);
          if (finalMatch) {
            console.log(`      Final (R300): ${finalMatch.status}, Winner: ${finalMatch.winner_id}`);
          } else {
            console.log(`      Final (R300): NOT FOUND`);
          }

          // Semifinals (R250)
          const semifinals = matches.filter(m => m.round_number === 250);
          console.log(`      Semifinals (R250): ${semifinals.length} matches`);
          semifinals.forEach((sf, i) => {
            console.log(`        SF${i+1}: ${sf.status}, Winner: ${sf.winner_id}`);
          });

          // R3 matches
          const r3matches = matches.filter(m => m.round_number === 3);
          console.log(`      R3 matches: ${r3matches.length} matches`);
          r3matches.forEach((r3, i) => {
            console.log(`        R3M${i+1}: ${r3.status}, Winner: ${r3.winner_id}`);
          });
        }
      }

      // Check existing results
      const { data: existingResults, error: resultsError } = await supabase
        .from('tournament_results')
        .select('user_id, final_position, wins, losses, spa_points_earned')
        .eq('tournament_id', tournament.id)
        .order('final_position', { ascending: true });

      if (resultsError) {
        console.error(`   ❌ Error fetching existing results: ${resultsError.message}`);
      } else {
        console.log(`   🏅 Existing results: ${existingResults.length}`);
        existingResults.slice(0, 3).forEach(result => {
          console.log(`      #${result.final_position}: ${result.user_id} (${result.wins}W-${result.losses}L, ${result.spa_points_earned} SPA)`);
        });
      }

      console.log('');
    }

    // 3. Check for data inconsistencies
    console.log('3️⃣ CHECKING DATA INCONSISTENCIES');
    console.log('--------------------------------');
    
    for (const tournament of tournaments) {
      console.log(`🔍 Checking ${tournament.name}:`);
      
      // Check for matches without players
      const { data: emptyMatches, error: emptyError } = await supabase
        .from('tournament_matches')
        .select('id, round_number, match_number, player1_id, player2_id')
        .eq('tournament_id', tournament.id)
        .or('player1_id.is.null,player2_id.is.null');

      if (emptyError) {
        console.error(`   ❌ Error checking empty matches: ${emptyError.message}`);
      } else {
        console.log(`   🚫 Matches missing players: ${emptyMatches.length}`);
        if (emptyMatches.length > 0) {
          emptyMatches.slice(0, 3).forEach(match => {
            console.log(`      R${match.round_number}M${match.match_number}: P1=${match.player1_id}, P2=${match.player2_id}`);
          });
        }
      }

      // Check for participants not in any match
      const { data: participants, error: pError } = await supabase
        .from('tournament_participants')
        .select('user_id')
        .eq('tournament_id', tournament.id);

      if (!pError && participants.length > 0) {
        const participantIds = participants.map(p => p.user_id);
        
        const { data: matchedPlayers, error: mError } = await supabase
          .from('tournament_matches')
          .select('player1_id, player2_id')
          .eq('tournament_id', tournament.id)
          .not('player1_id', 'is', null)
          .not('player2_id', 'is', null);

        if (!mError) {
          const playersInMatches = new Set();
          matchedPlayers.forEach(m => {
            if (m.player1_id) playersInMatches.add(m.player1_id);
            if (m.player2_id) playersInMatches.add(m.player2_id);
          });

          const orphanedPlayers = participantIds.filter(pid => !playersInMatches.has(pid));
          console.log(`   🤷 Players not in any match: ${orphanedPlayers.length}`);
          if (orphanedPlayers.length > 0) {
            console.log(`      IDs: ${orphanedPlayers.slice(0, 3).join(', ')}`);
          }
        }
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
  }
}

// Run if called directly
if (require.main === module) {
  debugTournamentData().then(() => {
    console.log('🎯 Debug completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });
}

module.exports = { debugTournamentData };
