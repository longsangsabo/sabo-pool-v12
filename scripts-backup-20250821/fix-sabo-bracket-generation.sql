-- 🔧 FIX SABO BRACKET GENERATION - Add sabo_match_id field
-- This fixes the NOT NULL constraint violation on sabo_match_id

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
  i INTEGER;
  v_sabo_match_id TEXT;
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
    ELSE
      SELECT ARRAY_AGG(tr.user_id ORDER BY tr.created_at) INTO participants
      FROM tournament_registrations tr
      WHERE tr.tournament_id = p_tournament_id 
      AND tr.registration_status = 'confirmed'
      LIMIT 16;
  END CASE;
  
  -- Validate we have exactly 16 participants
  IF array_length(participants, 1) != 16 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SABO tournament requires exactly 16 participants, found: ' || COALESCE(array_length(participants, 1), 0)
    );
  END IF;
  
  -- WINNERS BRACKET
  -- Round 1: 8 matches (16→8)
  FOR i IN 1..8 LOOP
    v_sabo_match_id := 'WR1M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, 
      sabo_match_id, player1_id, player2_id, status
    ) VALUES (
      p_tournament_id, 1, i, 'winners',
      v_sabo_match_id, participants[i*2-1], participants[i*2], 'ready'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 2: 4 matches (8→4) - TBD participants
  FOR i IN 1..4 LOOP
    v_sabo_match_id := 'WR2M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, sabo_match_id, status
    ) VALUES (
      p_tournament_id, 2, i, 'winners', v_sabo_match_id, 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 3: 2 matches (4→2) - TBD participants  
  FOR i IN 1..2 LOOP
    v_sabo_match_id := 'WR3M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, sabo_match_id, status
    ) VALUES (
      p_tournament_id, 3, i, 'winners', v_sabo_match_id, 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- LOSERS BRANCH A (for R1 losers)
  -- Round 101: 4 matches (8→4)
  FOR i IN 1..4 LOOP
    v_sabo_match_id := 'LAR101M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, branch_type, sabo_match_id, status
    ) VALUES (
      p_tournament_id, 101, i, 'losers', 'A', v_sabo_match_id, 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 102: 2 matches (4→2)
  FOR i IN 1..2 LOOP
    v_sabo_match_id := 'LAR102M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, branch_type, sabo_match_id, status
    ) VALUES (
      p_tournament_id, 102, i, 'losers', 'A', v_sabo_match_id, 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 103: 1 match (2→1)
  v_sabo_match_id := 'LAR103M1';
  INSERT INTO tournament_matches (
    tournament_id, round_number, match_number, bracket_type, branch_type, sabo_match_id, status
  ) VALUES (
    p_tournament_id, 103, 1, 'losers', 'A', v_sabo_match_id, 'pending'
  );
  match_counter := match_counter + 1;
  
  -- LOSERS BRANCH B (for R2 losers)
  -- Round 201: 2 matches (4→2)
  FOR i IN 1..2 LOOP
    v_sabo_match_id := 'LBR201M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, branch_type, sabo_match_id, status
    ) VALUES (
      p_tournament_id, 201, i, 'losers', 'B', v_sabo_match_id, 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 202: 1 match (2→1)
  v_sabo_match_id := 'LBR202M1';
  INSERT INTO tournament_matches (
    tournament_id, round_number, match_number, bracket_type, branch_type, sabo_match_id, status
  ) VALUES (
    p_tournament_id, 202, 1, 'losers', 'B', v_sabo_match_id, 'pending'
  );
  match_counter := match_counter + 1;
  
  -- FINALS
  -- Round 250: Semifinals (4→2) - 2 matches
  FOR i IN 1..2 LOOP
    v_sabo_match_id := 'FR250M' || i;
    INSERT INTO tournament_matches (
      tournament_id, round_number, match_number, bracket_type, sabo_match_id, status
    ) VALUES (
      p_tournament_id, 250, i, 'semifinals', v_sabo_match_id, 'pending'
    );
    match_counter := match_counter + 1;
  END LOOP;
  
  -- Round 300: Final (2→1) - 1 match
  v_sabo_match_id := 'FR300M1';
  INSERT INTO tournament_matches (
    tournament_id, round_number, match_number, bracket_type, sabo_match_id, status
  ) VALUES (
    p_tournament_id, 300, 1, 'finals', v_sabo_match_id, 'pending'
  );
  match_counter := match_counter + 1;
  
  -- Update tournament status
  UPDATE tournaments 
  SET status = 'ongoing',
      updated_at = NOW()
  WHERE id = p_tournament_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_matches', match_counter,
    'structure', 'SABO_compliant_with_match_ids',
    'participants_seeded', array_length(participants, 1),
    'seeding_method', p_seeding_method,
    'message', 'SABO tournament bracket generated successfully with proper match IDs'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'participants_found', COALESCE(array_length(participants, 1), 0)
    );
END;
$$;

-- Test the function
SELECT 'SABO bracket generation function updated with sabo_match_id support' as status;
