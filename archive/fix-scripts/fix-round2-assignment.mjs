import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixRound2Assignment() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔧 Fixing Round 2 Match 9 assignment...');
  
  // Round 1 winners in correct order
  const round1Winners = [
    'e411093e-144a-46c3-9def-37186c4ee6c8', // Match 1 winner
    'd7d6ce12-490f-4fff-b913-80044de5e169', // Match 2 winner  
    '4bedc2fd-a85d-483d-80e5-c9541d6ecdc2', // Match 3 winner
    '46bfe678-66cf-48a9-8bc8-d2eee8274ac3', // Match 4 winner
    '630730f6-6a4c-4e91-aab3-ce9bdc92057b', // Match 5 winner
    '1b20b730-51f7-4a58-9d14-ca168a51be99', // Match 6 winner
    '2fbdd92e-1c53-4b9e-b156-f0d2621ed9df', // Match 7 winner
    'aa25684c-90e5-4c5c-aa23-83b65d398b62'  // Match 8 winner
  ];
  
  // Correct Round 2 assignments based on SABO double elimination
  // Match 9: Winner M1 vs Winner M2
  // Match 10: Winner M3 vs Winner M4  
  // Match 11: Winner M5 vs Winner M6
  // Match 12: Winner M7 vs Winner M8
  
  console.log('Fixing Match 9...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Winners[0], // Winner M1
      player2_id: round1Winners[1]  // Winner M2
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 9);
    
  console.log('Fixing Match 10...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Winners[2], // Winner M3
      player2_id: round1Winners[3]  // Winner M4
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 10);
    
  console.log('Fixing Match 11...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Winners[4], // Winner M5
      player2_id: round1Winners[5]  // Winner M6
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 11);
    
  console.log('Fixing Match 12...');
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: round1Winners[6], // Winner M7
      player2_id: round1Winners[7]  // Winner M8
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', 12);
  
  console.log('✅ Fixed Round 2 assignments!');
  
  // Verify the fix
  const { data: round2Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 2)
    .order('match_number');
    
  console.log('\n🎯 Verified Round 2 Assignments:');
  round2Matches?.forEach(match => {
    console.log(`Round 2 Match ${match.match_number}: ${match.player1_id.substring(0,8)}... vs ${match.player2_id.substring(0,8)}...`);
  });
}

fixRound2Assignment();
