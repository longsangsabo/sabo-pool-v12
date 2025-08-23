require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function setupGroupFinal() {
  console.log('🏆 Setup Group A Final - 2 matches for 4 players\n');

  try {
    // 1. Check current Group Final
    const { data: currentFinal, error: cfError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_final')
      .order('match_number');

    if (cfError) {
      console.log('❌ Error:', cfError);
      return;
    }

    console.log(`📋 Current Group Final matches: ${currentFinal.length}`);

    // 2. Get the 4 players
    const players = {
      winner1: '558787dc', // A-W3M1 winner
      winner2: 'c6eaa405', // A-W3M2 winner  
      loserA: '18f6e853',  // A-LA103M1 winner
      loserB: '3b4b5cf4'   // A-LB202M1 winner (Đặng Hùng Hải)
    };

    console.log(`📋 4 Players ready:`);
    console.log(`   Winner1: ${players.winner1.slice(0,8)} (from Winners R3)`);
    console.log(`   Winner2: ${players.winner2.slice(0,8)} (from Winners R3)`);
    console.log(`   LoserA:  ${players.loserA.slice(0,8)} (from Losers A)`);
    console.log(`   LoserB:  ${players.loserB.slice(0,8)} (from Losers B)`);

    // 3. Create/Update 2 matches
    if (currentFinal.length === 1) {
      // Need to create second match
      console.log(`\n🔧 Creating second Group Final match...`);
      
      const { data: newMatch, error: createError } = await supabase
        .from('sabo32_matches')
        .insert({
          tournament_id: '7aba5a78-5c2b-4884-937d-99274220b019',
          group_id: 'A',
          bracket_type: 'group_a_final',
          round_number: 250,
          match_number: 2,
          sabo_match_id: 'A-FINAL2',
          status: 'pending'
        })
        .select();

      if (createError) {
        console.log(`❌ Error creating match: ${createError.message}`);
      } else {
        console.log(`✅ Created A-FINAL2`);
      }
    }

    // 4. Update both matches with players
    console.log(`\n🔧 Setting up matches:`);
    
    // Match 1: Winner1 vs LoserA
    const { error: update1Error } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: players.winner1,
        player2_id: players.loserA,
        status: 'pending'
      })
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_final')
      .eq('match_number', 1);

    if (update1Error) {
      console.log(`❌ Error updating A-FINAL: ${update1Error.message}`);
    } else {
      console.log(`✅ A-FINAL: ${players.winner1.slice(0,8)} vs ${players.loserA.slice(0,8)}`);
    }

    // Match 2: Winner2 vs LoserB
    const { error: update2Error } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: players.winner2,
        player2_id: players.loserB,
        status: 'pending'
      })
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_final')
      .eq('match_number', 2);

    if (update2Error) {
      console.log(`❌ Error updating A-FINAL2: ${update2Error.message}`);
    } else {
      console.log(`✅ A-FINAL2: ${players.winner2.slice(0,8)} vs ${players.loserB.slice(0,8)}`);
    }

    // 5. Verify final state
    console.log(`\n📋 FINAL GROUP A STRUCTURE:`);
    const { data: finalCheck } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .eq('group_id', 'A')
      .eq('bracket_type', 'group_a_final')
      .order('match_number');

    finalCheck?.forEach(match => {
      const p1 = match.player1_id ? `✅(${match.player1_id.slice(0,8)})` : '❌';
      const p2 = match.player2_id ? `✅(${match.player2_id.slice(0,8)})` : '❌';
      console.log(`   ${match.sabo_match_id}: P1:${p1} P2:${p2}`);
    });

    console.log(`\n✅ Group A Final ready!`);
    console.log(`   → 2 winners will advance to Cross Finals vs Group B`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupGroupFinal();
