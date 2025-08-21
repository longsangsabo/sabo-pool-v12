import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixAllMatchesForCorrectTournament() {
  console.log('🔧 FIXING ALL MATCHES FOR CORRECT TOURNAMENT');
  console.log('===========================================\n');
  
  // Use the correct tournament ID from the search above
  const correctTournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // "test 1" tournament
  
  console.log(`🎯 Working with tournament: test 1`);
  console.log(`Tournament ID: ${correctTournamentId}\n`);
  
  // Get all matches for this tournament
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', correctTournamentId)
    .order('round_number')
    .order('match_number');
    
  if (!allMatches) {
    console.log('❌ No matches found for this tournament');
    return;
  }
  
  console.log(`📊 Found ${allMatches.length} matches`);
  
  // Show current status
  const ready = allMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
  const completed = allMatches.filter(m => m.status === 'completed');
  const pendingWithBoth = allMatches.filter(m => m.status === 'pending' && m.player1_id && m.player2_id);
  const pendingIncomplete = allMatches.filter(m => m.status === 'pending' && (!m.player1_id || !m.player2_id));
  
  console.log('\n📋 CURRENT STATUS:');
  console.log(`✅ Ready: ${ready.length}`);
  console.log(`🏁 Completed: ${completed.length}`);
  console.log(`⏳ Pending with both players: ${pendingWithBoth.length}`);
  console.log(`🔶 Pending incomplete: ${pendingIncomplete.length}`);
  
  // Fix pending matches that have both players
  if (pendingWithBoth.length > 0) {
    console.log('\n🔧 FIXING PENDING MATCHES WITH BOTH PLAYERS:');
    
    for (const match of pendingWithBoth) {
      console.log(`Fixing Match ${match.match_number} (Round ${match.round_number})`);
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({ 
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', match.id);
        
      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Match ${match.match_number} now ready`);
      }
    }
  }
  
  // Show detailed match status
  console.log('\n📊 DETAILED MATCH STATUS:');
  
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
  
  const rounds = [...new Set(allMatches.map(m => m.round_number))].sort((a, b) => a - b);
  
  rounds.forEach(roundNum => {
    const roundMatches = allMatches.filter(m => m.round_number === roundNum);
    const roundName = roundNames[roundNum] || `Round ${roundNum}`;
    
    console.log(`\n${roundName}:`);
    roundMatches.forEach(match => {
      const p1Status = match.player1_id ? '✅' : '❌';
      const p2Status = match.player2_id ? '✅' : '❌';
      const statusIcon = match.status === 'ready' ? '🟢' : 
                        match.status === 'completed' ? '🏁' : '🟡';
      
      console.log(`  Match ${match.match_number}: P1:${p1Status} P2:${p2Status} ${statusIcon}${match.status}`);
    });
  });
  
  // Final check after fixes
  console.log('\n🔄 FINAL CHECK AFTER FIXES...');
  
  const { data: updatedMatches } = await supabase
    .from('tournament_matches')  
    .select('*')
    .eq('tournament_id', correctTournamentId);
    
  if (updatedMatches) {
    const finalReady = updatedMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
    const finalCompleted = updatedMatches.filter(m => m.status === 'completed');
    
    console.log('\n🎉 FINAL RESULTS:');
    console.log(`✅ Ready for score submission: ${finalReady.length} matches`);
    console.log(`🏁 Completed: ${finalCompleted.length} matches`);
    
    if (finalReady.length > 0) {
      console.log('\n🎮 MATCHES YOU CAN SUBMIT SCORES FOR:');
      finalReady.forEach(match => {
        const roundName = roundNames[match.round_number] || `Round ${match.round_number}`;
        console.log(`  🟢 Match ${match.match_number} - ${roundName}`);
      });
    }
  }
}

fixAllMatchesForCorrectTournament();
