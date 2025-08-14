import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function resetAndTestMatch10() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  const testMatch = 10;
  
  console.log('🔧 Resetting Match 10 for fresh test...');
  
  // Reset match
  await supabase
    .from('tournament_matches')
    .update({
      status: 'ready',
      score_player1: null,
      score_player2: null,
      winner_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch);
    
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch)
    .single();
    
  console.log(`📊 Match ${testMatch} Reset Complete:`);
  console.log(`- Round: ${match?.round_number}`);
  console.log(`- Player 1: ${match?.player1_id?.substring(0,8)}...`);
  console.log(`- Player 2: ${match?.player2_id?.substring(0,8)}...`);
  console.log(`- Status: ${match?.status}`);
  
  console.log('\n🧪 Testing score submission with fresh match...');
  
  try {
    const { data: result, error } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: match?.id,
      p_player1_score: 10,
      p_player2_score: 7,
      p_submitted_by: match?.player1_id
    });
    
    if (error) {
      console.log('❌ RPC Error:', error.message);
      console.log('Error Details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ RPC Success!');
    console.log('Full Result:', JSON.stringify(result, null, 2));
    
    if (result.winner_id) {
      console.log(`\n🏆 Winner: ${result.winner_id.substring(0,8)}...`);
      
      // Determine loser
      const loserId = result.winner_id === match.player1_id ? match.player2_id : match.player1_id;
      console.log(`💔 Loser: ${loserId?.substring(0,8)}...`);
      
      // Check advancement
      if (result.advancement) {
        console.log('\n🎯 Advancement Details:');
        console.log('- Success:', result.advancement.success);
        console.log('- Winner Advanced:', result.advancement.winner_advanced);
        console.log('- Round Completed:', result.advancement.round_completed);
        
        // Now check where they actually went
        await checkPlayerPlacement(tournamentId, result.winner_id, loserId);
      }
    }
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

async function checkPlayerPlacement(tournamentId, winnerId, loserId) {
  console.log('\n🔍 Checking Player Placement After Advancement...');
  
  // Check Round 3 for winner
  const { data: round3Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id, status')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 3)
    .order('match_number');
    
  console.log('\n🏆 Round 3 (Winners Bracket):');
  let winnerFound = false;
  round3Matches?.forEach(match => {
    const p1Display = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
    const p2Display = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
    console.log(`  Match ${match.match_number}: ${p1Display} vs ${p2Display} | Status: ${match.status}`);
    
    if (match.player1_id === winnerId || match.player2_id === winnerId) {
      console.log(`    ✅ WINNER FOUND HERE!`);
      winnerFound = true;
    }
  });
  
  if (!winnerFound) {
    console.log('    ❌ Winner NOT found in Round 3');
  }
  
  // Check Losers Branch B Round 201 for loser
  const { data: losersR201Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id, status')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 201)
    .order('match_number');
    
  console.log('\n💔 Losers Branch B Round 201:');
  let loserFound = false;
  losersR201Matches?.forEach(match => {
    const p1Display = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
    const p2Display = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
    console.log(`  Match ${match.match_number}: ${p1Display} vs ${p2Display} | Status: ${match.status}`);
    
    if (match.player1_id === loserId || match.player2_id === loserId) {
      console.log(`    ✅ LOSER FOUND HERE!`);
      loserFound = true;
    }
  });
  
  if (!loserFound) {
    console.log('    ❌ Loser NOT found in Losers Branch B Round 201');
  }
  
  // Summary
  console.log('\n📋 ADVANCEMENT SUMMARY:');
  console.log(`- Winner correctly placed in Round 3: ${winnerFound ? '✅' : '❌'}`);
  console.log(`- Loser correctly placed in Losers Branch B: ${loserFound ? '✅' : '❌'}`);
  
  if (!winnerFound || !loserFound) {
    console.log('\n⚠️  ADVANCEMENT LOGIC HAS ISSUES! Need to fix the database functions.');
  } else {
    console.log('\n🎉 ADVANCEMENT LOGIC WORKING PERFECTLY!');
  }
}

resetAndTestMatch10();
