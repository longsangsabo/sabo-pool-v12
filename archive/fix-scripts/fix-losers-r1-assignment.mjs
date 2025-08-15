import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixLosersR1Assignment() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔧 Fixing Losers Bracket Round 1 assignments...');
  
  // Round 1 losers in correct order
  const round1Losers = [
    'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca', // Match 1 loser
    '519cf7c9-e112-40b2-9e4d-0cd44783ec9e', // Match 2 loser
    '0e541971-640e-4a5e-881b-b7f98a2904f7', // Match 3 loser
    '9f5c350d-5ee2-4aa4-bd1e-e1ac2ed57e6a', // Match 4 loser
    'ece1b398-9107-4ed6-ba30-6c3b7d725b0b', // Match 5 loser
    'f926fc5d-74d8-4d63-a830-0a9676d8e0be', // Match 6 loser
    'f271ced4-12e2-4643-8123-1a65df65acf8', // Match 7 loser
    'c227cca4-9687-4964-8d4a-051198545b29'  // Match 8 loser
  ];
  
  // Correct Losers Round 1 assignments
  // Match 15: Loser M1 vs Loser M2
  // Match 16: Loser M3 vs Loser M4  
  // Match 17: Loser M5 vs Loser M6
  // Match 18: Loser M7 vs Loser M8
  
  console.log('Fixing Losers Match 15...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Losers[0], // Loser M1
      player2_id: round1Losers[1]  // Loser M2
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 15);
    
  console.log('Fixing Losers Match 16...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Losers[2], // Loser M3
      player2_id: round1Losers[3]  // Loser M4
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 16);
    
  console.log('Fixing Losers Match 17...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Losers[4], // Loser M5
      player2_id: round1Losers[5]  // Loser M6
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 17);
    
  console.log('Fixing Losers Match 18...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Losers[6], // Loser M7
      player2_id: round1Losers[7]  // Loser M8
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 18);
  
  console.log('✅ Fixed Losers Bracket Round 1 assignments!');
  
  // Verify the fix
  const { data: losersR1Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 101)
    .order('match_number');
    
  console.log('\n🎯 Verified Losers R1 Assignments:');
  losersR1Matches?.forEach(match => {
    console.log(`Losers R1 Match ${match.match_number}: ${match.player1_id.substring(0,8)}... vs ${match.player2_id.substring(0,8)}...`);
  });
}

fixLosersR1Assignment();
