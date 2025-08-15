import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function makeAllMatchesReady() {
  console.log('🚀 MAKING ALL MATCHES READY FOR SCORE SUBMISSION');
  console.log('==============================================\n');
  
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // "test 1"
  
  console.log(`🎯 Working with tournament: test 1`);
  console.log(`Tournament ID: ${tournamentId}\n`);
  
  // Get ALL matches for this tournament
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
  
  console.log(`📊 Found ${allMatches.length} matches total`);
  
  // Show current status
  const ready = allMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
  const completed = allMatches.filter(m => m.status === 'completed');
  const pendingWithBoth = allMatches.filter(m => m.status === 'pending' && m.player1_id && m.player2_id);
  const pendingIncomplete = allMatches.filter(m => m.status === 'pending' && (!m.player1_id || !m.player2_id));
  
  console.log('📋 BEFORE FIX:');
  console.log(`✅ Ready: ${ready.length}`);
  console.log(`🏁 Completed: ${completed.length}`);
  console.log(`⏳ Pending with both players: ${pendingWithBoth.length}`);
  console.log(`🔶 Pending incomplete: ${pendingIncomplete.length}`);
  
  // Strategy: Make ALL matches with both players ready
  const matchesToFix = allMatches.filter(m => 
    m.player1_id && m.player2_id && m.status !== 'completed' && m.status !== 'ready'
  );
  
  console.log(`\n🔧 FIXING ${matchesToFix.length} MATCHES:`);
  
  if (matchesToFix.length > 0) {
    for (const match of matchesToFix) {
      console.log(`Making Match ${match.match_number} (Round ${match.round_number}) ready...`);
      
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
        console.log(`✅ Match ${match.match_number} now READY`);
      }
    }
  } else {
    console.log('No matches need fixing - all good!');
  }
  
  // For incomplete matches, let's see if we can assign dummy players or skip them
  console.log(`\n🔍 CHECKING INCOMPLETE MATCHES (${pendingIncomplete.length}):`);
  
  pendingIncomplete.forEach(match => {
    const missingP1 = !match.player1_id;
    const missingP2 = !match.player2_id;
    console.log(`Match ${match.match_number} (Round ${match.round_number}): Missing ${missingP1 ? 'P1' : ''}${missingP1 && missingP2 ? ' & ' : ''}${missingP2 ? 'P2' : ''}`);
  });
  
  // Final verification
  console.log('\n🔄 FINAL VERIFICATION...');
  
  const { data: updatedMatches } = await supabase
    .from('tournament_matches')  
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (updatedMatches) {
    const finalReady = updatedMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
    const finalCompleted = updatedMatches.filter(m => m.status === 'completed');
    const finalPending = updatedMatches.filter(m => m.status === 'pending');
    
    console.log('\n🎉 FINAL RESULTS:');
    console.log(`✅ READY for score submission: ${finalReady.length} matches`);
    console.log(`🏁 Completed: ${finalCompleted.length} matches`);
    console.log(`⏳ Still pending: ${finalPending.length} matches`);
    
    console.log('\n🎮 ALL READY MATCHES (YOU CAN SUBMIT SCORES):');
    finalReady.forEach(match => {
      const roundNames = {
        1: 'R1', 2: 'R2', 3: 'R3',
        101: 'LR1', 102: 'LR2', 103: 'LR3',
        201: 'LR4', 202: 'LR5',
        250: 'SF', 300: 'GF'
      };
      const roundName = roundNames[match.round_number] || `R${match.round_number}`;
      console.log(`  🟢 Match ${match.match_number} - ${roundName} (Ready to play!)`);
    });
    
    console.log('\n📊 DETAILED BREAKDOWN BY ROUND:');
    
    const rounds = [...new Set(updatedMatches.map(m => m.round_number))].sort((a, b) => a - b);
    
    rounds.forEach(roundNum => {
      const roundMatches = updatedMatches.filter(m => m.round_number === roundNum);
      const roundNames = {
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
      };
      const roundName = roundNames[roundNum] || `Round ${roundNum}`;
      
      const readyInRound = roundMatches.filter(m => m.status === 'ready').length;
      const completedInRound = roundMatches.filter(m => m.status === 'completed').length;
      const pendingInRound = roundMatches.filter(m => m.status === 'pending').length;
      
      console.log(`\n${roundName}: ${readyInRound}ready + ${completedInRound}done + ${pendingInRound}pending = ${roundMatches.length}total`);
      
      roundMatches.forEach(match => {
        const p1Status = match.player1_id ? '✅' : '❌';
        const p2Status = match.player2_id ? '✅' : '❌';
        const statusIcon = match.status === 'ready' ? '🟢' : 
                          match.status === 'completed' ? '🏁' : '🟡';
        
        console.log(`    Match ${match.match_number}: P1:${p1Status} P2:${p2Status} ${statusIcon}${match.status}`);
      });
    });
    
    if (finalReady.length > 0) {
      console.log('\n🎯 SUCCESS! No more "Match not ready for score submission" errors!');
      console.log(`You can now submit scores for ${finalReady.length} matches!`);
    }
  }
}

makeAllMatchesReady();
