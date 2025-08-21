const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournamentStatuses() {
  console.log('🔍 CHECKING ALL TOURNAMENT STATUSES');
  console.log('===================================');

  try {
    // Get all tournaments with their statuses
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, status, tournament_type, created_at, current_participants')
      .order('created_at', { ascending: false });

    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      return;
    }

    console.log(`📊 Found ${tournaments.length} tournaments total`);
    console.log('');

    // Group by status
    const statusGroups = tournaments.reduce((acc, t) => {
      if (!acc[t.status]) acc[t.status] = [];
      acc[t.status].push(t);
      return acc;
    }, {});

    console.log('📋 TOURNAMENTS BY STATUS:');
    console.log('========================');
    Object.keys(statusGroups).forEach(status => {
      console.log(`\n${status.toUpperCase()}: ${statusGroups[status].length} tournaments`);
      statusGroups[status].slice(0, 5).forEach(t => {
        console.log(`  - ${t.name} (${t.tournament_type}, ${t.current_participants} players)`);
      });
    });

    // Check for tournaments that might be "done" but not marked as completed
    console.log('\n🔍 CHECKING FOR POTENTIALLY COMPLETED TOURNAMENTS:');
    console.log('===================================================');

    for (const tournament of tournaments.slice(0, 10)) {
      console.log(`\n🏆 ${tournament.name}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Type: ${tournament.tournament_type}`);
      console.log(`   Participants: ${tournament.current_participants}`);

      // Check if it has matches
      const { data: matches, error: matchesError } = await supabase
        .from('tournament_matches')
        .select('id, status, round_number, winner_id')
        .eq('tournament_id', tournament.id);

      if (!matchesError && matches) {
        console.log(`   Matches: ${matches.length} total`);
        
        const matchStats = matches.reduce((acc, m) => {
          acc[m.status] = (acc[m.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`   Match statuses:`, matchStats);

        // For SABO tournaments, check key matches
        if (tournament.tournament_type.includes('sabo') || tournament.tournament_type.includes('double_elimination')) {
          const finalMatch = matches.find(m => m.round_number === 300);
          const semifinals = matches.filter(m => m.round_number === 250);
          
          console.log(`   Final (R300): ${finalMatch ? finalMatch.status + (finalMatch.winner_id ? ` (Winner: ${finalMatch.winner_id})` : '') : 'NOT FOUND'}`);
          console.log(`   Semifinals: ${semifinals.length} matches, ${semifinals.filter(sf => sf.status === 'completed').length} completed`);
          
          // Check if tournament is actually finished
          if (finalMatch && finalMatch.status === 'completed' && finalMatch.winner_id) {
            console.log(`   🎯 POTENTIALLY COMPLETED: Final has winner!`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
  }
}

// Run if called directly
if (require.main === module) {
  checkTournamentStatuses().then(() => {
    console.log('\n🎯 Status check completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Status check failed:', error);
    process.exit(1);
  });
}

module.exports = { checkTournamentStatuses };
