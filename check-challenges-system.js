// Check challenges system functions and tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking Challenges System...\n');

async function checkChallengesSystem() {
  
  // Check challenges table
  console.log('📊 Checking challenges table...');
  try {
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .limit(3);
    
    if (challengesError) {
      console.log('❌ challenges table error:', challengesError.message);
    } else {
      console.log('✅ challenges table exists');
      console.log('   Sample count:', challengesData?.length || 0);
      if (challengesData && challengesData.length > 0) {
        console.log('   Sample columns:', Object.keys(challengesData[0]).join(', '));
      }
    }
  } catch (error) {
    console.log('❌ challenges table check error:', error.message);
  }
  
  console.log('');
  
  // Check accept_open_challenge function
  console.log('🔍 Testing accept_open_challenge function...');
  try {
    const { data: funcData, error: funcError } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: 'test-id-non-existent',
      p_user_id: 'test-user-non-existent'
    });
    
    if (funcError) {
      console.log('❌ accept_open_challenge function error:', funcError.message);
      console.log('   Code:', funcError.code);
      
      if (funcError.code === '42883' || funcError.code === 'PGRST202') {
        console.log('   → Function does not exist');
      } else if (funcError.message.includes('UUID')) {
        console.log('   ✅ Function exists but input validation failed (expected)');
      }
    } else {
      console.log('✅ accept_open_challenge function exists!');
      console.log('   Test response:', funcData);
    }
  } catch (error) {
    console.log('💥 Function test error:', error.message);
  }
  
  console.log('');
  
  // Check matches table
  console.log('📊 Checking matches table...');
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(3);
    
    if (matchesError) {
      console.log('❌ matches table error:', matchesError.message);
    } else {
      console.log('✅ matches table exists');
      console.log('   Sample count:', matchesData?.length || 0);
    }
  } catch (error) {
    console.log('❌ matches table check error:', error.message);
  }
  
  console.log('');
  
  // Check other challenge-related functions
  const functionsToCheck = [
    'create_open_challenge',
    'complete_challenge_match',
    'cancel_challenge',
    'get_user_challenge_stats'
  ];
  
  console.log('🔍 Checking other challenge functions...');
  for (const funcName of functionsToCheck) {
    try {
      const { data, error } = await supabase.rpc(funcName, {});
      
      if (error) {
        if (error.code === '42883' || error.code === 'PGRST202') {
          console.log(`❌ ${funcName}: Does not exist`);
        } else {
          console.log(`⚠️  ${funcName}: Exists but error - ${error.message}`);
        }
      } else {
        console.log(`✅ ${funcName}: Exists and callable`);
      }
    } catch (err) {
      console.log(`❌ ${funcName}: Check failed - ${err.message}`);
    }
  }
  
  console.log('\n🏁 Challenges system check completed!');
}

await checkChallengesSystem();
