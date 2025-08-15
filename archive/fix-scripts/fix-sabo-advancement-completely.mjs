import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixSABOAdvancementCompletely() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🚀 COMPREHENSIVE SABO ADVANCEMENT FIX');
  console.log('====================================\n');
  
  console.log('STEP 1: Cleaning up duplicate/incorrect player assignments...');
  
  // Clean up Round 3 duplicate issues
  console.log('🔧 Fixing Round 3 matches...');
  
  // Reset Round 3 to clean state first
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: null,
      player2_id: null,
      status: 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournamentId)
    .eq('round_number', 3);
    
  // Reset Losers Branch B to clean state
  await supabase
    .from('tournament_matches')
    .update({
      player1_id: null,
      player2_id: null,
      status: 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournamentId)
    .eq('round_number', 201);
  
  console.log('✅ Cleared Round 3 and Losers Branch B');
  
  console.log('\nSTEP 2: Manually implementing correct SABO advancement...');
  
  // Get all completed Round 2 matches
  const { data: round2Matches } = await supabase
    .from('tournament_matches')
    .select('match_number, winner_id, player1_id, player2_id')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 2)
    .eq('status', 'completed')
    .order('match_number');
    
  console.log(`📊 Found ${round2Matches?.length || 0} completed Round 2 matches`);
  
  if (round2Matches && round2Matches.length > 0) {
    // Collect winners and losers
    const winners = [];
    const losers = [];
    
    round2Matches.forEach(match => {
      if (match.winner_id) {
        winners.push(match.winner_id);
        const loserId = match.winner_id === match.player1_id ? match.player2_id : match.player1_id;
        losers.push(loserId);
      }
    });
    
    console.log(`🏆 Winners to advance to Round 3: ${winners.length}`);
    console.log(`💔 Losers to advance to Losers Branch B: ${losers.length}`);
    
    // Manually assign winners to Round 3
    console.log('\n🎯 Assigning winners to Round 3...');
    for (let i = 0; i < winners.length; i += 2) {
      const winner1 = winners[i];
      const winner2 = winners[i + 1];
      const matchNumber = Math.floor(i / 2) + 13; // Round 3 starts at match 13
      
      if (winner1 && winner2) {
        await supabase
          .from('tournament_matches')
          .update({
            player1_id: winner1,
            player2_id: winner2,
            status: 'ready',
            updated_at: new Date().toISOString()
          })
          .eq('tournament_id', tournamentId)
          .eq('match_number', matchNumber);
          
        console.log(`✅ Match ${matchNumber}: ${winner1.substring(0,8)}... vs ${winner2.substring(0,8)}...`);
      } else if (winner1) {
        await supabase
          .from('tournament_matches')
          .update({
            player1_id: winner1,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('tournament_id', tournamentId)
          .eq('match_number', matchNumber);
          
        console.log(`⏳ Match ${matchNumber}: ${winner1.substring(0,8)}... vs TBD`);
      }
    }
    
    // Manually assign losers to Losers Branch B (Round 201)
    console.log('\n💔 Assigning losers to Losers Branch B (Round 201)...');
    for (let i = 0; i < losers.length; i += 2) {
      const loser1 = losers[i];
      const loser2 = losers[i + 1];
      const matchNumber = Math.floor(i / 2) + 23; // Losers Branch B starts at match 23
      
      if (loser1 && loser2) {
        await supabase
          .from('tournament_matches')
          .update({
            player1_id: loser1,
            player2_id: loser2,
            status: 'ready',
            updated_at: new Date().toISOString()
          })
          .eq('tournament_id', tournamentId)
          .eq('match_number', matchNumber);
          
        console.log(`✅ Match ${matchNumber}: ${loser1.substring(0,8)}... vs ${loser2.substring(0,8)}...`);
      } else if (loser1) {
        await supabase
          .from('tournament_matches')
          .update({
            player1_id: loser1,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('tournament_id', tournamentId)
          .eq('match_number', matchNumber);
          
        console.log(`⏳ Match ${matchNumber}: ${loser1.substring(0,8)}... vs TBD`);
      }
    }
  }
  
  console.log('\nSTEP 3: Verification...');
  
  // Verify Round 3
  const { data: round3Verification } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id, status')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 3)
    .order('match_number');
    
  console.log('\n🏆 Round 3 Status:');
  round3Verification?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    const p1Display = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
    const p2Display = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
    console.log(`  Match ${match.match_number}: ${p1Display} vs ${p2Display} | Status: ${match.status}`);
  });
  
  // Verify Losers Branch B
  const { data: losersR201Verification } = await supabase
    .from('tournament_matches')
    .select('match_number, player1_id, player2_id, status')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 201)
    .order('match_number');
    
  console.log('\n💔 Losers Branch B (Round 201) Status:');
  losersR201Verification?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    const p1Display = match.player1_id ? match.player1_id.substring(0,8) + '...' : 'TBD';
    const p2Display = match.player2_id ? match.player2_id.substring(0,8) + '...' : 'TBD';
    console.log(`  Match ${match.match_number}: ${p1Display} vs ${p2Display} | Status: ${match.status}`);
  });
  
  console.log('\n🎉 SABO ADVANCEMENT FIX COMPLETED!');
  console.log('Players should now advance correctly according to SABO Double Elimination rules.');
}

fixSABOAdvancementCompletely();
