-- Fix RPC function to use correct table name: tournament_matches instead of sabo_tournament_matches
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER, UUID);

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
  -- Get match details from tournament_matches table (CORRECTED)
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found in tournament_matches');
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
  
  -- Update match with scores in tournament_matches table (CORRECTED)
  UPDATE tournament_matches 
  SET 
    score_player1 = p_player1_score,
    score_player2 = p_player2_score,
    winner_id = v_winner_id,
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW(),
    score_input_by = p_submitted_by
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Score submitted successfully to tournament_matches',
    'scores_updated', true,
    'winner_id', v_winner_id,
    'match_completed', true,
    'player1_score', p_player1_score,
    'player2_score', p_player2_score,
    'table_used', 'tournament_matches'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'match_id', p_match_id,
      'table_used', 'tournament_matches'
    );
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO authenticated;

-- Test the function
SELECT '✅ submit_sabo_match_score function updated to use tournament_matches table' as status;
