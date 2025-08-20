const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAllTournamentResults() {
  console.log('🚀 STARTING TOURNAMENT RESULTS UPDATE');
  console.log('====================================');

  try {
    // Get all completed tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, status, tournament_type, created_at, completed_at')
      .in('status', ['completed', 'finished'])
      .order('created_at', { ascending: false });

    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      return;
    }

    console.log(`📊 Found ${tournaments.length} completed tournaments`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each tournament
    for (const tournament of tournaments) {
      console.log(`🏆 Processing: ${tournament.name}`);
      console.log(`   - ID: ${tournament.id}`);
      console.log(`   - Type: ${tournament.tournament_type}`);
      console.log(`   - Status: ${tournament.status}`);

      try {
        // Call the calculate_tournament_results function
        const { data: result, error: calcError } = await supabase.rpc(
          'calculate_tournament_results',
          { p_tournament_id: tournament.id }
        );

        if (calcError) {
          console.error(`   ❌ Error: ${calcError.message}`);
          errorCount++;
          results.push({
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            status: 'error',
            error: calcError.message
          });
        } else if (result.error) {
          console.error(`   ❌ Function Error: ${result.error}`);
          errorCount++;
          results.push({
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            status: 'error',
            error: result.error
          });
        } else {
          console.log(`   ✅ Success: Created ${result.results_created} results`);
          console.log(`   🏅 Champion: ${result.champion_id}`);
          console.log(`   🥈 Runner-up: ${result.runner_up_id}`);
          successCount++;
          results.push({
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            status: 'success',
            results_created: result.results_created,
            champion_id: result.champion_id,
            runner_up_id: result.runner_up_id
          });
        }
      } catch (error) {
        console.error(`   ❌ Exception: ${error.message}`);
        errorCount++;
        results.push({
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          status: 'error',
          error: error.message
        });
      }

      console.log('');
    }

    // Summary
    console.log('📋 SUMMARY');
    console.log('==========');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total: ${tournaments.length}`);
    console.log('');

    // Show detailed results
    console.log('📄 DETAILED RESULTS');
    console.log('===================');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.tournament_name}`);
      console.log(`   Status: ${result.status}`);
      if (result.status === 'success') {
        console.log(`   Results: ${result.results_created} created`);
        console.log(`   Champion: ${result.champion_id}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    // Verify some results
    console.log('🔍 VERIFICATION');
    console.log('===============');
    const { data: totalResults, error: countError } = await supabase
      .from('tournament_results')
      .select('tournament_id', { count: 'exact' });

    if (!countError) {
      console.log(`📊 Total tournament results in database: ${totalResults.length}`);
    }

    console.log('✅ TOURNAMENT RESULTS UPDATE COMPLETED!');

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
  }
}

// Run if called directly
if (require.main === module) {
  updateAllTournamentResults().then(() => {
    console.log('🎯 Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { updateAllTournamentResults };
