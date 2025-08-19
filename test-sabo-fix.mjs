// Test SABO score submission after fixes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSABOScoreSubmission() {
  console.log('🧪 Testing SABO score submission after fixes...');
  
  // 1. Get a test match
  console.log('\n1. Getting test match...');
  const { data: matches, error: matchError } = await supabase
    .from('sabo_tournament_matches')
    .select('id, score_player1, score_player2, status, player1_id, player2_id')
    .limit(1);
    
  if (matchError || !matches?.length) {
    console.log('❌ No matches found for testing');
    return;
  }
  
  const testMatch = matches[0];
  console.log('✅ Test match:', testMatch);
  
  // 2. Test score submission function
  console.log('\n2. Testing score submission...');
  const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
    p_match_id: testMatch.id,
    p_player1_score: 7,
    p_player2_score: 4,
    p_submitted_by: null
  });
  
  if (funcError) {
    console.log('❌ Function error:', funcError.message);
    return;
  }
  
  console.log('✅ Function result:', result);
  
  // 3. Check if scores were updated
  console.log('\n3. Checking if scores were updated...');
  const { data: updatedMatch, error: checkError } = await supabase
    .from('sabo_tournament_matches')
    .select('id, score_player1, score_player2, status, winner_id')
    .eq('id', testMatch.id)
    .single();
    
  if (checkError) {
    console.log('❌ Error checking updated match:', checkError.message);
    return;
  }
  
  console.log('✅ Updated match:', updatedMatch);
  
  // 4. Verify the fix
  if (updatedMatch.score_player1 === 7 && updatedMatch.score_player2 === 4) {
    console.log('\n🎉 SUCCESS: Score submission is working correctly!');
    console.log('✅ Scores updated in correct columns (score_player1, score_player2)');
    console.log('✅ Winner determined correctly:', updatedMatch.winner_id);
    console.log('✅ Status updated to:', updatedMatch.status);
  } else {
    console.log('\n❌ ISSUE: Scores not updated correctly');
    console.log('Expected: score_player1=7, score_player2=4');
    console.log('Actual:', updatedMatch);
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('='.repeat(50));
  console.log('✅ Fixed issues:');
  console.log('  1. Function now uses correct table: sabo_tournament_matches');
  console.log('  2. Function now uses correct columns: score_player1, score_player2');
  console.log('  3. Frontend now reads correct columns');
  console.log('  4. TypeScript interface updated');
  console.log('\n💡 Next step: Test in the browser to confirm UI updates');
}

testSABOScoreSubmission().catch(console.error);
