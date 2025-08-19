const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL');
const serviceKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceKey);

async function testRealSABOScore() {
  try {
    console.log('🎯 Testing SABO score submission with real match...');
    
    // Find a match that has both players
    const { data: readyMatches, error } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, round_number, match_number, player1_id, player2_id, status, bracket_type')
      .not('player1_id', 'is', null)
      .not('player2_id', 'is', null)
      .eq('status', 'pending')
      .limit(1);
      
    if (error || !readyMatches || readyMatches.length === 0) {
      console.log('❌ No ready matches found:', error?.message || 'No matches with both players');
      return;
    }
    
    const match = readyMatches[0];
    console.log('🏆 Found ready match:', {
      id: match.id.substring(0, 8) + '...',
      round: match.round_number,
      match: match.match_number,
      bracket: match.bracket_type,
      status: match.status
    });
    
    // Get a test user ID
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    const userId = users?.[0]?.id || '18f49e79-f402-46d1-90be-889006e9761c';
    
    console.log('\n🎮 Testing score submission...');
    const { data: result, error: submitError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: match.id,
      p_player1_score: 3,
      p_player2_score: 1,
      p_submitted_by: userId
    });
    
    if (submitError) {
      console.log('❌ Score submission error:', submitError.message);
    } else {
      console.log('✅ Score submission result:', result);
      
      // Check if match was updated
      const { data: updatedMatch } = await supabase
        .from('tournament_matches')
        .select('id, status, player1_score, player2_score, winner_id')
        .eq('id', match.id)
        .single();
        
      console.log('📋 Updated match:', updatedMatch);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testRealSABOScore();
