import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugSABOScoreFunction() {
  console.log('🔍 DEBUGGING submit_sabo_match_score FUNCTION');
  console.log('==============================================\n');
  
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // test 1
  const matchId = 'b6d2f212-f93a-42a0-84ee-64c98f9bb08f'; // Match 25
  
  // Test different parameter combinations
  const parameterTests = [
    {
      name: 'Original format (player1/player2 scores)',
      params: {
        p_match_id: matchId,
        p_player1_score: 3,
        p_player2_score: 1,
        p_submitted_by: 'test-user-id'
      }
    },
    {
      name: 'Winner/Loser format',
      params: {
        p_tournament_id: tournamentId,
        p_match_id: matchId,
        p_winner_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
        p_loser_id: '630730f6-6a4c-4e91-aab3-ce9bdc92057b',
        p_winner_score: 3,
        p_loser_score: 1
      }
    },
    {
      name: 'Simple format',
      params: {
        p_match_id: matchId,
        p_winner_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
        p_loser_id: '630730f6-6a4c-4e91-aab3-ce9bdc92057b'
      }
    },
    {
      name: 'Extended format',
      params: {
        p_tournament_id: tournamentId,
        p_match_id: matchId,
        p_player1_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
        p_player2_id: '630730f6-6a4c-4e91-aab3-ce9bdc92057b',
        p_player1_score: 3,
        p_player2_score: 1,
        p_submitted_by: 'test-user-id'
      }
    },
    {
      name: 'Minimal format',
      params: {
        match_id: matchId,
        winner_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
        loser_id: '630730f6-6a4c-4e91-aab3-ce9bdc92057b',
        winner_score: 3,
        loser_score: 1
      }
    }
  ];
  
  console.log('🧪 Testing different parameter combinations:\n');
  
  for (let i = 0; i < parameterTests.length; i++) {
    const test = parameterTests[i];
    console.log(`${i + 1}. Testing: ${test.name}`);
    console.log(`   Parameters: ${JSON.stringify(test.params, null, 2)}`);
    
    try {
      const { data, error } = await supabase.rpc('submit_sabo_match_score', test.params);
      
      if (error) {
        if (error.message.includes('could not find function')) {
          console.log(`   ❌ SCHEMA MISMATCH: ${error.message.slice(0, 100)}...`);
        } else {
          console.log(`   ✅ SCHEMA MATCH (Execution error): ${error.message.slice(0, 80)}...`);
        }
      } else {
        console.log(`   ✅ SUCCESS: Function executed successfully`);
        console.log(`   📋 Result: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`   ❌ EXCEPTION: ${err.message.slice(0, 80)}...`);
    }
    
    console.log('');
  }
  
  // Check available functions in database
  console.log('🔍 Checking available SABO functions in database:');
  
  // Alternative: Check using information_schema
  try {
    const { data: routines } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_definition')
      .eq('routine_name', 'submit_sabo_match_score');
      
    if (routines && routines.length > 0) {
      console.log('✅ Found function in information_schema');
      console.log(`📋 Routine count: ${routines.length}`);
    }
  } catch (error) {
    console.log('❌ Could not access information_schema');
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('==================');
  console.log('1. Check the correct parameter names in Supabase dashboard');
  console.log('2. Verify function exists and is published');
  console.log('3. Check RLS policies on the function');
  console.log('4. Try recreating the function with correct parameters');
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('==============');
  console.log('1. Go to Supabase Dashboard → Database → Functions');
  console.log('2. Find submit_sabo_match_score function');
  console.log('3. Check parameter names and types');
  console.log('4. Update SABOTournamentEngine to use correct parameters');
}

debugSABOScoreFunction();
