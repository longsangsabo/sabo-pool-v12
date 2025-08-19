const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Lấy đúng 4 users từ tournament brackets...');
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  console.log('🏆 Tournament ID:', tournament?.id?.substring(0,8));
  
  // 1. Get R3 Winners (Winners Bracket Finalists)
  const { data: r3Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 3)
    .order('match_number');
  
  const r3m1Winner = r3Matches.find(m => m.match_number === 1)?.winner_id;
  const r3m2Winner = r3Matches.find(m => m.match_number === 2)?.winner_id;
  
  console.log('🥇 Winners Bracket Finalists:');
  console.log('  R3 M1 Winner:', r3m1Winner?.substring(0,8));
  console.log('  R3 M2 Winner:', r3m2Winner?.substring(0,8));
  
  // 2. Get L103 Winner (Losers Bracket Champion)
  const { data: l103Match } = await supabase
    .from('tournament_matches')
    .select('winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 103)
    .eq('match_number', 1)
    .single();
  
  const losersChampion = l103Match?.winner_id;
  console.log('🥈 Losers Bracket Champion:');
  console.log('  L103 Winner:', losersChampion?.substring(0,8));
  
  // 3. Get L102 Winners (Losers Bracket Semi-finalists) 
  const { data: l102Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 102)
    .order('match_number');
  
  console.log('🥉 Losers Bracket Semi-finalists:');
  l102Matches.forEach(match => {
    console.log(`  L102 M${match.match_number} Winner: ${match.winner_id?.substring(0,8)}`);
  });
  
  // Find the L102 winner who DIDN'T win L103 (the runner-up)
  const losersRunnerUp = l102Matches.find(m => m.winner_id !== losersChampion)?.winner_id;
  console.log('🏃 Losers Bracket Runner-up:', losersRunnerUp?.substring(0,8));
  
  // 4. Setup correct Semifinals
  console.log('\n🔧 Setting up correct Semifinals...');
  
  // Semifinal 1: R3 M1 Winner vs Losers Champion
  await supabase
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
  
  // Semifinal 2: R3 M2 Winner vs Losers Runner-up
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: r3m2Winner,
      player2_id: losersRunnerUp,
      winner_id: null,
      status: 'pending',
      score_player1: 0,
      score_player2: 0,
      completed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .eq('match_number', 2);
  
  // Get player names
  const allPlayerIds = [r3m1Winner, r3m2Winner, losersChampion, losersRunnerUp].filter(Boolean);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .in('id', allPlayerIds);
  
  const getPlayerName = (id) => {
    const profile = profiles.find(p => p.id === id);
    return profile ? (profile.display_name || profile.full_name) : 'Unknown';
  };
  
  console.log('\n✅ Semifinals với đúng players từ tournament:');
  console.log(`  Semifinal 1: ${getPlayerName(r3m1Winner)} vs ${getPlayerName(losersChampion)}`);
  console.log(`  Semifinal 2: ${getPlayerName(r3m2Winner)} vs ${getPlayerName(losersRunnerUp)}`);
  
  console.log('\n🎯 Logic:');
  console.log('  - Semifinal 1: Winners Bracket Finalist #1 vs Losers Bracket Champion');
  console.log('  - Semifinal 2: Winners Bracket Finalist #2 vs Losers Bracket Runner-up');
})();
