const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔧 Creating Losers B Final (R203) for test3...');
  
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
  
  // Get R202 winner (should become Losers B Champion)
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
  
  console.log(`📋 R202 winner: ${r202Match.winner_id.substring(0,8)} (should be Losers B Champion)`);
  
  // Check if R203 already exists
  const { data: existingR203 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 203)
    .eq('match_number', 1)
    .single();
    
  if (existingR203) {
    console.log('🔧 R203 exists but needs to be set as completed...');
    
    // Mark R202 winner as Losers B Champion by completing R203
    const { error: updateR203 } = await supabase
      .from('tournament_matches')
      .update({
        player1_id: r202Match.winner_id,
        player2_id: null, // No opponent needed for final
        winner_id: r202Match.winner_id,
        status: 'completed',
        score_player1: 1,
        score_player2: 0,
        completed_at: new Date().toISOString()
      })
      .eq('id', existingR203.id);
      
    if (updateR203) {
      console.error('❌ Failed to update R203:', updateR203);
      return;
    }
    
    console.log('✅ R203 marked as completed');
  } else {
    console.log('🔧 Creating new R203 match...');
    
    // Create R203 as Losers B Final
    const { error: createR203 } = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: tournament.id,
        round_number: 203,
        match_number: 1,
        bracket_type: 'losers',
        player1_id: r202Match.winner_id,
        player2_id: null,
        winner_id: r202Match.winner_id,
        status: 'completed',
        score_player1: 1,
        score_player2: 0,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (createR203) {
      console.error('❌ Failed to create R203:', createR203);
      return;
    }
    
    console.log('✅ R203 created and completed');
  }
  
  // Now advance Losers B Champion to Semifinal 2
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
  
  // Verify the fix
  const { data: sf2 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 250)
    .eq('match_number', 2)
    .single();
    
  console.log('\n🎯 RESULT:');
  console.log(`✅ Semifinal 2 now has both players:`);
  console.log(`   Player 1: ${sf2?.player1_id?.substring(0,8) || 'NULL'} (Winners R3 M2)`);
  console.log(`   Player 2: ${sf2?.player2_id?.substring(0,8) || 'NULL'} (Losers B Champion)`);
  console.log(`   Status: ${sf2?.status} - Ready to play!`);
})();
