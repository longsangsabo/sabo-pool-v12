const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Checking test3 tournament structure...');
  
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name')
    .ilike('name', '%test3%')
    .single();
    
  if (!tournament) {
    console.log('❌ test3 tournament not found');
    return;
  }
  
  console.log(`🏆 Found tournament: ${tournament.name} (ID: ${tournament.id.substring(0,8)}...)`);
  
  // Check Finals Stage structure
  console.log('\n📊 Finals Stage (Rounds 200-300):');
  
  const { data: finalsMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .gte('round_number', 200)
    .order('round_number, match_number');
    
  finalsMatches?.forEach(match => {
    const roundName = match.round_number === 200 ? 'Quarterfinals' : 
                     match.round_number === 250 ? 'Semifinals' : 'Grand Final';
    console.log(`   ${roundName} R${match.round_number} M${match.match_number}:`);
    console.log(`     Player1: ${match.player1_id?.substring(0,8) || 'NULL'}`);
    console.log(`     Player2: ${match.player2_id?.substring(0,8) || 'NULL'}`);
    console.log(`     Status: ${match.status}, Score: ${match.score_player1 || 0}-${match.score_player2 || 0}`);
    console.log(`     Winner: ${match.winner_id?.substring(0,8) || 'NULL'}\n`);
  });
  
  // Check what should feed into semifinals
  console.log('🔄 Checking advancement logic sources...');
  
  // Check Winners Bracket R3 results
  const { data: winners_r3_matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 3)
    .order('match_number');
    
  console.log('\n🎯 Winners R3 (should feed to semifinals):');
  winners_r3_matches?.forEach(match => {
    console.log(`   R3 M${match.match_number}: Player1=${match.player1_id?.substring(0,8)} vs Player2=${match.player2_id?.substring(0,8)}`);
    console.log(`     Status: ${match.status}, Winner: ${match.winner_id?.substring(0,8) || 'NULL'}`);
  });
  
  // Check Losers Finals
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
    
  console.log('\n🎯 Losers Finals (should feed to semifinals):');
  console.log(`   Losers A Final (R103): Status=${losers_final_a?.status || 'NULL'}, Winner=${losers_final_a?.winner_id?.substring(0,8) || 'NULL'}`);
  console.log(`   Losers B Final (R203): Status=${losers_final_b?.status || 'NULL'}, Winner=${losers_final_b?.winner_id?.substring(0,8) || 'NULL'}`);
  
  // Diagnose the issue
  console.log('\n🔧 DIAGNOSIS:');
  console.log('Semifinals should be populated as follows:');
  console.log(`   SF1: Winners R3 M1 winner (${winners_r3_matches?.[0]?.winner_id?.substring(0,8) || 'MISSING'}) vs Losers A Champion (${losers_final_a?.winner_id?.substring(0,8) || 'MISSING'})`);
  console.log(`   SF2: Winners R3 M2 winner (${winners_r3_matches?.[1]?.winner_id?.substring(0,8) || 'MISSING'}) vs Losers B Champion (${losers_final_b?.winner_id?.substring(0,8) || 'MISSING'})`);
})();
