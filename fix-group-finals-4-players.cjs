const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zlrhgvdtcuwbzrwqlzjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscmhndmR0Y3V3Ynpyd3FsempiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTg1OTAyMSwiZXhwIjoyMDQ3NDM1MDIxfQ.BBZNaLhj_IfSC6xQrGgojk9Nub8Zb4ZJn0wYDt33aFU'
);

async function fixGroupFinalsLogic() {
  try {
    console.log('=== ANALYZING GROUP FINALS LOGIC ===');
    
    // Check current Group Finals state
    const { data: groupFinals } = await supabase
      .from('sabo32_matches')
      .select('bracket_id, player1_id, player2_id, winner_id, status')
      .in('bracket_id', ['A-FINAL1', 'A-FINAL2', 'B-FINAL1', 'B-FINAL2'])
      .order('bracket_id');

    console.log('\nCurrent Group Finals:');
    groupFinals?.forEach(match => {
      console.log(`${match.bracket_id}: P1=${match.player1_id}, P2=${match.player2_id}, Winner=${match.winner_id}, Status=${match.status}`);
    });

    // Get the required feeder matches
    const { data: feederMatches } = await supabase
      .from('sabo32_matches')
      .select('bracket_id, winner_id, status')
      .in('bracket_id', ['A-W3M1', 'B-W3M1', 'A-LA103M1', 'B-LB202M1'])
      .eq('status', 'completed')
      .order('bracket_id');

    console.log('\nFeeder matches (completed):');
    feederMatches?.forEach(match => {
      console.log(`${match.bracket_id}: Winner=${match.winner_id}`);
    });

    // Check if we have all 4 required winners
    const aWinners = feederMatches?.find(m => m.bracket_id === 'A-W3M1')?.winner_id;
    const bWinners = feederMatches?.find(m => m.bracket_id === 'B-W3M1')?.winner_id;
    const aLosers = feederMatches?.find(m => m.bracket_id === 'A-LA103M1')?.winner_id;
    const bLosers = feederMatches?.find(m => m.bracket_id === 'B-LB202M1')?.winner_id;

    console.log('\n=== REQUIRED PLAYERS ===');
    console.log(`Group A Winners Champion: ${aWinners || 'MISSING'}`);
    console.log(`Group B Winners Champion: ${bWinners || 'MISSING'}`);
    console.log(`Group A Losers Champion: ${aLosers || 'MISSING'}`);
    console.log(`Group B Losers Champion: ${bLosers || 'MISSING'}`);

    const missingPlayers = [];
    if (!aWinners) missingPlayers.push('A-W3M1 winner');
    if (!bWinners) missingPlayers.push('B-W3M1 winner');
    if (!aLosers) missingPlayers.push('A-LA103M1 winner');
    if (!bLosers) missingPlayers.push('B-LB202M1 winner');

    if (missingPlayers.length > 0) {
      console.log(`\n❌ MISSING PLAYERS: ${missingPlayers.join(', ')}`);
      console.log('Cannot set up Group Finals until all feeder matches are completed.');
      return;
    }

    console.log('\n✅ All 4 required players available!');
    console.log('\n=== CORRECT GROUP FINALS SETUP ===');
    console.log('A-FINAL1: Winners Champion vs Losers Champion (Group A)');
    console.log('B-FINAL1: Winners Champion vs Losers Champion (Group B)');
    console.log('A-FINAL2: For potential bracket reset (Group A)');
    console.log('B-FINAL2: For potential bracket reset (Group B)');

    // Fix Group Finals setup
    console.log('\n=== FIXING GROUP FINALS ===');

    // Update A-FINAL1: A Winners Champion vs A Losers Champion
    const { error: errorA1 } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: aWinners,
        player2_id: aLosers,
        winner_id: null,
        status: 'pending'
      })
      .eq('bracket_id', 'A-FINAL1');

    if (errorA1) {
      console.error('Error updating A-FINAL1:', errorA1);
    } else {
      console.log(`✅ A-FINAL1: ${aWinners} vs ${aLosers}`);
    }

    // Update B-FINAL1: B Winners Champion vs B Losers Champion
    const { error: errorB1 } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: bWinners,
        player2_id: bLosers,
        winner_id: null,
        status: 'pending'
      })
      .eq('bracket_id', 'B-FINAL1');

    if (errorB1) {
      console.error('Error updating B-FINAL1:', errorB1);
    } else {
      console.log(`✅ B-FINAL1: ${bWinners} vs ${bLosers}`);
    }

    // Clear A-FINAL2 and B-FINAL2 (they'll be populated when needed for bracket reset)
    const { error: errorA2 } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending'
      })
      .eq('bracket_id', 'A-FINAL2');

    const { error: errorB2 } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending'
      })
      .eq('bracket_id', 'B-FINAL2');

    if (!errorA2 && !errorB2) {
      console.log('✅ A-FINAL2 and B-FINAL2 cleared (ready for bracket reset if needed)');
    }

    console.log('\n=== GROUP FINALS SUMMARY ===');
    console.log('4 players in Group Finals:');
    console.log(`1. ${aWinners} (Group A Winners Champion)`);
    console.log(`2. ${aLosers} (Group A Losers Champion)`);
    console.log(`3. ${bWinners} (Group B Winners Champion)`);
    console.log(`4. ${bLosers} (Group B Losers Champion)`);
    console.log('\nGroup Finals structure:');
    console.log('- A-FINAL1: Group A final (2 players)');
    console.log('- B-FINAL1: Group B final (2 players)');
    console.log('- A-FINAL2: Group A bracket reset (if needed)');
    console.log('- B-FINAL2: Group B bracket reset (if needed)');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixGroupFinalsLogic();
