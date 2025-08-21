-- FIX ASSIGN_PARTICIPANT_TO_NEXT_MATCH FUNCTION
CREATE OR REPLACE FUNCTION assign_participant_to_next_match(
  p_tournament_id UUID,
  p_round_number INTEGER,
  p_participant_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id UUID;
  v_current_match RECORD;
BEGIN
  -- Find the next available match in the round
  SELECT id, player1_id, player2_id INTO v_match_id, v_current_match.player1_id, v_current_match.player2_id
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = p_round_number
    AND (player1_id IS NULL OR player2_id IS NULL)
    AND status = 'pending'
  ORDER BY match_number
  LIMIT 1;
  
  IF v_match_id IS NOT NULL THEN
    -- Check which slot is empty and assign correctly
    IF v_current_match.player1_id IS NULL THEN
      -- Assign to player1_id slot
      UPDATE tournament_matches
      SET 
        player1_id = p_participant_id,
        status = CASE WHEN player2_id IS NOT NULL THEN 'ready' ELSE 'pending' END,
        updated_at = NOW()
      WHERE id = v_match_id;
      
    ELSIF v_current_match.player2_id IS NULL THEN
      -- Assign to player2_id slot
      UPDATE tournament_matches
      SET 
        player2_id = p_participant_id,
        status = 'ready', -- Both players now assigned
        updated_at = NOW()
      WHERE id = v_match_id;
    END IF;
  END IF;
END;
$$;
