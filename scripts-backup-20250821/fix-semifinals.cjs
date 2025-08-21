const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Kiểm tra cấu trúc bảng profiles...');
  
  // Get profiles with basic columns first
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Found profiles:');
    console.log('Sample profile structure:');
    if (profiles.length > 0) {
      console.log(Object.keys(profiles[0]));
      console.log('First profile:', profiles[0]);
    }
  }
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  // Get semifinals matches
  const { data: semifinals } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .order('match_number');
  
  console.log('\n📊 Semifinals trong database:');
  semifinals.forEach(match => {
    console.log(`  Semifinal ${match.match_number}:`);
    console.log(`    Player 1 ID: ${match.player1_id || 'NULL'}`);
    console.log(`    Player 2 ID: ${match.player2_id || 'NULL'}`);
    console.log(`    Status: ${match.status}`);
  });
  
  // The problem: IDs like 'c6eaa405-4c7e-4b8a-b123-1234567890ab' are fake!
  // We need to find the real player IDs
  console.log('\n🔍 Finding real player IDs from R3 and Losers bracket...');
  
  // Get R3 winners (real IDs)
  const { data: r3Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 3)
    .order('match_number');
  
  console.log('R3 Winners (real IDs):');
  r3Matches.forEach(match => {
    console.log(`  R3 M${match.match_number} Winner: ${match.winner_id?.substring(0,8) || 'NULL'}`);
  });
  
  // Get L103 winner (real ID)
  const { data: l103Match } = await supabase
    .from('tournament_matches')
    .select('winner_id')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 103)
    .eq('match_number', 1)
    .single();
  
  console.log(`L103 Winner (real ID): ${l103Match?.winner_id?.substring(0,8) || 'NULL'}`);
})();
