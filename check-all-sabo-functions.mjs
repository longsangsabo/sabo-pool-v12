import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAllSABOFunctions() {
  console.log('🔍 CHECKING ALL SABO FUNCTIONS IN DATABASE');
  console.log('=========================================\n');
  
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // "test 1"
  
  const saboFunctions = [
    'initialize_sabo_tournament',
    'process_winners_round1_completion',
    'process_winners_round2_completion',
    'process_winners_round3_completion',
    'process_losers_r101_completion',
    'process_losers_r102_completion',
    'process_losers_r103_completion',
    'process_losers_r201_completion',
    'process_losers_r202_completion',
    'setup_semifinals_pairings',
    'process_semifinals_completion',
    'process_grand_final_completion',
    'update_tournament_status',
    'calculate_final_rankings',
    'finalize_tournament',
    'sabo_tournament_coordinator'
  ];
  
  console.log(`📋 Testing ${saboFunctions.length} SABO functions:\n`);
  
  const results = [];
  
  for (let i = 0; i < saboFunctions.length; i++) {
    const funcName = saboFunctions[i];
    const isMaster = funcName === 'sabo_tournament_coordinator';
    
    console.log(`${i + 1}. Testing ${funcName}${isMaster ? ' (MASTER CONTROLLER)' : ''}...`);
    
    try {
      const { data, error } = await supabase.rpc(funcName, {
        p_tournament_id: tournamentId
      });
      
      if (error) {
        if (error.message.includes('could not find function')) {
          console.log(`   ❌ NOT FOUND - Function does not exist in database`);
          results.push({ name: funcName, status: 'NOT_FOUND', error: error.message });
        } else {
          console.log(`   ✅ EXISTS - Function found (Error on execution: ${error.message.slice(0, 50)}...)`);
          results.push({ name: funcName, status: 'EXISTS', error: error.message, data: null });
        }
      } else {
        console.log(`   ✅ EXISTS & WORKING - Function executed successfully`);
        console.log(`      Result: ${JSON.stringify(data)}`);
        results.push({ name: funcName, status: 'WORKING', error: null, data });
      }
    } catch (err) {
      console.log(`   ❌ ERROR - ${err.message.slice(0, 60)}...`);
      results.push({ name: funcName, status: 'ERROR', error: err.message });
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('===========');
  
  const working = results.filter(r => r.status === 'WORKING');
  const existing = results.filter(r => r.status === 'EXISTS');
  const notFound = results.filter(r => r.status === 'NOT_FOUND');
  const errors = results.filter(r => r.status === 'ERROR');
  
  console.log(`✅ Working functions: ${working.length}`);
  console.log(`🔶 Existing (but failed): ${existing.length}`);
  console.log(`❌ Not found: ${notFound.length}`);
  console.log(`⚠️ Errors: ${errors.length}`);
  
  if (working.length > 0) {
    console.log('\n✅ WORKING FUNCTIONS:');
    working.forEach(func => {
      console.log(`   - ${func.name}`);
      if (func.data) {
        console.log(`     Result: ${JSON.stringify(func.data).slice(0, 100)}...`);
      }
    });
  }
  
  if (existing.length > 0) {
    console.log('\n🔶 EXISTING BUT FAILED:');
    existing.forEach(func => {
      console.log(`   - ${func.name}: ${func.error.slice(0, 80)}...`);
    });
  }
  
  if (notFound.length > 0) {
    console.log('\n❌ NOT FOUND IN DATABASE:');
    notFound.forEach(func => {
      console.log(`   - ${func.name}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️ ERRORS:');
    errors.forEach(func => {
      console.log(`   - ${func.name}: ${func.error.slice(0, 80)}...`);
    });
  }
  
  // Test Master Controller separately if it exists
  const masterController = results.find(r => r.name === 'sabo_tournament_coordinator');
  
  if (masterController && (masterController.status === 'EXISTS' || masterController.status === 'WORKING')) {
    console.log('\n🎮 TESTING MASTER CONTROLLER WITH DIFFERENT PARAMETERS:');
    
    try {
      // Test with different parameter combinations
      const testParams = [
        { p_tournament_id: tournamentId },
        { tournament_id: tournamentId },
        { p_tournament_id: tournamentId, p_action: 'coordinate' }
      ];
      
      for (let i = 0; i < testParams.length; i++) {
        console.log(`   Test ${i + 1}: ${JSON.stringify(testParams[i])}`);
        
        const { data, error } = await supabase.rpc('sabo_tournament_coordinator', testParams[i]);
        
        if (error) {
          console.log(`      ❌ ${error.message.slice(0, 80)}...`);
        } else {
          console.log(`      ✅ Success: ${JSON.stringify(data)}`);
          break; // Stop on first success
        }
      }
    } catch (err) {
      console.log(`   ❌ Master controller test failed: ${err.message}`);
    }
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('==================');
  
  if (working.length > 0) {
    console.log(`✅ ${working.length} functions are working - use these for tournament flow`);
  }
  
  if (existing.length > 0) {
    console.log(`🔧 ${existing.length} functions exist but need parameter fixes`);
  }
  
  if (notFound.length > 0) {
    console.log(`📝 ${notFound.length} functions need to be created in database`);
  }
  
  const masterStatus = masterController?.status;
  if (masterStatus === 'WORKING') {
    console.log('🎮 Master controller is working - use it to orchestrate tournament flow');
  } else if (masterStatus === 'EXISTS') {
    console.log('🎮 Master controller exists but needs parameter adjustment');
  } else {
    console.log('🚨 Master controller not available - manual coordination required');
  }
}

checkAllSABOFunctions();
