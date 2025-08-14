import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAndFixAllMatchReadiness() {
  console.log('🔍 CHECKING ALL MATCH READINESS');
  console.log('================================\n');
  
  const tournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  // Get all matches
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (!allMatches) {
    console.log('❌ No matches found');
    return;
  }
  
  console.log(`📊 Total matches: ${allMatches.length}`);
  
  // Categorize matches
  const readyMatches = allMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
  const completedMatches = allMatches.filter(m => m.status === 'completed');
  const pendingWithBothPlayers = allMatches.filter(m => m.status === 'pending' && m.player1_id && m.player2_id);
  const pendingWithOnePlayer = allMatches.filter(m => m.status === 'pending' && ((m.player1_id && !m.player2_id) || (!m.player1_id && m.player2_id)));
  const emptyMatches = allMatches.filter(m => m.status === 'pending' && !m.player1_id && !m.player2_id);
  
  console.log('📋 MATCH STATUS BREAKDOWN:');
  console.log(`✅ Ready matches: ${readyMatches.length}`);
  console.log(`🏁 Completed matches: ${completedMatches.length}`);
  console.log(`⏳ Pending with both players: ${pendingWithBothPlayers.length}`);
  console.log(`🔶 Pending with one player: ${pendingWithOnePlayer.length}`);
  console.log(`⭕ Empty matches: ${emptyMatches.length}`);
  
  // Fix pending matches that have both players but wrong status
  if (pendingWithBothPlayers.length > 0) {
    console.log('\n🔧 FIXING PENDING MATCHES WITH BOTH PLAYERS:');
    
    for (const match of pendingWithBothPlayers) {
      console.log(`Fixing Match ${match.match_number} (Round ${match.round_number})`);
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({ 
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id);
        
      if (error) {
        console.log(`❌ Error fixing match ${match.match_number}:`, error.message);
      } else {
        console.log(`✅ Match ${match.match_number} now ready`);
      }
    }
  }
  
  // Show detailed status by round
  console.log('\n📊 DETAILED STATUS BY ROUND:');
  
  const rounds = [1, 2, 3, 101, 102, 103, 201, 202, 250, 300];
  
  rounds.forEach(roundNum => {
    const roundMatches = allMatches.filter(m => m.round_number === roundNum);
    if (roundMatches.length > 0) {
      const roundName = {
        1: 'Round 1 (Winners)',
        2: 'Round 2 (Winners)', 
        3: 'Round 3 (Winners)',
        101: 'Losers Round 1',
        102: 'Losers Round 2', 
        103: 'Losers Round 3',
        201: 'Losers Round 4',
        202: 'Losers Round 5',
        250: 'Semifinals',
        300: 'Grand Final'
      }[roundNum] || `Round ${roundNum}`;
      
      console.log(`\n${roundName}:`);
      roundMatches.forEach(match => {
        const p1Status = match.player1_id ? '✅' : '❌';
        const p2Status = match.player2_id ? '✅' : '❌';
        const statusIcon = match.status === 'ready' ? '🟢' : 
                          match.status === 'completed' ? '🏁' : '🟡';
        
        console.log(`  Match ${match.match_number}: P1:${p1Status} P2:${p2Status} ${statusIcon}${match.status}`);
      });
    }
  });
  
  // After fixing, check again
  console.log('\n🔄 RE-CHECKING AFTER FIXES...');
  
  const { data: updatedMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (updatedMatches) {
    const newReadyMatches = updatedMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
    const newCompletedMatches = updatedMatches.filter(m => m.status === 'completed');
    const newPendingWithBoth = updatedMatches.filter(m => m.status === 'pending' && m.player1_id && m.player2_id);
    
    console.log('\n📊 UPDATED COUNTS:');
    console.log(`✅ Ready matches: ${newReadyMatches.length}`);
    console.log(`🏁 Completed matches: ${newCompletedMatches.length}`);
    console.log(`⏳ Still pending with both players: ${newPendingWithBoth.length}`);
    
    if (newPendingWithBoth.length === 0) {
      console.log('\n🎉 ALL MATCHES WITH BOTH PLAYERS ARE NOW READY!');
    }
    
    // Show matches available for score submission
    console.log('\n🎮 MATCHES READY FOR SCORE SUBMISSION:');
    newReadyMatches.forEach(match => {
      const roundName = {
        1: 'R1', 2: 'R2', 3: 'R3',
        101: 'LR1', 102: 'LR2', 103: 'LR3',
        201: 'LR4', 202: 'LR5',
        250: 'SF', 300: 'GF'
      }[match.round_number] || `R${match.round_number}`;
      
      console.log(`  🟢 Match ${match.match_number} (${roundName}) - Ready to play!`);
    });
  }
}

checkAndFixAllMatchReadiness();
