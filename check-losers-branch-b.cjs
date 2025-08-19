const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Checking Losers Branch B in test3...');
  
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name')
    .ilike('name', '%test3%')
    .single();
    
  if (!tournament) {
    console.log('❌ test3 tournament not found');
    return;
  }
  
  console.log(`🏆 Checking tournament: ${tournament.name}`);
  
  // Check Losers Branch B structure (Round 201-203)
  console.log('\n📊 Losers Branch B (Rounds 201-203):');
  
  const { data: losersBMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .gte('round_number', 201)
    .lte('round_number', 203)
    .order('round_number, match_number');
    
  losersBMatches?.forEach(match => {
    console.log(`   R${match.round_number} M${match.match_number}:`);
    console.log(`     Player1: ${match.player1_id?.substring(0,8) || 'NULL'}`);
    console.log(`     Player2: ${match.player2_id?.substring(0,8) || 'NULL'}`);
    console.log(`     Status: ${match.status}, Score: ${match.score_player1 || 0}-${match.score_player2 || 0}`);
    console.log(`     Winner: ${match.winner_id?.substring(0,8) || 'NULL'}\n`);
  });
  
  // Check what should feed into Losers Branch B
  console.log('🔄 Checking sources for Losers Branch B...');
  
  // R3 losers should go to R201
  const { data: winnersR3 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 3)
    .order('match_number');
    
  console.log('\n🎯 Winners R3 (losers should feed to Losers B):');
  winnersR3?.forEach(match => {
    const loser_id = match.winner_id ? 
      (match.player1_id === match.winner_id ? match.player2_id : match.player1_id) : 'NO_WINNER';
    console.log(`   R3 M${match.match_number}: Winner=${match.winner_id?.substring(0,8) || 'NULL'}, Loser=${loser_id?.substring?.(0,8) || loser_id}`);
  });
  
  // Check Losers A R103 results (feeds to R202)  
  const { data: losersAFinal } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 103)
    .eq('match_number', 1)
    .single();
    
  const losersA_loser = losersAFinal?.winner_id ? 
    (losersAFinal.player1_id === losersAFinal.winner_id ? losersAFinal.player2_id : losersAFinal.player1_id) : null;
    
  console.log('\n🎯 Losers A Final (loser should feed to R202):');
  console.log(`   R103 Winner: ${losersAFinal?.winner_id?.substring(0,8) || 'NULL'}`);
  console.log(`   R103 Loser: ${losersA_loser?.substring(0,8) || 'NULL'} (should go to R202)`);
  
  console.log('\n🔧 DIAGNOSIS:');
  console.log('Losers Branch B should be populated as:');
  console.log(`   R201: R3 losers`);
  console.log(`   R202: R201 winner vs R103 loser`);  
  console.log(`   R203: R202 winner (becomes Losers B Champion for SF2)`);
})();
