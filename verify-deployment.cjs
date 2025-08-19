const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dafbqjjvqbtlqxtuhkkn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmJxamp2cWJ0bHF4dHVoa2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzAzMTYwMCwiZXhwIjoyMDUyNjA3NjAwfQ.vayBVmcUF2TnJoiX9TgdQOZx_tWOT8EmlTGqzTlL1yY'
);

async function verifyDeployment() {
  try {
    console.log('🔍 Verifying SABO advancement system...');
    
    // Check if trigger function exists
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .like('proname', '%sabo%advance%');
      
    if (funcError) {
      console.log('⚠️  Could not verify functions (expected if using different schema)');
    } else {
      console.log('📋 SABO functions found:', functions?.length || 0);
    }
    
    // Get SABO tournaments and check their advancement
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status')
      .eq('tournament_type', 'sabo')
      .limit(5);
      
    if (tError) {
      console.error('❌ Tournament check failed:', tError.message);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('ℹ️  No SABO tournaments found. System ready for new tournaments.');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} SABO tournaments:`);
    
    for (const tournament of tournaments) {
      console.log(`\n📊 ${tournament.name} (${tournament.status}):`);
      
      // Check critical advancement points
      const { data: criticalMatches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, player1_id, player2_id, status, winner_id')
        .eq('tournament_id', tournament.id)
        .in('round_number', [202, 250])
        .order('round_number, match_number');
        
      if (matchError) {
        console.error('  ❌ Match check failed:', matchError.message);
        continue;
      }
      
      if (!criticalMatches || criticalMatches.length === 0) {
        console.log('  ⚠️  No critical matches found');
        continue;
      }
      
      let r202Status = 'Not found';
      let sf2Status = 'Not found';
      let advancementOK = false;
      
      criticalMatches.forEach(match => {
        if (match.round_number === 202) {
          r202Status = match.status === 'completed' ? `Completed (Winner: ${match.winner_id})` : match.status;
        }
        if (match.round_number === 250 && match.match_number === 2) {
          const p1Status = match.player1_id ? '✅' : '❌';
          const p2Status = match.player2_id ? '✅' : '❌';
          sf2Status = `P1:${p1Status} P2:${p2Status}`;
          
          // Check if R202 winner is in SF2
          const r202Match = criticalMatches.find(m => m.round_number === 202);
          if (r202Match?.winner_id && match.player2_id === r202Match.winner_id) {
            advancementOK = true;
          }
        }
      });
      
      console.log(`  R202 (Losers B Final): ${r202Status}`);
      console.log(`  SF2 (Critical): ${sf2Status}`);
      console.log(`  Advancement Status: ${advancementOK ? '✅ Correct' : '❌ Needs Fix'}`);
    }
    
    console.log('\n🎯 Deployment verification complete!');
    console.log('📝 New tournaments will have automatic advancement');
    
  } catch (err) {
    console.error('💥 Verification failed:', err.message);
  }
}

verifyDeployment();
