-- ================================
-- DOUBLE ELIMINATION SYSTEM CLEANUP
-- Remove obsolete functions and keep only SABO system
-- ================================

-- 1. DROP ALL OBSOLETE DOUBLE ELIMINATION FUNCTIONS
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v2 CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v3 CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v4 CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v5 CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v6 CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v7 CASCADE;

-- 2. DROP OLD ADVANCEMENT FUNCTIONS
DROP FUNCTION IF EXISTS public.advance_winner_to_next_round_enhanced CASCADE;
DROP FUNCTION IF EXISTS public.advance_winner_safe CASCADE;
DROP FUNCTION IF EXISTS public.advance_winner_simplified CASCADE;

-- 3. DROP OLD BRACKET CREATION FUNCTIONS
DROP FUNCTION IF EXISTS public.create_double_elimination_bracket_v2 CASCADE;
DROP FUNCTION IF EXISTS public.create_double_elimination_bracket_simplified CASCADE;
DROP FUNCTION IF EXISTS public.generate_modified_double_elimination CASCADE;

-- 4. DROP OBSOLETE TEST FUNCTIONS
DROP FUNCTION IF EXISTS public.test_advance_winners_r1_to_r2 CASCADE;

-- 5. VERIFY SABO FUNCTIONS ARE INTACT
-- These should remain and be the only double elimination system:
-- - generate_sabo_tournament_bracket
-- - advance_sabo_tournament  
-- - submit_sabo_match_score
-- - validate_sabo_tournament_structure

-- 6. ADD VALIDATION TO ENSURE SABO FUNCTIONS EXIST
DO $$
DECLARE
  v_sabo_functions TEXT[] := ARRAY[
    'generate_sabo_tournament_bracket',
    'advance_sabo_tournament', 
    'submit_sabo_match_score',
    'validate_sabo_tournament_structure'
  ];
  v_function TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_function IN ARRAY v_sabo_functions LOOP
    SELECT EXISTS(
      SELECT 1 FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public' AND p.proname = v_function
    ) INTO v_exists;
    
    IF NOT v_exists THEN
      RAISE WARNING 'CRITICAL: SABO function % is missing!', v_function;
    ELSE
      RAISE NOTICE 'SABO function % is present ✓', v_function;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🧹 Double Elimination cleanup completed. Only SABO system remains.';
END $$;

-- 7. COMMENT CLEANUP
COMMENT ON FUNCTION public.generate_sabo_tournament_bracket IS 
'SABO Double Elimination: Generate 27-match tournament bracket for 16 players';

COMMENT ON FUNCTION public.advance_sabo_tournament IS 
'SABO Double Elimination: Advance winners and losers through bracket structure';

COMMENT ON FUNCTION public.submit_sabo_match_score IS 
'SABO Double Elimination: Submit match scores and auto-advance players';

COMMENT ON FUNCTION public.validate_sabo_tournament_structure IS 
'SABO Double Elimination: Validate tournament follows 27-match SABO structure';
