const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function analyzeSemifinalAdvancement() {
  try {
    console.log('🔍 ANALYZING SEMIFINAL 2 ADVANCEMENT ISSUE');
    console.log('==========================================');
    
    // Get SABO tournaments
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('tournament_type', 'sabo')
      .limit(3);
      
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No SABO tournaments found');
      return;
    }
    
    for (const tournament of tournaments) {
      console.log(`\n🏆 Tournament: ${tournament.name}`);
      console.log('=====================================');
      
      // Get all relevant matches
      const { data: allMatches } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .in('round_number', [3, 103, 202, 203, 250])
        .order('round_number, match_number');
        
      if (!allMatches) continue;
      
      // Group matches by round
      const r3Matches = allMatches.filter(m => m.round_number === 3);
      const r103Matches = allMatches.filter(m => m.round_number === 103);
      const r202Matches = allMatches.filter(m => m.round_number === 202);
      const r203Matches = allMatches.filter(m => m.round_number === 203);
      const semifinals = allMatches.filter(m => m.round_number === 250);
      
      console.log('\n📊 CURRENT STATE:');
      console.log('==================');
      
      // Winners Bracket Finals (R3)
      console.log('\n🏅 Winners Bracket Finals (R3):');
      r3Matches.forEach(match => {
        console.log(`  R3 M${match.match_number}: ${match.player1_id?.substring(0,8)} vs ${match.player2_id?.substring(0,8)}`);
        console.log(`    Status: ${match.status}, Winner: ${match.winner_id?.substring(0,8) || 'None'}`);
      });
      
      // Losers Bracket Finals
      console.log('\n🏅 Losers Bracket Finals:');
      [...r103Matches, ...r202Matches, ...r203Matches].forEach(match => {
        const type = match.round_number === 103 ? 'Losers A Final' : 
                     match.round_number === 202 ? 'Losers B (R202)' : 'Losers B Final (R203)';
        console.log(`  R${match.round_number} M${match.match_number} (${type}): ${match.player1_id?.substring(0,8)} vs ${match.player2_id?.substring(0,8)}`);
        console.log(`    Status: ${match.status}, Winner: ${match.winner_id?.substring(0,8) || 'None'}`);
      });
      
      // Semifinals
      console.log('\n🎯 SEMIFINALS:');
      semifinals.forEach(match => {
        console.log(`  SF${match.match_number}: ${match.player1_id?.substring(0,8) || 'TBD'} vs ${match.player2_id?.substring(0,8) || 'TBD'}`);
        console.log(`    Status: ${match.status}, Winner: ${match.winner_id?.substring(0,8) || 'None'}`);
      });
      
      console.log('\n❓ CORRECT SABO SEMIFINAL STRUCTURE:');
      console.log('====================================');
      console.log('SF1: R3 M1 Winner vs R103 Winner (Losers A Champion)');
      console.log('SF2: R3 M2 Winner vs R202/R203 Winner (Losers B Champion)');
      
      // Verify advancement
      console.log('\n🔍 ADVANCEMENT VERIFICATION:');
      console.log('=============================');
      
      if (r3Matches.length >= 2 && semifinals.length >= 2) {
        const r3m1Winner = r3Matches.find(m => m.match_number === 1)?.winner_id;
        const r3m2Winner = r3Matches.find(m => m.match_number === 2)?.winner_id;
        const r103Winner = r103Matches[0]?.winner_id;
        const r202Winner = r202Matches[0]?.winner_id;
        const r203Winner = r203Matches[0]?.winner_id;
        
        const sf1 = semifinals.find(m => m.match_number === 1);
        const sf2 = semifinals.find(m => m.match_number === 2);
        
        console.log('\n✅ EXPECTED vs ACTUAL:');
        console.log(`SF1 Player1: Expected R3M1 Winner (${r3m1Winner?.substring(0,8) || 'None'}), Actual: ${sf1?.player1_id?.substring(0,8) || 'TBD'} ${r3m1Winner === sf1?.player1_id ? '✅' : '❌'}`);
        console.log(`SF1 Player2: Expected R103 Winner (${r103Winner?.substring(0,8) || 'None'}), Actual: ${sf1?.player2_id?.substring(0,8) || 'TBD'} ${r103Winner === sf1?.player2_id ? '✅' : '❌'}`);
        console.log(`SF2 Player1: Expected R3M2 Winner (${r3m2Winner?.substring(0,8) || 'None'}), Actual: ${sf2?.player1_id?.substring(0,8) || 'TBD'} ${r3m2Winner === sf2?.player1_id ? '✅' : '❌'}`);
        console.log(`SF2 Player2: Expected R202/R203 Winner (${r202Winner?.substring(0,8) || r203Winner?.substring(0,8) || 'None'}), Actual: ${sf2?.player2_id?.substring(0,8) || 'TBD'} ${(r202Winner === sf2?.player2_id || r203Winner === sf2?.player2_id) ? '✅' : '❌'}`);
        
        // Identify issues
        console.log('\n🚨 ISSUES FOUND:');
        console.log('================');
        
        const issues = [];
        
        if (r3m1Winner && r3m1Winner !== sf1?.player1_id) {
          issues.push(`SF1 Player1 incorrect: Should be ${r3m1Winner.substring(0,8)} but is ${sf1?.player1_id?.substring(0,8) || 'TBD'}`);
        }
        
        if (r3m2Winner && r3m2Winner !== sf2?.player1_id) {
          issues.push(`SF2 Player1 incorrect: Should be ${r3m2Winner.substring(0,8)} but is ${sf2?.player1_id?.substring(0,8) || 'TBD'}`);
        }
        
        if (r103Winner && r103Winner !== sf1?.player2_id) {
          issues.push(`SF1 Player2 incorrect: Should be ${r103Winner.substring(0,8)} but is ${sf1?.player2_id?.substring(0,8) || 'TBD'}`);
        }
        
        if ((r202Winner || r203Winner) && !((r202Winner === sf2?.player2_id) || (r203Winner === sf2?.player2_id))) {
          const expectedWinner = r202Winner || r203Winner;
          issues.push(`SF2 Player2 incorrect: Should be ${expectedWinner?.substring(0,8)} but is ${sf2?.player2_id?.substring(0,8) || 'TBD'}`);
        }
        
        if (issues.length === 0) {
          console.log('✅ No issues found - advancement is correct!');
        } else {
          issues.forEach(issue => console.log(`❌ ${issue}`));
          
          console.log('\n🔧 FIXING ISSUES...');
          console.log('===================');
          
          // Fix SF1 Player1 (R3 M1 Winner)
          if (r3m1Winner && r3m1Winner !== sf1?.player1_id) {
            const { error } = await supabase
              .from('tournament_matches')
              .update({ player1_id: r3m1Winner })
              .eq('tournament_id', tournament.id)
              .eq('round_number', 250)
              .eq('match_number', 1);
              
            if (error) {
              console.log('❌ Failed to fix SF1 Player1:', error.message);
            } else {
              console.log(`✅ Fixed SF1 Player1: ${r3m1Winner.substring(0,8)}`);
            }
          }
          
          // Fix SF2 Player1 (R3 M2 Winner)
          if (r3m2Winner && r3m2Winner !== sf2?.player1_id) {
            const { error } = await supabase
              .from('tournament_matches')
              .update({ player1_id: r3m2Winner })
              .eq('tournament_id', tournament.id)
              .eq('round_number', 250)
              .eq('match_number', 2);
              
            if (error) {
              console.log('❌ Failed to fix SF2 Player1:', error.message);
            } else {
              console.log(`✅ Fixed SF2 Player1: ${r3m2Winner.substring(0,8)}`);
            }
          }
          
          // Fix SF1 Player2 (R103 Winner)
          if (r103Winner && r103Winner !== sf1?.player2_id) {
            const { error } = await supabase
              .from('tournament_matches')
              .update({ player2_id: r103Winner })
              .eq('tournament_id', tournament.id)
              .eq('round_number', 250)
              .eq('match_number', 1);
              
            if (error) {
              console.log('❌ Failed to fix SF1 Player2:', error.message);
            } else {
              console.log(`✅ Fixed SF1 Player2: ${r103Winner.substring(0,8)}`);
            }
          }
          
          // Fix SF2 Player2 (R202/R203 Winner)
          const losersBWinner = r202Winner || r203Winner;
          if (losersBWinner && losersBWinner !== sf2?.player2_id) {
            const { error } = await supabase
              .from('tournament_matches')
              .update({ player2_id: losersBWinner })
              .eq('tournament_id', tournament.id)
              .eq('round_number', 250)
              .eq('match_number', 2);
              
            if (error) {
              console.log('❌ Failed to fix SF2 Player2:', error.message);
            } else {
              console.log(`✅ Fixed SF2 Player2: ${losersBWinner.substring(0,8)}`);
            }
          }
          
          console.log('\n🎉 Semifinal advancement fixes completed!');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeSemifinalAdvancement();
