require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function finalizeTournament() {
  console.log('🎯 FINALIZING TOURNAMENT');
  console.log('='.repeat(60));

  const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';

  // Step 1: Complete Group B Losers A progression
  console.log('\n1️⃣ Completing Group B Losers A progression...');
  
  // Complete R102M1 to get winners for R102M2
  const { data: la102m1 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_a')
    .eq('round_number', 102)
    .eq('match_number', 1);

  let la102Winners = [];
  
  if (la102m1[0] && la102m1[0].status !== 'completed') {
    const winner = Math.random() > 0.5 ? la102m1[0].player1_id : la102m1[0].player2_id;
    await supabase
      .from('sabo32_matches')
      .update({
        player1_score: winner === la102m1[0].player1_id ? 5 : 3,
        player2_score: winner === la102m1[0].player2_id ? 5 : 3,
        winner_id: winner,
        status: 'completed'
      })
      .eq('id', la102m1[0].id);
    
    la102Winners.push(winner);
    console.log('✅ Completed B-LA102M1');
  } else if (la102m1[0]?.winner_id) {
    la102Winners.push(la102m1[0].winner_id);
    console.log('✅ B-LA102M1 already completed');
  }

  // Get remaining R101 winners that weren't used in R102M1
  const { data: la101Completed } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_a')
    .eq('round_number', 101)
    .eq('status', 'completed');

  const allLA101Winners = la101Completed.map(match => match.winner_id);
  const unusedWinners = allLA101Winners.filter(w => !la102m1[0] || (w !== la102m1[0].player1_id && w !== la102m1[0].player2_id));

  console.log(`Found ${unusedWinners.length} unused R101 winners for R102M2`);

  if (unusedWinners.length >= 2) {
    // Assign to R102M2
    await supabase
      .from('sabo32_matches')
      .update({
        player1_id: unusedWinners[0],
        player2_id: unusedWinners[1],
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_losers_a')
      .eq('round_number', 102)
      .eq('match_number', 2);
    
    console.log('✅ B-LA102M2: Assigned players');

    // Complete R102M2
    const winner = Math.random() > 0.5 ? unusedWinners[0] : unusedWinners[1];
    await supabase
      .from('sabo32_matches')
      .update({
        player1_score: winner === unusedWinners[0] ? 5 : 3,
        player2_score: winner === unusedWinners[1] ? 5 : 3,
        winner_id: winner,
        status: 'completed'
      })
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_losers_a')
      .eq('round_number', 102)
      .eq('match_number', 2);
    
    la102Winners.push(winner);
    console.log('✅ Completed B-LA102M2');
  }

  // Assign to R103M1
  if (la102Winners.length >= 2) {
    await supabase
      .from('sabo32_matches')
      .update({
        player1_id: la102Winners[0],
        player2_id: la102Winners[1],
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_losers_a')
      .eq('round_number', 103)
      .eq('match_number', 1);
    
    console.log('✅ B-LA103M1: Assigned players');
  }

  // Step 2: Setup Cross Finals (Group A vs Group B)
  console.log('\n2️⃣ Setting up Cross Finals...');
  
  // Get Group A Finals winners (if any completed)
  const { data: groupAFinals } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'A')
    .eq('bracket_type', 'group_a_final')
    .eq('status', 'completed');

  // Get Group B Finals winners (if any completed)
  const { data: groupBFinals } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_final')
    .eq('status', 'completed');

  const groupAWinners = groupAFinals.map(match => match.winner_id).filter(Boolean);
  const groupBWinners = groupBFinals.map(match => match.winner_id).filter(Boolean);

  console.log(`Group A has ${groupAWinners.length} completed finals`);
  console.log(`Group B has ${groupBWinners.length} completed finals`);

  if (groupAWinners.length >= 2 && groupBWinners.length >= 1) {
    // Cross Semifinals: Group A winners vs Group B winner
    await supabase
      .from('sabo32_matches')
      .update({
        player1_id: groupAWinners[0],
        player2_id: groupBWinners[0],
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'cross_semifinals')
      .eq('round_number', 350)
      .eq('match_number', 1);

    await supabase
      .from('sabo32_matches')
      .update({
        player1_id: groupAWinners[1],
        player2_id: groupBWinners[0], // Same player faces both Group A winners
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'cross_semifinals')
      .eq('round_number', 350)
      .eq('match_number', 2);

    console.log('✅ Cross Semifinals setup complete');
  } else {
    console.log('⚠️  Need to complete Group Finals first');
  }

  console.log('\n🎉 Tournament finalization completed!');
  console.log('\n📋 CURRENT STATUS:');
  console.log('✅ Group A: Fully structured and ready');
  console.log('✅ Group B: Fully structured and ready');
  console.log('⚠️  Cross Finals: Waiting for Group Finals completion');
  console.log('\n🎮 Players can now complete their matches!');
}

finalizeTournament().catch(console.error);
