/**
 * 🔧 FIX TEST2 TOURNAMENT - Finals Stage Advancement
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

async function fixTest2Finals() {
  console.log('🔧 FIXING TEST2 TOURNAMENT FINALS STAGE\n');
  
  try {
    // Get test2 tournament
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .ilike('name', '%test2%')
      .single();
      
    if (!tournaments) {
      console.log('❌ test2 tournament not found');
      return;
    }
    
    const tournamentId = tournaments.id;
    console.log(`✅ Working on: ${tournaments.name}\n`);
    
    // Step 1: Check what should advance to Finals
    console.log('📋 CHECKING ADVANCEMENT SOURCES:\n');
    
    // Winners Bracket Round 3 (should go to Semifinals)
    const { data: winnersR3 } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 3)
      .eq('status', 'completed');
      
    console.log(`🏆 Winners R3 completed: ${winnersR3?.length || 0}/2`);
    winnersR3?.forEach(match => {
      console.log(`   M${match.match_number}: Winner ${match.winner_id?.substring(0,8)}`);
    });
    
    // Losers Branch A Round 103 (should go to Semifinals) 
    const { data: losersR103 } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 103)
      .eq('status', 'completed');
      
    console.log(`\n🥈 Losers A R103 completed: ${losersR103?.length || 0}/1`);
    if (losersR103?.[0]) {
      console.log(`   Winner: ${losersR103[0].winner_id?.substring(0,8)} (${losersR103[0].score_player1}-${losersR103[0].score_player2})`);
    }
    
    // Losers Branch B Round 202 (should go to Semifinals)
    const { data: losersR202 } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 202)
      .eq('status', 'completed');
      
    console.log(`\n🔥 Losers B R202 completed: ${losersR202?.length || 0}/1`);
    if (losersR202?.[0]) {
      console.log(`   Winner: ${losersR202[0].winner_id?.substring(0,8)}`);
    }
    
    // Step 2: Fix Semifinal 2 (Round 250 Match 2)
    console.log('\n🎯 FIXING SEMIFINAL 2 (Round 250 Match 2):\n');
    
    const { data: semi2 } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 250)
      .eq('match_number', 2)
      .single();
      
    if (semi2) {
      console.log(`Current Semifinal 2: P1=${semi2.player1_id?.substring(0,8) || 'NULL'} P2=${semi2.player2_id?.substring(0,8) || 'NULL'}`);
      
      // Semifinal 2 should have:
      // - Player 1: Winner from Winners R3 Match 2  
      // - Player 2: Winner from Losers Branch B (Round 202)
      
      let player1Id = null;
      let player2Id = null;
      
      // Get Winners R3 Match 2 winner
      if (winnersR3 && winnersR3.length >= 2) {
        const r3m2 = winnersR3.find(m => m.match_number === 2);
        if (r3m2) {
          player1Id = r3m2.winner_id;
          console.log(`✅ Winners R3 M2 winner available: ${player1Id?.substring(0,8)}`);
        }
      }
      
      // Get Losers B Round 202 winner
      if (losersR202 && losersR202.length > 0) {
        player2Id = losersR202[0].winner_id;
        console.log(`✅ Losers B R202 winner available: ${player2Id?.substring(0,8)}`);
      }
      
      if (player1Id && player2Id) {
        console.log('\n🔧 Updating Semifinal 2...');
        
        const { error: semi2Error } = await supabase
          .from('tournament_matches')
          .update({
            player1_id: player1Id,
            player2_id: player2Id,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', semi2.id);
          
        if (semi2Error) {
          console.error('❌ Semifinal 2 update failed:', semi2Error.message);
        } else {
          console.log('✅ Semifinal 2 fixed!');
        }
      } else {
        console.log('⚠️ Missing advancement sources for Semifinal 2');
        if (!player1Id) console.log('   Need Winners R3 M2 completion');
        if (!player2Id) console.log('   Need Losers B R202 completion');
      }
    }
    
    // Step 3: Check Semifinal 1 (Round 250 Match 1)
    console.log('\n🎯 CHECKING SEMIFINAL 1 (Round 250 Match 1):\n');
    
    const { data: semi1 } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 250)
      .eq('match_number', 1)
      .single();
      
    if (semi1) {
      console.log(`Current Semifinal 1: P1=${semi1.player1_id?.substring(0,8) || 'NULL'} P2=${semi1.player2_id?.substring(0,8) || 'NULL'}`);
      console.log(`Status: ${semi1.status}`);
      
      if (semi1.status === 'completed') {
        console.log(`✅ Semifinal 1 completed, winner: ${semi1.winner_id?.substring(0,8)}`);
        
        // Step 4: Check Grand Final (Round 300 Match 1)
        const { data: final } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('round_number', 300)
          .eq('match_number', 1)
          .single();
          
        if (final) {
          console.log(`\nCurrent Grand Final: P1=${final.player1_id?.substring(0,8) || 'NULL'} P2=${final.player2_id?.substring(0,8) || 'NULL'}`);
          
          // Grand Final Player 1 should be Semifinal 1 winner
          if (semi1.winner_id && final.player1_id !== semi1.winner_id) {
            console.log('\n🔧 Fixing Grand Final Player 1...');
            
            const { error: finalError } = await supabase
              .from('tournament_matches')
              .update({
                player1_id: semi1.winner_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', final.id);
              
            if (finalError) {
              console.error('❌ Grand Final update failed:', finalError.message);
            } else {
              console.log('✅ Grand Final Player 1 fixed!');
            }
          }
        }
      }
    }
    
    console.log('\n🎉 TEST2 FINALS ADVANCEMENT COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixTest2Finals();
