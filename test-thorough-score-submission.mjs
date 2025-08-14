import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testScoreSubmissionThorough() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🎯 Testing Score Submission Thoroughly...\n');
  
  // Test Match 9 (Round 2)
  const testMatch = 9;
  
  // First verify match status
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch)
    .single();
    
  console.log(`📊 Match ${testMatch} Details:`);
  console.log(`- Status: ${match?.status}`);
  console.log(`- Player 1: ${match?.player1_id?.substring(0,8)}...`);
  console.log(`- Player 2: ${match?.player2_id?.substring(0,8)}...`);
  console.log(`- Current Winner: ${match?.winner_id || 'None'}`);
  
  if (match?.status !== 'ready') {
    console.log('\n🔧 Fixing match status to ready...');
    await supabase
      .from('tournament_matches')
      .update({ status: 'ready' })
      .eq('tournament_id', tournamentId)
      .eq('match_number', testMatch);
    console.log('✅ Match status updated to ready');
  }
  
  // Test score submission
  console.log(`\n🎮 Testing score submission for Match ${testMatch}...`);
  
  const testPayload = {
    tournament_id: tournamentId,
    match_number: testMatch,
    score_player1: 5,
    score_player2: 3,
    winner_id: match?.player1_id
  };
  
  console.log('Payload:', testPayload);
  
  try {
    const { data: result, error } = await supabase.rpc('submit_sabo_match_score', testPayload);
    
    if (error) {
      console.error('❌ RPC Error:', error);
      console.log('Error Details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ RPC Success!');
      console.log('Result:', JSON.stringify(result, null, 2));
      
      // Verify the match was updated
      const { data: updatedMatch } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('match_number', testMatch)
        .single();
        
      console.log(`\n📊 Match ${testMatch} After Score Submission:`);
      console.log(`- Status: ${updatedMatch?.status}`);
      console.log(`- Score: ${updatedMatch?.score_player1}-${updatedMatch?.score_player2}`);
      console.log(`- Winner: ${updatedMatch?.winner_id?.substring(0,8)}...`);
    }
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testScoreSubmissionThorough();
