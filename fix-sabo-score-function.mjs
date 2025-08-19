-- Test and fix SABO score submission function
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSABOScoreFunction() {
  console.log('🔧 Fixing SABO score submission function...');
  
  const functionSQL = `
-- Drop existing function
DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER, UUID);

-- Create corrected submit_sabo_match_score function
CREATE OR REPLACE FUNCTION submit_sabo_match_score(
  p_match_id UUID,
  p_player1_score INTEGER,
  p_player2_score INTEGER,
  p_submitted_by UUID DEFAULT NULL
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_winner_id UUID;
  v_advancement_result jsonb;
  v_tournament_id UUID;
BEGIN
  -- Get match details from SABO table
  SELECT * INTO v_match FROM sabo_tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;
  
  v_tournament_id := v_match.tournament_id;
  
  -- Validate match status
  IF v_match.status NOT IN ('ready', 'in_progress', 'pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not ready for score submission');
  END IF;
  
  -- Validate scores
  IF p_player1_score < 0 OR p_player2_score < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid scores - must be non-negative');
  END IF;
  
  IF p_player1_score = p_player2_score THEN
    RETURN jsonb_build_object('success', false, 'error', 'SABO matches cannot be ties');
  END IF;
  
  -- Determine winner
  v_winner_id := CASE 
    WHEN p_player1_score > p_player2_score THEN v_match.player1_id
    ELSE v_match.player2_id
  END;
  
  -- Update match with scores in SABO table with correct column names
  UPDATE sabo_tournament_matches 
  SET 
    player1_score = p_player1_score,
    player2_score = p_player2_score,
    winner_id = v_winner_id,
    status = 'completed',
    score_input_by = p_submitted_by,
    score_submitted_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Score submitted successfully - function updated to use sabo_tournament_matches',
    'scores_updated', true,
    'winner_id', v_winner_id,
    'match_completed', true,
    'player1_score', p_player1_score,
    'player2_score', p_player2_score
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'match_id', p_match_id
    );
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO authenticated;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    
    if (error) {
      console.error('❌ Failed to update function:', error);
      return false;
    }
    
    console.log('✅ SABO score function updated successfully');
    return true;
  } catch (err) {
    console.error('❌ Error updating function:', err);
    return false;
  }
}

async function testFunction() {
  console.log('🧪 Testing updated function...');
  
  // Get a test match first
  const { data: matches, error: matchError } = await supabase
    .from('sabo_tournament_matches')
    .select('*')
    .limit(1);
    
  if (matchError || !matches?.length) {
    console.log('⚠️ No SABO matches found for testing');
    return;
  }
  
  const testMatch = matches[0];
  console.log('🎯 Testing with match:', testMatch.id);
  
  // Try the function
  const { data: result, error } = await supabase.rpc('submit_sabo_match_score', {
    p_match_id: testMatch.id,
    p_player1_score: 5,
    p_player2_score: 3,
    p_submitted_by: null
  });
  
  if (error) {
    console.error('❌ Function test failed:', error);
  } else {
    console.log('✅ Function test result:', result);
  }
}

// Run the fix
fixSABOScoreFunction().then(success => {
  if (success) {
    testFunction();
  }
});
