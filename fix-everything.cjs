require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixEverything() {
  console.log('🚀 Fix Everything - Complete Tournament\n');

  try {
    // Fix both groups
    for (const groupId of ['A', 'B']) {
      console.log(`📋 === FIXING GROUP ${groupId} ===`);
      await fixGroup(groupId);
      console.log('');
    }

    // Final verification
    console.log('📋 === FINAL TOURNAMENT STATE ===');
    await verifyTournament();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function fixGroup(groupId) {
  // 1. Fix Winners R1 losers → Losers A
  await fixWinnersToLosersA(groupId);
  
  // 2. Complete Losers A progression
  await completeLosersA(groupId);
  
  // 3. Fix Winners R2 losers → Losers B
  await fixWinnersToLosersB(groupId);
  
  // 4. Complete Losers B progression
  await completeLosersB(groupId);
  
  // 5. Complete Winners bracket
  await completeWinners(groupId);
  
  // 6. Setup Group Finals
  await setupGroupFinals(groupId);
}

async function fixWinnersToLosersA(groupId) {
  console.log(`   🏆→💀 Winners R1 losers to Losers A...`);
  
  // Get Winners R1 completed
  const { data: winnersR1 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
    .eq('round_number', 1)
    .eq('status', 'completed');

  const losers = winnersR1.map(match => 
    match.player1_id === match.winner_id ? match.player2_id : match.player1_id
  );

  console.log(`     Found ${losers.length} losers from Winners R1`);

  // Get Losers A R101
  const { data: losersA101 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_a`)
    .eq('round_number', 101)
    .order('match_number');

  // Distribute losers (2 per match)
  for (let i = 0; i < Math.min(losersA101.length, Math.ceil(losers.length / 2)); i++) {
    const match = losersA101[i];
    const loser1 = losers[i * 2];
    const loser2 = losers[i * 2 + 1];

    if (loser1 && loser2 && !match.player1_id) {
      await supabase
        .from('sabo32_matches')
        .update({
          player1_id: loser1,
          player2_id: loser2,
          status: 'pending'
        })
        .eq('id', match.id);

      console.log(`     ✅ ${match.sabo_match_id}: Advanced 2 losers`);
    }
  }
}

async function completeLosersA(groupId) {
  console.log(`   💀 Complete Losers A progression...`);
  
  // Complete R101 → R102
  await completeLosersRound(groupId, 'losers_a', 101, 102);
  
  // Complete R102 → R103
  await completeLosersRound(groupId, 'losers_a', 102, 103);
}

async function completeLosersB(groupId) {
  console.log(`   💀 Complete Losers B progression...`);
  
  // Complete R201 → R202
  await completeLosersRound(groupId, 'losers_b', 201, 202);
}

async function completeLosersRound(groupId, bracketSuffix, fromRound, toRound) {
  // Complete current round matches
  const { data: currentRound } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_${bracketSuffix}`)
    .eq('round_number', fromRound)
    .eq('status', 'pending')
    .not('player1_id', 'is', null)
    .not('player2_id', 'is', null);

  for (const match of currentRound) {
    await supabase
      .from('sabo32_matches')
      .update({
        winner_id: match.player1_id,
        score_player1: 2,
        score_player2: 1,
        status: 'completed'
      })
      .eq('id', match.id);
  }

  if (currentRound.length > 0) {
    console.log(`     ✅ Completed ${currentRound.length} matches in R${fromRound}`);
  }

  // Advance winners to next round
  const { data: completed } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_${bracketSuffix}`)
    .eq('round_number', fromRound)
    .eq('status', 'completed');

  const winners = completed.map(m => m.winner_id);

  if (winners.length > 0) {
    const { data: nextRound } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_${bracketSuffix}`)
      .eq('round_number', toRound)
      .order('match_number');

    // Distribute winners
    for (let i = 0; i < Math.min(nextRound.length, Math.ceil(winners.length / 2)); i++) {
      const match = nextRound[i];
      const winner1 = winners[i * 2];
      const winner2 = winners[i * 2 + 1] || winners[i * 2]; // Handle odd numbers

      if (winner1 && !match.player1_id) {
        await supabase
          .from('sabo32_matches')
          .update({
            player1_id: winner1,
            player2_id: winner2,
            status: 'pending'
          })
          .eq('id', match.id);

        console.log(`     ✅ ${match.sabo_match_id}: Advanced ${winner2 ? '2' : '1'} winners`);
      }
    }
  }
}

async function fixWinnersToLosersB(groupId) {
  console.log(`   🏆→💀 Winners R2 losers to Losers B...`);
  
  // Already handled by previous fixes, but ensure completion
  const { data: winnersR2 } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
    .eq('round_number', 2)
    .eq('status', 'completed');

  if (winnersR2.length > 0) {
    console.log(`     ✅ Already fixed - ${winnersR2.length} Winners R2 completed`);
  }
}

async function completeWinners(groupId) {
  console.log(`   🏆 Complete Winners bracket...`);
  
  // Complete R2 if needed
  const { data: winnersR2Pending } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
    .eq('round_number', 2)
    .eq('status', 'pending')
    .not('player1_id', 'is', null)
    .not('player2_id', 'is', null);

  for (const match of winnersR2Pending) {
    await supabase
      .from('sabo32_matches')
      .update({
        winner_id: match.player1_id,
        score_player1: 2,
        score_player2: 0,
        status: 'completed'
      })
      .eq('id', match.id);
    
    console.log(`     ✅ ${match.sabo_match_id}: Completed`);
  }

  // Advance to R3
  await completeLosersRound(groupId, 'winners', 2, 3);
  
  // Complete R3
  const { data: winnersR3Pending } = await supabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
    .eq('round_number', 3)
    .eq('status', 'pending')
    .not('player1_id', 'is', null)
    .not('player2_id', 'is', null);

  for (const match of winnersR3Pending) {
    await supabase
      .from('sabo32_matches')
      .update({
        winner_id: match.player1_id,
        score_player1: 2,
        score_player2: 1,
        status: 'completed'
      })
      .eq('id', match.id);
    
    console.log(`     ✅ ${match.sabo_match_id}: Completed`);
  }
}

async function setupGroupFinals(groupId) {
  console.log(`   🏆 Setup Group Finals...`);
  
  // Run auto advancement for finals
  await runAutoAdvancement(groupId);
}

async function runAutoAdvancement(groupId) {
  // Get all sources
  const { data: winnersR3 } = await supabase
    .from('sabo32_matches')
    .select('winner_id')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
    .eq('round_number', 3)
    .eq('status', 'completed')
    .order('match_number');

  const { data: losersA } = await supabase
    .from('sabo32_matches')
    .select('winner_id')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_a`)
    .eq('round_number', 103)
    .eq('status', 'completed');

  const { data: losersB } = await supabase
    .from('sabo32_matches')
    .select('winner_id')
    .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
    .eq('group_id', groupId)
    .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
    .eq('round_number', 202)
    .eq('status', 'completed');

  const sources = [
    ...(winnersR3?.map(m => m.winner_id) || []),
    ...(losersA?.map(m => m.winner_id) || []),
    ...(losersB?.map(m => m.winner_id) || [])
  ];

  console.log(`     Found ${sources.length}/4 players for finals`);

  if (sources.length >= 4) {
    // Setup 2 final matches
    const { data: finalMatches } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_final`)
      .order('match_number');

    if (finalMatches.length >= 2) {
      // Update matches
      await supabase
        .from('sabo32_matches')
        .update({
          player1_id: sources[0], // Winner1
          player2_id: sources[2], // LoserA
          status: 'pending'
        })
        .eq('id', finalMatches[0].id);

      await supabase
        .from('sabo32_matches')
        .update({
          player1_id: sources[1], // Winner2
          player2_id: sources[3], // LoserB
          status: 'pending'
        })
        .eq('id', finalMatches[1].id);

      console.log(`     ✅ Group Finals populated`);
    }
  }
}

async function verifyTournament() {
  for (const groupId of ['A', 'B']) {
    console.log(`\n📊 GROUP ${groupId} FINAL STATE:`);
    
    const brackets = [
      'winners', 'losers_a', 'losers_b', 'final'
    ];

    for (const bracket of brackets) {
      const { data: matches } = await supabase
        .from('sabo32_matches')
        .select('sabo_match_id, status, player1_id, player2_id, winner_id')
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('group_id', groupId)
        .eq('bracket_type', `group_${groupId.toLowerCase()}_${bracket}`)
        .order('round_number')
        .order('match_number');

      const completed = matches?.filter(m => m.status === 'completed').length || 0;
      const pending = matches?.filter(m => m.status === 'pending' && m.player1_id && m.player2_id).length || 0;
      const empty = matches?.filter(m => !m.player1_id || !m.player2_id).length || 0;

      console.log(`   ${bracket.toUpperCase()}: ${completed}C + ${pending}P + ${empty}E = ${matches?.length || 0} total`);
    }
  }
}

fixEverything();
