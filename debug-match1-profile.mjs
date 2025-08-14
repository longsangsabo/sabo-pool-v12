import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugMatch1Profile() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔍 Deep debug Match 1 profile issue...');
  
  // Get Match 1
  const { data: match1, error: matchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .eq('match_number', 1)
    .single();
    
  if (matchError) {
    console.error('❌ Match error:', matchError);
    return;
  }
  
  console.log('🎯 Match 1 player IDs:');
  console.log('- player1_id:', match1.player1_id);
  console.log('- player2_id:', match1.player2_id);
  
  // Test profile fetch for both players using exact same query as useProfileCache
  console.log('\n👤 Testing profile queries...');
  
  // Player 1 profile
  const { data: player1Profile, error: p1Error } = await supabase
    .from('profiles')
    .select('user_id, full_name, display_name, avatar_url, verified_rank')
    .eq('user_id', match1.player1_id)
    .single();
    
  console.log('Player 1 profile fetch result:');
  if (p1Error) {
    console.error('❌ Error:', p1Error);
  } else {
    console.log('✅ Success:', {
      user_id: player1Profile?.user_id,
      full_name: player1Profile?.full_name,
      display_name: player1Profile?.display_name,
      display_name_type: typeof player1Profile?.display_name,
      display_name_length: player1Profile?.display_name?.length,
      display_name_truthy: !!player1Profile?.display_name,
      avatar_url: player1Profile?.avatar_url,
      verified_rank: player1Profile?.verified_rank
    });
  }
  
  // Player 2 profile for comparison
  const { data: player2Profile, error: p2Error } = await supabase
    .from('profiles')
    .select('user_id, full_name, display_name, avatar_url, verified_rank')
    .eq('user_id', match1.player2_id)
    .single();
    
  console.log('\nPlayer 2 profile fetch result:');
  if (p2Error) {
    console.error('❌ Error:', p2Error);
  } else {
    console.log('✅ Success:', {
      user_id: player2Profile?.user_id,
      full_name: player2Profile?.full_name,
      display_name: player2Profile?.display_name,
      display_name_type: typeof player2Profile?.display_name,
      display_name_length: player2Profile?.display_name?.length,
      display_name_truthy: !!player2Profile?.display_name,
      avatar_url: player2Profile?.avatar_url,
      verified_rank: player2Profile?.verified_rank
    });
  }
  
  // Test the exact query useSABOTournamentMatches uses
  console.log('\n🔄 Testing SABO matches query...');
  const { data: saboMatches, error: saboError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .in('round_number', [1])
    .eq('match_number', 1);
    
  if (saboError) {
    console.error('❌ SABO query error:', saboError);
  } else {
    console.log('✅ SABO query success:');
    console.log('Match data:', {
      id: saboMatches?.[0]?.id,
      player1_id: saboMatches?.[0]?.player1_id,
      player2_id: saboMatches?.[0]?.player2_id,
      match_number: saboMatches?.[0]?.match_number,
      round_number: saboMatches?.[0]?.round_number
    });
  }
}

debugMatch1Profile();
