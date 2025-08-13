const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.ORMM0nSs8QfKYI8H04m-IfNM7NTShKWq21LqP_MpjRM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChallengesData() {
  console.log('🔍 Checking challenges data...\n');

  try {
    // Check latest challenges
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching challenges:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('📝 No challenges found in database');
      return;
    }

    console.log(`📊 Found ${data.length} latest challenges:\n`);

    data.forEach((challenge, index) => {
      console.log(`🎯 Challenge ${index + 1}:`);
      console.log(`   ID: ${challenge.id}`);
      console.log(`   Challenger ID: ${challenge.challenger_id}`);
      console.log(`   Challenger Name: ${challenge.challenger_name || '❌ NULL'}`);
      console.log(`   Opponent ID: ${challenge.opponent_id || 'Open Challenge'}`);
      console.log(`   Location: ${challenge.location || '❌ NULL'}`);
      console.log(`   Required Rank: ${challenge.required_rank || '❌ NULL'}`);
      console.log(`   Club ID: ${challenge.club_id || '❌ NULL'}`);
      console.log(`   Bet Points: ${challenge.bet_points}`);
      console.log(`   Race To: ${challenge.race_to}`);
      console.log(`   Status: ${challenge.status}`);
      console.log(`   Created: ${new Date(challenge.created_at).toLocaleString()}`);
      console.log(`   Message: ${challenge.message || 'No message'}`);
      console.log('   ─────────────────────────────────');
    });

    // Check for NULL values
    const nullLocationCount = data.filter(c => !c.location).length;
    const nullRequiredRankCount = data.filter(c => !c.required_rank).length;
    const nullChallengerNameCount = data.filter(c => !c.challenger_name).length;

    console.log('\n📈 Data Quality Summary:');
    console.log(`   Challenges with NULL location: ${nullLocationCount}/${data.length}`);
    console.log(`   Challenges with NULL required_rank: ${nullRequiredRankCount}/${data.length}`);
    console.log(`   Challenges with NULL challenger_name: ${nullChallengerNameCount}/${data.length}`);

    if (nullLocationCount > 0 || nullRequiredRankCount > 0 || nullChallengerNameCount > 0) {
      console.log('\n⚠️  Some challenges have missing data. This may affect display in the app.');
      console.log('💡 Try creating a new challenge to test if new data is saved correctly.');
    } else {
      console.log('\n✅ All challenges have complete data!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkChallengesData();
