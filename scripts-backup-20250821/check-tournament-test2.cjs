/**
 * 🔍 CHECK TOURNAMENT TEST 2 - Missing Players Fix
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment
const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : '';
};

const supabase = createClient(
  getEnvValue('VITE_SUPABASE_URL'), 
  getEnvValue('SUPABASE_SERVICE_ROLE_KEY')
);

async function checkTournamentTest2() {
  console.log('🔍 KIỂM TRA TOURNAMENT TEST 2\n');
  
  try {
    // Find tournaments with "test" in name
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .ilike('name', '%test%')
      .order('created_at', { ascending: false });
      
    console.log('📋 Available tournaments:');
    tournaments?.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.name} (ID: ${t.id.substring(0,8)})`);
    });
    
    // Use test2 (first tournament) instead of test1  
    const tournament = tournaments?.[0]; // This should be test2
    
    if (!tournament) {
      console.log('❌ Không tìm thấy tournament test');
      return;
    }
    
    console.log(`\n✅ Analyzing: ${tournament.name}\n`);
    
    // Check the specific match from image: Round 103 Match 1
    const { data: targetMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 103)
      .eq('match_number', 1)
      .single();
      
    if (targetMatch) {
      console.log('🎯 TARGET MATCH (Round 103 Match 1):');
      console.log(`   Match ID: ${targetMatch.id}`);
      console.log(`   Player 1 ID: ${targetMatch.player1_id || 'NULL'}`);
      console.log(`   Player 2 ID: ${targetMatch.player2_id || 'NULL'}`);
      console.log(`   Status: ${targetMatch.status}`);
      console.log(`   Score: ${targetMatch.score_player1 || 0} - ${targetMatch.score_player2 || 0}`);
      
      // Get player names
      if (targetMatch.player1_id) {
        const { data: p1 } = await supabase
          .from('profiles')
          .select('display_name, full_name')
          .eq('user_id', targetMatch.player1_id)
          .single();
        console.log(`   Player 1 Name: ${p1?.display_name || p1?.full_name || 'Unknown'}`);
      }
      
      if (targetMatch.player2_id) {
        const { data: p2 } = await supabase
          .from('profiles')
          .select('display_name, full_name')
          .eq('user_id', targetMatch.player2_id)
          .single();
        console.log(`   Player 2 Name: ${p2?.display_name || p2?.full_name || 'Unknown'}`);
      }
      
      if (!targetMatch.player1_id || !targetMatch.player2_id) {
        console.log('\n❌ PROBLEM: Match thiếu player(s)!\n');
        
        // Check Round 102 for advancement
        const { data: round102Matches } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', tournament.id)
          .eq('round_number', 102)
          .order('match_number');
          
        console.log('📋 Round 102 matches (should advance to Round 103):');
        if (round102Matches) {
          round102Matches.forEach(match => {
            const status = match.status;
            const winner = match.winner_id?.substring(0,8) || 'NULL';
            console.log(`   Match ${match.match_number}: Status=${status}, Winner=${winner}`);
          });
          
          // Find completed matches with winners
          const winners = round102Matches.filter(m => m.status === 'completed' && m.winner_id);
          console.log(`\n🏆 Round 102 completed with winners: ${winners.length}/2`);
          
          if (winners.length >= 2) {
            console.log('\n🔧 CAN FIX: Advance 2 winners to Round 103');
            
            // Fix the advancement
            const winner1 = winners[0].winner_id;
            const winner2 = winners[1].winner_id;
            
            const { error: fixError } = await supabase
              .from('tournament_matches')
              .update({
                player1_id: winner1,
                player2_id: winner2,
                status: 'pending',
                updated_at: new Date().toISOString()
              })
              .eq('id', targetMatch.id);
              
            if (fixError) {
              console.error('❌ Fix failed:', fixError.message);
            } else {
              console.log('✅ FIXED! Round 103 Match 1 now has both players');
              
              // Get player names for confirmation
              const { data: p1 } = await supabase
                .from('profiles')
                .select('display_name, full_name')
                .eq('user_id', winner1)
                .single();
                
              const { data: p2 } = await supabase
                .from('profiles')
                .select('display_name, full_name')
                .eq('user_id', winner2)
                .single();
                
              console.log(`   Player 1: ${p1?.display_name || p1?.full_name}`);
              console.log(`   Player 2: ${p2?.display_name || p2?.full_name}`);
            }
          } else {
            console.log('\n⚠️ Need to complete Round 102 matches first');
            
            // Show what needs to be done
            const pendingMatches = round102Matches.filter(m => m.status !== 'completed');
            if (pendingMatches.length > 0) {
              console.log('\n📝 Round 102 matches to complete:');
              pendingMatches.forEach(match => {
                console.log(`   Match ${match.match_number}: ${match.player1_id?.substring(0,8) || 'NULL'} vs ${match.player2_id?.substring(0,8) || 'NULL'}`);
              });
            }
          }
        }
      } else {
        console.log('\n✅ Match has both players - issue might be UI/validation related');
        
        // Check if match can accept score input
        console.log('\n🧪 Testing score input capability...');
        
        const testScore = {
          score_player1: 1,
          score_player2: 0,
          winner_id: targetMatch.player1_id,
          status: 'completed'
        };
        
        // Test update (then revert)
        const { error: testError } = await supabase
          .from('tournament_matches')
          .update(testScore)
          .eq('id', targetMatch.id);
          
        if (testError) {
          console.error('❌ Score input test failed:', testError.message);
        } else {
          console.log('✅ Score input works - reverting test...');
          
          // Revert
          await supabase
            .from('tournament_matches')
            .update({
              score_player1: 0,
              score_player2: 0,
              winner_id: null,
              status: 'pending'
            })
            .eq('id', targetMatch.id);
        }
      }
    } else {
      console.log('❌ Không tìm thấy Round 103 Match 1');
      
      // Show all matches for this tournament
      const { data: allMatches } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, sabo_match_id, status')
        .eq('tournament_id', tournament.id)
        .order('round_number')
        .order('match_number');
        
      console.log('\n📋 All matches in tournament:');
      allMatches?.forEach(match => {
        console.log(`   R${match.round_number} M${match.match_number} (${match.sabo_match_id}): ${match.status}`);
      });
    }
    
    // Check for any incomplete matches
    const { data: incompleteMatches } = await supabase
      .from('tournament_matches')
      .select('round_number, match_number, sabo_match_id, player1_id, player2_id, status')
      .eq('tournament_id', tournament.id)
      .or('player1_id.is.null,player2_id.is.null')
      .order('round_number')
      .order('match_number');
      
    if (incompleteMatches && incompleteMatches.length > 0) {
      console.log(`\n⚠️  OTHER INCOMPLETE MATCHES: ${incompleteMatches.length}`);
      incompleteMatches.forEach(match => {
        const p1 = match.player1_id ? '✓' : '✗';
        const p2 = match.player2_id ? '✓' : '✗';
        console.log(`   R${match.round_number} M${match.match_number}: P1=${p1} P2=${p2} Status=${match.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkTournamentTest2();
