const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dafbqjjvqbtlqxtuhkkn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmJxamp2cWJ0bHF4dHVoa2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzAzMTYwMCwiZXhwIjoyMDUyNjA3NjAwfQ.vayBVmcUF2TnJoiX9TgdQOZx_tWOT8EmlTGqzTlL1yY'
);

async function testCurrentState() {
  try {
    console.log('🧪 Testing current tournament state...');
    
    // Get SABO tournaments
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type')
      .eq('tournament_type', 'sabo')
      .limit(3);
      
    if (tError) {
      console.error('❌ Error:', tError);
      return;
    }
    
    console.log('🏆 Found SABO tournaments:');
    tournaments.forEach(t => console.log(`  - ${t.name} (ID: ${t.id})`));
    
    // Check key matches for each tournament
    for (const tournament of tournaments) {
      console.log(`\n🔍 Checking ${tournament.name}:`);
      
      const { data: matches, error: mError } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, player1_id, player2_id, status, bracket_type')
        .eq('tournament_id', tournament.id)
        .in('round_number', [202, 250])  // R202 and Semifinals
        .order('round_number, match_number');
        
      if (mError) {
        console.error('❌ Match error:', mError);
        continue;
      }
      
      matches.forEach(match => {
        const status = match.player1_id && match.player2_id ? '✅ Ready' : '❌ Missing Players';
        console.log(`  R${match.round_number}M${match.match_number} (${match.bracket_type}): ${status}`);
        if (!match.player1_id || !match.player2_id) {
          console.log(`    Player1: ${match.player1_id || 'TBD'}`);
          console.log(`    Player2: ${match.player2_id || 'TBD'}`);
        }
      });
    }
    
    // Get one tournament for deeper analysis
    if (tournaments.length > 0) {
      const testTournament = tournaments[0];
      console.log(`\n🎯 Deep analysis for ${testTournament.name}:`);
      
      // Check if R202 has completed
      const { data: r202, error: r202Error } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', testTournament.id)
        .eq('round_number', 202)
        .eq('match_number', 1)
        .single();
        
      if (r202Error) {
        console.log('  ❌ R202 not found or error:', r202Error.message);
      } else {
        console.log(`  R202 status: ${r202.status}`);
        console.log(`  R202 winner: ${r202.winner_id || 'None'}`);
        
        // Check if SF2 has R202 winner
        const { data: sf2, error: sf2Error } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', testTournament.id)
          .eq('round_number', 250)
          .eq('match_number', 2)
          .single();
          
        if (sf2Error) {
          console.log('  ❌ SF2 not found:', sf2Error.message);
        } else {
          console.log(`  SF2 Player1: ${sf2.player1_id || 'TBD'}`);
          console.log(`  SF2 Player2: ${sf2.player2_id || 'TBD'}`);
          
          if (r202.winner_id && sf2.player2_id === r202.winner_id) {
            console.log('  ✅ R202 winner correctly advanced to SF2!');
          } else if (r202.winner_id) {
            console.log('  ❌ R202 winner NOT in SF2 - advancement failed!');
          }
        }
      }
    }
    
  } catch (err) {
    console.error('💥 Exception:', err.message);
  }
}

testCurrentState();
