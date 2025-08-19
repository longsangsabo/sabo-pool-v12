-- Migration: Fix submit_sabo_match_score function column names
-- Date: 2025-08-19
-- Description: Update function to use correct column names (score_player1, score_player2)

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
  -- Get match details from tournament_matches table
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found in tournament_matches');
  END IF;
  
  v_tournament_id := v_match.tournament_id;
  
  -- Validate match status
  IF v_match.status NOT IN ('ready', 'in_progress', 'pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not ready for score submission. Status: ' || v_match.status);
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
  
  -- Update match with scores using CORRECT column names
  UPDATE tournament_matches 
  SET 
    score_player1 = p_player1_score,
    score_player2 = p_player2_score,
    winner_id = v_winner_id,
    loser_id = CASE 
      WHEN v_winner_id = v_match.player1_id THEN v_match.player2_id 
      ELSE v_match.player1_id 
    END,
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;
  
  -- Create match results log if match_results table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_results') THEN
    INSERT INTO match_results (
      match_id, player_id, result, elo_before, elo_after, spa_points_earned
    ) VALUES 
      (p_match_id, v_winner_id, 'win', 1000, 1000, 100),
      (p_match_id, CASE WHEN v_winner_id = v_match.player1_id THEN v_match.player2_id ELSE v_match.player1_id END, 'loss', 1000, 1000, 0)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Score submitted successfully',
    'match_id', p_match_id,
    'winner_id', v_winner_id,
    'scores', jsonb_build_object(
      'player1_score', p_player1_score,
      'player2_score', p_player2_score
    )
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
GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO service_role;

-- Add comment
COMMENT ON FUNCTION submit_sabo_match_score IS 'Submit SABO match score - Uses tournament_matches table with correct column names (score_player1, score_player2)';

-- Verify function creation
SELECT 'submit_sabo_match_score function updated with correct column names' AS migration_status;
