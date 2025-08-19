const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔧 Fixing test3 semifinals structure...');
  
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
  
  // Get the correct sources
  const { data: winners_r3_matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 3)
    .order('match_number');
    
  const { data: losers_final_a } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 103)
    .eq('match_number', 1)
    .single();
    
  const { data: losers_final_b } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 203)
    .eq('match_number', 1)
    .single();
  
  // Fix Semifinal 1: Winners R3 M1 winner vs Losers A Champion
  const sf1_player1 = winners_r3_matches?.[0]?.winner_id;
  const sf1_player2 = losers_final_a?.winner_id;
  
  if (sf1_player1 && sf1_player2) {
    console.log('🔧 Setting up Semifinal 1...');
    const { error: sf1Error } = await supabase
      .from('tournament_matches')
      .update({
        player1_id: sf1_player1,
        player2_id: sf1_player2,
        status: 'pending',
        score_player1: 0,
        score_player2: 0,
        winner_id: null,
        completed_at: null
      })
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .eq('match_number', 1);
      
    if (sf1Error) {
      console.error('❌ SF1 update failed:', sf1Error);
    } else {
      console.log(`✅ SF1 set: ${sf1_player1.substring(0,8)} vs ${sf1_player2.substring(0,8)}`);
    }
  }
  
  // Fix Semifinal 2: Winners R3 M2 winner vs Losers B Champion (if available)
  const sf2_player1 = winners_r3_matches?.[1]?.winner_id;
  const sf2_player2 = losers_final_b?.winner_id;
  
  if (sf2_player1) {
    console.log('🔧 Setting up Semifinal 2...');
    const { error: sf2Error } = await supabase
      .from('tournament_matches')
      .update({
        player1_id: sf2_player1,
        player2_id: sf2_player2, // May be null if Losers B not completed
        status: sf2_player2 ? 'pending' : 'waiting_for_players',
        score_player1: 0,
        score_player2: 0,
        winner_id: null,
        completed_at: null
      })
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .eq('match_number', 2);
      
    if (sf2Error) {
      console.error('❌ SF2 update failed:', sf2Error);
    } else {
      console.log(`✅ SF2 set: ${sf2_player1.substring(0,8)} vs ${sf2_player2?.substring(0,8) || 'PENDING'}`);
    }
  }
  
  // Reset Grand Final to wait for semifinal winners
  console.log('🔧 Resetting Grand Final...');
  const { error: finalError } = await supabase
    .from('tournament_matches')
    .update({
      player1_id: null,
      player2_id: null,
      status: 'waiting_for_players',
      score_player1: 0,
      score_player2: 0,
      winner_id: null,
      completed_at: null
    })
    .eq('tournament_id', tournament.id)
    .eq('round_number', 300)
    .eq('match_number', 1);
    
  if (finalError) {
    console.error('❌ Grand Final reset failed:', finalError);
  } else {
    console.log('✅ Grand Final reset - waiting for semifinal winners');
  }
  
  console.log('\n🎯 RESULT:');
  console.log('✅ Semifinals structure corrected');
  console.log('✅ SF1 ready to play');
  console.log('⚠️ SF2 waiting for Losers B Final completion');
  console.log('⚠️ Grand Final waiting for semifinal winners');
})();
