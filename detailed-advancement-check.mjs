import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function detailedAdvancementCheck() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔍 Detailed Advancement Check...');
  
  // Get Round 1 results with player details
  const { data: round1Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id, player1_id, player2_id, score_player1, score_player2')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .order('match_number');
    
  console.log('\n📊 Round 1 Detailed Results:');
  round1Matches?.forEach(match => {
    const loser = match.winner_id === match.player1_id ? match.player2_id : match.player1_id;
    console.log(`Match ${match.match_number}: Winner ${match.winner_id} defeats ${loser} (${match.score_player1}-${match.score_player2})`);
  });
  
  // Get Round 2 assignments
  const { data: round2Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 2)
    .order('match_number');
    
  console.log('\n🎯 Round 2 Assignments:');
  round2Matches?.forEach(match => {
    console.log(`Round 2 Match ${match.match_number}: ${match.player1_id} vs ${match.player2_id}`);
  });
  
  // Verify if Round 2 players are indeed Round 1 winners
  const round1Winners = new Set(round1Matches?.map(m => m.winner_id) || []);
  const round2Players = new Set();
  round2Matches?.forEach(match => {
    if (match.player1_id) round2Players.add(match.player1_id);
    if (match.player2_id) round2Players.add(match.player2_id);
  });
  
  console.log('\n✅ Verification:');
  console.log('Round 1 Winners:', Array.from(round1Winners));
  console.log('Round 2 Players:', Array.from(round2Players));
  
  const correctAdvancement = Array.from(round2Players).every(p => round1Winners.has(p));
  console.log('Correct Winners Advancement:', correctAdvancement ? '✅' : '❌');
  
  // Check losers bracket assignments
  const { data: losersR1Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 101)
    .order('match_number');
    
  console.log('\n🎯 Losers Bracket Round 1 Assignments:');
  losersR1Matches?.forEach(match => {
    console.log(`Losers R1 Match ${match.match_number}: ${match.player1_id} vs ${match.player2_id}`);
  });
  
  // Verify losers bracket has Round 1 losers
  const round1Losers = new Set();
  round1Matches?.forEach(match => {
    const loser = match.winner_id === match.player1_id ? match.player2_id : match.player1_id;
    round1Losers.add(loser);
  });
  
  const losersR1Players = new Set();
  losersR1Matches?.forEach(match => {
    if (match.player1_id) losersR1Players.add(match.player1_id);
    if (match.player2_id) losersR1Players.add(match.player2_id);
  });
  
  console.log('\n🔄 Losers Verification:');
  console.log('Round 1 Losers:', Array.from(round1Losers));
  console.log('Losers R1 Players:', Array.from(losersR1Players));
  
  const correctLosersAdvancement = Array.from(losersR1Players).every(p => round1Losers.has(p));
  console.log('Correct Losers Advancement:', correctLosersAdvancement ? '✅' : '❌');
}

detailedAdvancementCheck();
