const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔧 SIMPLE FIX: Direct advancement from R202 to Semifinal 2...');
  
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name')
    .ilike('name', '%test3%')
    .single();
    
  if (!tournament) {
    console.log('❌ test3 tournament not found');
    return;
  }
  
  console.log(`🏆 Fixing tournament: ${tournament.name}`);
  
  // Get R202 winner (this IS the Losers B Champion)
  const { data: r202Match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 202)
    .eq('match_number', 1)
    .single();
    
  if (!r202Match?.winner_id) {
    console.log('❌ R202 not completed yet');
    return;
  }
  
  console.log(`📋 R202 winner: ${r202Match.winner_id.substring(0,8)} = Losers B Champion`);
  
  // Directly advance R202 winner to Semifinal 2 Player 2
  console.log('🔧 Advancing Losers B Champion to Semifinal 2...');
  
  const { error: updateSF2 } = await supabase
    .from('tournament_matches')
    .update({
      player2_id: r202Match.winner_id,
      status: 'pending'
    })
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .eq('match_number', 2);
    
  if (updateSF2) {
    console.error('❌ Failed to update SF2:', updateSF2);
    return;
  }
  
  console.log('✅ Losers B Champion advanced to Semifinal 2');
  
  // Verify both semifinals are now ready
  const { data: semifinals } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .order('match_number');
    
  console.log('\n🎯 SEMIFINALS STATUS:');
  semifinals?.forEach(sf => {
    const status = sf.player1_id && sf.player2_id ? '✅ READY TO PLAY' : '⚠️ WAITING';
    console.log(`   SF${sf.match_number}: ${sf.player1_id?.substring(0,8) || 'NULL'} vs ${sf.player2_id?.substring(0,8) || 'NULL'} ${status}`);
  });
  
  console.log('\n🎉 BOTH SEMIFINALS NOW HAVE PLAYERS!');
  console.log('🔄 Refresh browser to see the complete semifinals!');
})();
