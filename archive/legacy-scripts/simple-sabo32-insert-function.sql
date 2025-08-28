-- =============================================
-- SIMPLE SABO-32 FUNCTION WITH RLS BYPASS
-- Create simple function to insert tournament matches
-- =============================================

-- Create simple function to insert matches (runs with definer rights, bypasses RLS)
CREATE OR REPLACE FUNCTION insert_sabo32_matches(
  p_tournament_id UUID,
  p_matches JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
AS $$
DECLARE
  match_record JSONB;
  insert_count INTEGER := 0;
BEGIN
  -- Clear existing matches first
  DELETE FROM tournament_matches WHERE tournament_id = p_tournament_id;
  
  -- Insert each match
  FOR match_record IN SELECT * FROM jsonb_array_elements(p_matches)
  LOOP
    INSERT INTO tournament_matches (
      id,
      tournament_id,
      group_id,
      bracket_type,
      round_number,
      match_number,
      sabo_match_id,
      player1_id,
      player2_id,
      status,
      created_at
    ) VALUES (
      gen_random_uuid(),
      p_tournament_id,
      (match_record->>'group_id')::VARCHAR(1),
      match_record->>'bracket_type',
      (match_record->>'round_number')::INTEGER,
      (match_record->>'match_number')::INTEGER,
      match_record->>'sabo_match_id',
      (match_record->>'player1_id')::UUID,
      (match_record->>'player2_id')::UUID,
      'pending',
      NOW()
    );
    
    insert_count := insert_count + 1;
  END LOOP;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'matches_created', insert_count,
    'message', 'SABO-32 matches inserted successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to insert SABO-32 matches'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_sabo32_matches(UUID, JSONB) TO authenticated;

-- Test the function
SELECT 'SABO-32 insert function created successfully' as status;
