const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Kiểm tra Semifinals trong database...');
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  console.log('🏆 Tournament ID:', tournament?.id?.substring(0,8));
  
  // Get semifinals matches (round 250)
  const { data: semifinals } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .order('match_number');
  
  console.log('\n📊 Semifinals Raw Data:');
  semifinals.forEach(match => {
    console.log(`  Semifinal ${match.match_number}:`);
    console.log(`    Player 1 ID: ${match.player1_id || 'NULL'}`);
    console.log(`    Player 2 ID: ${match.player2_id || 'NULL'}`);
    console.log(`    Winner ID: ${match.winner_id || 'NULL'}`);
    console.log(`    Status: ${match.status}`);
    console.log(`    Score: ${match.score_player1 || 0}-${match.score_player2 || 0}`);
    console.log('---');
  });
  
  // Get player profiles to show names
  const allPlayerIds = semifinals.flatMap(m => [m.player1_id, m.player2_id, m.winner_id].filter(Boolean));
  
  if (allPlayerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', allPlayerIds);
    
    console.log('\n👥 Player Names:');
    profiles.forEach(profile => {
      console.log(`  ${profile.id.substring(0,8)}: ${profile.username || profile.full_name || 'No name'}`);
    });
    
    console.log('\n📋 Semifinals with Names:');
    semifinals.forEach(match => {
      const p1 = profiles.find(p => p.id === match.player1_id);
      const p2 = profiles.find(p => p.id === match.player2_id);
      const p1Name = p1 ? (p1.username || p1.full_name) : 'EMPTY';
      const p2Name = p2 ? (p2.username || p2.full_name) : 'EMPTY';
      
      console.log(`  Semifinal ${match.match_number}: ${p1Name} vs ${p2Name} | Status: ${match.status}`);
    });
  } else {
    console.log('\n❌ No players found in Semifinals!');
  }
})();
