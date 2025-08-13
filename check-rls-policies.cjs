const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function checkAndFixRLS() {
  try {
    console.log('🔍 CHECKING RLS POLICIES FOR CHALLENGES TABLE...\n');

    // Check current policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'challenges');

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log(`📋 Found ${policies?.length || 0} policies for challenges table:`);
      policies?.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
      });
      console.log('');
    }

    // Try to check if RLS is enabled
    console.log('🔐 Checking RLS status...\n');

    // Test inserting a simple challenge to see what happens
    console.log('🧪 Testing challenge creation...\n');

    const testChallenge = {
      challenger_id: 'test-user-id',
      challenger_name: 'Test User',
      bet_points: 100,
      race_to: 8,
      message: 'Test challenge',
      status: 'pending',
      location: 'Test Club',
      required_rank: 'G'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('challenges')
      .insert(testChallenge)
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('\n💡 SOLUTIONS:');
      console.log('1. Disable RLS temporarily: ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;');
      console.log('2. Or create proper INSERT policy for authenticated users');
      console.log('3. Or use service role key instead of anon key');
    } else {
      console.log('✅ Insert test successful:', insertResult);
      
      // Clean up test data
      if (insertResult && insertResult[0]) {
        await supabase
          .from('challenges')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🧹 Test data cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndFixRLS();
