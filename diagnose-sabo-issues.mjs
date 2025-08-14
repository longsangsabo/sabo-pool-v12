import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnoseAndFixSABO() {
  console.log('🔍 DIAGNOSING SABO TOURNAMENT ISSUES');
  console.log('===================================\n');
  
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // "test 1"
  
  // Get current tournament state
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (!allMatches) {
    console.log('❌ No matches found');
    return;
  }
  
  console.log(`📊 Total matches: ${allMatches.length}`);
  
  // Analyze the specific issues mentioned
  console.log('\n🚨 ANALYZING REPORTED ISSUES:');
  
  // Issue 1: A3 Branch Final has extra match 22
  const round103Matches = allMatches.filter(m => m.round_number === 103);
  console.log(`\n1️⃣ A3 Branch Final (Round 103): ${round103Matches.length} matches`);
  round103Matches.forEach(match => {
    const p1 = match.player1_id ? '✅' : '❌';
    const p2 = match.player2_id ? '✅' : '❌';
    const status = match.status;
    console.log(`   Match ${match.match_number}: P1:${p1} P2:${p2} Status:${status}`);
    
    if (match.match_number === 22) {
      console.log('   ⚠️ Match 22 found - this might be the extra match!');
    }
  });
  
  // Issue 2: Loser's Branch B Finals Stage wrong users
  const round201Matches = allMatches.filter(m => m.round_number === 201);
  const round202Matches = allMatches.filter(m => m.round_number === 202);
  
  console.log(`\n2️⃣ Loser's Branch B:`);
  console.log(`   Round 201 (B1): ${round201Matches.length} matches`);
  round201Matches.forEach(match => {
    const p1 = match.player1_id ? '✅' : '❌';
    const p2 = match.player2_id ? '✅' : '❌';
    console.log(`     Match ${match.match_number}: P1:${p1} P2:${p2} Status:${match.status}`);
  });
  
  console.log(`   Round 202 (B2 - Finals Stage): ${round202Matches.length} matches`);
  round202Matches.forEach(match => {
    const p1 = match.player1_id ? '✅' : '❌';
    const p2 = match.player2_id ? '✅' : '❌';
    console.log(`     Match ${match.match_number}: P1:${p1} P2:${p2} Status:${match.status}`);
  });
  
  // Issue 3: Grand Final missing users
  const grandFinalMatches = allMatches.filter(m => m.round_number === 300);
  console.log(`\n3️⃣ Grand Final (Round 300): ${grandFinalMatches.length} matches`);
  grandFinalMatches.forEach(match => {
    const p1 = match.player1_id ? '✅' : '❌';
    const p2 = match.player2_id ? '✅' : '❌';
    console.log(`   Match ${match.match_number}: P1:${p1} P2:${p2} Status:${match.status}`);
    
    if (!match.player1_id || !match.player2_id) {
      console.log('   ⚠️ Grand Final missing players!');
    }
  });
  
  console.log('\n🔧 TESTING SABO FUNCTIONS AVAILABILITY:');
  
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
  
  const availableFunctions = [];
  
  for (const funcName of saboFunctions) {
    try {
      // Test with dummy parameters
      const { data, error } = await supabase.rpc(funcName, {
        p_tournament_id: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error && !error.message.includes('could not find function')) {
        console.log(`✅ ${funcName}: Available`);
        availableFunctions.push(funcName);
      } else if (error && error.message.includes('could not find function')) {
        console.log(`❌ ${funcName}: Not found`);
      }
    } catch (err) {
      console.log(`❓ ${funcName}: ${err.message.slice(0, 50)}...`);
    }
  }
  
  console.log(`\n📋 Found ${availableFunctions.length} available SABO functions`);
  
  // Try to fix using available functions
  if (availableFunctions.includes('sabo_tournament_coordinator')) {
    console.log('\n🎮 Using SABO Tournament Coordinator to fix issues...');
    
    try {
      const { data: coordResult, error: coordError } = await supabase.rpc('sabo_tournament_coordinator', {
        p_tournament_id: tournamentId
      });
      
      if (coordError) {
        console.log('❌ Coordinator error:', coordError.message);
      } else {
        console.log('✅ Coordinator executed successfully');
        console.log('Result:', coordResult);
      }
    } catch (err) {
      console.log('❌ Coordinator execution failed:', err.message);
    }
  } else {
    console.log('\n🔧 Manual fix required - coordinator not available');
    
    // Manual fixes
    console.log('\nApplying manual fixes...');
    
    // Fix 1: Remove extra match 22 if empty
    const match22 = allMatches.find(m => m.match_number === 22 && m.round_number === 103);
    if (match22 && !match22.player1_id && !match22.player2_id) {
      console.log('Removing empty Match 22...');
      
      const { error } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('id', match22.id);
        
      if (!error) {
        console.log('✅ Match 22 removed');
      }
    }
  }
  
  console.log('\n📊 FINAL VERIFICATION:');
  
  // Re-check after fixes
  const { data: finalMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (finalMatches) {
    const finalRound103 = finalMatches.filter(m => m.round_number === 103);
    const finalRound202 = finalMatches.filter(m => m.round_number === 202);
    const finalRound300 = finalMatches.filter(m => m.round_number === 300);
    
    console.log(`\n✅ Final state:`);
    console.log(`   A3 Branch Final: ${finalRound103.length} matches`);
    console.log(`   B2 Finals Stage: ${finalRound202.length} matches`);
    console.log(`   Grand Final: ${finalRound300.length} matches`);
    
    const readyMatches = finalMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
    console.log(`   Ready for play: ${readyMatches.length} matches`);
  }
}

diagnoseAndFixSABO();
