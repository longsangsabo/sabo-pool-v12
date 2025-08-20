const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - sử dụng env vars từ .env file
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTournamentResults() {
  console.log('🧪 TESTING TOURNAMENT RESULTS CALCULATION');
  console.log('=========================================');

  try {
    // Get a few completed tournaments to test
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, status, tournament_type, current_participants')
      .in('status', ['completed', 'finished'])
      .limit(5)
      .order('created_at', { ascending: false });

    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      return;
    }

    if (tournaments.length === 0) {
      console.log('⚠️ No completed tournaments found');
      console.log('Let\'s check all tournaments:');
      
      const { data: allTournaments, error } = await supabase
        .from('tournaments')
        .select('id, name, status, tournament_type')
        .limit(10)
        .order('created_at', { ascending: false });
        
      if (!error && allTournaments.length > 0) {
        console.log('\n📋 Available tournaments:');
        allTournaments.forEach((t, i) => {
          console.log(`${i + 1}. ${t.name} (${t.status}) - ${t.tournament_type}`);
        });
        console.log('\n💡 You may need to manually set some tournaments to "completed" status first');
      }
      return;
    }

    console.log(`📊 Found ${tournaments.length} completed tournaments to test:`);
    tournaments.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} (${t.current_participants} players) - ${t.tournament_type}`);
    });
    console.log('');

    // Test with the first tournament
    const testTournament = tournaments[0];
    console.log(`🎯 Testing with: ${testTournament.name}`);
    console.log(`   - ID: ${testTournament.id}`);
    console.log(`   - Type: ${testTournament.tournament_type}`);
    console.log(`   - Players: ${testTournament.current_participants}`);
    console.log('');

    // Check if this tournament already has results
    const { data: existingResults, error: existingError } = await supabase
      .from('tournament_results')
      .select('id, final_position, placement_type')
      .eq('tournament_id', testTournament.id)
      .order('final_position');

    if (!existingError && existingResults.length > 0) {
      console.log(`📊 Existing results found: ${existingResults.length} entries`);
      console.log('Will clear and recalculate...');
      console.log('');
    }

    // Calculate results
    console.log('🔄 Calculating tournament results...');
    const { data: result, error: calcError } = await supabase.rpc(
      'calculate_tournament_results',
      { p_tournament_id: testTournament.id }
    );

    if (calcError) {
      console.error(`❌ RPC Error: ${calcError.message}`);
      console.error('Full error:', calcError);
      return;
    }

    if (result.error) {
      console.error(`❌ Function Error: ${result.error}`);
      return;
    }

    console.log('✅ SUCCESS!');
    console.log(`📊 Results created: ${result.results_created}`);
    console.log(`🏅 Champion: ${result.champion_id}`);
    console.log(`🥈 Runner-up: ${result.runner_up_id}`);
    console.log('');

    // Verify the results
    console.log('🔍 Verifying results...');
    const { data: newResults, error: verifyError } = await supabase
      .from('tournament_results')
      .select(`
        final_position,
        placement_type,
        wins,
        losses,
        spa_points_earned,
        elo_points_awarded,
        profiles!inner (
          full_name,
          display_name
        )
      `)
      .eq('tournament_id', testTournament.id)
      .order('final_position');

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      return;
    }

    console.log('📋 FINAL RESULTS:');
    console.log('=================');
    newResults.forEach(result => {
      console.log(`${result.final_position}. ${result.profiles.display_name || result.profiles.full_name}`);
      console.log(`   - Position: ${result.placement_type}`);
      console.log(`   - Record: ${result.wins}W-${result.losses}L`);
      console.log(`   - SPA Points: ${result.spa_points_earned}`);
      console.log(`   - ELO Points: ${result.elo_points_awarded}`);
      console.log('');
    });

    console.log('🎉 Test completed successfully!');
    console.log('💡 You can now check the "Kết quả giải đấu" tab in the app');

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
  }
}

// Run the test
testTournamentResults().then(() => {
  console.log('🎯 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
