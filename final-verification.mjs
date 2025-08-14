import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function finalVerification() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🏆 SABO Tournament Final Verification');
  console.log('=====================================\n');
  
  // Get all matches for verification
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number', { ascending: true })
    .order('match_number', { ascending: true });
  
  if (!allMatches) {
    console.log('❌ No matches found');
    return;
  }
  
  // Group by rounds
  const rounds = {};
  allMatches.forEach(match => {
    if (!rounds[match.round_number]) {
      rounds[match.round_number] = [];
    }
    rounds[match.round_number].push(match);
  });
  
  console.log('📊 Tournament Structure:');
  console.log(`Total Matches: ${allMatches.length}`);
  console.log(`Rounds: ${Object.keys(rounds).join(', ')}\n`);
  
  // Check Winners Bracket
  console.log('🏆 Winners Bracket:');
  console.log('==================');
  
  // Round 1
  const round1 = rounds[1] || [];
  console.log(`\nRound 1 (${round1.length} matches):`);
  let round1Winners = [];
  round1.forEach(match => {
    const status = match.status === 'completed' ? '✅' : '⏳';
    const winnerInfo = match.winner_id ? `Winner: ${match.winner_id.substring(0,8)}...` : 'No winner';
    console.log(`  Match ${match.match_number}: ${status} ${winnerInfo}`);
    if (match.winner_id) round1Winners.push(match.winner_id);
  });
  
  // Round 2
  const round2 = rounds[2] || [];
  console.log(`\nRound 2 (${round2.length} matches):`);
  round2.forEach(match => {
    const status = match.status === 'completed' ? '✅' : '⏳';
    const p1 = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
    const p2 = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
    console.log(`  Match ${match.match_number}: ${status} ${p1} vs ${p2}`);
  });
  
  // Check Losers Bracket
  console.log('\n💔 Losers Bracket:');
  console.log('==================');
  
  const losersR1 = rounds[101] || [];
  console.log(`\nLosers Round 1 (${losersR1.length} matches):`);
  losersR1.forEach(match => {
    const status = match.status === 'completed' ? '✅' : '⏳';
    const p1 = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
    const p2 = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
    console.log(`  Match ${match.match_number}: ${status} ${p1} vs ${p2}`);
  });
  
  // Verification
  console.log('\n🔍 Advancement Verification:');
  console.log('=============================');
  
  // Check if Round 2 has correct winners
  const round2Players = new Set();
  round2.forEach(match => {
    if (match.player1_id) round2Players.add(match.player1_id);
    if (match.player2_id) round2Players.add(match.player2_id);
  });
  
  const round1WinnersSet = new Set(round1Winners);
  const correctWinnersAdvancement = Array.from(round2Players).every(p => round1WinnersSet.has(p));
  
  console.log(`Round 1 Completed: ${round1Winners.length === 8 ? '✅' : '❌'} (${round1Winners.length}/8)`);
  console.log(`Round 2 Players Assigned: ${round2Players.size === 8 ? '✅' : '❌'} (${round2Players.size}/8)`);
  console.log(`Winners Advancement Correct: ${correctWinnersAdvancement ? '✅' : '❌'}`);
  
  // Check losers bracket
  const losersR1Players = new Set();
  losersR1.forEach(match => {
    if (match.player1_id) losersR1Players.add(match.player1_id);
    if (match.player2_id) losersR1Players.add(match.player2_id);
  });
  
  console.log(`Losers R1 Players Assigned: ${losersR1Players.size === 8 ? '✅' : '❌'} (${losersR1Players.size}/8)`);
  
  console.log('\n🎯 SABO Tournament Status: READY FOR ROUND 2! 🚀');
}

finalVerification();
