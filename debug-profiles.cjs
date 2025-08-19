const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Debug profile lookup...');
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  // Get updated semifinals
  const { data: semifinals } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .order('match_number');
  
  console.log('Semifinals player IDs:');
  semifinals.forEach(match => {
    console.log(`  Semifinal ${match.match_number}:`);
    console.log(`    Player 1: ${match.player1_id}`);
    console.log(`    Player 2: ${match.player2_id || 'NULL'}`);
  });
  
  // Get specific profiles
  const playerIds = [
    'c6eaa405-cfda-4169-be23-dfdaf025820c',
    '0e541971-640e-4a5e-881b-b7f98a2904f7', 
    '94527a17-1dd9-42f9-bcb7-6969329464e2'
  ];
  
  console.log('\nLooking up these specific IDs:');
  playerIds.forEach(id => console.log(`  ${id}`));
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .in('id', playerIds);
  
  console.log('\nProfile lookup result:');
  console.log('Error:', error);
  console.log('Found profiles:', profiles?.length || 0);
  
  if (profiles && profiles.length > 0) {
    profiles.forEach(p => {
      console.log(`  ${p.id}: ${p.display_name || p.full_name || 'No name'}`);
    });
  }
  
  // Try finding ANY profiles with similar IDs
  console.log('\nSearching for profiles with similar ID patterns...');
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .limit(50);
  
  const searchPatterns = ['c6eaa405', '0e541971', '94527a17'];
  
  searchPatterns.forEach(pattern => {
    const found = allProfiles.find(p => p.id.includes(pattern));
    if (found) {
      console.log(`  Found match for ${pattern}: ${found.id} - ${found.display_name || found.full_name}`);
    } else {
      console.log(`  No match found for ${pattern}`);
    }
  });
})();
