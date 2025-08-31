-- Double Elimination Cleanup Phase 3: Remove Duplicate Database Functions
-- This migration removes duplicate create_double_elimination_tournament functions
-- keeping only the essential functions needed for SABO

-- Drop duplicate create_double_elimination_tournament functions
-- We need to identify which ones exist first
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    -- Count how many create_double_elimination_tournament functions exist
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'create_double_elimination_tournament';
    
    RAISE NOTICE 'Found % create_double_elimination_tournament functions', func_count;
    
    -- Drop all variants of create_double_elimination_tournament
    -- This handles function overloading by dropping all versions
    DROP FUNCTION IF EXISTS public.create_double_elimination_tournament(uuid);
    DROP FUNCTION IF EXISTS public.create_double_elimination_tournament(uuid, integer);
    DROP FUNCTION IF EXISTS public.create_double_elimination_tournament(uuid, text);
    DROP FUNCTION IF EXISTS public.create_double_elimination_tournament(text);
    DROP FUNCTION IF EXISTS public.create_double_elimination_tournament();
    
    RAISE NOTICE 'Dropped all create_double_elimination_tournament function variants';
END $$;

-- Create single, clean create_double_elimination_tournament function
CREATE OR REPLACE FUNCTION public.create_double_elimination_tournament(p_tournament_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_participant_count INTEGER;
  v_result jsonb;
BEGIN
  -- Check if tournament exists
  IF NOT EXISTS (SELECT 1 FROM tournaments WHERE id = p_tournament_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tournament not found'
    );
  END IF;
  
  -- Use the consolidated SABO structure creation
  SELECT public.create_sabo_tournament_structure(p_tournament_id) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'tournament_id', p_tournament_id
    );
END;
$function$;