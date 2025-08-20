const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function fixSemifinalAdvancement() {
  try {
    console.log('🔧 FIXING SEMIFINAL ADVANCEMENT ISSUE');
    console.log('====================================');
    console.log('Problem: Semifinal 2 chưa được advance đúng 2 user từ winner bracket');
    console.log('');
    
    // Get SABO tournaments
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('tournament_type', 'sabo');
      
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No SABO tournaments found');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} SABO tournaments to check`);
    
    for (const tournament of tournaments) {
      console.log(`\n📊 Checking ${tournament.name}:`);
      console.log('============================');
      
      // Get Winners Bracket Finals (R3) - these should feed into Semifinals
      const { data: r3Matches } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 3)
        .order('match_number');
        
      // Get Losers Finals
      const { data: losersMatches } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .in('round_number', [103, 202, 203])
        .order('round_number, match_number');
        
      // Get current Semifinals
      const { data: semifinals } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .order('match_number');
        
      if (!r3Matches || !semifinals) {
        console.log('❌ Missing R3 or Semifinals matches');
        continue;
      }
      
      console.log('\\n🏅 Winners Bracket Finals (R3):');
      r3Matches.forEach(match => {
        console.log(`  R3 M${match.match_number}: Status=${match.status}, Winner=${match.winner_id?.substring(0,8) || 'None'}`);
      });
      
      console.log('\\n🏅 Losers Finals:');
      losersMatches?.forEach(match => {
        const type = match.round_number === 103 ? 'Losers A' : 
                     match.round_number === 202 ? 'Losers B (R202)' : 'Losers B (R203)';
        console.log(`  R${match.round_number}: Status=${match.status}, Winner=${match.winner_id?.substring(0,8) || 'None'} (${type})`);
      });
      
      console.log('\\n🎯 Current Semifinals:');
      semifinals.forEach(match => {
        console.log(`  SF${match.match_number}: P1=${match.player1_id?.substring(0,8) || 'TBD'}, P2=${match.player2_id?.substring(0,8) || 'TBD'}`);
      });
      
      // Apply CORRECT SABO advancement logic
      console.log('\\n🔧 Applying CORRECT SABO advancement...');
      
      const r3m1Winner = r3Matches.find(m => m.match_number === 1)?.winner_id;
      const r3m2Winner = r3Matches.find(m => m.match_number === 2)?.winner_id;
      const r103Winner = losersMatches?.find(m => m.round_number === 103)?.winner_id;
      const r202Winner = losersMatches?.find(m => m.round_number === 202)?.winner_id;
      const r203Winner = losersMatches?.find(m => m.round_number === 203)?.winner_id;
      
      // Determine Losers B Champion (R202 or R203)
      const losersBChampion = r202Winner || r203Winner;
      
      console.log('\\n📋 CORRECT SABO SEMIFINAL STRUCTURE:');
      console.log('====================================');
      console.log(`SF1: R3M1 Winner (${r3m1Winner?.substring(0,8) || 'TBD'}) vs Losers A Champion (${r103Winner?.substring(0,8) || 'TBD'})`);
      console.log(`SF2: R3M2 Winner (${r3m2Winner?.substring(0,8) || 'TBD'}) vs Losers B Champion (${losersBChampion?.substring(0,8) || 'TBD'})`);
      
      // Fix SF1
      if (r3m1Winner || r103Winner) {
        console.log('\\n🔧 Fixing Semifinal 1...');
        const { error: sf1Error } = await supabase
          .from('tournament_matches')
          .update({
            player1_id: r3m1Winner,
            player2_id: r103Winner,
            status: (r3m1Winner && r103Winner) ? 'pending' : 'waiting_for_players'
          })
          .eq('tournament_id', tournament.id)
          .eq('round_number', 250)
          .eq('match_number', 1);
          
        if (sf1Error) {
          console.log('❌ SF1 fix failed:', sf1Error.message);
        } else {
          console.log('✅ SF1 fixed successfully');
        }
      }
      
      // Fix SF2 - THIS IS THE KEY FIX FOR YOUR ISSUE
      if (r3m2Winner || losersBChampion) {
        console.log('\\n🔧 Fixing Semifinal 2 (THE MAIN ISSUE)...');
        const { error: sf2Error } = await supabase
          .from('tournament_matches')
          .update({
            player1_id: r3m2Winner,  // Winner from Winners Bracket Final M2
            player2_id: losersBChampion,  // Winner from Losers B Final
            status: (r3m2Winner && losersBChampion) ? 'pending' : 'waiting_for_players'
          })
          .eq('tournament_id', tournament.id)
          .eq('round_number', 250)
          .eq('match_number', 2);
          
        if (sf2Error) {
          console.log('❌ SF2 fix failed:', sf2Error.message);
        } else {
          console.log('✅ SF2 fixed successfully');
          console.log(`  Player 1: ${r3m2Winner?.substring(0,8)} (R3 M2 Winner - Winners Bracket)`);
          console.log(`  Player 2: ${losersBChampion?.substring(0,8)} (Losers B Champion)`);
        }
      }
      
      // Verify the fix
      console.log('\\n🔍 Verifying fix...');
      const { data: updatedSemifinals } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .order('match_number');
        
      console.log('\\n✅ UPDATED SEMIFINALS:');
      updatedSemifinals?.forEach(match => {
        const readyStatus = (match.player1_id && match.player2_id) ? '✅ Ready' : '⏳ Waiting';
        console.log(`  SF${match.match_number}: ${match.player1_id?.substring(0,8) || 'TBD'} vs ${match.player2_id?.substring(0,8) || 'TBD'} (${readyStatus})`);
      });
    }
    
    console.log('\\n🎉 SEMIFINAL ADVANCEMENT FIX COMPLETED!');
    console.log('======================================');
    console.log('✅ Both players from Winners Bracket are now correctly placed in Semifinals');
    console.log('✅ SF1: R3M1 Winner vs Losers A Champion');
    console.log('✅ SF2: R3M2 Winner vs Losers B Champion');
    console.log('\\n🔄 Please refresh your browser to see the updated bracket!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSemifinalAdvancement();
