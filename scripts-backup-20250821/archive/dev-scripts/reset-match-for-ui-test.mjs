import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function resetMatchForTesting() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  const testMatch = 10; // Test a fresh match
  
  console.log('🔧 Resetting Match 10 for UI testing...\n');
  
  // Reset match status
  await supabase
    .from('tournament_matches')
    .update({
      status: 'ready',
      score_player1: null,
      score_player2: null,
      winner_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch);
    
  // Get match details for verification
  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('match_number', testMatch)
    .single();
    
  console.log(`✅ Match ${testMatch} Reset Complete:`);
  console.log(`- ID: ${match?.id}`);
  console.log(`- Status: ${match?.status}`);
  console.log(`- Player 1: ${match?.player1_id?.substring(0,8)}...`);
  console.log(`- Player 2: ${match?.player2_id?.substring(0,8)}...`);
  console.log(`- Scores: ${match?.score_player1 || 'null'} - ${match?.score_player2 || 'null'}`);
  console.log(`- Winner: ${match?.winner_id || 'None'}`);
  
  console.log('\n🚀 Ready for UI testing!');
  console.log('Go to localhost:8083 and try to submit score for Match 10');
}

resetMatchForTesting();
