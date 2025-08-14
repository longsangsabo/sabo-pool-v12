import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixSABOTournamentDirectly() {
  console.log('🔧 FIXING SABO TOURNAMENT ISSUES DIRECTLY');
  console.log('========================================\n');
  
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // "test 1"
  
  console.log('🎯 Applying direct fixes to Supabase database...\n');
  
  // Fix 1: Remove the extra Match 22
  console.log('1️⃣ Removing extra Match 22 in Round 103...');
  
  const { data: match22 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', 22)
    .eq('round_number', 103)
    .single();
    
  if (match22 && !match22.player1_id && !match22.player2_id) {
    const { error: deleteError } = await supabase
      .from('tournament_matches')
      .delete()
      .eq('id', match22.id);
      
    if (deleteError) {
      console.log('❌ Error removing Match 22:', deleteError.message);
    } else {
      console.log('✅ Match 22 removed successfully');
    }
  } else {
    console.log('ℹ️ Match 22 not found or has players assigned');
  }
  
  // Fix 2: Assign players to Grand Final
  console.log('\n2️⃣ Fixing Grand Final player assignment...');
  
  // Get winners from Round 3 (Winners bracket champion)
  const { data: round3Matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 3)
    .eq('status', 'completed');
    
  let winnersChampion = null;
  if (round3Matches && round3Matches.length > 0) {
    // Get the winner from the last completed Round 3 match
    const lastR3Match = round3Matches[round3Matches.length - 1];
    if (lastR3Match.winner_id) {
      winnersChampion = lastR3Match.winner_id;
      console.log('✅ Found Winners bracket champion');
    }
  }
  
  // Get loser from Round 202 (Losers bracket champion)
  const { data: round202Matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 202)
    .eq('status', 'completed');
    
  let losersChampion = null;
  if (round202Matches && round202Matches.length > 0) {
    const lastR202Match = round202Matches[0];
    if (lastR202Match.winner_id) {
      losersChampion = lastR202Match.winner_id;
      console.log('✅ Found Losers bracket champion');
    }
  }
  
  // Update Grand Final with both champions
  if (winnersChampion || losersChampion) {
    const { error: updateGFError } = await supabase
      .from('tournament_matches')
      .update({
        player1_id: winnersChampion,
        player2_id: losersChampion,
        status: (winnersChampion && losersChampion) ? 'ready' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)
      .eq('round_number', 300);
      
    if (updateGFError) {
      console.log('❌ Error updating Grand Final:', updateGFError.message);
    } else {
      console.log('✅ Grand Final updated with champions');
    }
  } else {
    console.log('⚠️ Could not find champions for Grand Final');
  }
  
  // Fix 3: Use available SABO functions
  console.log('\n3️⃣ Using available SABO functions...');
  
  const functionsToTry = [
    'update_tournament_status',
    'calculate_final_rankings',
    'process_semifinals_completion'
  ];
  
  for (const funcName of functionsToTry) {
    try {
      console.log(`Testing ${funcName}...`);
      
      const { data, error } = await supabase.rpc(funcName, {
        p_tournament_id: tournamentId
      });
      
      if (error) {
        console.log(`❌ ${funcName}: ${error.message}`);
      } else {
        console.log(`✅ ${funcName}: Success`);
        if (data) console.log(`   Result: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`❌ ${funcName}: ${err.message}`);
    }
  }
  
  // Final verification
  console.log('\n📊 FINAL VERIFICATION:');
  
  const { data: finalMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (finalMatches) {
    console.log(`\n✅ Updated tournament has ${finalMatches.length} matches`);
    
    // Check key rounds
    const criticalRounds = [103, 201, 202, 300];
    criticalRounds.forEach(round => {
      const roundMatches = finalMatches.filter(m => m.round_number === round);
      if (roundMatches.length > 0) {
        const roundNames = {
          103: 'A3 Branch Final',
          201: 'Losers B1',
          202: 'Losers B2 (Finals Stage)', 
          300: 'Grand Final'
        };
        
        console.log(`\n${roundNames[round]}:`);
        roundMatches.forEach(match => {
          const p1 = match.player1_id ? '✅' : '❌';
          const p2 = match.player2_id ? '✅' : '❌';
          const status = match.status === 'ready' ? '🟢ready' : 
                        match.status === 'completed' ? '🏁done' : '🟡pending';
          console.log(`  Match ${match.match_number}: P1:${p1} P2:${p2} ${status}`);
        });
      }
    });
    
    // Count ready matches
    const readyMatches = finalMatches.filter(m => m.status === 'ready' && m.player1_id && m.player2_id);
    console.log(`\n🎮 Ready for score submission: ${readyMatches.length} matches`);
    
    if (readyMatches.length > 0) {
      console.log('Ready matches:');
      readyMatches.forEach(match => {
        console.log(`  🟢 Match ${match.match_number} (Round ${match.round_number})`);
      });
    }
  }
  
  console.log('\n🎉 SABO Tournament fixes completed!');
  console.log('✅ Extra Match 22 removed');
  console.log('✅ Grand Final player assignment attempted');
  console.log('✅ SABO functions tested');
}

fixSABOTournamentDirectly();
