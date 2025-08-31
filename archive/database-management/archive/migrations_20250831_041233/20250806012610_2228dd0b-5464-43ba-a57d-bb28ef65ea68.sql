-- PHASE 1: Database Functions Cleanup (Fixed)
-- Remove obsolete double elimination functions to reduce confusion

-- Drop obsolete advancement functions
DROP FUNCTION IF EXISTS public.advance_double_elimination_loser CASCADE;
DROP FUNCTION IF EXISTS public.advance_double_elimination_v9_fixed CASCADE;
DROP FUNCTION IF EXISTS public.advance_double_elimination_winner_comprehensive_v2 CASCADE;
DROP FUNCTION IF EXISTS public.advance_double_elimination_winner_comprehensive_v4 CASCADE;
DROP FUNCTION IF EXISTS public.trigger_advance_double_elimination_winner CASCADE;
DROP FUNCTION IF EXISTS public.trigger_auto_advance_double_elimination_fixed CASCADE;

-- Drop obsolete bracket generation functions (be specific about parameters)
DROP FUNCTION IF EXISTS public.create_double_elimination_tournament(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_double_elimination_tournament(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_complete_v8 CASCADE;
DROP FUNCTION IF EXISTS public.generate_double_elimination_bracket_v9 CASCADE;
DROP FUNCTION IF EXISTS public.repair_double_elimination_v9 CASCADE;

-- Drop obsolete helper functions
DROP FUNCTION IF EXISTS public.get_double_elimination_next_loser_match CASCADE;
DROP FUNCTION IF EXISTS public.get_double_elimination_next_winner_match CASCADE;
DROP FUNCTION IF EXISTS public.get_double_elimination_status CASCADE;
DROP FUNCTION IF EXISTS public.submit_double_elimination_score_v9 CASCADE;
DROP FUNCTION IF EXISTS public.enforce_double_elimination_standards CASCADE;
DROP FUNCTION IF EXISTS public.fix_double_elimination_bracket_sub_types CASCADE;
DROP FUNCTION IF EXISTS public.standardize_double_elimination_structure CASCADE;
DROP FUNCTION IF EXISTS public.validate_double_elimination_structure CASCADE;

-- Keep only these essential functions:
-- 1. repair_double_elimination_bracket (used by useDoubleEliminationBracket)
-- 2. update_double_elimination_match_status (might be used for status updates)

-- Add comment to remaining essential functions
COMMENT ON FUNCTION public.repair_double_elimination_bracket IS 'ESSENTIAL: Used by useDoubleEliminationBracket hook for bracket repairs';
COMMENT ON FUNCTION public.update_double_elimination_match_status IS 'ESSENTIAL: Used for match status updates in double elimination';