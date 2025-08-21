-- SABO POOL V12 - Fix generate_sabo_tournament_bracket function
-- Remove reference to non-existent bracket_generated column

BEGIN;

-- Drop and recreate the function without bracket_generated reference
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
  
  -- Update tournament status (without bracket_generated column)
  UPDATE tournaments 
  SET status = 'ongoing',
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

-- Verify function was created
SELECT 'generate_sabo_tournament_bracket function updated successfully' as status;

COMMIT;
