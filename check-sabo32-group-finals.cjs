const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSabo32GroupFinals() {
  try {
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
    m.sabo_match_id?.includes('A-FINAL') ||
    (m.group_id === 'A' && m.round_number >= 4)
  );
  
  const groupBFinals = allMatches.filter(m => 
    m.bracket_type === 'GROUP_B_FINAL' || 
    m.sabo_match_id?.includes('B-FINAL') ||
    (m.group_id === 'B' && m.round_number >= 4)
  );
  
  console.log('🏆 Group A Finals:', groupAFinals);
  console.log('🏆 Group B Finals:', groupBFinals);
  
  // Check advancement logic for each group
  await checkGroupAdvancement('A', groupA);
  await checkGroupAdvancement('B', groupB);    // 2. Check Group Final matches
    const { data: groupFinals, error: finalsError } = await supabase
      .from('matches')
      .select(`
        id, round, bracket_type, bracket_position, status,
        player1_id, player2_id, winner_id,
        player1:profiles!matches_player1_id_fkey(display_name),
        player2:profiles!matches_player2_id_fkey(display_name),
        winner:profiles!matches_winner_id_fkey(display_name)
      `)
      .eq('tournament_id', tournament.id)
      .eq('round', 'GROUP_A_FINAL')
      .or('round.eq.GROUP_B_FINAL');

    if (finalsError) {
      console.error('Error fetching group finals:', finalsError);
      return;
    }

    console.log('🏆 GROUP FINALS STATUS:');
    console.log('='.repeat(50));

    if (!groupFinals || groupFinals.length === 0) {
      console.log('❌ No Group Final matches found!');
    } else {
      groupFinals.forEach(match => {
        console.log(`\n${match.round}:`);
        console.log(`  Match ID: ${match.id}`);
        console.log(`  Status: ${match.status}`);
        console.log(`  Player 1: ${match.player1?.display_name || 'TBD'} (ID: ${match.player1_id || 'N/A'})`);
        console.log(`  Player 2: ${match.player2?.display_name || 'TBD'} (ID: ${match.player2_id || 'N/A'})`);
        console.log(`  Winner: ${match.winner?.display_name || 'TBD'} (ID: ${match.winner_id || 'N/A'})`);
        console.log(`  Bracket: ${match.bracket_type}, Position: ${match.bracket_position}`);
      });
    }

    // 3. Check matches that should advance to Group Finals
    console.log('\n🔍 CHECKING ADVANCEMENT SOURCES:');
    console.log('='.repeat(50));

    // Check Winner Bracket Semi-Finals (should advance top 2 to Group Final)
    const { data: winnerSemis, error: semiError } = await supabase
      .from('matches')
      .select(`
        id, round, bracket_type, status, winner_id,
        winner:profiles!matches_winner_id_fkey(display_name)
      `)
      .eq('tournament_id', tournament.id)
      .in('round', ['WINNER_SEMI_A', 'WINNER_SEMI_B'])
      .eq('status', 'completed');

    if (semiError) {
      console.error('Error fetching winner semis:', semiError);
    } else {
      console.log('\n📊 Winner Bracket Semi-Finals:');
      winnerSemis.forEach(match => {
        console.log(`  ${match.round}: Winner = ${match.winner?.display_name || 'TBD'} (ID: ${match.winner_id})`);
      });
    }

    // Check Losers Bracket Finals (should advance 1 each to Group Final)
    const { data: losersFinals, error: losersError } = await supabase
      .from('matches')
      .select(`
        id, round, bracket_type, status, winner_id,
        winner:profiles!matches_winner_id_fkey(display_name)
      `)
      .eq('tournament_id', tournament.id)
      .in('round', ['LOSERS_A_FINAL', 'LOSERS_B_FINAL'])
      .eq('status', 'completed');

    if (losersError) {
      console.error('Error fetching losers finals:', losersError);
    } else {
      console.log('\n📊 Losers Bracket Finals:');
      losersFinals.forEach(match => {
        console.log(`  ${match.round}: Winner = ${match.winner?.display_name || 'TBD'} (ID: ${match.winner_id})`);
      });
    }

    // 4. Check if we should automatically advance players
    const winnerSemiWinners = winnerSemis?.filter(m => m.winner_id).map(m => m.winner_id) || [];
    const losersAWinner = losersFinals?.find(m => m.round === 'LOSERS_A_FINAL')?.winner_id;
    const losersBWinner = losersFinals?.find(m => m.round === 'LOSERS_B_FINAL')?.winner_id;

    console.log('\n🎯 ADVANCEMENT ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Winner Semi Winners: ${winnerSemiWinners.length}/2`);
    console.log(`Losers A Final Winner: ${losersAWinner ? '✅' : '❌'}`);
    console.log(`Losers B Final Winner: ${losersBWinner ? '✅' : '❌'}`);

    // Check Group A Final participants
    const groupAPlayers = [
      winnerSemiWinners[0], // Winner Semi A winner
      losersAWinner         // Losers A Final winner
    ].filter(Boolean);

    // Check Group B Final participants  
    const groupBPlayers = [
      winnerSemiWinners[1], // Winner Semi B winner
      losersBWinner         // Losers B Final winner
    ].filter(Boolean);

    console.log(`\nGroup A Final should have: ${groupAPlayers.join(', ')}`);
    console.log(`Group B Final should have: ${groupBPlayers.join(', ')}`);

    // 5. Fix Group Finals if needed
    if (groupAPlayers.length === 2) {
      console.log('\n🔧 Updating Group A Final...');
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          player1_id: groupAPlayers[0],
          player2_id: groupAPlayers[1],
          status: 'pending'
        })
        .eq('tournament_id', tournament.id)
        .eq('round', 'GROUP_A_FINAL');

      if (updateError) {
        console.error('Error updating Group A Final:', updateError);
      } else {
        console.log('✅ Group A Final updated successfully');
      }
    }

    if (groupBPlayers.length === 2) {
      console.log('\n🔧 Updating Group B Final...');
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          player1_id: groupBPlayers[0],
          player2_id: groupBPlayers[1],
          status: 'pending'
        })
        .eq('tournament_id', tournament.id)
        .eq('round', 'GROUP_B_FINAL');

      if (updateError) {
        console.error('Error updating Group B Final:', updateError);
      } else {
        console.log('✅ Group B Final updated successfully');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSabo32GroupFinals();
