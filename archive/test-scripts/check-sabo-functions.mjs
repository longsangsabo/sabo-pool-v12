import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSABOFunctions() {
  console.log('🔍 Checking SABO Functions in Database...\n');
  
  const requiredFunctions = [
    'submit_sabo_match_score',
    'advance_sabo_tournament', 
    'assign_participant_to_next_match',
    'generate_sabo_tournament_bracket'
  ];
  
  console.log('📋 Checking Function Availability:');
  
  for (const func of requiredFunctions) {
    try {
      // Test if function exists by trying to get its definition
      const { data, error } = await supabase.rpc('pg_get_functiondef', {
        func_oid: `${func}::regproc`
      });
      
      if (error && error.message.includes('does not exist')) {
        console.log(`❌ ${func}: NOT FOUND`);
      } else if (error) {
        console.log(`⚠️  ${func}: ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${func}: EXISTS`);
      }
    } catch (e) {
      // Alternative check - try to call function with dummy params
      try {
        await supabase.rpc(func, {});
      } catch (callError) {
        if (callError.message.includes('Could not find the function')) {
          console.log(`❌ ${func}: NOT FOUND`);
        } else {
          console.log(`✅ ${func}: EXISTS (parameter error expected)`);
        }
      }
    }
  }
  
  console.log('\n🎯 Testing actual function calls...\n');
  
  // Test submit_sabo_match_score with real data
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  const { data: testMatch } = await supabase
    .from('tournament_matches')
    .select('id, status, player1_id, player2_id, round_number')
    .eq('tournament_id', tournamentId)
    .eq('match_number', 10) // Use our test match
    .single();
    
  if (testMatch) {
    console.log(`🎮 Testing with Match 10 (Round ${testMatch.round_number}):`);
    console.log(`- ID: ${testMatch.id}`);
    console.log(`- Status: ${testMatch.status}`);
    console.log(`- Players: ${testMatch.player1_id ? 'P1✅' : 'P1❌'} ${testMatch.player2_id ? 'P2✅' : 'P2❌'}`);
    
    if (testMatch.status === 'ready') {
      console.log('\n🚀 Testing submit_sabo_match_score...');
      
      try {
        const { data: result, error } = await supabase.rpc('submit_sabo_match_score', {
          p_match_id: testMatch.id,
          p_player1_score: 8,
          p_player2_score: 4,
          p_submitted_by: testMatch.player1_id
        });
        
        if (error) {
          console.log('❌ submit_sabo_match_score failed:', error.message);
        } else {
          console.log('✅ submit_sabo_match_score SUCCESS!');
          console.log('Result:', JSON.stringify(result, null, 2));
          
          // Check if advancement worked
          if (result.advancement?.success) {
            console.log('\n🎯 Checking advancement results...');
            
            // Check Round 3 (next round for Round 2 winners)
            const { data: round3Matches } = await supabase
              .from('tournament_matches')
              .select('match_number, player1_id, player2_id, status')
              .eq('tournament_id', tournamentId)
              .eq('round_number', 3)
              .order('match_number');
              
            console.log('Round 3 Status After Advancement:');
            round3Matches?.forEach(match => {
              const hasP1 = match.player1_id ? '✅' : '❌';
              const hasP2 = match.player2_id ? '✅' : '❌';
              console.log(`Match ${match.match_number}: P1:${hasP1} P2:${hasP2} | Status: ${match.status}`);
            });
            
            // Check Losers Branch B (where Round 2 losers should go)
            const { data: losersR201Matches } = await supabase
              .from('tournament_matches')
              .select('match_number, player1_id, player2_id, status')
              .eq('tournament_id', tournamentId)
              .eq('round_number', 201)
              .order('match_number');
              
            console.log('\nLosers Branch B (Round 201) Status:');
            losersR201Matches?.forEach(match => {
              const hasP1 = match.player1_id ? '✅' : '❌';
              const hasP2 = match.player2_id ? '✅' : '❌';
              console.log(`Match ${match.match_number}: P1:${hasP1} P2:${hasP2} | Status: ${match.status}`);
            });
          }
        }
      } catch (err) {
        console.log('❌ Exception during test:', err.message);
      }
      
    } else {
      console.log('⚠️  Match not ready for testing');
    }
  }
}

checkSABOFunctions();
