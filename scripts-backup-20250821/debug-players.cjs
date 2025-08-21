const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Debugging player IDs...');
  
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
  
  console.log('\n📊 Semifinals Raw Data:');
  semifinals.forEach(match => {
    console.log(`  Semifinal ${match.match_number}:`);
    console.log(`    Player 1 ID: ${match.player1_id || 'NULL'}`);
    console.log(`    Player 2 ID: ${match.player2_id || 'NULL'}`);
    console.log(`    Status: ${match.status}`);
    console.log('---');
  });
  
  // Get ALL profiles to see what IDs exist
  console.log('\n🔍 Checking all profiles in database...');
  const { data: allProfiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .limit(20);
  
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('All profiles found:');
    allProfiles.forEach(profile => {
      console.log(`  ${profile.id}: ${profile.username || profile.full_name || 'No name'}`);
    });
  }
  
  // Check if the player IDs in semifinals actually exist
  const semiFinalPlayerIds = semifinals.flatMap(m => [m.player1_id, m.player2_id].filter(Boolean));
  console.log('\nSemifinal player IDs:');
  semiFinalPlayerIds.forEach(id => {
    console.log(`  ${id}`);
  });
  
  // Try to find these specific IDs
  if (semiFinalPlayerIds.length > 0) {
    const { data: specificProfiles, error: specificError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', semiFinalPlayerIds);
    
    console.log('\nSpecific profile lookup result:');
    console.log('Error:', specificError);
    console.log('Data:', specificProfiles);
  }
})();
