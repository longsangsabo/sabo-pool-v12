require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeCrossBracketIssue() {
  console.log('🔍 ANALYZING CROSS-BRACKET FINALS ADVANCEMENT ISSUE');
  console.log('='.repeat(60));
  
  try {
    // 1. Check Cross-Bracket matches structure
    console.log('\n1. 📊 Checking Cross-Bracket matches...');
    
    const { data: crossMatches, error: crossError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .in('bracket_type', ['CROSS_SEMIFINALS', 'CROSS_FINAL'])
      .order('bracket_type, round_number, match_number');
      
    if (crossError) {
      console.error('❌ Error fetching cross matches:', crossError);
      return;
    }
    
    console.log('📋 Cross-Bracket matches structure:');
    crossMatches?.forEach(match => {
      console.log(`  ${match.sabo_match_id} (${match.bracket_type}):`);
      console.log(`    Players: ${match.player1_id || 'NULL'} vs ${match.player2_id || 'NULL'}`);
      console.log(`    Winner: ${match.winner_id || 'NULL'}`);
      console.log(`    Status: ${match.status}`);
      console.log(`    Score: ${match.score_player1}-${match.score_player2}`);
      console.log('');
    });
    
    // 2. Check Group Finals results (should feed into Cross-Bracket)
    console.log('\n2. 🏆 Checking Group Finals results...');
    
    const { data: groupFinals, error: groupError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL'])
      .eq('status', 'completed')
      .order('group_id, round_number');
      
    if (groupError) {
      console.error('❌ Error fetching group finals:', groupError);
      return;
    }
    
    console.log('📋 Group Finals results:');
    groupFinals?.forEach(match => {
      console.log(`  ${match.sabo_match_id} (${match.bracket_type}):`);
      console.log(`    Winner: ${match.winner_id}`);
      console.log(`    Completed: ${match.completed_at}`);
      console.log('');
    });
    
    // 3. Analyze advancement logic
    console.log('\n3. 🧠 Analyzing advancement logic...');
    
    // Group A Finals winners
    const groupAWinners = groupFinals.filter(m => m.group_id === 'A' && m.winner_id);
    const groupBWinners = groupFinals.filter(m => m.group_id === 'B' && m.winner_id);
    
    console.log('🏆 Group A Finals winners:');
    groupAWinners.forEach(m => {
      console.log(`  ${m.sabo_match_id}: Winner ${m.winner_id}`);
    });
    
    console.log('🏆 Group B Finals winners:');
    groupBWinners.forEach(m => {
      console.log(`  ${m.sabo_match_id}: Winner ${m.winner_id}`);
    });
    
    // 4. Check Cross-Semifinals logic
    console.log('\n4. 🔄 Checking Cross-Semifinals advancement...');
    
    const crossSemifinals = crossMatches.filter(m => m.bracket_type === 'CROSS_SEMIFINALS');
    const crossFinal = crossMatches.find(m => m.bracket_type === 'CROSS_FINAL');
    
    console.log('📋 Cross-Semifinals status:');
    crossSemifinals.forEach(sf => {
      console.log(`  ${sf.sabo_match_id}:`);
      console.log(`    Status: ${sf.status}`);
      console.log(`    Winner: ${sf.winner_id || 'TBD'}`);
    });
    
    console.log('📋 Cross-Final status:');
    if (crossFinal) {
      console.log(`  ${crossFinal.sabo_match_id}:`);
      console.log(`    Players: ${crossFinal.player1_id || 'NULL'} vs ${crossFinal.player2_id || 'NULL'}`);
      console.log(`    Status: ${crossFinal.status}`);
      console.log(`    Expected: Winners from Cross-Semifinals`);
    }
    
    // 5. Check advancement logic consistency
    console.log('\n5. ❌ IDENTIFYING ADVANCEMENT ISSUES...');
    
    const issues = [];
    
    // Check if Cross-Final has correct players
    const completedSemifinals = crossSemifinals.filter(sf => sf.status === 'completed' && sf.winner_id);
    
    if (completedSemifinals.length === 2) {
      const expectedFinalPlayers = completedSemifinals.map(sf => sf.winner_id).sort();
      const actualFinalPlayers = [crossFinal?.player1_id, crossFinal?.player2_id].filter(p => p).sort();
      
      console.log('🔍 Cross-Final advancement check:');
      console.log(`  Expected players: ${expectedFinalPlayers.join(', ')}`);
      console.log(`  Actual players: ${actualFinalPlayers.join(', ')}`);
      
      if (JSON.stringify(expectedFinalPlayers) !== JSON.stringify(actualFinalPlayers)) {
        issues.push({
          type: 'WRONG_FINAL_PLAYERS',
          expected: expectedFinalPlayers,
          actual: actualFinalPlayers
        });
      }
    } else if (completedSemifinals.length < 2) {
      console.log('⚠️ Not all Cross-Semifinals completed yet');
    }
    
    // Check Cross-Semifinals players source
    console.log('\n6. 🔍 Checking Cross-Semifinals player sources...');
    
    crossSemifinals.forEach(sf => {
      console.log(`  ${sf.sabo_match_id}:`);
      console.log(`    Player1: ${sf.player1_id}`);
      console.log(`    Player2: ${sf.player2_id}`);
      
      // Check if these players came from Group Finals
      const player1InGroupFinals = groupFinals.find(gf => gf.winner_id === sf.player1_id);
      const player2InGroupFinals = groupFinals.find(gf => gf.winner_id === sf.player2_id);
      
      console.log(`    Player1 source: ${player1InGroupFinals ? player1InGroupFinals.sabo_match_id : 'NOT FROM GROUP FINALS'}`);
      console.log(`    Player2 source: ${player2InGroupFinals ? player2InGroupFinals.sabo_match_id : 'NOT FROM GROUP FINALS'}`);
    });
    
    // 7. Generate fix recommendations
    console.log('\n7. 🔧 GENERATING FIX RECOMMENDATIONS...');
    
    if (issues.length > 0) {
      console.log('❌ Issues found:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.type}:`);
        console.log(`     Expected: ${issue.expected.join(', ')}`);
        console.log(`     Actual: ${issue.actual.join(', ')}`);
      });
      
      console.log('\n🔧 Recommended fixes:');
      console.log('1. Update Cross-Final with correct winners from Cross-Semifinals');
      console.log('2. Verify Cross-Semifinals have correct Group Finals winners');
      console.log('3. Update advancement trigger to handle Cross-Bracket logic');
    } else {
      console.log('✅ No obvious advancement issues detected');
      console.log('   Manual review recommended for tournament logic');
    }
    
    return { crossMatches, groupFinals, issues };
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  }
}

analyzeCrossBracketIssue().catch(console.error);
