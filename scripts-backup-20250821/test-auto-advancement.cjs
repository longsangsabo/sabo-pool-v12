const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🧪 TESTING AUTOMATIC ADVANCEMENT SYSTEM...');
  console.log('Creating new test tournament to verify auto-advancement...\n');
  
  try {
    // 1. Create a new test tournament
    const now = new Date();
    const tournamentStart = new Date();
    tournamentStart.setDate(tournamentStart.getDate() + 1); // Tomorrow
    const tournamentEnd = new Date(tournamentStart);
    tournamentEnd.setHours(tournamentEnd.getHours() + 8); // 8 hours later
    
    const { data: newTournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'AUTO-TEST-' + Date.now(),
        tournament_type: 'sabo',
        max_participants: 16,
        status: 'registration_open',
        description: 'Testing automatic advancement',
        tournament_start: tournamentStart.toISOString(),
        tournament_end: tournamentEnd.toISOString(),
        registration_start: now.toISOString(),
        registration_end: tournamentStart.toISOString(),
        game_format: '9_ball',
        tier_level: 1
      })
      .select()
      .single();
      
    if (tournamentError) {
      console.error('❌ Failed to create tournament:', tournamentError);
      return;
    }
    
    console.log(`✅ Created test tournament: ${newTournament.name} (${newTournament.id.substring(0,8)}...)`);
    
    // 2. Generate bracket using the SABO system
    console.log('🏗️ Generating SABO bracket...');
    
    const { data: bracketResult, error: bracketError } = await supabase
      .rpc('generate_sabo_tournament_bracket', {
        p_tournament_id: newTournament.id
      });
      
    if (bracketError) {
      console.error('❌ Bracket generation failed:', bracketError);
      return;
    }
    
    console.log('✅ SABO bracket generated successfully');
    console.log(`📊 Created ${bracketResult?.total_matches || 'unknown'} matches`);
    
    // 3. Test advancement by simulating R202 completion
    console.log('\n🧪 TESTING R202 → SF2 ADVANCEMENT...');
    
    // Find R202 match
    const { data: r202Match } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', newTournament.id)
      .eq('round_number', 202)
      .eq('match_number', 1)
      .single();
      
    if (!r202Match) {
      console.log('❌ R202 match not found - checking structure...');
      
      // Check what rounds exist
      const { data: allMatches } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, player1_id, player2_id')
        .eq('tournament_id', newTournament.id)
        .order('round_number, match_number');
        
      const rounds = [...new Set(allMatches?.map(m => m.round_number))].sort();
      console.log('Available rounds:', rounds);
      return;
    }
    
    console.log(`📋 Found R202 match: ${r202Match.id.substring(0,8)}...`);
    
    // Add dummy players to R202
    const dummyPlayer1 = crypto.randomUUID();
    const dummyPlayer2 = crypto.randomUUID();
    
    const { error: setupError } = await supabase
      .from('tournament_matches')
      .update({
        player1_id: dummyPlayer1,
        player2_id: dummyPlayer2,
        status: 'pending'
      })
      .eq('id', r202Match.id);
      
    if (setupError) {
      console.error('❌ Failed to setup R202:', setupError);
      return;
    }
    
    console.log('✅ Added dummy players to R202');
    
    // 4. Complete R202 and trigger advancement
    console.log('🎯 Completing R202 to trigger auto-advancement...');
    
    const { error: completeError } = await supabase
      .from('tournament_matches')
      .update({
        score_player1: 2,
        score_player2: 1,
        winner_id: dummyPlayer1,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', r202Match.id);
      
    if (completeError) {
      console.error('❌ Failed to complete R202:', completeError);
      return;
    }
    
    console.log('✅ R202 completed with winner');
    
    // 5. Check if SF2 was automatically updated
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
    
    const { data: sf2After } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', newTournament.id)
      .eq('round_number', 250)
      .eq('match_number', 2)
      .single();
      
    console.log('\n🎯 ADVANCEMENT TEST RESULTS:');
    console.log(`SF2 Player1: ${sf2After?.player1_id?.substring(0,8) || 'NULL'}`);
    console.log(`SF2 Player2: ${sf2After?.player2_id?.substring(0,8) || 'NULL'}`);
    console.log(`Expected Player2: ${dummyPlayer1.substring(0,8)} (R202 winner)`);
    
    if (sf2After?.player2_id === dummyPlayer1) {
      console.log('🎉 ✅ AUTOMATIC ADVANCEMENT WORKING!');
      console.log('✅ R202 winner correctly advanced to SF2 Player2');
      console.log('✅ Trigger system is functioning properly');
    } else {
      console.log('❌ AUTOMATIC ADVANCEMENT FAILED!');
      console.log('❌ R202 winner did not advance to SF2');
      console.log('❌ Trigger needs to be fixed');
    }
    
    // 6. Cleanup - delete test tournament
    console.log('\n🧹 Cleaning up test tournament...');
    
    await supabase
      .from('tournament_matches')
      .delete()
      .eq('tournament_id', newTournament.id);
      
    await supabase
      .from('tournaments')
      .delete()
      .eq('id', newTournament.id);
      
    console.log('✅ Test tournament cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
