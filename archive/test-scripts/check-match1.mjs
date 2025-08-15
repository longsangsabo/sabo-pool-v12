import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMatch1() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔍 Checking Match 1 data...');
  
  // Get Match 1 specifically
  const { data: match1, error: matchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .eq('match_number', 1)
    .single();
    
  if (matchError) {
    console.error('❌ Match 1 error:', matchError);
    return;
  }
  
  console.log('🎯 Match 1 data:');
  console.log('- player1_id:', match1?.player1_id || 'NULL');
  console.log('- player2_id:', match1?.player2_id || 'NULL');
  console.log('- bracket_type:', match1?.bracket_type);
  console.log('- status:', match1?.status);
  
  // Check if players exist in profiles
  if (match1?.player1_id) {
    const { data: player1Profile } = await supabase
      .from('profiles')
      .select('full_name, display_name')
      .eq('user_id', match1.player1_id)
      .single();
    console.log('👤 Player 1:', player1Profile?.display_name || player1Profile?.full_name || 'Not found');
  } else {
    console.log('❌ Player 1 ID is missing');
  }
  
  if (match1?.player2_id) {
    const { data: player2Profile } = await supabase
      .from('profiles')
      .select('full_name, display_name')
      .eq('user_id', match1.player2_id)
      .single();
    console.log('👤 Player 2:', player2Profile?.display_name || player2Profile?.full_name || 'Not found');
  } else {
    console.log('❌ Player 2 ID is missing');
  }
  
  // Check all Round 1 matches
  console.log('\n📊 All Round 1 matches:');
  const { data: round1Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .order('match_number');
    
  for (const match of round1Matches || []) {
    const hasPlayer1 = match.player1_id ? '✅' : '❌';
    const hasPlayer2 = match.player2_id ? '✅' : '❌';
    console.log(`Match ${match.match_number}: ${hasPlayer1} Player1 | ${hasPlayer2} Player2`);
  }

  // Check registrations order
  console.log('\n📋 Registration order (first 8 players for Round 1):');
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('user_id, profiles(display_name, full_name)')
    .eq('tournament_id', tournamentId)
    .eq('registration_status', 'confirmed')
    .order('created_at', { ascending: true })
    .limit(8);
    
  registrations?.forEach((reg, index) => {
    const name = reg.profiles?.display_name || reg.profiles?.full_name || 'Unknown';
    console.log(`${index + 1}. ${name} (${reg.user_id})`);
  });
}

checkMatch1();
