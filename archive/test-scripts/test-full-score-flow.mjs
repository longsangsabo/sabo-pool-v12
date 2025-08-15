import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testFullScoreFlow() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  const testMatch = 9;
  
  console.log('🔍 Testing Full Score Submission Flow...\n');
  
  // Get match details
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch)
    .single();
    
  console.log(`📊 Match ${testMatch} Details:`);
  console.log(`- ID: ${match?.id}`);
  console.log(`- Status: ${match?.status}`);
  console.log(`- Player 1: ${match?.player1_id}`);
  console.log(`- Player 2: ${match?.player2_id}`);
  
  if (match?.status !== 'ready') {
    console.log('\n🔧 Setting match to ready status...');
    await supabase
      .from('tournament_matches')
      .update({ status: 'ready' })
      .eq('id', match?.id);
  }
  
  // Test score submission with exact parameters from hook
  const testPayload = {
    p_match_id: match?.id,
    p_player1_score: 7,
    p_player2_score: 5,
    p_submitted_by: match?.player1_id // Use player1 as submitter
  };
  
  console.log('\n🎮 Submitting score with payload:', testPayload);
  
  try {
    const { data: result, error } = await supabase.rpc('submit_sabo_match_score', testPayload);
    
    if (error) {
      console.error('❌ RPC Error:', error);
      
      // If auth fails, try with a generic UUID
      console.log('\n🔄 Trying with generic submitter ID...');
      const genericPayload = {
        ...testPayload,
        p_submitted_by: '00000000-0000-0000-0000-000000000000'
      };
      
      const { data: result2, error: error2 } = await supabase.rpc('submit_sabo_match_score', genericPayload);
      
      if (error2) {
        console.error('❌ Still failed with generic ID:', error2);
      } else {
        console.log('✅ Success with generic ID:', result2);
      }
      
    } else {
      console.log('✅ RPC Success!');
      console.log('Result:', JSON.stringify(result, null, 2));
      
      // Check advancement results
      if (result.advancement?.success) {
        console.log('\n🚀 Advancement Details:');
        console.log(`- Round Completed: ${result.advancement.round_completed}`);
        console.log(`- Winner Advanced: ${result.advancement.winner_advanced}`);
        console.log(`- Tournament Complete: ${result.advancement.tournament_complete}`);
        
        // Verify next round has player
        const { data: nextRoundMatches } = await supabase
          .from('tournament_matches')
          .select('match_number, player1_id, player2_id, status')
          .eq('tournament_id', tournamentId)
          .eq('round_number', 3)
          .order('match_number');
          
        console.log('\n🎯 Round 3 Status After Advancement:');
        nextRoundMatches?.forEach(match => {
          const hasP1 = match.player1_id ? '✅' : '❌';
          const hasP2 = match.player2_id ? '✅' : '❌';
          console.log(`Match ${match.match_number}: P1:${hasP1} P2:${hasP2} | Status: ${match.status}`);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testFullScoreFlow();
