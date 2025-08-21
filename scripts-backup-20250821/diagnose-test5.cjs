const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function diagnoseTest5() {
  try {
    console.log('🔍 Diagnosing test5 tournament...');
    
    // Get test5 tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id, name')
      .ilike('name', '%test5%')
      .single();
      
    if (!tournament) {
      console.log('❌ test5 tournament not found');
      return;
    }
    
    console.log(`📊 Found tournament: ${tournament.name} (${tournament.id})`);
    
    // Check Semifinal 2 (Round 250, Match 2) - the one showing TBD in UI
    const { data: sf2Match } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .eq('match_number', 2)
      .single();
      
    if (!sf2Match) {
      console.log('❌ Semifinal 2 not found');
      return;
    }
    
    console.log('\n🎯 Semifinal 2 (Round 250 Match 2) Database Data:');
    console.log(`  Player1 ID: ${sf2Match.player1_id || 'NULL'}`);
    console.log(`  Player2 ID: ${sf2Match.player2_id || 'NULL'}`);
    console.log(`  Status: ${sf2Match.status}`);
    console.log(`  Winner: ${sf2Match.winner_id || 'NULL'}`);
    
    // Get player names if IDs exist
    if (sf2Match.player1_id || sf2Match.player2_id) {
      const playerIds = [sf2Match.player1_id, sf2Match.player2_id].filter(Boolean);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .in('id', playerIds);
        
      console.log('\n👥 Player Details:');
      if (sf2Match.player1_id) {
        const p1 = profiles?.find(p => p.id === sf2Match.player1_id);
        console.log(`  Player1: ${p1?.display_name || p1?.full_name || 'Name not found'} (${sf2Match.player1_id.substring(0,8)})`);
      } else {
        console.log('  Player1: NULL (should be R3M2 Winner)');
      }
      
      if (sf2Match.player2_id) {
        const p2 = profiles?.find(p => p.id === sf2Match.player2_id);
        console.log(`  Player2: ${p2?.display_name || p2?.full_name || 'Name not found'} (${sf2Match.player2_id.substring(0,8)})`);
      } else {
        console.log('  Player2: NULL (should be Losers B Champion)');
      }
    }
    
    // Check what should be in SF2
    console.log('\n🔍 Checking what should populate SF2:');
    
    // R3M2 Winner (should be SF2 Player1)
    const { data: r3m2 } = await supabase
      .from('tournament_matches')
      .select('winner_id, status')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 3)
      .eq('match_number', 2)
      .single();
      
    console.log(`  R3M2 status: ${r3m2?.status || 'Not found'}, Winner: ${r3m2?.winner_id?.substring(0,8) || 'None'}`);
    
    // R202 Winner (should be SF2 Player2)
    const { data: r202 } = await supabase
      .from('tournament_matches')
      .select('winner_id, status')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 202)
      .eq('match_number', 1)
      .single();
      
    console.log(`  R202 status: ${r202?.status || 'Not found'}, Winner: ${r202?.winner_id?.substring(0,8) || 'None'}`);
    
    // Diagnosis
    console.log('\n🎯 DIAGNOSIS:');
    if (!sf2Match.player1_id && !sf2Match.player2_id) {
      console.log('❌ PROBLEM: Both SF2 players are NULL - this explains the TBD display');
    } else if (!sf2Match.player1_id) {
      console.log('❌ PROBLEM: SF2 Player1 is NULL');
    } else if (!sf2Match.player2_id) {
      console.log('❌ PROBLEM: SF2 Player2 is NULL');
    } else {
      console.log('✅ Both SF2 players have IDs - UI display issue or profile lookup problem');
    }
    
    // Check if advancement should have happened
    const shouldAdvance = [];
    if (r3m2?.winner_id && r3m2.status === 'completed') {
      shouldAdvance.push(`R3M2 Winner (${r3m2.winner_id.substring(0,8)}) → SF2 Player1`);
    }
    if (r202?.winner_id && r202.status === 'completed') {
      shouldAdvance.push(`R202 Winner (${r202.winner_id.substring(0,8)}) → SF2 Player2`);
    }
    
    if (shouldAdvance.length > 0) {
      console.log('\n🔧 REQUIRED FIXES:');
      shouldAdvance.forEach(fix => console.log(`  - ${fix}`));
      
      console.log('\n💡 SOLUTION: Apply manual fix');
      console.log(`   SQL: SELECT fix_sabo_semifinals_now('${tournament.id}');`);
    }
    
    // Also check if there's a registration/profile issue
    if (sf2Match.player1_id && sf2Match.player2_id) {
      console.log('\n🔍 Checking if this is a profile display issue...');
      const { data: registrations } = await supabase
        .from('tournament_registrations')
        .select('user_id')
        .eq('tournament_id', tournament.id)
        .in('user_id', [sf2Match.player1_id, sf2Match.player2_id]);
        
      console.log(`  Players registered: ${registrations?.length || 0}/2`);
      if (registrations?.length !== 2) {
        console.log('⚠️  Some players may not be properly registered');
      }
    }
    
  } catch (err) {
    console.error('💥 Diagnosis failed:', err.message);
  }
}

diagnoseTest5();
