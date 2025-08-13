const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function addTestDataToChallenges() {
  try {
    console.log('🧪 ADDING TEST DATA TO CHALLENGES...\n');

    // Get the most recent challenge
    const { data: challenges, error: fetchError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (fetchError) {
      console.error('❌ Error fetching challenges:', fetchError);
      return;
    }

    if (!challenges || challenges.length === 0) {
      console.log('❌ No challenges found');
      return;
    }

    console.log(`📊 Found ${challenges.length} recent challenges. Adding test data...\n`);

    // Update the first few challenges with test data
    const testUpdates = [
      {
        id: challenges[0].id,
        location: 'CLB Bida Sao Việt',
        required_rank: 'G',
        challenger_name: 'Võ Long Sang'
      },
      {
        id: challenges[1]?.id,
        location: 'CLB Bida Hoàng Gia',
        required_rank: 'H',
        challenger_name: 'Player 2'
      },
      {
        id: challenges[2]?.id,
        location: 'CLB Bida Vip',
        required_rank: 'I',
        challenger_name: 'Player 3'
      }
    ].filter(update => update.id); // Remove undefined IDs

    for (const update of testUpdates) {
      console.log(`🔄 Updating challenge ${update.id}...`);
      
      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          location: update.location,
          required_rank: update.required_rank,
          challenger_name: update.challenger_name
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Error updating challenge ${update.id}:`, updateError);
      } else {
        console.log(`✅ Updated challenge ${update.id}: ${update.location} (${update.required_rank})`);
      }
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('\n📋 Verification - Updated challenges:');

    // Verify the updates
    const { data: verifyData, error: verifyError } = await supabase
      .from('challenges')
      .select('id, location, required_rank, challenger_name')
      .not('location', 'is', null)
      .limit(5);

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      verifyData?.forEach(challenge => {
        console.log(`  - ${challenge.id}: "${challenge.location}" (${challenge.required_rank}) - ${challenge.challenger_name}`);
      });
    }

    console.log('\n🚀 Now refresh your browser and check the challenge cards!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTestDataToChallenges();
