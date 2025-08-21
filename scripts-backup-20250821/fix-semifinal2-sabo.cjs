const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Kiểm tra và sửa Semifinal 2...');
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  // Get current Semifinal 2
  const { data: semifinal2 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .eq('match_number', 2)
    .single();
  
  console.log('📊 Current Semifinal 2:');
  console.log('  Player 1 ID:', semifinal2.player1_id?.substring(0,8));
  console.log('  Player 2 ID:', semifinal2.player2_id?.substring(0,8));
  
  // Find SABO user
  const { data: saboProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, full_name')
    .or('display_name.ilike.%SABO%,full_name.ilike.%SABO%');
  
  console.log('Found SABO profiles:', saboProfiles?.length || 0);
  
  if (saboProfiles && saboProfiles.length > 0) {
    const saboProfile = saboProfiles[0];
    console.log('Using SABO user:', saboProfile.id.substring(0,8), saboProfile.display_name || saboProfile.full_name);
    
    // Update Semifinal 2 với SABO
    console.log('\n🔧 Updating Semifinal 2 với SABO...');
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        player2_id: saboProfile.id,
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .eq('match_number', 2);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Updated Semifinal 2 với SABO');
      
      // Verify update
      const { data: updatedSemifinal2 } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2)
        .single();
      
      // Get player names
      const playerIds = [updatedSemifinal2.player1_id, updatedSemifinal2.player2_id].filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .in('id', playerIds);
      
      console.log('\n✅ Verification - Updated Semifinal 2:');
      const p1 = profiles.find(p => p.id === updatedSemifinal2.player1_id);
      const p2 = profiles.find(p => p.id === updatedSemifinal2.player2_id);
      console.log(`  Player 1: ${p1?.display_name || p1?.full_name || 'Unknown'}`);
      console.log(`  Player 2: ${p2?.display_name || p2?.full_name || 'Unknown'}`);
    }
  } else {
    console.log('❌ SABO user not found');
    
    // List all available users to help identify
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .limit(10);
    
    console.log('\nAvailable users:');
    allProfiles.forEach(p => {
      console.log(`  ${p.id.substring(0,8)}: ${p.display_name || p.full_name}`);
    });
  }
})();
