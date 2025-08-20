const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔧 EMERGENCY FIX FOR WRONG SEMIFINALS ADVANCEMENT...');
  
  // Fix test6 - has wrong SF1 Player1
  console.log('\n📋 FIXING TEST6 SEMIFINALS...');
  
  const { data: test6 } = await supabase
    .from('tournaments')
    .select('id')
    .ilike('name', '%test6%')
    .single();
    
  if (test6) {
    // Get correct R3M1 winner
    const { data: r3m1 } = await supabase
      .from('tournament_matches')
      .select('winner_id')
      .eq('tournament_id', test6.id)
      .eq('round_number', 3)
      .eq('match_number', 1)
      .single();
      
    if (r3m1?.winner_id) {
      console.log(`  R3M1 winner: ${r3m1.winner_id.substring(0,8)}`);
      
      // Fix SF1 Player1
      const { error: fixError } = await supabase
        .from('tournament_matches')
        .update({
          player1_id: r3m1.winner_id
        })
        .eq('tournament_id', test6.id)
        .eq('round_number', 250)
        .eq('match_number', 1);
        
      if (fixError) {
        console.error('❌ Fix error:', fixError.message);
      } else {
        console.log('✅ Test6 SF1 Player1 fixed!');
      }
    }
  }
  
  // Check test1 SF1 Player2 issue
  console.log('\n📋 CHECKING TEST1 SEMIFINALS...');
  
  const { data: test1 } = await supabase
    .from('tournaments')
    .select('id')
    .ilike('name', '%test1%')
    .single();
    
  if (test1) {
    // Check if R103 is actually completed
    const { data: r103 } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', test1.id)
      .eq('round_number', 103)
      .eq('match_number', 1)
      .single();
      
    console.log(`  R103 status: ${r103?.status}, winner: ${r103?.winner_id?.substring(0,8) || 'NULL'}`);
    
    if (r103?.status !== 'completed') {
      // R103 not completed yet, should clear SF1 Player2
      const { error: clearError } = await supabase
        .from('tournament_matches')
        .update({
          player2_id: null,
          status: 'waiting_for_players'
        })
        .eq('tournament_id', test1.id)
        .eq('round_number', 250)
        .eq('match_number', 1);
        
      if (clearError) {
        console.error('❌ Clear error:', clearError.message);
      } else {
        console.log('✅ Test1 SF1 Player2 cleared (waiting for R103)');
      }
    }
  }
  
  console.log('\n🎯 EMERGENCY FIXES COMPLETE!');
  console.log('\n📋 FINAL VERIFICATION...');
  
  // Verify all tournaments again
  const { data: allTournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .ilike('name', '%test%')
    .order('name');
    
  for (const tournament of allTournaments || []) {
    const { data: semifinals } = await supabase
      .from('tournament_matches')
      .select('match_number, player1_id, player2_id, status')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .order('match_number');
      
    console.log(`\n${tournament.name}:`);
    semifinals?.forEach(sf => {
      console.log(`  SF${sf.match_number}: ${sf.player1_id?.substring(0,8) || 'NULL'} vs ${sf.player2_id?.substring(0,8) || 'NULL'} (${sf.status})`);
    });
  }
  
  console.log('\n✅ ALL FIXES APPLIED! Refresh browser để test...');
  
})();
