// Test current SABO function and identify the issue
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseSABOIssue() {
  console.log('🔍 Diagnosing SABO score submission issue...');
  
  // 1. Check if sabo_tournament_matches table exists and has data
  console.log('\n1. Checking sabo_tournament_matches table...');
  const { data: saboMatches, error: saboError } = await supabase
    .from('sabo_tournament_matches')
    .select('id, player1_score, player2_score, status')
    .limit(3);
    
  if (saboError) {
    console.log('❌ Error accessing sabo_tournament_matches:', saboError.message);
  } else {
    console.log('✅ sabo_tournament_matches accessible:', saboMatches?.length || 0, 'matches found');
    console.log('Sample data:', saboMatches?.[0]);
  }
  
  // 2. Check if tournament_matches table exists
  console.log('\n2. Checking tournament_matches table...');
  const { data: tournamentMatches, error: tournamentError } = await supabase
    .from('tournament_matches')
    .select('id, score_player1, score_player2, status')
    .limit(3);
    
  if (tournamentError) {
    console.log('❌ Error accessing tournament_matches:', tournamentError.message);
  } else {
    console.log('✅ tournament_matches accessible:', tournamentMatches?.length || 0, 'matches found');
    console.log('Sample data:', tournamentMatches?.[0]);
  }
  
  // 3. Check current function definition
  console.log('\n3. Testing submit_sabo_match_score function...');
  
  if (saboMatches?.length > 0) {
    const testMatchId = saboMatches[0].id;
    console.log('🧪 Testing with match ID:', testMatchId);
    
    const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatchId,
      p_player1_score: 5,
      p_player2_score: 3,
      p_submitted_by: null
    });
    
    if (funcError) {
      console.log('❌ Function error:', funcError.message);
    } else {
      console.log('✅ Function result:', result);
      
      // Check if the scores were actually updated
      const { data: updatedMatch, error: checkError } = await supabase
        .from('sabo_tournament_matches')
        .select('id, player1_score, player2_score, status')
        .eq('id', testMatchId)
        .single();
        
      if (checkError) {
        console.log('❌ Error checking updated match:', checkError.message);
      } else {
        console.log('📊 Updated match data:', updatedMatch);
        
        if (updatedMatch.player1_score === 5 && updatedMatch.player2_score === 3) {
          console.log('🎉 SUCCESS: Scores were updated correctly in sabo_tournament_matches!');
        } else {
          console.log('❌ ISSUE: Scores were not updated correctly');
        }
      }
    }
  }
  
  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('='.repeat(50));
  console.log('The issue might be:');
  console.log('1. Function uses wrong table (tournament_matches vs sabo_tournament_matches)');
  console.log('2. Function uses wrong column names (score_player1/2 vs player1/2_score)');
  console.log('3. Frontend not refreshing data properly after score submission');
  console.log('\n💡 SOLUTION:');
  console.log('Run the SQL in fix-sabo-function-manual.sql in Supabase SQL Editor');
}

diagnoseSABOIssue().catch(console.error);
