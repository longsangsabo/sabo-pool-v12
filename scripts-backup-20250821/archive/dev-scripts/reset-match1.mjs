import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function resetMatch1() {
  console.log('🔄 Resetting Match 1 for testing...');
  
  const { data, error } = await supabase
    .from('tournament_matches')
    .update({ 
      status: 'ready',
      score_player1: null,
      score_player2: null,
      winner_id: null
    })
    .eq('tournament_id', 'adced892-a39f-483f-871e-aa0102735219')
    .eq('round_number', 1)
    .eq('match_number', 1)
    .select();
    
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Reset Match 1:', data?.[0]);
  }
}

resetMatch1();
