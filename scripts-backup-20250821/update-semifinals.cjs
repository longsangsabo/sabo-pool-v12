const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔧 Sửa lại Semifinals với real player IDs...');
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  // Get real R3 winners
  const { data: r3Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 3)
    .order('match_number');
  
  // Get real L103 winner
  const { data: l103Match } = await supabase
    .from('tournament_matches')
    .select('winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 103)
    .eq('match_number', 1)
    .single();
  
  const r3m1Winner = r3Matches.find(m => m.match_number === 1)?.winner_id;
  const r3m2Winner = r3Matches.find(m => m.match_number === 2)?.winner_id;
  const losersChampion = l103Match?.winner_id;
  
  console.log('Real player IDs:');
  console.log(`  R3 M1 Winner: ${r3m1Winner}`);
  console.log(`  R3 M2 Winner: ${r3m2Winner}`);
  console.log(`  Losers Champion: ${losersChampion}`);
  
  // Update Semifinal 1: R3 M1 Winner vs Losers Champion
  console.log('\n🔧 Updating Semifinal 1...');
  const { error: semi1Error } = await supabase
    .from('tournament_matches')
    .update({
      player1_id: r3m1Winner,
      player2_id: losersChampion,
      winner_id: null,
      status: 'pending',
      score_player1: 0,
      score_player2: 0,
      completed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .eq('match_number', 1);
  
  if (semi1Error) {
    console.error('❌ Error updating Semifinal 1:', semi1Error);
  } else {
    console.log('✅ Semifinal 1 updated with real IDs');
  }
  
  // Update Semifinal 2: R3 M2 Winner (BYE)
  console.log('🔧 Updating Semifinal 2...');
  const { error: semi2Error } = await supabase
    .from('tournament_matches')
    .update({
      player1_id: r3m2Winner,
      player2_id: null,
      winner_id: r3m2Winner,
      status: 'completed',
      score_player1: 1,
      score_player2: 0,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .eq('match_number', 2);
  
  if (semi2Error) {
    console.error('❌ Error updating Semifinal 2:', semi2Error);
  } else {
    console.log('✅ Semifinal 2 updated with real IDs');
  }
  
  // Verify with player names
  const { data: updatedSemifinals } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .order('match_number');
  
  const allPlayerIds = updatedSemifinals.flatMap(m => [m.player1_id, m.player2_id].filter(Boolean));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .in('id', allPlayerIds);
  
  console.log('\n📋 Verification - Semifinals with real names:');
  updatedSemifinals.forEach(match => {
    const p1 = profiles.find(p => p.id === match.player1_id);
    const p2 = profiles.find(p => p.id === match.player2_id);
    const p1Name = p1 ? (p1.display_name || p1.full_name) : 'EMPTY';
    const p2Name = p2 ? (p2.display_name || p2.full_name) : 'EMPTY';
    
    console.log(`  Semifinal ${match.match_number}: ${p1Name} vs ${p2Name} | Status: ${match.status}`);
  });
})();
