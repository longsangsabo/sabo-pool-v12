// Debug script to test all tournament-related database queries
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testTournamentQueries() {
  console.log('🧪 TESTING TOURNAMENT QUERIES');
  console.log('==============================');

  try {
    // Get a sample tournament ID
    console.log('\n1. 🔍 Getting sample tournament...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1);

    if (tournamentsError) {
      console.error('❌ Error getting tournaments:', tournamentsError);
      return;
    }

    if (!tournaments || tournaments.length === 0) {
      console.log('📭 No tournaments found');
      return;
    }

    const tournamentId = tournaments[0].id;
    console.log(`✅ Using tournament: ${tournaments[0].name} (${tournamentId})`);

    // Test tournament_matches
    console.log('\n2. 🎯 Testing tournament_matches...');
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .limit(5);

    if (matchesError) {
      console.error('❌ Error fetching matches:', matchesError);
    } else {
      console.log(`✅ Matches query works! Found ${matches?.length || 0} matches`);
    }

    // Test tournament_registrations
    console.log('\n3. 📝 Testing tournament_registrations...');
    const { data: registrations, error: registrationsError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', tournamentId)
      .limit(5);

    if (registrationsError) {
      console.error('❌ Error fetching registrations:', registrationsError);
    } else {
      console.log(`✅ Registrations query works! Found ${registrations?.length || 0} registrations`);
    }

    // Test tournament_results
    console.log('\n4. 🏆 Testing tournament_results...');
    const { data: results, error: resultsError } = await supabase
      .from('tournament_results')
      .select('*')
      .eq('tournament_id', tournamentId)
      .limit(5);

    if (resultsError) {
      console.error('❌ Error fetching results:', resultsError);
    } else {
      console.log(`✅ Results query works! Found ${results?.length || 0} results`);
    }

    // Test profiles with foreign key join
    console.log('\n5. 👤 Testing profiles foreign key...');
    const { data: profilesJoin, error: profilesJoinError } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        user_id,
        profiles(id, full_name, display_name)
      `)
      .eq('tournament_id', tournamentId)
      .limit(1);

    if (profilesJoinError) {
      console.error('❌ Profiles join failed:', profilesJoinError);
      
      // Try alternative approach
      console.log('\n🔄 Trying manual join approach...');
      if (registrations && registrations.length > 0) {
        const userIds = registrations.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, display_name')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('❌ Manual profiles fetch failed:', profilesError);
        } else {
          console.log(`✅ Manual profiles fetch works! Found ${profiles?.length || 0} profiles`);
        }
      }
    } else {
      console.log('✅ Profiles foreign key join works!');
    }

    // Test tournament_prizes
    console.log('\n6. 🎁 Testing tournament_prizes...');
    const { data: prizes, error: prizesError } = await supabase
      .from('tournament_prizes')
      .select('*')
      .eq('tournament_id', tournamentId);

    if (prizesError) {
      console.error('❌ Error fetching prizes:', prizesError);
    } else {
      console.log(`✅ Prizes query works! Found ${prizes?.length || 0} prizes`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testTournamentQueries();
