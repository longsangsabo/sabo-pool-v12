const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function fixAllSemifinalsAdvancement() {
  try {
    console.log('🔧 Fixing all tournaments Semifinals advancement...');
    
    // Get all double elimination tournaments
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('tournament_type', 'double_elimination');
      
    if (!tournaments || tournaments.length === 0) {
      console.log('ℹ️  No double elimination tournaments found');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} tournaments to check`);
    
    for (const tournament of tournaments) {
      console.log(`\n🔍 Checking ${tournament.name}...`);
      
      // Get key matches
      const { data: matches } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, winner_id, status, player1_id, player2_id')
        .eq('tournament_id', tournament.id)
        .in('round_number', [3, 103, 202, 250]);
        
      if (!matches) continue;
      
      // Organize matches
      const r3m1 = matches.find(m => m.round_number === 3 && m.match_number === 1);
      const r3m2 = matches.find(m => m.round_number === 3 && m.match_number === 2);
      const losersA = matches.find(m => m.round_number === 103 && m.match_number === 1);
      const losersB = matches.find(m => m.round_number === 202 && m.match_number === 1);
      const sf1 = matches.find(m => m.round_number === 250 && m.match_number === 1);
      const sf2 = matches.find(m => m.round_number === 250 && m.match_number === 2);
      
      // Check what needs to be fixed
      const fixes = [];
      
      // SF1 fixes
      if (r3m1?.winner_id && r3m1.status === 'completed' && sf1?.player1_id !== r3m1.winner_id) {
        fixes.push({
          type: 'SF1 Player1',
          round: 250,
          match: 1,
          field: 'player1_id',
          value: r3m1.winner_id,
          description: 'R3M1 Winner → SF1 Player1'
        });
      }
      
      if (losersA?.winner_id && losersA.status === 'completed' && sf1?.player2_id !== losersA.winner_id) {
        fixes.push({
          type: 'SF1 Player2',
          round: 250,
          match: 1,
          field: 'player2_id',
          value: losersA.winner_id,
          description: 'Losers A Champion → SF1 Player2'
        });
      }
      
      // SF2 fixes
      if (r3m2?.winner_id && r3m2.status === 'completed' && sf2?.player1_id !== r3m2.winner_id) {
        fixes.push({
          type: 'SF2 Player1',
          round: 250,
          match: 2,
          field: 'player1_id',
          value: r3m2.winner_id,
          description: 'R3M2 Winner → SF2 Player1'
        });
      }
      
      if (losersB?.winner_id && losersB.status === 'completed' && sf2?.player2_id !== losersB.winner_id) {
        fixes.push({
          type: 'SF2 Player2',
          round: 250,
          match: 2,
          field: 'player2_id',
          value: losersB.winner_id,
          description: 'Losers B Champion → SF2 Player2'
        });
      }
      
      if (fixes.length === 0) {
        console.log('  ✅ Already correct');
        continue;
      }
      
      console.log(`  🔧 Applying ${fixes.length} fixes:`);
      fixes.forEach(fix => console.log(`    - ${fix.description}`));
      
      // Group fixes by match and apply
      const sf1Fixes = fixes.filter(f => f.match === 1);
      const sf2Fixes = fixes.filter(f => f.match === 2);
      
      // Apply SF1 fixes
      if (sf1Fixes.length > 0) {
        const updateData = {};
        sf1Fixes.forEach(fix => updateData[fix.field] = fix.value);
        updateData.status = sf1?.player1_id && sf1?.player2_id ? 'pending' : 'waiting_for_players';
        
        const { error: sf1Error } = await supabase
          .from('tournament_matches')
          .update(updateData)
          .eq('tournament_id', tournament.id)
          .eq('round_number', 250)
          .eq('match_number', 1);
          
        if (sf1Error) {
          console.log(`    ❌ SF1 fix failed: ${sf1Error.message}`);
        } else {
          console.log('    ✅ SF1 fixed');
        }
      }
      
      // Apply SF2 fixes
      if (sf2Fixes.length > 0) {
        const updateData = {};
        sf2Fixes.forEach(fix => updateData[fix.field] = fix.value);
        updateData.status = sf2?.player1_id && sf2?.player2_id ? 'pending' : 'waiting_for_players';
        
        const { error: sf2Error } = await supabase
          .from('tournament_matches')
          .update(updateData)
          .eq('tournament_id', tournament.id)
          .eq('round_number', 250)
          .eq('match_number', 2);
          
        if (sf2Error) {
          console.log(`    ❌ SF2 fix failed: ${sf2Error.message}`);
        } else {
          console.log('    ✅ SF2 fixed');
        }
      }
    }
    
    console.log('\n🎉 All tournaments fixed!');
    console.log('🔄 Refresh browser to see updated Semifinals');
    
  } catch (err) {
    console.error('💥 Fix failed:', err.message);
  }
}

fixAllSemifinalsAdvancement();
