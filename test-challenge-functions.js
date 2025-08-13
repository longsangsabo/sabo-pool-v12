// List all available RPC functions in the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Listing all available RPC functions...\n');

async function listFunctions() {
  // Try to call the function list RPC
  try {
    const { data, error } = await supabase.rpc('get_function_list');
    
    if (error) {
      console.log('❌ get_function_list not available:', error.message);
    } else {
      console.log('✅ Available functions:', data);
    }
  } catch (err) {
    console.log('❌ Cannot list functions via RPC');
  }
  
  // Let's test some challenge functions that might exist
  const possibleFunctions = [
    'accept_open_challenge',
    'accept_challenge', 
    'create_challenge',
    'create_open_challenge',
    'challenge_player',
    'join_challenge',
    'start_challenge',
    'complete_challenge',
    'get_open_challenges',
    'get_user_challenges',
    'get_challenge_stats'
  ];
  
  console.log('\n🔍 Testing possible challenge functions...');
  
  for (const funcName of possibleFunctions) {
    try {
      // Test with minimal parameters
      const { data, error } = await supabase.rpc(funcName);
      
      if (error) {
        if (error.code === '42883' || error.code === 'PGRST202') {
          // Function does not exist
          continue;
        } else {
          console.log(`✅ ${funcName}: EXISTS (${error.message})`);
        }
      } else {
        console.log(`✅ ${funcName}: EXISTS and returned data`);
      }
    } catch (err) {
      // Skip
    }
  }
  
  console.log('\n🎯 Now testing accept_open_challenge with proper UUID...');
  
  try {
    // Use a valid UUID format
    const testChallengeId = '550e8400-e29b-41d4-a716-446655440000';
    const testUserId = '550e8400-e29b-41d4-a716-446655440001';
    
    const { data, error } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: testChallengeId,
      p_user_id: testUserId
    });
    
    if (error) {
      console.log('🔍 accept_open_challenge with valid UUID:', error.message);
      console.log('   Code:', error.code);
      
      // This is expected behavior for non-existent IDs
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('   ✅ Function exists and validates properly!');
      }
    } else {
      console.log('✅ accept_open_challenge succeeded:', data);
    }
  } catch (err) {
    console.log('❌ accept_open_challenge test failed:', err.message);
  }
  
  console.log('\n📊 Checking current challenges...');
  
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_open_challenge', true)
      .eq('status', 'pending');
    
    if (error) {
      console.log('❌ Error fetching open challenges:', error.message);
    } else {
      console.log(`✅ Found ${challenges.length} open challenges`);
      if (challenges.length > 0) {
        console.log('   First challenge:', {
          id: challenges[0].id,
          challenger_id: challenges[0].challenger_id,
          status: challenges[0].status,
          is_open_challenge: challenges[0].is_open_challenge
        });
      }
    }
  } catch (err) {
    console.log('❌ Challenge query failed:', err.message);
  }
  
  console.log('\n🏁 Function analysis completed!');
}

await listFunctions();
