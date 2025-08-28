-- ============================================================================
-- 🚀 SIMPLE TOURNAMENT SCORE SUBMISSION - MINIMAL VERSION
-- Chỉ tạo function cần thiết để submit score, không có trigger conflict
-- ============================================================================

-- 1. SIMPLE SUBMIT SCORE FUNCTION (No automatic advancement)
CREATE OR REPLACE FUNCTION submit_match_score(
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
BEGIN
  -- Get match details
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;
  
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
  
  -- Simple UPDATE without ON CONFLICT
  UPDATE tournament_matches 
  SET 
    score_player1 = p_player1_score,
    score_player2 = p_player2_score,
    winner_id = v_winner_id,
    status = 'completed',
    score_input_by = p_submitted_by,
    score_submitted_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'success', true,
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

-- 2. UPDATED_AT TRIGGER (Simple version)
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE FUNCTION update_tournaments_updated_at();

CREATE TRIGGER tournament_matches_updated_at 
    BEFORE UPDATE ON tournament_matches 
    FOR EACH ROW EXECUTE FUNCTION update_tournaments_updated_at();

SELECT '✅ Simple tournament score function created successfully!' as status;
