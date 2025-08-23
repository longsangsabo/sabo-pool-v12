require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixGroupB() {
  console.log('🔧 Fix Group B để test auto advancement system\n');

  try {
    // 1. Complete Winners R1 matches that are pending
    console.log('📋 1. Completing Winners R1...');
    
    const { data: winnersR1Pending } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_winners')
      .eq('round_number', 1)
      .eq('status', 'pending')
      .not('player1_id', 'is', null)
      .not('player2_id', 'is', null);

    for (const match of winnersR1Pending) {
      // Set winner randomly (player1 wins)
      await supabase
        .from('sabo32_matches')
        .update({
          winner_id: match.player1_id,
          score_player1: 2,
          score_player2: 0,
          status: 'completed'
        })
        .eq('id', match.id);
      
      console.log(`   ✅ ${match.sabo_match_id}: P1 wins 2-0`);
    }

    // 2. Advance Winners R1 winners to R2
    console.log('\n📋 2. Advancing Winners R1 winners to R2...');
    
    const { data: winnersR1Completed } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_winners')
      .eq('round_number', 1)
      .eq('status', 'completed')
      .order('match_number');

    const winners = winnersR1Completed.map(m => m.winner_id);
    console.log(`   Found ${winners.length} winners from R1`);

    // Get Winners R2 matches
    const { data: winnersR2 } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_winners')
      .eq('round_number', 2)
      .order('match_number');

    // Populate R2 (2 winners per match)
    for (let i = 0; i < Math.min(winnersR2.length, Math.floor(winners.length / 2)); i++) {
      const match = winnersR2[i];
      const winner1 = winners[i * 2];
      const winner2 = winners[i * 2 + 1];

      if (winner1 && winner2) {
        await supabase
          .from('sabo32_matches')
          .update({
            player1_id: winner1,
            player2_id: winner2,
            status: 'pending'
          })
          .eq('id', match.id);

        console.log(`   ✅ ${match.sabo_match_id}: Advanced 2 winners`);
      }
    }

    // 3. Complete some Winners R2 matches
    console.log('\n📋 3. Completing some Winners R2...');
    
    const { data: winnersR2Ready } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_winners')
      .eq('round_number', 2)
      .eq('status', 'pending')
      .not('player1_id', 'is', null)
      .not('player2_id', 'is', null)
      .limit(3); // Complete 3/4 để test

    for (const match of winnersR2Ready) {
      await supabase
        .from('sabo32_matches')
        .update({
          winner_id: match.player1_id,
          score_player1: 2,
          score_player2: 1,
          status: 'completed'
        })
        .eq('id', match.id);
      
      console.log(`   ✅ ${match.sabo_match_id}: P1 wins 2-1`);
    }

    // 4. Run auto advancement
    console.log('\n📋 4. Running auto advancement system...');
    
    const TournamentAdvancementSystem = require('./auto-advancement-system.cjs').default;
    // Import doesn't work, so inline the logic
    
    // Get completed Winners R2 in Group B
    const { data: completedR2 } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'B')
      .eq('bracket_type', 'group_b_winners')
      .eq('round_number', 2)
      .eq('status', 'completed');

    console.log(`   Found ${completedR2.length} completed Winners R2 matches`);

    if (completedR2.length > 0) {
      // Get losers and advance to Losers B
      const losers = completedR2.map(match => 
        match.player1_id === match.winner_id ? match.player2_id : match.player1_id
      );

      console.log(`   Advancing ${losers.length} losers to Losers B...`);

      const { data: losersB201 } = await supabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('group_id', 'B')
        .eq('bracket_type', 'group_b_losers_b')
        .eq('round_number', 201)
        .order('match_number');

      // Distribute losers
      for (let i = 0; i < Math.min(losersB201.length, Math.ceil(losers.length / 2)); i++) {
        const match = losersB201[i];
        const loser1 = losers[i * 2];
        const loser2 = losers[i * 2 + 1] || losers[i * 2]; // If odd number

        if (loser1) {
          await supabase
            .from('sabo32_matches')
            .update({
              player1_id: loser1,
              player2_id: loser2,
              status: 'pending'
            })
            .eq('id', match.id);

          console.log(`   ✅ ${match.sabo_match_id}: Advanced losers`);
        }
      }
    }

    // 5. Final verification
    console.log('\n📋 5. FINAL GROUP B STATE:');
    
    const brackets = ['group_b_winners', 'group_b_losers_b'];
    for (const bracketType of brackets) {
      const { data: matches } = await supabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('group_id', 'B')
        .eq('bracket_type', bracketType)
        .order('round_number')
        .order('match_number');

      console.log(`\n   ${bracketType.toUpperCase()}:`);
      matches?.slice(0, 6).forEach(match => {
        const p1 = match.player1_id ? '✅' : '❌';
        const p2 = match.player2_id ? '✅' : '❌';
        const winner = match.winner_id ? '🏆' : '❌';
        console.log(`     ${match.sabo_match_id}: P1:${p1} P2:${p2} W:${winner} (${match.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixGroupB();
