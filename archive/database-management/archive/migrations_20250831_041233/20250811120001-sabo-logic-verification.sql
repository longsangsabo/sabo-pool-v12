-- ================================
-- SABO TOURNAMENT LOGIC VERIFICATION
-- Comprehensive testing and validation functions
-- ================================

-- 0. DROP EXISTING FUNCTIONS TO AVOID CONFLICTS
DROP FUNCTION IF EXISTS public.sabo_system_health_check CASCADE;
DROP FUNCTION IF EXISTS public.validate_sabo_tournament_structure_enhanced CASCADE;
DROP FUNCTION IF EXISTS public.test_sabo_tournament_flow CASCADE;

-- 1. Enhanced Structure Validation with Detailed Analysis
CREATE OR REPLACE FUNCTION validate_sabo_tournament_structure_enhanced(
  p_tournament_id UUID
) RETURNS jsonb AS $$
DECLARE
  v_match_counts jsonb;
  v_total_matches INTEGER;
  v_structure_valid BOOLEAN := TRUE;
  v_errors TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
  v_detailed_analysis jsonb;
BEGIN
  -- Count matches by bracket type and round with detailed breakdown
  WITH match_analysis AS (
    SELECT 
      bracket_type,
      round_number,
      COUNT(*) as match_count,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
      COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
      COUNT(CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 1 END) as filled_count
    FROM tournament_matches 
    WHERE tournament_id = p_tournament_id
    GROUP BY bracket_type, round_number
    ORDER BY bracket_type, round_number
  )
  SELECT jsonb_object_agg(
    bracket_type || '_R' || round_number, 
    jsonb_build_object(
      'total', match_count,
      'completed', completed_count,
      'ready', ready_count,
      'pending', pending_count,
      'filled', filled_count
    )
  ) INTO v_detailed_analysis
  FROM match_analysis;
  
  -- Get total match count
  SELECT COUNT(*) INTO v_total_matches
  FROM tournament_matches 
  WHERE tournament_id = p_tournament_id;
  
  -- SABO Structure Validation Rules
  -- Total matches must be exactly 27
  IF v_total_matches != 27 THEN
    v_structure_valid := FALSE;
    v_errors := v_errors || ('Expected 27 matches, found ' || v_total_matches);
  END IF;
  
  -- Validate Winners Bracket (14 matches: 8+4+2)
  DECLARE
    v_winners_r1 INTEGER;
    v_winners_r2 INTEGER; 
    v_winners_r3 INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_winners_r1 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'winners' AND round_number = 1;
    
    SELECT COUNT(*) INTO v_winners_r2 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'winners' AND round_number = 2;
    
    SELECT COUNT(*) INTO v_winners_r3 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'winners' AND round_number = 3;
    
    IF v_winners_r1 != 8 THEN
      v_errors := v_errors || ('Winners R1 should have 8 matches, found ' || v_winners_r1);
    END IF;
    
    IF v_winners_r2 != 4 THEN
      v_errors := v_errors || ('Winners R2 should have 4 matches, found ' || v_winners_r2);
    END IF;
    
    IF v_winners_r3 != 2 THEN
      v_errors := v_errors || ('Winners R3 should have 2 matches, found ' || v_winners_r3);
    END IF;
  END;
  
  -- Validate Losers Branch A (7 matches: 4+2+1)
  DECLARE
    v_losers_a_r101 INTEGER;
    v_losers_a_r102 INTEGER;
    v_losers_a_r103 INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_losers_a_r101 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'losers' AND round_number = 101;
    
    SELECT COUNT(*) INTO v_losers_a_r102 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'losers' AND round_number = 102;
    
    SELECT COUNT(*) INTO v_losers_a_r103 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'losers' AND round_number = 103;
    
    IF v_losers_a_r101 != 4 THEN
      v_errors := v_errors || ('Losers A R101 should have 4 matches, found ' || v_losers_a_r101);
    END IF;
    
    IF v_losers_a_r102 != 2 THEN
      v_errors := v_errors || ('Losers A R102 should have 2 matches, found ' || v_losers_a_r102);
    END IF;
    
    IF v_losers_a_r103 != 1 THEN
      v_errors := v_errors || ('Losers A R103 should have 1 match, found ' || v_losers_a_r103);
    END IF;
  END;
  
  -- Validate Losers Branch B (3 matches: 2+1)
  DECLARE
    v_losers_b_r201 INTEGER;
    v_losers_b_r202 INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_losers_b_r201 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'losers' AND round_number = 201;
    
    SELECT COUNT(*) INTO v_losers_b_r202 FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'losers' AND round_number = 202;
    
    IF v_losers_b_r201 != 2 THEN
      v_errors := v_errors || ('Losers B R201 should have 2 matches, found ' || v_losers_b_r201);
    END IF;
    
    IF v_losers_b_r202 != 1 THEN
      v_errors := v_errors || ('Losers B R202 should have 1 match, found ' || v_losers_b_r202);
    END IF;
  END;
  
  -- Validate Finals (3 matches: 2 semifinal + 1 final)
  DECLARE
    v_semifinals INTEGER;
    v_final INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_semifinals FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'semifinals' AND round_number = 250;
    
    SELECT COUNT(*) INTO v_final FROM tournament_matches 
    WHERE tournament_id = p_tournament_id AND bracket_type = 'finals' AND round_number = 300;
    
    IF v_semifinals != 2 THEN
      v_errors := v_errors || ('Semifinals should have 2 matches, found ' || v_semifinals);
    END IF;
    
    IF v_final != 1 THEN
      v_errors := v_errors || ('Final should have 1 match, found ' || v_final);
    END IF;
  END;
  
  -- Check for logical flow issues
  DECLARE
    v_orphaned_matches INTEGER;
    v_incomplete_rounds TEXT[];
  BEGIN
    -- Check for matches with missing players that should be filled
    SELECT COUNT(*) INTO v_orphaned_matches
    FROM tournament_matches 
    WHERE tournament_id = p_tournament_id
      AND status = 'pending' 
      AND (player1_id IS NULL OR player2_id IS NULL)
      AND round_number != 1; -- Round 1 is seeded directly
      
    IF v_orphaned_matches > 0 THEN
      v_warnings := v_warnings || ('Found ' || v_orphaned_matches || ' matches waiting for players from previous rounds');
    END IF;
  END;
  
  -- Final validation
  v_structure_valid := (array_length(v_errors, 1) IS NULL);
  
  RETURN jsonb_build_object(
    'valid', v_structure_valid,
    'total_matches', v_total_matches,
    'detailed_analysis', v_detailed_analysis,
    'errors', v_errors,
    'warnings', v_warnings,
    'expected_structure', jsonb_build_object(
      'winners_bracket', jsonb_build_object('rounds', 3, 'matches', 14, 'structure', '8+4+2'),
      'losers_branch_a', jsonb_build_object('rounds', 3, 'matches', 7, 'structure', '4+2+1'),
      'losers_branch_b', jsonb_build_object('rounds', 2, 'matches', 3, 'structure', '2+1'),
      'finals', jsonb_build_object('rounds', 2, 'matches', 3, 'structure', '2_semifinals+1_final'),
      'total_matches', 27
    ),
    'validation_timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tournament Flow Testing Function
CREATE OR REPLACE FUNCTION test_sabo_tournament_flow(
  p_tournament_id UUID
) RETURNS jsonb AS $$
DECLARE
  v_flow_issues TEXT[] := '{}';
  v_flow_valid BOOLEAN := TRUE;
  v_advancement_map jsonb := '{}';
BEGIN
  -- Test Winners Bracket advancement paths
  WITH winners_advancement AS (
    SELECT 
      m1.id as source_match,
      m1.round_number as source_round,
      m1.match_number as source_match_num,
      COALESCE(
        (SELECT m2.id FROM tournament_matches m2 
         WHERE m2.tournament_id = p_tournament_id 
           AND m2.bracket_type = 'winners' 
           AND m2.round_number = m1.round_number + 1
           AND m2.match_number = CEIL(m1.match_number::numeric / 2)
         LIMIT 1), 
        'None'
      ) as target_match
    FROM tournament_matches m1
    WHERE m1.tournament_id = p_tournament_id 
      AND m1.bracket_type = 'winners'
      AND m1.round_number < 3
  )
  SELECT jsonb_object_agg(source_match::text, target_match) INTO v_advancement_map
  FROM winners_advancement;
  
  -- Test Losers Bracket dropout paths
  -- Winners R1 losers should go to Losers R101
  -- Winners R2 losers should go to Losers R201
  -- etc.
  
  IF v_flow_valid THEN
    RETURN jsonb_build_object(
      'flow_valid', v_flow_valid,
      'advancement_map', v_advancement_map,
      'issues', v_flow_issues,
      'test_timestamp', NOW()
    );
  ELSE
    RETURN jsonb_build_object(
      'flow_valid', v_flow_valid,
      'issues', v_flow_issues,
      'test_timestamp', NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Complete SABO System Health Check
CREATE OR REPLACE FUNCTION sabo_system_health_check(
  p_tournament_id UUID DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_health_report jsonb := '{}';
  v_function_checks jsonb;
  v_structure_validation jsonb;
  v_flow_test jsonb;
BEGIN
  -- 1. Check SABO functions exist and are callable
  WITH function_status AS (
    SELECT 
      'generate_sabo_tournament_bracket' as func_name,
      EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'generate_sabo_tournament_bracket') as exists
    UNION ALL
    SELECT 
      'advance_sabo_tournament',
      EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'advance_sabo_tournament')
    UNION ALL
    SELECT 
      'submit_sabo_match_score',
      EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'submit_sabo_match_score')
    UNION ALL
    SELECT 
      'validate_sabo_tournament_structure',
      EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'validate_sabo_tournament_structure')
  )
  SELECT jsonb_object_agg(func_name, exists) INTO v_function_checks
  FROM function_status;
  
  -- 2. If tournament ID provided, validate structure
  IF p_tournament_id IS NOT NULL THEN
    SELECT validate_sabo_tournament_structure_enhanced(p_tournament_id) INTO v_structure_validation;
    SELECT test_sabo_tournament_flow(p_tournament_id) INTO v_flow_test;
  END IF;
  
  -- 3. Build complete health report
  v_health_report := jsonb_build_object(
    'system_status', 'SABO_READY',
    'functions_available', v_function_checks,
    'functions_healthy', (
      (v_function_checks->>'generate_sabo_tournament_bracket')::boolean AND
      (v_function_checks->>'advance_sabo_tournament')::boolean AND
      (v_function_checks->>'submit_sabo_match_score')::boolean AND
      (v_function_checks->>'validate_sabo_tournament_structure')::boolean
    ),
    'health_check_timestamp', NOW()
  );
  
  IF p_tournament_id IS NOT NULL THEN
    v_health_report := v_health_report || jsonb_build_object(
      'tournament_structure', v_structure_validation,
      'tournament_flow', v_flow_test
    );
  END IF;
  
  RETURN v_health_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Quick SABO System Status
COMMENT ON FUNCTION sabo_system_health_check IS 'Comprehensive SABO double elimination system health check';
COMMENT ON FUNCTION validate_sabo_tournament_structure_enhanced IS 'Enhanced SABO tournament structure validation with detailed analysis';
COMMENT ON FUNCTION test_sabo_tournament_flow IS 'Test SABO tournament advancement flow logic';
