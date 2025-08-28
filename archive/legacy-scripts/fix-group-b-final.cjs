require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixGroupBCompletely() {
  console.log('🔧 FIXING GROUP B COMPLETELY');
  console.log('='.repeat(60));

  const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';

  // Step 1: Get all Group B Winners R1 losers and put them in Losers A
  console.log('\n1️⃣ Fixing Winners R1 losers → Losers A...');
  const { data: winnersR1 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_winners')
    .eq('round_number', 1)
    .eq('status', 'completed');

  const r1Losers = [];
  winnersR1.forEach(match => {
    if (match.winner_id === match.player1_id) {
      r1Losers.push(match.player2_id);
    } else {
      r1Losers.push(match.player1_id);
    }
  });

  console.log(`Found ${r1Losers.length} losers from Winners R1`);

  // Assign to Losers A R101
  for (let i = 0; i < r1Losers.length && i < 8; i += 2) {
    const matchNum = Math.floor(i / 2) + 1;
    if (r1Losers[i] && r1Losers[i + 1]) {
      await supabase
        .from('sabo32_matches')
        .update({
          player1_id: r1Losers[i],
          player2_id: r1Losers[i + 1],
          status: 'pending'
        })
        .eq('tournament_id', tournamentId)
        .eq('group_id', 'B')
        .eq('bracket_type', 'group_b_losers_a')
        .eq('round_number', 101)
        .eq('match_number', matchNum);
      
      console.log(`✅ B-LA101M${matchNum}: Assigned players`);
    }
  }

  // Step 2: Complete Losers A progression with dummy scores
  console.log('\n2️⃣ Completing Losers A progression...');
  
  // Complete R101 matches
  const { data: la101 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_a')
    .eq('round_number', 101)
    .not('player1_id', 'is', null)
    .not('player2_id', 'is', null);

  const la101Winners = [];
  for (const match of la101) {
    if (match.status !== 'completed') {
      const winner = Math.random() > 0.5 ? match.player1_id : match.player2_id;
      await supabase
        .from('sabo32_matches')
        .update({
          player1_score: winner === match.player1_id ? 5 : 3,
          player2_score: winner === match.player2_id ? 5 : 3,
          winner_id: winner,
          status: 'completed'
        })
        .eq('id', match.id);
      
      la101Winners.push(winner);
      console.log(`✅ Completed B-LA101M${match.match_number}`);
    }
  }

  // Assign to R102
  for (let i = 0; i < la101Winners.length && i < 4; i += 2) {
    const matchNum = Math.floor(i / 2) + 1;
    if (la101Winners[i] && la101Winners[i + 1]) {
      await supabase
        .from('sabo32_matches')
        .update({
          player1_id: la101Winners[i],
          player2_id: la101Winners[i + 1],
          status: 'pending'
        })
        .eq('tournament_id', tournamentId)
        .eq('group_id', 'B')
        .eq('bracket_type', 'group_b_losers_a')
        .eq('round_number', 102)
        .eq('match_number', matchNum);
      
      console.log(`✅ B-LA102M${matchNum}: Assigned players`);
    }
  }

  // Complete R102 matches
  const { data: la102 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_a')
    .eq('round_number', 102)
    .not('player1_id', 'is', null)
    .not('player2_id', 'is', null);

  const la102Winners = [];
  for (const match of la102) {
    if (match.status !== 'completed') {
      const winner = Math.random() > 0.5 ? match.player1_id : match.player2_id;
      await supabase
        .from('sabo32_matches')
        .update({
          player1_score: winner === match.player1_id ? 5 : 3,
          player2_score: winner === match.player2_id ? 5 : 3,
          winner_id: winner,
          status: 'completed'
        })
        .eq('id', match.id);
      
      la102Winners.push(winner);
      console.log(`✅ Completed B-LA102M${match.match_number}`);
    }
  }

  // Assign to R103 (only 1 match)
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

  // Step 3: Get Winners R2 losers and put them in Losers B
  console.log('\n3️⃣ Fixing Winners R2 losers → Losers B...');
  const { data: winnersR2 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_winners')
    .eq('round_number', 2)
    .eq('status', 'completed');

  const r2Losers = [];
  winnersR2.forEach(match => {
    if (match.winner_id === match.player1_id) {
      r2Losers.push(match.player2_id);
    } else {
      r2Losers.push(match.player1_id);
    }
  });

  console.log(`Found ${r2Losers.length} losers from Winners R2`);

  // Assign to Losers B R201
  for (let i = 0; i < r2Losers.length && i < 4; i += 2) {
    const matchNum = Math.floor(i / 2) + 1;
    if (r2Losers[i] && r2Losers[i + 1]) {
      await supabase
        .from('sabo32_matches')
        .update({
          player1_id: r2Losers[i],
          player2_id: r2Losers[i + 1],
          status: 'pending'
        })
        .eq('tournament_id', tournamentId)
        .eq('group_id', 'B')
        .eq('bracket_type', 'group_b_losers_b')
        .eq('round_number', 201)
        .eq('match_number', matchNum);
      
      console.log(`✅ B-LB201M${matchNum}: Assigned players`);
    }
  }

  // Step 4: Complete Losers B progression
  console.log('\n4️⃣ Completing Losers B progression...');
  
  // Complete R201 matches
  const { data: lb201 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_b')
    .eq('round_number', 201)
    .not('player1_id', 'is', null)
    .not('player2_id', 'is', null);

  const lb201Winners = [];
  for (const match of lb201) {
    if (match.status !== 'completed') {
      const winner = Math.random() > 0.5 ? match.player1_id : match.player2_id;
      await supabase
        .from('sabo32_matches')
        .update({
          player1_score: winner === match.player1_id ? 5 : 3,
          player2_score: winner === match.player2_id ? 5 : 3,
          winner_id: winner,
          status: 'completed'
        })
        .eq('id', match.id);
      
      lb201Winners.push(winner);
      console.log(`✅ Completed B-LB201M${match.match_number}`);
    }
  }

  // Assign winners to R202 (1 match)
  if (lb201Winners.length >= 2) {
    await supabase
      .from('sabo32_matches')
      .update({
        player1_id: lb201Winners[0],
        player2_id: lb201Winners[1],
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_losers_b')
      .eq('round_number', 202)
      .eq('match_number', 1);
    
    console.log('✅ B-LB202M1: Assigned players');
  }

  // Step 5: Setup Group B Finals
  console.log('\n5️⃣ Setting up Group B Finals...');
  
  // Get the finalists
  const { data: winnersR3 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_winners')
    .eq('round_number', 3);

  const { data: la103Winner } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_a')
    .eq('round_number', 103)
    .eq('match_number', 1);

  const { data: lb202Winner } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('group_id', 'B')
    .eq('bracket_type', 'group_b_losers_b')
    .eq('round_number', 202)
    .eq('match_number', 1);

  const finalists = [];
  
  // Add Winners R3 finalists
  winnersR3.forEach(match => {
    if (match.player1_id) finalists.push(match.player1_id);
    if (match.player2_id) finalists.push(match.player2_id);
  });
  
  // Add Losers A winner (if completed)
  if (la103Winner[0]?.winner_id) {
    finalists.push(la103Winner[0].winner_id);
  }
  
  // Add Losers B winner (if completed)
  if (lb202Winner[0]?.winner_id) {
    finalists.push(lb202Winner[0].winner_id);
  }

  console.log(`Found ${finalists.length}/4 players for Group B Finals`);

  if (finalists.length >= 4) {
    // Match 1: Winners R3 players
    await supabase
      .from('sabo32_matches')
      .update({
        player1_id: finalists[0],
        player2_id: finalists[1],
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_final')
      .eq('round_number', 250)
      .eq('match_number', 1);
    
    console.log('✅ Group B Finals populated');
  } else {
    console.log(`⚠️  Need to complete more matches to get all 4 finalists`);
  }

  console.log('\n🎉 Group B fixing completed!');
}

fixGroupBCompletely().catch(console.error);
