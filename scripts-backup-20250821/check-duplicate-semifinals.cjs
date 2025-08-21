/**
 * 🚨 CHECK DUPLICATE PLAYERS IN SEMIFINALS
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

async function checkDuplicateInSemifinals() {
  console.log('🔍 CHECKING DUPLICATE PLAYERS IN SEMIFINALS...\n');
  
  try {
    // Find tournament test2
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name')
      .ilike('name', '%test2%')
      .single();
      
    if (!tournaments) {
      console.log('❌ Tournament test2 not found');
      return;
    }
    
    console.log(`✅ Tournament: ${tournaments.name}`);
    console.log(`   ID: ${tournaments.id.substring(0,8)}...\n`);
    
    // Get Semifinals (Round 250)
    const { data: semifinals } = await supabase
      .from('tournament_matches')
      .select('id, match_number, player1_id, player2_id, status, score_player1, score_player2, winner_id')
      .eq('tournament_id', tournaments.id)
      .eq('round_number', 250)
      .order('match_number');
      
    console.log('📊 SEMIFINALS DETAILED ANALYSIS:');
    
    const allPlayerIds = [];
    const playerDetails = {};
    
    // Collect all player IDs and get their names
    for (const match of semifinals || []) {
      if (match.player1_id) allPlayerIds.push(match.player1_id);
      if (match.player2_id) allPlayerIds.push(match.player2_id);
    }
    
    // Get player names
    const uniquePlayerIds = [...new Set(allPlayerIds)];
    for (const playerId of uniquePlayerIds) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('user_id', playerId)
        .single();
      
      playerDetails[playerId] = {
        name: profile?.display_name || profile?.full_name || 'Unknown',
        shortId: playerId.substring(0,8)
      };
    }
    
    // Display each semifinal match
    for (const match of semifinals || []) {
      console.log(`\n🏆 Semifinal ${match.match_number}:`);
      
      const p1 = match.player1_id ? playerDetails[match.player1_id] : null;
      const p2 = match.player2_id ? playerDetails[match.player2_id] : null;
      
      console.log(`   Player 1: ${p1?.name || 'NULL'} (${p1?.shortId || 'NULL'})`);
      console.log(`   Player 2: ${p2?.name || 'NULL'} (${p2?.shortId || 'NULL'})`);
      console.log(`   Status: ${match.status}`);
      console.log(`   Score: ${match.score_player1 || 0}-${match.score_player2 || 0}`);
      
      if (match.winner_id && playerDetails[match.winner_id]) {
        console.log(`   Winner: ${playerDetails[match.winner_id].name}`);
      }
    }
    
    // Check for duplicates
    console.log('\n🚨 DUPLICATE DETECTION:');
    
    const duplicateIds = allPlayerIds.filter((id, index) => 
      allPlayerIds.indexOf(id) !== index
    );
    
    if (duplicateIds.length > 0) {
      console.log('❌ DUPLICATE PLAYERS FOUND!');
      
      const uniqueDuplicates = [...new Set(duplicateIds)];
      uniqueDuplicates.forEach(dupId => {
        const player = playerDetails[dupId];
        console.log(`   🔴 ${player.name} (${player.shortId}) appears multiple times`);
        
        // Show which matches they appear in
        semifinals.forEach((match, index) => {
          if (match.player1_id === dupId || match.player2_id === dupId) {
            console.log(`      → Semifinal ${match.match_number}`);
          }
        });
      });
      
      // Analyze correct semifinal structure
      console.log('\n🔧 CORRECT SEMIFINAL STRUCTURE ANALYSIS:');
      
      // Get Winners Bracket finalists (Round 3 winners)
      const { data: winnersFinalists } = await supabase
        .from('tournament_matches')
        .select('match_number, winner_id')
        .eq('tournament_id', tournaments.id)
        .eq('round_number', 3)
        .eq('status', 'completed')
        .not('winner_id', 'is', null)
        .order('match_number');
        
      console.log('\n🏆 Winners Bracket Finalists (should be in semifinals):');
      winnersFinalists?.forEach(match => {
        const player = playerDetails[match.winner_id];
        console.log(`   R3 M${match.match_number} Winner: ${player?.name || 'Unknown'} (${player?.shortId || 'NULL'})`);
      });
      
      // Get Losers champions
      const { data: losersChamps } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, winner_id')
        .eq('tournament_id', tournaments.id)
        .in('round_number', [103, 202])
        .eq('status', 'completed')
        .not('winner_id', 'is', null);
        
      console.log('\n🥈 Losers Champions (should be in semifinals):');
      losersChamps?.forEach(match => {
        const player = playerDetails[match.winner_id];
        console.log(`   R${match.round_number} Winner: ${player?.name || 'Unknown'} (${player?.shortId || 'NULL'})`);
      });
      
      console.log('\n💡 SEMIFINAL STRUCTURE SHOULD BE:');
      console.log('   Semifinal 1: WB Finalist #1 vs Losers Champion');
      console.log('   Semifinal 2: WB Finalist #2 vs Losers Runner-up (or different player)');
      
    } else {
      console.log('✅ No duplicate players detected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkDuplicateInSemifinals();
