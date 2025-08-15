import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugSABOLogic() {
  console.log('🔍 DEBUGGING SABO ADVANCEMENT LOGIC BASED ON DOCUMENTATION');
  console.log('==========================================================\n');
  
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  // SABO Structure theo documentation:
  console.log('📚 SABO DOUBLE ELIMINATION STRUCTURE:');
  console.log('=====================================');
  console.log('WINNERS BRACKET:');
  console.log('- Round 1: 8 matches (16→8 players)');
  console.log('- Round 2: 4 matches (8→4 players)');
  console.log('- Round 3: 2 matches (4→2 players)');
  console.log('');
  console.log('LOSERS BRACKET:');
  console.log('- Branch A:');
  console.log('  - Round 101: 4 matches (R1 losers)');
  console.log('  - Round 102: 2 matches');
  console.log('  - Round 103: 1 match');
  console.log('- Branch B:');
  console.log('  - Round 201: 2 matches (R2 losers)');
  console.log('  - Round 202: 1 match');
  console.log('');
  console.log('FINALS:');
  console.log('- Round 250: 2 semifinals (2 from WB + 1 from Branch A + 1 from Branch B)');
  console.log('- Round 300: 1 final');
  console.log('');
  
  // Test the advancement logic
  console.log('🎯 TESTING ACTUAL VS EXPECTED ADVANCEMENT:');
  console.log('==========================================\n');
  
  // Test Round 2 Match completion
  const testMatch = 10; // Round 2
  
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch)
    .single();
    
  console.log(`📊 Testing Match ${testMatch} (Round ${match?.round_number}):`);
  console.log(`- Player 1: ${match?.player1_id?.substring(0,8)}...`);
  console.log(`- Player 2: ${match?.player2_id?.substring(0,8)}...`);
  console.log(`- Status: ${match?.status}`);
  
  if (match?.round_number === 2) {
    console.log('\n🚀 Round 2 Advancement Logic Should Be:');
    console.log('- WINNER → Goes to Round 3 (semifinals qualification)');
    console.log('- LOSER → Goes to Losers Branch B (Round 201)');
    
    // Test submission và check results
    console.log('\n🧪 Testing score submission...');
    
    try {
      const { data: result, error } = await supabase.rpc('submit_sabo_match_score', {
        p_match_id: match?.id,
        p_player1_score: 9,
        p_player2_score: 6,
        p_submitted_by: match?.player1_id
      });
      
      if (error) {
        console.log('❌ Score submission failed:', error.message);
        return;
      }
      
      console.log('✅ Score submitted successfully!');
      console.log('Winner ID:', result.winner_id?.substring(0,8) + '...');
      
      // Check advancement results
      if (result.advancement?.success) {
        console.log('\n🎯 Checking where players were advanced...');
        
        // Check Round 3 (Winner should go here)
        const { data: round3Matches } = await supabase
          .from('tournament_matches')
          .select('match_number, player1_id, player2_id, status')
          .eq('tournament_id', tournamentId)
          .eq('round_number', 3)
          .order('match_number');
          
        console.log('\n🏆 Round 3 (Winner should be here):');
        round3Matches?.forEach(match => {
          const hasP1 = match.player1_id ? '✅' : '❌';
          const hasP2 = match.player2_id ? '✅' : '❌';
          const p1Display = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
          const p2Display = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
          console.log(`  Match ${match.match_number}: ${p1Display} vs ${p2Display} | Status: ${match.status}`);
          
          // Check if our winner is here
          if (match.player1_id === result.winner_id || match.player2_id === result.winner_id) {
            console.log(`    ✅ WINNER FOUND HERE! (${result.winner_id.substring(0,8)}...)`);
          }
        });
        
        // Check Losers Branch B Round 201 (Loser should go here)
        const { data: losersR201Matches } = await supabase
          .from('tournament_matches')
          .select('match_number, player1_id, player2_id, status')
          .eq('tournament_id', tournamentId)
          .eq('round_number', 201)
          .order('match_number');
          
        console.log('\n💔 Losers Branch B Round 201 (Loser should be here):');
        const loserId = result.winner_id === match.player1_id ? match.player2_id : match.player1_id;
        console.log(`Expected loser: ${loserId?.substring(0,8)}...`);
        
        losersR201Matches?.forEach(match => {
          const hasP1 = match.player1_id ? '✅' : '❌';
          const hasP2 = match.player2_id ? '✅' : '❌';
          const p1Display = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
          const p2Display = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
          console.log(`  Match ${match.match_number}: ${p1Display} vs ${p2Display} | Status: ${match.status}`);
          
          // Check if our loser is here
          if (match.player1_id === loserId || match.player2_id === loserId) {
            console.log(`    ✅ LOSER FOUND HERE! (${loserId?.substring(0,8)}...)`);
          }
        });
        
        console.log('\n📋 Summary of Advancement:');
        console.log('- Advancement Success:', result.advancement.success ? '✅' : '❌');
        console.log('- Round Completed:', result.advancement.round_completed);
        console.log('- Winner Advanced:', result.advancement.winner_advanced ? '✅' : '❌');
        
      } else {
        console.log('❌ Advancement failed:', result.advancement);
      }
      
    } catch (err) {
      console.log('❌ Error during testing:', err.message);
    }
  }
}

debugSABOLogic();
