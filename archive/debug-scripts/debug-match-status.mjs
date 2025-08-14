import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugMatchStatus() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔍 Debugging Match Status Issues...\n');
  
  // Check all matches status
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, round_number, status, player1_id, player2_id, winner_id, bracket_type')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
  
  console.log('📊 Current Match Status:');
  console.log('========================');
  
  allMatches?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    const status = match.status;
    const hasWinner = match.winner_id ? '🏆' : '⏳';
    
    console.log(`Match ${match.match_number} (R${match.round_number}): ${status} | P1:${hasP1} P2:${hasP2} | Winner:${hasWinner}`);
  });
  
  // Check specifically problematic matches
  const problematicMatches = allMatches?.filter(match => 
    match.status !== 'ready' && match.status !== 'completed' && match.player1_id && match.player2_id
  );
  
  if (problematicMatches && problematicMatches.length > 0) {
    console.log('\n⚠️  Problematic Matches Found:');
    problematicMatches.forEach(match => {
      console.log(`Match ${match.match_number}: Status="${match.status}" but has both players`);
    });
    
    // Fix them
    console.log('\n🔧 Fixing problematic matches...');
    for (const match of problematicMatches) {
      await supabase
        .from('tournament_matches')
        .update({ status: 'ready' })
        .eq('tournament_id', tournamentId)
        .eq('match_number', match.match_number);
      
      console.log(`✅ Fixed Match ${match.match_number} status to 'ready'`);
    }
  }
  
  // Check matches that should be ready but aren't
  const shouldBeReady = allMatches?.filter(match => 
    match.player1_id && match.player2_id && match.status === 'pending'
  );
  
  if (shouldBeReady && shouldBeReady.length > 0) {
    console.log('\n🔧 Fixing matches that should be ready...');
    for (const match of shouldBeReady) {
      await supabase
        .from('tournament_matches')
        .update({ status: 'ready' })
        .eq('tournament_id', tournamentId)
        .eq('match_number', match.match_number);
      
      console.log(`✅ Fixed Match ${match.match_number} from 'pending' to 'ready'`);
    }
  }
  
  // Final verification
  const { data: finalMatches } = await supabase
    .from('tournament_matches')
    .select('match_number, round_number, status, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
  
  console.log('\n✅ Final Status After Fixes:');
  console.log('============================');
  
  const readyMatches = [];
  const completedMatches = [];
  
  finalMatches?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    const canPlay = match.player1_id && match.player2_id;
    
    if (match.status === 'ready' && canPlay) {
      readyMatches.push(match.match_number);
    } else if (match.status === 'completed') {
      completedMatches.push(match.match_number);
    }
    
    console.log(`Match ${match.match_number} (R${match.round_number}): ${match.status} | P1:${hasP1} P2:${hasP2} ${canPlay ? '🎮' : '⏳'}`);
  });
  
  console.log(`\n🎮 Ready to play: ${readyMatches.length} matches [${readyMatches.join(', ')}]`);
  console.log(`✅ Completed: ${completedMatches.length} matches [${completedMatches.join(', ')}]`);
  console.log('\n🚀 All matches should now be ready for score submission!');
}

debugMatchStatus();
