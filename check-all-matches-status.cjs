const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zlrhgvdtcuwbzrwqlzjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscmhndmR0Y3V3Ynpyd3FsempiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTg1OTAyMSwiZXhwIjoyMDQ3NDM1MDIxfQ.BBZNaLhj_IfSC6xQrGgojk9Nub8Zb4ZJn0wYDt33aFU'
);

async function checkAllMatches() {
  try {
    console.log('=== CHECKING ALL MATCHES STATUS ===');
    
    // Get all matches
    const { data: allMatches } = await supabase
      .from('sabo32_matches')
      .select('bracket_id, player1_id, player2_id, winner_id, status')
      .order('bracket_id');

    if (!allMatches) {
      console.log('No matches found');
      return;
    }

    // Group by status
    const completed = allMatches.filter(m => m.status === 'completed');
    const pending = allMatches.filter(m => m.status === 'pending');
    const inProgress = allMatches.filter(m => m.status === 'in_progress');

    console.log(`\nTOTAL MATCHES: ${allMatches.length}`);
    console.log(`✅ Completed: ${completed.length}`);
    console.log(`⏳ Pending: ${pending.length}`);
    console.log(`🟡 In Progress: ${inProgress.length}`);

    // Check specific brackets we need for Group Finals
    console.log('\n=== GROUP FINALS FEEDER MATCHES ===');
    const feederBrackets = ['A-W3M1', 'B-W3M1', 'A-LA103M1', 'B-LB202M1'];
    
    feederBrackets.forEach(bracketId => {
      const match = allMatches.find(m => m.bracket_id === bracketId);
      if (match) {
        console.log(`${bracketId}: ${match.status} (Winner: ${match.winner_id || 'None'})`);
      } else {
        console.log(`${bracketId}: NOT FOUND`);
      }
    });

    // Check Group Finals
    console.log('\n=== GROUP FINALS MATCHES ===');
    const groupFinals = ['A-FINAL1', 'A-FINAL2', 'B-FINAL1', 'B-FINAL2'];
    
    groupFinals.forEach(bracketId => {
      const match = allMatches.find(m => m.bracket_id === bracketId);
      if (match) {
        console.log(`${bracketId}: P1=${match.player1_id}, P2=${match.player2_id}, Status=${match.status}`);
      } else {
        console.log(`${bracketId}: NOT FOUND`);
      }
    });

    // Show recently completed matches
    console.log('\n=== RECENTLY COMPLETED MATCHES ===');
    completed.slice(-10).forEach(match => {
      console.log(`${match.bracket_id}: Winner = ${match.winner_id}`);
    });

    // Check if we can simulate completion for feeder matches
    console.log('\n=== SIMULATION CHECK ===');
    const pendingFeeders = feederBrackets.filter(bracketId => {
      const match = allMatches.find(m => m.bracket_id === bracketId);
      return match && match.status !== 'completed';
    });

    if (pendingFeeders.length > 0) {
      console.log(`❌ Cannot setup Group Finals yet. Missing: ${pendingFeeders.join(', ')}`);
      console.log('\nNeed to complete these matches first to get 4 players for Group Finals:');
      pendingFeeders.forEach(bracketId => {
        const match = allMatches.find(m => m.bracket_id === bracketId);
        console.log(`  ${bracketId}: ${match.player1_id} vs ${match.player2_id}`);
      });
    } else {
      console.log('✅ All feeder matches completed! Can setup Group Finals.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllMatches();
