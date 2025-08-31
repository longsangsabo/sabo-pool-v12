-- ===================================================================
-- 🧹 SABO POOL V12 - MIGRATION CLEANUP & SABO COMPATIBILITY
-- Cleanup old migrations và ensure SABO functions work với new schema
-- ===================================================================

BEGIN;

-- ===============================================
-- 📋 PHASE 1: VERIFY SABO FUNCTIONS COMPATIBILITY
-- ===============================================

-- Ensure SABO functions work with consolidated schema
-- Check if current SABO functions exist and are compatible

DO $$
DECLARE
  v_function_exists BOOLEAN;
  v_schema_compatible BOOLEAN := true;
BEGIN
  -- Check generate_sabo_tournament_bracket function
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_sabo_tournament_bracket'
  ) INTO v_function_exists;
  
  IF NOT v_function_exists THEN
    RAISE WARNING '⚠️ generate_sabo_tournament_bracket function not found - will create';
    v_schema_compatible := false;
  END IF;
  
  -- Check advance_sabo_tournament function  
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'advance_sabo_tournament'
  ) INTO v_function_exists;
  
  IF NOT v_function_exists THEN
    RAISE WARNING '⚠️ advance_sabo_tournament function not found - will create';
    v_schema_compatible := false;
  END IF;
  
  -- Check submit_sabo_match_score function
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'submit_sabo_match_score'
  ) INTO v_function_exists;
  
  IF NOT v_function_exists THEN
    RAISE WARNING '⚠️ submit_sabo_match_score function not found - will create';
    v_schema_compatible := false;
  END IF;
  
  IF v_schema_compatible THEN
    RAISE NOTICE '✅ All SABO functions found and compatible';
  ELSE
    RAISE NOTICE '🔧 Will create missing SABO functions';
  END IF;
END $$;

-- ===============================================
-- 📋 PHASE 2: ENSURE SABO FUNCTIONS EXIST
-- ===============================================

-- Create or update generate_sabo_tournament_bracket if needed
CREATE OR REPLACE FUNCTION generate_sabo_tournament_bracket(
  p_tournament_id UUID,
  p_seeding_method TEXT DEFAULT 'registration_order'
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  participants UUID[];
  match_counter INTEGER := 0;
  v_participant UUID;
  i INTEGER;
BEGIN
  -- Clear existing matches
  DELETE FROM tournament_matches WHERE tournament_id = p_tournament_id;
  
  -- Get 16 participants based on seeding method
  CASE p_seeding_method
    WHEN 'elo_ranking' THEN
      SELECT ARRAY_AGG(tr.user_id ORDER BY COALESCE(pr.elo_points, 1000) DESC) INTO participants
      FROM tournament_registrations tr
      LEFT JOIN player_rankings pr ON tr.user_id = pr.user_id
      WHERE tr.tournament_id = p_tournament_id 
        AND tr.registration_status = 'confirmed'
      LIMIT 16;
    WHEN 'random' THEN
      SELECT ARRAY_AGG(user_id ORDER BY RANDOM()) INTO participants
      FROM tournament_registrations 
      WHERE tournament_id = p_tournament_id
        AND registration_status = 'confirmed'
      LIMIT 16;
    ELSE -- registration_order (default)
      SELECT ARRAY_AGG(user_id ORDER BY created_at) INTO participants
      FROM tournament_registrations 
      WHERE tournament_id = p_tournament_id
        AND registration_status = 'confirmed'
      LIMIT 16;
  END CASE;
  
  IF array_length(participants, 1) != 16 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Requires exactly 16 participants, found: ' || COALESCE(array_length(participants, 1), 0)
    );
  END IF;
  
  -- WINNERS BRACKET
  -- Round 1: 8 matches (16→8)
  FOR i IN 1..8 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, 
      player1_id, player2_id, status
    ) VALUES (
      p_tournament_id, 1, i, 'winners',
      participants[i*2-1], participants[i*2], 'ready'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 2: 4 matches (8→4) - TBD participants
  FOR i IN 1..4 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, status
    ) VALUES (
      p_tournament_id, 2, i, 'winners', 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 3: 2 matches (4→2) - TBD participants  
  FOR i IN 1..2 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, status
    ) VALUES (
      p_tournament_id, 3, i, 'winners', 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- LOSERS BRANCH A (for R1 losers)
  -- Round 101: 4 matches (8→4)
  FOR i IN 1..4 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, branch_type, status
    ) VALUES (
      p_tournament_id, 101, i, 'losers', 'A', 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 102: 2 matches (4→2)
  FOR i IN 1..2 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, branch_type, status
    ) VALUES (
      p_tournament_id, 102, i, 'losers', 'A', 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 103: 1 match (2→1)
  INSERT INTO tournament_matches (
    tournament_id, round_number, match_number, bracket_type, branch_type, status
  ) VALUES (
    p_tournament_id, 103, 1, 'losers', 'A', 'pending'
  );
  match_counter := match_counter + 1;
  
  -- LOSERS BRANCH B (for R2 losers)
  -- Round 201: 2 matches (4→2)
  FOR i IN 1..2 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, branch_type, status
    ) VALUES (
      p_tournament_id, 201, i, 'losers', 'B', 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 202: 1 match (2→1)
  INSERT INTO tournament_matches (
    tournament_id, round_number, match_number, bracket_type, branch_type, status
  ) VALUES (
    p_tournament_id, 202, 1, 'losers', 'B', 'pending'
  );
  match_counter := match_counter + 1;
  
  -- FINALS
  -- Round 250: Semifinals (4→2) - 2 matches
  FOR i IN 1..2 LOOP
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, status
    ) VALUES (
      p_tournament_id, 250, i, 'semifinals', 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 300: Final (2→1) - 1 match
  INSERT INTO tournament_matches (
    tournament_id, round_number, match_number, bracket_type, status
  ) VALUES (
    p_tournament_id, 300, 1, 'finals', 'pending'
  );
  match_counter := match_counter + 1;
  
  -- Update tournament status
  UPDATE tournaments 
  SET status = 'ongoing', 
      bracket_generated = true,
      updated_at = NOW()
  WHERE id = p_tournament_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_matches', match_counter,
    'structure', 'SABO_compliant',
    'participants_seeded', array_length(participants, 1),
    'seeding_method', p_seeding_method
  );
END;
$$;

-- Create or update advance_sabo_tournament function
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
  v_advancement_result jsonb;
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

-- Helper function to assign participants to next matches
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
BEGIN
  -- Find the next available match in the round
  SELECT id INTO v_match_id
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = p_round_number
    AND (player1_id IS NULL OR player2_id IS NULL)
    AND status = 'pending'
  ORDER BY match_number
  LIMIT 1;
  
  IF v_match_id IS NOT NULL THEN
    -- Assign to empty slot
    UPDATE tournament_matches
    SET 
      player1_id = CASE WHEN player1_id IS NULL THEN p_participant_id ELSE player1_id END,
      player2_id = CASE WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN p_participant_id ELSE player2_id END,
      status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'ready' ELSE 'pending' END,
      updated_at = NOW()
    WHERE id = v_match_id;
  END IF;
END;
$$;
