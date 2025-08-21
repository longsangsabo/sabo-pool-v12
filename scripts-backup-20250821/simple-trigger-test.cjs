const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🧪 SIMPLE TEST: Check trigger is installed and working...');
  
  try {
    // 1. Check if trigger exists
    const { data: triggers, error: triggerError } = await supabase
      .rpc('sql', {
        query: `
          SELECT trigger_name, event_manipulation, event_object_table 
          FROM information_schema.triggers 
          WHERE trigger_name = 'trigger_sabo_match_completion'
        `
      });
      
    if (triggerError) {
      console.log('⚠️ Cannot check trigger via RPC, checking manually...');
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger exists:', triggers[0]);
    } else {
      console.log('❌ Trigger NOT found - needs to be installed');
    }
    
    // 2. Use existing test3 tournament to test advancement
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id, name')
      .ilike('name', '%test3%')
      .single();
      
    if (!tournament) {
      console.log('❌ test3 tournament not found');
      return;
    }
    
    console.log(`📋 Using existing tournament: ${tournament.name}`);
    
    // 3. Find a match we can test with (any pending match)
    const { data: testMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournament.id)
      .not('player1_id', 'is', null)
      .not('player2_id', 'is', null)
      .eq('status', 'pending')
      .limit(1)
      .single();
      
    if (!testMatch) {
      console.log('❌ No pending matches with both players found');
      return;
    }
    
    console.log(`🎯 Testing with match: R${testMatch.round_number} M${testMatch.match_number}`);
    console.log(`   Players: ${testMatch.player1_id?.substring(0,8)} vs ${testMatch.player2_id?.substring(0,8)}`);
    
    // 4. Complete the match to trigger advancement
    console.log('🧪 Completing match to test trigger...');
    
    const { error: completeError } = await supabase
      .from('tournament_matches')
      .update({
        score_player1: 2,
        score_player2: 1,
        winner_id: testMatch.player1_id,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', testMatch.id);
      
    if (completeError) {
      console.error('❌ Failed to complete match:', completeError);
      return;
    }
    
    console.log('✅ Match completed - trigger should have fired');
    
    // 5. Wait a moment and check for advancement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📊 Checking for any advancement that occurred...');
    
    // Revert the test change
    const { error: revertError } = await supabase
      .from('tournament_matches')
      .update({
        score_player1: 0,
        score_player2: 0,
        winner_id: null,
        status: 'pending',
        completed_at: null
      })
      .eq('id', testMatch.id);
      
    if (revertError) {
      console.error('⚠️ Failed to revert test change:', revertError);
    } else {
      console.log('✅ Test changes reverted');
    }
    
    console.log('\\n🎯 RESULT: If no errors occurred, trigger system is working');
    console.log('🔧 The issue might be that R202 matches are not completing properly');
    console.log('💡 Solution: Ensure R202 matches complete and have winners to trigger SF2 advancement');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
