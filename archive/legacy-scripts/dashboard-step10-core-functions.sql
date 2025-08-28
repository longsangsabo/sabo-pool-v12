-- ===================================================================
-- ⚡ STEP 10: ADVANCEMENT & SCORE FUNCTIONS - Paste vào Supabase Dashboard
-- Core SABO logic for advancement và score submission
-- ===================================================================

-- ▶️ ADVANCE SABO TOURNAMENT
CREATE OR REPLACE FUNCTION advance_sabo_tournament(
  p_match_id UUID,
  p_winner_id UUID
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_loser_id UUID;
  v_tournament_complete BOOLEAN := FALSE;
BEGIN
  -- Get match details
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;
  
  -- Validate winner is actually in the match
  IF p_winner_id NOT IN (v_match.player1_id, v_match.player2_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid winner for this match');
  END IF;
  
  -- Determine loser
  v_loser_id := CASE 
    WHEN p_winner_id = v_match.player1_id THEN v_match.player2_id
    ELSE v_match.player1_id
  END;
  
  -- Update match with winner
  UPDATE tournament_matches 
  SET winner_id = p_winner_id, 
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_match_id;
  
  -- SABO advancement logic based on round_number
  CASE v_match.round_number
    -- WINNERS BRACKET
    WHEN 1 THEN
      -- Advance winner to R2, loser to Losers Branch A
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 2, p_winner_id);
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 101, v_loser_id);
      
    WHEN 2 THEN  
      -- Advance winner to R3, loser to Losers Branch B
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 3, p_winner_id);
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 201, v_loser_id);
      
    WHEN 3 THEN
      -- Advance winner to Semifinals
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 250, p_winner_id);
      -- Loser eliminated
      
    -- LOSERS BRANCH A  
    WHEN 101 THEN
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 102, p_winner_id);
      -- Loser eliminated
      
    WHEN 102 THEN
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 103, p_winner_id);
      -- Loser eliminated
      
    WHEN 103 THEN
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 250, p_winner_id);
      -- Loser eliminated
      
    -- LOSERS BRANCH B
    WHEN 201 THEN
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 202, p_winner_id);
      -- Loser eliminated
      
    WHEN 202 THEN
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 250, p_winner_id);
      -- Loser eliminated
      
    -- SEMIFINALS  
    WHEN 250 THEN
      PERFORM assign_participant_to_next_match(v_match.tournament_id, 300, p_winner_id);
      -- Loser eliminated
      
    -- FINAL
    WHEN 300 THEN
      -- Tournament complete, winner is champion
      UPDATE tournaments 
      SET status = 'completed', 
          winner_id = p_winner_id,
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = v_match.tournament_id;
      v_tournament_complete := TRUE;
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid SABO round: ' || v_match.round_number);
  END CASE;
  
  RETURN jsonb_build_object(
    'success', true,
    'winner_advanced', true,
    'round_completed', v_match.round_number,
    'tournament_complete', v_tournament_complete
  );
END;
$$;

-- ⚽ SUBMIT SABO MATCH SCORE
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
  -- Get match details
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;
  
  v_tournament_id := v_match.tournament_id;
  
  -- Validate match status
  IF v_match.status NOT IN ('ready', 'in_progress') THEN
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
  
  -- Update match with scores
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
  
  -- Trigger SABO advancement
  SELECT advance_sabo_tournament(p_match_id, v_winner_id) INTO v_advancement_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'scores_updated', true,
    'winner_id', v_winner_id,
    'match_completed', true,
    'advancement', v_advancement_result
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

SELECT '✅ advance_sabo_tournament and submit_sabo_match_score functions created' as status;
