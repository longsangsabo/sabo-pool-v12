import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkRPCFunctions() {
  console.log('🔍 Checking available RPC functions...\n');
  
  // Check what submit functions exist
  const { data: functions, error } = await supabase
    .from('information_schema.routines')
    .select('routine_name, routine_definition')
    .like('routine_name', '%submit%')
    .eq('routine_schema', 'public');
    
  if (error) {
    console.log('❌ Could not query functions directly');
    console.log('Let me check the actual function signature...\n');
  } else {
    console.log('📋 Available submit functions:');
    functions?.forEach(func => {
      console.log(`- ${func.routine_name}`);
    });
  }
  
  // Test with the correct signature based on the hint
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  const testMatch = 9;
  
  // Get match ID instead of match_number
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch)
    .single();
    
  console.log(`\n🎯 Testing with correct signature for Match ${testMatch}:`);
  console.log(`Match ID: ${match?.id}`);
  
  // Test with the signature suggested in the hint
  const testPayload = {
    p_match_id: match?.id,
    p_player1_score: 5,
    p_player2_score: 3,
    p_submitted_by: match?.player1_id  // Using winner as submitter
  };
  
  console.log('New Payload:', testPayload);
  
  try {
    const { data: result, error } = await supabase.rpc('submit_sabo_match_score', testPayload);
    
    if (error) {
      console.error('❌ Still Error:', error);
      
      // Try alternative signatures
      console.log('\n🔄 Trying alternative approaches...');
      
      // Try direct match update approach
      const { data: updateResult, error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          score_player1: 5,
          score_player2: 3,
          winner_id: match?.player1_id,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', match?.id)
        .select();
      
      if (updateError) {
        console.error('❌ Direct update also failed:', updateError);
      } else {
        console.log('✅ Direct update succeeded!');
        console.log('Updated match:', updateResult);
        
        // Now we need to handle advancement manually
        console.log('\n🎯 Handling advancement manually...');
        await handleAdvancement(tournamentId, testMatch, match?.player1_id);
      }
      
    } else {
      console.log('✅ RPC Success with correct signature!');
      console.log('Result:', result);
    }
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

async function handleAdvancement(tournamentId, matchNumber, winnerId) {
  console.log(`🚀 Handling advancement for Match ${matchNumber}...`);
  
  // For Round 2 matches, winners go to Round 3
  if (matchNumber >= 9 && matchNumber <= 12) {
    const round3MatchNumber = Math.floor((matchNumber - 9) / 2) + 13;
    const isFirstMatch = (matchNumber - 9) % 2 === 0;
    
    console.log(`Winner goes to Round 3 Match ${round3MatchNumber} as ${isFirstMatch ? 'Player 1' : 'Player 2'}`);
    
    const updateField = isFirstMatch ? 'player1_id' : 'player2_id';
    
    await supabase
      .from('tournament_matches')
      .update({
        [updateField]: winnerId,
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)
      .eq('match_number', round3MatchNumber);
      
    // Check if both players are assigned
    const { data: round3Match } = await supabase
      .from('tournament_matches')
      .select('player1_id, player2_id')
      .eq('tournament_id', tournamentId)
      .eq('match_number', round3MatchNumber)
      .single();
      
    if (round3Match?.player1_id && round3Match?.player2_id) {
      await supabase
        .from('tournament_matches')
        .update({ status: 'ready' })
        .eq('tournament_id', tournamentId)
        .eq('match_number', round3MatchNumber);
      console.log(`✅ Round 3 Match ${round3MatchNumber} is now ready!`);
    }
  }
}

checkRPCFunctions();
