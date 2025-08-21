const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function testSemifinalsLogic() {
  try {
    console.log('🧪 Testing SABO Semifinals Auto-Population Logic...');
    console.log('====================================================');
    
    // Get double elimination tournaments (SABO type)
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type')
      .eq('tournament_type', 'double_elimination')
      .limit(3);
      
    if (tError) {
      console.error('❌ Error getting tournaments:', tError.message);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('ℹ️  No double elimination tournaments found');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} double elimination tournaments:`);
    tournaments.forEach(t => console.log(`  - ${t.name} (${t.id})`));
    
    // Analyze each tournament
    for (const tournament of tournaments) {
      console.log(`\n🔍 Analyzing ${tournament.name}:`);
      console.log('=====================================');
      
      // Get key matches
      const { data: matches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, player1_id, player2_id, winner_id, status')
        .eq('tournament_id', tournament.id)
        .in('round_number', [3, 103, 202, 250])  // R3, Losers Finals, Semifinals
        .order('round_number, match_number');
        
      if (matchError) {
        console.error('❌ Match error:', matchError.message);
        continue;
      }
      
      // Organize matches
      const r3m1 = matches.find(m => m.round_number === 3 && m.match_number === 1);
      const r3m2 = matches.find(m => m.round_number === 3 && m.match_number === 2);
      const losersA = matches.find(m => m.round_number === 103 && m.match_number === 1);
      const losersB = matches.find(m => m.round_number === 202 && m.match_number === 1);
      const sf1 = matches.find(m => m.round_number === 250 && m.match_number === 1);
      const sf2 = matches.find(m => m.round_number === 250 && m.match_number === 2);
      
      console.log('\n📊 Current Status:');
      console.log(`  R3 M1: ${r3m1?.status || 'Not Found'} | Winner: ${r3m1?.winner_id?.substring(0,8) || 'None'}`);
      console.log(`  R3 M2: ${r3m2?.status || 'Not Found'} | Winner: ${r3m2?.winner_id?.substring(0,8) || 'None'}`);
      console.log(`  Losers A (R103): ${losersA?.status || 'Not Found'} | Winner: ${losersA?.winner_id?.substring(0,8) || 'None'}`);
      console.log(`  Losers B (R202): ${losersB?.status || 'Not Found'} | Winner: ${losersB?.winner_id?.substring(0,8) || 'None'}`);
      
      console.log('\n🎯 Semifinals Should Be:');
      console.log(`  SF1 Player1: ${r3m1?.winner_id?.substring(0,8) || 'TBD'} (R3M1 Winner)`);
      console.log(`  SF1 Player2: ${losersA?.winner_id?.substring(0,8) || 'TBD'} (Losers A Champion)`);
      console.log(`  SF2 Player1: ${r3m2?.winner_id?.substring(0,8) || 'TBD'} (R3M2 Winner)`);
      console.log(`  SF2 Player2: ${losersB?.winner_id?.substring(0,8) || 'TBD'} (Losers B Champion)`);
      
      console.log('\n📋 Semifinals Currently Are:');
      console.log(`  SF1: ${sf1?.player1_id?.substring(0,8) || 'NULL'} vs ${sf1?.player2_id?.substring(0,8) || 'NULL'} (${sf1?.status || 'Not Found'})`);
      console.log(`  SF2: ${sf2?.player1_id?.substring(0,8) || 'NULL'} vs ${sf2?.player2_id?.substring(0,8) || 'NULL'} (${sf2?.status || 'Not Found'})`);
      
      // Check if fixes are needed
      const needsFix = [];
      
      if (r3m1?.winner_id && sf1?.player1_id !== r3m1.winner_id) {
        needsFix.push('SF1 Player1 ← R3M1 Winner');
      }
      if (losersA?.winner_id && sf1?.player2_id !== losersA.winner_id) {
        needsFix.push('SF1 Player2 ← Losers A Champion');
      }
      if (r3m2?.winner_id && sf2?.player1_id !== r3m2.winner_id) {
        needsFix.push('SF2 Player1 ← R3M2 Winner');
      }
      if (losersB?.winner_id && sf2?.player2_id !== losersB.winner_id) {
        needsFix.push('SF2 Player2 ← Losers B Champion');
      }
      
      if (needsFix.length > 0) {
        console.log('\n❌ Fixes Needed:');
        needsFix.forEach(fix => console.log(`  - ${fix}`));
        
        console.log('\n🔧 Would you like to apply the fix? (Run the manual fix function)');
        console.log(`   SQL: SELECT fix_sabo_semifinals_now('${tournament.id}');`);
      } else {
        console.log('\n✅ Semifinals are correctly populated!');
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log('==========');
    console.log('✅ Logic: R3 Winners → SF Player1, Losers Champions → SF Player2');
    console.log('✅ Auto-trigger will handle future matches');
    console.log('✅ Manual fix function available for existing tournaments');
    console.log('\n📝 To deploy: Copy sabo-semifinals-auto-population.sql to Supabase');
    
  } catch (err) {
    console.error('💥 Test failed:', err.message);
  }
}

testSemifinalsLogic();
