import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAdvancement() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔍 Checking tournament advancement...');
  
  // Check Round 1 results
  const { data: round1Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id, status, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .order('match_number');
    
  console.log('📊 Round 1 Results:');
  round1Matches?.forEach(match => {
    const hasWinner = match.winner_id ? '✅' : '❌';
    console.log(`Match ${match.match_number}: ${match.status} | Winner: ${hasWinner}`);
  });
  
  // Check Round 2 players
  const { data: round2Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id, status')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 2)
    .order('match_number');
    
  console.log('\n🎯 Round 2 Player Assignment:');
  round2Matches?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    console.log(`Match ${match.match_number}: P1: ${hasP1} P2: ${hasP2} | Status: ${match.status}`);
  });
  
  // Check losers bracket Round 1 (should get losers from Round 1)
  const { data: losersR1Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id, status')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 101)
    .order('match_number');
    
  console.log('\n🎯 Losers Bracket Round 1 Player Assignment:');
  losersR1Matches?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    console.log(`Losers Match ${match.match_number}: P1: ${hasP1} P2: ${hasP2} | Status: ${match.status}`);
  });
  
  // Get the winners from Round 1 for manual verification
  console.log('\n🏆 Round 1 Winners (should advance to Round 2):');
  const round1Winners = round1Matches?.filter(m => m.winner_id).map(m => m.winner_id);
  console.log('Winner IDs:', round1Winners);
}

checkAdvancement();
