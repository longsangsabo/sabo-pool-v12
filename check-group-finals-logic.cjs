const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zlrhgvdtcuwbzrwqlzjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscmhndmR0Y3V3Ynpyd3FsempiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTg1OTAyMSwiZXhwIjoyMDQ3NDM1MDIxfQ.BBZNaLhj_IfSC6xQrGgojk9Nub8Zb4ZJn0wYDt33aFU'
);

async function checkGroupFinalsLogic() {
  try {
    console.log('=== CHECKING GROUP FINALS LOGIC ===');
    
    // Check Group Finals matches
    const { data: groupFinals, error: groupError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .in('bracket_id', ['A-FINAL1', 'A-FINAL2', 'B-FINAL1', 'B-FINAL2'])
      .order('bracket_id');

    if (groupError) {
      console.error('Group Finals query error:', groupError);
      return;
    }

    console.log('\n=== GROUP FINALS MATCHES ===');
    if (groupFinals && groupFinals.length > 0) {
      groupFinals.forEach(match => {
        console.log(`${match.bracket_id}:`);
        console.log(`  Player 1: ${match.player1_id}`);
        console.log(`  Player 2: ${match.player2_id}`);
        console.log(`  Winner: ${match.winner_id}`);
        console.log(`  Status: ${match.status}`);
        console.log('');
      });
    } else {
      console.log('No Group Finals matches found');
    }

    // Check feeder matches that should provide players to Group Finals
    console.log('=== FEEDER MATCHES ===');
    
    // Winners bracket finals (W3M1) - winners go to Group Finals
    const { data: winnersBracket } = await supabase
      .from('sabo32_matches')
      .select('*')
      .in('bracket_id', ['A-W3M1', 'B-W3M1'])
      .order('bracket_id');

    console.log('\nWinners Bracket Finals (should provide 2 players to Group Finals):');
    winnersBracket?.forEach(match => {
      console.log(`${match.bracket_id}: Winner = ${match.winner_id} (Status: ${match.status})`);
    });

    // Losers bracket finals - winners go to Group Finals
    const { data: losersBracket } = await supabase
      .from('sabo32_matches')
      .select('*')
      .in('bracket_id', ['A-LA103M1', 'B-LB202M1'])
      .order('bracket_id');

    console.log('\nLosers Bracket Finals (should provide 2 players to Group Finals):');
    losersBracket?.forEach(match => {
      console.log(`${match.bracket_id}: Winner = ${match.winner_id} (Status: ${match.status})`);
    });

    console.log('\n=== ANALYSIS ===');
    console.log('Expected Group Finals logic:');
    console.log('1. A-FINAL1: Winner of A-W3M1 vs Winner of A-LA103M1');
    console.log('2. B-FINAL1: Winner of B-W3M1 vs Winner of B-LB202M1');
    console.log('3. A-FINAL2: Loser of A-FINAL1 (if needed for reset)');
    console.log('4. B-FINAL2: Loser of B-FINAL1 (if needed for reset)');
    console.log('');
    console.log('Total Group Finals players: 4');
    console.log('- 2 from Winners bracket (A-W3M1, B-W3M1)');
    console.log('- 2 from Losers bracket (A-LA103M1, B-LB202M1)');

    // Check if we have all the required winners
    const aWinnersBracket = winnersBracket?.find(m => m.bracket_id === 'A-W3M1');
    const bWinnersBracket = winnersBracket?.find(m => m.bracket_id === 'B-W3M1');
    const aLosersBracket = losersBracket?.find(m => m.bracket_id === 'A-LA103M1');
    const bLosersBracket = losersBracket?.find(m => m.bracket_id === 'B-LB202M1');

    console.log('\n=== REQUIRED PLAYERS CHECK ===');
    console.log(`A Winners Champion: ${aWinnersBracket?.winner_id || 'MISSING'}`);
    console.log(`B Winners Champion: ${bWinnersBracket?.winner_id || 'MISSING'}`);
    console.log(`A Losers Champion: ${aLosersBracket?.winner_id || 'MISSING'}`);
    console.log(`B Losers Champion: ${bLosersBracket?.winner_id || 'MISSING'}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkGroupFinalsLogic();
