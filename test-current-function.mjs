// Simple script to update SABO function with direct query
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSABOFunction() {
  console.log('🔧 Updating SABO function directly...');
  
  const { data, error } = await supabase
    .from('pg_proc')
    .select('proname')
    .eq('proname', 'submit_sabo_match_score');
    
  if (error) {
    console.log('⚠️ Cannot check function existence:', error.message);
  } else {
    console.log('✅ Function exists:', data?.length > 0);
  }
  
  // Since we can't easily update function via client, let's test with current function
  console.log('\n🧪 Testing current function behavior...');
  
  // Get a test match
  const { data: matches, error: matchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .limit(1);
    
  if (matchError) {
    console.log('❌ Error getting matches:', matchError.message);
    return;
  }
  
  if (!matches?.length) {
    console.log('⚠️ No matches found for testing');
    return;
  }
  
  const testMatch = matches[0];
  console.log('📍 Test match columns:', Object.keys(testMatch));
  console.log('📍 Test match data:', testMatch);
  
  // Test the function
  const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
    p_match_id: testMatch.id,
    p_player1_score: 6,
    p_player2_score: 2,
    p_submitted_by: null
  });
  
  if (funcError) {
    console.log('❌ Function error:', funcError.message);
    
    if (funcError.message.includes('does not exist')) {
      console.log('\n💡 DIAGNOSIS: Function is using wrong column names');
      console.log('📋 MANUAL FIX REQUIRED:');
      console.log('1. Open Supabase SQL Editor');
      console.log('2. Run the SQL in fix-sabo-function-manual.sql');
      console.log('3. This will update the function to use score_player1/score_player2');
    }
  } else {
    console.log('✅ Function result:', result);
    
    // Check if data was actually updated
    const { data: checkMatch, error: checkError } = await supabase
      .from('tournament_matches')
      .select('score_player1, score_player2, status')
      .eq('id', testMatch.id)
      .single();
      
    if (!checkError) {
      console.log('📊 After function call:', checkMatch);
    }
  }
}

updateSABOFunction().catch(console.error);
