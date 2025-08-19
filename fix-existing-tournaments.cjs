const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dafbqjjvqbtlqxtuhkkn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmJxamp2cWJ0bHF4dHVoa2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzAzMTYwMCwiZXhwIjoyMDUyNjA3NjAwfQ.vayBVmcUF2TnJoiX9TgdQOZx_tWOT8EmlTGqzTlL1yY'
);

async function fixExistingTournaments() {
  try {
    console.log('🔨 Fixing existing SABO tournaments...');
    
    // Get all SABO tournaments
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('tournament_type', 'sabo');
      
    if (tError) {
      console.error('❌ Error:', tError.message);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('ℹ️  No SABO tournaments to fix');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} SABO tournaments to check`);
    
    for (const tournament of tournaments) {
      console.log(`\n🔧 Fixing ${tournament.name}...`);
      
      // Check R202 completion and SF2 status
      const { data: r202, error: r202Error } = await supabase
        .from('tournament_matches')
        .select('winner_id, status')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 202)
        .eq('match_number', 1)
        .single();
        
      if (r202Error || !r202) {
        console.log('  ⚠️  R202 not found, skipping');
        continue;
      }
      
      if (r202.status !== 'completed' || !r202.winner_id) {
        console.log('  ⚠️  R202 not completed, skipping');
        continue;
      }
      
      const { data: sf2, error: sf2Error } = await supabase
        .from('tournament_matches')
        .select('player2_id')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2)
        .single();
        
      if (sf2Error || !sf2) {
        console.log('  ❌ SF2 not found');
        continue;
      }
      
      if (sf2.player2_id === r202.winner_id) {
        console.log('  ✅ Already correct, no fix needed');
        continue;
      }
      
      // Apply fix
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({ 
          player2_id: r202.winner_id,
          status: sf2.player1_id ? 'pending' : 'waiting_for_players'
        })
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2);
        
      if (updateError) {
        console.log('  ❌ Fix failed:', updateError.message);
      } else {
        console.log('  ✅ Fixed! R202 winner advanced to SF2');
      }
    }
    
    console.log('\n🎉 Fix process complete!');
    
  } catch (err) {
    console.error('💥 Fix failed:', err.message);
  }
}

fixExistingTournaments();
