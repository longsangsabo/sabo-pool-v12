const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function checkChallengeDisplayData() {
  try {
    console.log('🔍 CHECKING CHALLENGE DISPLAY DATA...\n');

    // Get recent challenges
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching challenges:', error);
      return;
    }

    console.log(`📊 Found ${challenges.length} recent challenges:\n`);

    challenges.forEach((challenge, index) => {
      console.log(`🎯 Challenge ${index + 1}:`);
      console.log(`  ID: ${challenge.id}`);
      console.log(`  Challenger ID: ${challenge.challenger_id}`);
      console.log(`  Status: ${challenge.status}`);
      console.log(`  Location: ${challenge.location || 'NULL'}`);
      console.log(`  Required Rank: ${challenge.required_rank || 'NULL'}`);
      console.log(`  Bet Points: ${challenge.bet_points}`);
      console.log(`  Race To: ${challenge.race_to}`);
      console.log(`  Created: ${challenge.created_at}`);
      console.log(`  --- DATA CHECK ---`);
      console.log(`  Has Location: ${!!challenge.location}`);
      console.log(`  Has Required Rank: ${!!(challenge.required_rank && challenge.required_rank !== 'all')}`);
      console.log(`  Display Condition: ${!!(challenge.location || (challenge.required_rank && challenge.required_rank !== 'all'))}`);
      console.log('');
    });

    // Check if any challenges have the data we need
    const withLocation = challenges.filter(c => c.location);
    const withRequiredRank = challenges.filter(c => c.required_rank && c.required_rank !== 'all');

    console.log(`📈 SUMMARY:`);
    console.log(`  Challenges with location: ${withLocation.length}`);
    console.log(`  Challenges with required_rank: ${withRequiredRank.length}`);
    console.log(`  Total that should show info section: ${challenges.filter(c => c.location || (c.required_rank && c.required_rank !== 'all')).length}`);

    if (withLocation.length === 0 && withRequiredRank.length === 0) {
      console.log('\n⚠️  NO CHALLENGES HAVE LOCATION OR REQUIRED_RANK DATA!');
      console.log('This is why the Club and Rank Information section is not displaying.');
      console.log('');
      console.log('💡 SOLUTIONS:');
      console.log('1. Create a new challenge with club selection');
      console.log('2. Update existing challenges with location/required_rank');
      console.log('3. Check if the create challenge form is saving these fields correctly');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkChallengeDisplayData();
