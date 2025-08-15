import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testScoreSubmission() {
  console.log('🧪 Testing SABO score submission function...');
  
  // Get a real user ID from registrations
  const { data: registration } = await supabase
    .from('tournament_registrations')
    .select('user_id')
    .eq('tournament_id', 'adced892-a39f-483f-871e-aa0102735219')
    .limit(1)
    .single();
    
  if (!registration) {
    console.log('❌ No registrations found');
    return;
  }
  
  console.log('📋 Using real user ID:', registration.user_id);
  
  // Get the first match from Round 1
  const { data: match, error: matchError } = await supabase
    .from('tournament_matches')
    .select('id, match_number, player1_id, player2_id, status')
    .eq('tournament_id', 'adced892-a39f-483f-871e-aa0102735219')
    .eq('round_number', 1)
    .eq('match_number', 1)
    .single();
    
  if (matchError) {
    console.error('❌ Match error:', matchError);
    return;
  }
  
  console.log('🎯 Testing with Match 1:', {
    id: match.id,
    status: match.status,
    hasPlayer1: !!match.player1_id,
    hasPlayer2: !!match.player2_id
  });
  
  // Test the RPC function with real user ID
  console.log('\n🔍 Testing submit_sabo_match_score RPC function...');
  try {
    const { data, error } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: match.id,
      p_player1_score: 10,
      p_player2_score: 8,
      p_submitted_by: registration.user_id
    });
    
    console.log('RPC Response:', { data, error });
    
    if (error) {
      console.error('❌ RPC Error:', error);
      console.log('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ RPC Success:', data);
    }
  } catch (e) {
    console.error('❌ Exception:', e);
  }
}

testScoreSubmission();
