// Quick fix for SABO score function using SQL
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSABOScoreFunction() {
  console.log('🔧 Fixing SABO score submission function...');
  
  // First, drop the old function
  const dropSQL = `DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER, UUID);`;
  
  const { error: dropError } = await supabase.rpc('exec', { sql: dropSQL });
  if (dropError) {
    console.log('⚠️ Drop function error (may not exist):', dropError.message);
  }
  
  // Create the new function
  const createSQL = `
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
  v_tournament_id UUID;
BEGIN
  -- Get match details from SABO table
  SELECT * INTO v_match FROM sabo_tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found in sabo_tournament_matches');
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
    'message', 'Score submitted successfully to sabo_tournament_matches',
    'scores_updated', true,
    'winner_id', v_winner_id,
    'match_completed', true,
    'player1_score', p_player1_score,
    'player2_score', p_player2_score,
    'table_used', 'sabo_tournament_matches'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'match_id', p_match_id,
      'table_used', 'sabo_tournament_matches'
    );
END;
$$;`;

  const { error: createError } = await supabase.rpc('exec', { sql: createSQL });
  
  if (createError) {
    console.error('❌ Failed to create function:', createError);
    return false;
  }
  
  console.log('✅ SABO score function created successfully');
  
  // Grant permissions
  const grantSQL = `GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO authenticated;`;
  const { error: grantError } = await supabase.rpc('exec', { sql: grantSQL });
  
  if (grantError) {
    console.error('⚠️ Grant permission error:', grantError.message);
  } else {
    console.log('✅ Permissions granted');
  }
  
  return true;
}

// Run the fix
fixSABOScoreFunction().then(success => {
  if (success) {
    console.log('🎉 Function fix completed successfully');
  } else {
    console.log('❌ Function fix failed');
  }
  process.exit(success ? 0 : 1);
});
