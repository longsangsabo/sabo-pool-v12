/**
 * 🔧 FIX DUPLICATE ANH LONG IN SEMIFINALS
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : '';
};

const supabase = createClient(
  getEnvValue('VITE_SUPABASE_URL'), 
  getEnvValue('SUPABASE_SERVICE_ROLE_KEY')
);

async function fixDuplicateAnhLong() {
  console.log('🔧 FIXING DUPLICATE ANH LONG IN SEMIFINALS...\n');
  
  try {
    // Get tournament test2
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id, name')
      .ilike('name', '%test2%')
      .single();
      
    console.log(`✅ Tournament: ${tournament.name}`);
    
    // 1. Check Round 3 status - should be completed first
    const { data: round3Matches } = await supabase
      .from('tournament_matches')
      .select('match_number, player1_id, player2_id, winner_id, status')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 3)
      .order('match_number');
      
    console.log('\n📊 Round 3 (Winners Bracket Finals) Status:');
    round3Matches?.forEach(match => {
      console.log(`   R3 M${match.match_number}: Winner = ${match.winner_id?.substring(0,8) || 'NULL'}, Status = ${match.status}`);
    });
    
    // Check if Round 3 needs completion
    const incompleteR3 = round3Matches?.filter(m => m.status !== 'completed' && m.player1_id && m.player2_id);
    
    if (incompleteR3 && incompleteR3.length > 0) {
      console.log('\n⚠️ Round 3 has incomplete matches - need to complete first');
      
      // Complete R3 matches automatically for testing
      for (const match of incompleteR3) {
        console.log(`\n🎮 Auto-completing R3 M${match.match_number}...`);
        
        // Simulate match result
        const { error: completeError } = await supabase
          .from('tournament_matches')
          .update({
            score_player1: 2,
            score_player2: 1,
            winner_id: match.player1_id, // Player 1 wins
            status: 'completed'
          })
          .eq('id', match.id);
          
        if (completeError) {
          console.error(`❌ Failed to complete R3 M${match.match_number}:`, completeError);
        } else {
          console.log(`✅ R3 M${match.match_number} completed - Player 1 wins`);
        }
      }
      
      // Re-fetch Round 3 winners
      const { data: updatedR3 } = await supabase
        .from('tournament_matches')
        .select('match_number, winner_id')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 3)
        .eq('status', 'completed')
        .order('match_number');
        
      console.log('\n🏆 Updated Round 3 Winners:');
      updatedR3?.forEach(match => {
        console.log(`   R3 M${match.match_number} Winner: ${match.winner_id.substring(0,8)}`);
      });
    }
    
    // 2. Get correct players for semifinals
    console.log('\n🎯 CALCULATING CORRECT SEMIFINAL ASSIGNMENTS...');
    
    // Winners Bracket Finalists (R3 winners)
    const { data: wbFinalists } = await supabase
      .from('tournament_matches')
      .select('match_number, winner_id')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 3)
      .eq('status', 'completed')
      .order('match_number');
      
    // Losers Champions  
    const { data: losersChamps } = await supabase
      .from('tournament_matches')
      .select('round_number, winner_id')
      .eq('tournament_id', tournament.id)
      .in('round_number', [103, 202])
      .eq('status', 'completed')
      .order('round_number');
      
    console.log('🏆 Winners Bracket Finalists:');
    wbFinalists?.forEach(match => {
      console.log(`   WB Finalist #${match.match_number}: ${match.winner_id.substring(0,8)}`);
    });
    
    console.log('🥈 Losers Champions:');
    losersChamps?.forEach(match => {
      console.log(`   R${match.round_number} Champion: ${match.winner_id.substring(0,8)}`);
    });
    
    // 3. Fix Semifinals with correct players
    if (wbFinalists && wbFinalists.length >= 2 && losersChamps && losersChamps.length >= 2) {
      console.log('\n🔧 FIXING SEMIFINALS...');
      
      const wbFinalst1 = wbFinalists[0].winner_id; // R3 M1 winner
      const wbFinalist2 = wbFinalists[1].winner_id; // R3 M2 winner  
      const losersChamp1 = losersChamps[0].winner_id; // R103 winner
      const losersChamp2 = losersChamps[1].winner_id; // R202 winner
      
      // Reset Semifinals to prevent errors
      await supabase
        .from('tournament_matches')
        .update({
          score_player1: 0,
          score_player2: 0,
          winner_id: null,
          status: 'pending'
        })
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250);
      
      // Semifinal 1: WB Finalist #1 vs Losers Champ #1
      const { error: semi1Error } = await supabase
        .from('tournament_matches')
        .update({
          player1_id: wbFinalst1,
          player2_id: losersChamp1
        })
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 1);
        
      // Semifinal 2: WB Finalist #2 vs Losers Champ #2  
      const { error: semi2Error } = await supabase
        .from('tournament_matches')
        .update({
          player1_id: wbFinalist2,
          player2_id: losersChamp2
        })
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2);
        
      if (semi1Error || semi2Error) {
        console.error('❌ Semifinal update failed:', semi1Error || semi2Error);
      } else {
        console.log('✅ SEMIFINALS FIXED!');
        console.log(`   Semifinal 1: ${wbFinalst1.substring(0,8)} vs ${losersChamp1.substring(0,8)}`);
        console.log(`   Semifinal 2: ${wbFinalist2.substring(0,8)} vs ${losersChamp2.substring(0,8)}`);
        
        // Also reset Grand Final
        await supabase
          .from('tournament_matches')
          .update({
            player1_id: null,
            player2_id: null,
            winner_id: null,
            status: 'pending',
            score_player1: 0,
            score_player2: 0
          })
          .eq('tournament_id', tournament.id)
          .eq('round_number', 300);
          
        console.log('✅ Grand Final reset - ready for semifinal winners');
      }
    } else {
      console.log('⚠️ Not enough winners to fix semifinals properly');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixDuplicateAnhLong();
