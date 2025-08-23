require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSabo32GroupFinals() {
  console.log('🔍 Checking SABO-32 Group Finals...');
  
  // Get all sabo32_matches
  const { data: allMatches, error: matchError } = await supabase
    .from('sabo32_matches')
    .select('*');
    
  if (matchError) {
    console.error('❌ Error fetching sabo32_matches:', matchError);
    return;
  }
  
  console.log('🎮 Found sabo32_matches:', allMatches?.length || 0);
  
  if (!allMatches || allMatches.length === 0) {
    console.log('⚠️ No SABO-32 matches found');
    return;
  }

  // Group matches by group and bracket type
  const groupA = allMatches.filter(m => m.group_id === 'A');
  const groupB = allMatches.filter(m => m.group_id === 'B');
  
  console.log('📊 Group A matches:', groupA.length);
  console.log('📊 Group B matches:', groupB.length);
  
  // Check Group Finals specifically
  const groupAFinals = allMatches.filter(m => 
    m.bracket_type === 'GROUP_A_FINAL' || 
    m.sabo_match_id?.includes('A-FINAL')
  );
  
  const groupBFinals = allMatches.filter(m => 
    m.bracket_type === 'GROUP_B_FINAL' || 
    m.sabo_match_id?.includes('B-FINAL')
  );
  
  console.log('🏆 Group A Finals:', groupAFinals.length, 'matches');
  console.log('🏆 Group B Finals:', groupBFinals.length, 'matches');
  
  // Check advancement logic for each group
  await checkGroupAdvancement('A', groupA);
  await checkGroupAdvancement('B', groupB);
  
  console.log('✅ Analysis complete');
}

async function checkGroupAdvancement(groupId, groupMatches) {
  console.log(`\n🔍 Analyzing Group ${groupId} advancement:`);
  
  // Separate by bracket type
  const winnersMatches = groupMatches.filter(m => m.bracket_type?.includes('WINNERS'));
  const losersAMatches = groupMatches.filter(m => m.bracket_type?.includes('LOSERS_A'));
  const losersBMatches = groupMatches.filter(m => m.bracket_type?.includes('LOSERS_B'));
  const finalMatches = groupMatches.filter(m => m.bracket_type?.includes('FINAL'));
  
  console.log(`  Winners bracket: ${winnersMatches.length} matches`);
  console.log(`  Losers A bracket: ${losersAMatches.length} matches`);
  console.log(`  Losers B bracket: ${losersBMatches.length} matches`);
  console.log(`  Finals: ${finalMatches.length} matches`);
  
  // Find latest completed matches
  const completedWinners = winnersMatches.filter(m => m.status === 'completed');
  const completedLosersA = losersAMatches.filter(m => m.status === 'completed');
  const completedLosersB = losersBMatches.filter(m => m.status === 'completed');
  
  console.log(`  ✅ Completed winners: ${completedWinners.length}`);
  console.log(`  ✅ Completed losers A: ${completedLosersA.length}`);
  console.log(`  ✅ Completed losers B: ${completedLosersB.length}`);
  
  // Find highest round completed in each bracket
  const winnersMaxRound = Math.max(...completedWinners.map(m => m.round_number), 0);
  const losersAMaxRound = Math.max(...completedLosersA.map(m => m.round_number), 0);
  const losersBMaxRound = Math.max(...completedLosersB.map(m => m.round_number), 0);
  
  console.log(`  🏁 Winners max round: ${winnersMaxRound}`);
  console.log(`  🏁 Losers A max round: ${losersAMaxRound}`);
  console.log(`  🏁 Losers B max round: ${losersBMaxRound}`);
  
  // Get finalists from each bracket
  const winnersFinalists = completedWinners
    .filter(m => m.round_number === winnersMaxRound)
    .map(m => ({ player: m.winner_id, match: m.sabo_match_id }));
    
  const losersAChampion = completedLosersA
    .filter(m => m.round_number === losersAMaxRound)
    .map(m => ({ player: m.winner_id, match: m.sabo_match_id }));
    
  const losersBChampion = completedLosersB
    .filter(m => m.round_number === losersBMaxRound)
    .map(m => ({ player: m.winner_id, match: m.sabo_match_id }));
  
  console.log(`  🏆 Winners finalists:`, winnersFinalists);
  console.log(`  🏆 Losers A champion:`, losersAChampion);
  console.log(`  🏆 Losers B champion:`, losersBChampion);
  
  // Check if Group Final exists and has correct participants
  if (finalMatches.length === 0) {
    console.log(`  ❌ No Group ${groupId} Final match found!`);
    console.log(`  🔧 Need to create Group ${groupId} Final with:`);
    console.log(`     - 2 winners from Winners bracket`);
    console.log(`     - 1 winner from Losers A bracket`);
    console.log(`     - 1 winner from Losers B bracket`);
    
    // Suggest who should advance
    if (winnersFinalists.length >= 2 && losersAChampion.length >= 1 && losersBChampion.length >= 1) {
      console.log(`  💡 Suggested participants:`);
      console.log(`     - ${winnersFinalists[0].player} (Winners)`);
      console.log(`     - ${winnersFinalists[1].player} (Winners)`);
      console.log(`     - ${losersAChampion[0].player} (Losers A)`);
      console.log(`     - ${losersBChampion[0].player} (Losers B)`);
    }
  } else {
    const finalMatch = finalMatches[0];
    console.log(`  ✅ Group ${groupId} Final exists:`, {
      match_id: finalMatch.sabo_match_id,
      player1: finalMatch.player1_id,
      player2: finalMatch.player2_id,
      status: finalMatch.status
    });
    
    if (finalMatch.status === 'pending' && finalMatch.player1_id === null && finalMatch.player2_id === null) {
      console.log(`  ⚠️  Group ${groupId} Final has no players assigned (TBD state)`);
    }
  }
}

// Run the check
checkSabo32GroupFinals().catch(console.error);
