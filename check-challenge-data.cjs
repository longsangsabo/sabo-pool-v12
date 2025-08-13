const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function checkChallengeData() {
  try {
    console.log('🔍 CHECKING CHALLENGE DATA...\n');

    // Fetch recent challenges
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, challenger_name, location, required_rank, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${challenges.length} recent challenges:\n`);

    challenges.forEach((challenge, index) => {
      console.log(`${index + 1}. Challenge by ${challenge.challenger_name || 'Unknown'}:`);
      console.log(`   ID: ${challenge.id}`);
      console.log(`   Status: ${challenge.status}`);
      console.log(`   Location: ${challenge.location || 'NULL/UNDEFINED'}`);
      console.log(`   Required Rank: ${challenge.required_rank || 'NULL/UNDEFINED'}`);
      console.log(`   Created: ${challenge.created_at}`);
      console.log('');
    });

    // Check specific challenge from "Võ Long Sang"
    const longSangChallenge = challenges.find(c => c.challenger_name === 'Võ Long Sang');
    if (longSangChallenge) {
      console.log('🎯 FOCUS ON VÕ LONG SANG CHALLENGE:');
      console.log('   Location exists:', !!longSangChallenge.location);
      console.log('   Location value:', longSangChallenge.location);
      console.log('   Required rank exists:', !!longSangChallenge.required_rank);
      console.log('   Required rank value:', longSangChallenge.required_rank);
      console.log('   Will display location section:', !!longSangChallenge.location);
      console.log('   Will display rank section:', !!(longSangChallenge.required_rank && longSangChallenge.required_rank !== 'all'));
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

checkChallengeData();
