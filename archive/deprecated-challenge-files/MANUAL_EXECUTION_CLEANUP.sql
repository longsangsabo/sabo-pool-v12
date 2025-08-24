-- =====================================================
-- 🎯 FINAL EXECUTION SCRIPT - RUN THIS IN SUPABASE SQL EDITOR
-- =====================================================
-- Manual execution approach using service role privileges

-- STEP 1: Analysis (Optional - for logging)
DO $$
DECLARE
    func_count INTEGER;
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
      AND (routine_name ILIKE '%challenge%' OR routine_name ILIKE '%spa%');
      
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
      AND (event_object_table IN ('challenges', 'matches', 'player_rankings'));
      
    RAISE NOTICE '📊 BEFORE CLEANUP: Functions=%, Triggers=%', func_count, trigger_count;
END $$;

-- STEP 2: COMPLETE CLEANUP (CRITICAL!)
-- Drop triggers first
DROP TRIGGER IF EXISTS club_confirmation_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS spa_transfer_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS challenge_status_update ON challenges CASCADE;
DROP TRIGGER IF EXISTS challenge_created_notification ON challenges CASCADE;
DROP TRIGGER IF EXISTS club_approval_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS challenge_status_change_trigger ON challenges CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.accept_open_challenge CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_challenge CASCADE;
DROP FUNCTION IF EXISTS public.create_challenge CASCADE;
DROP FUNCTION IF EXISTS public.create_challenge_safe CASCADE;
DROP FUNCTION IF EXISTS public.complete_challenge CASCADE;
DROP FUNCTION IF EXISTS public.complete_challenge_match CASCADE;
DROP FUNCTION IF EXISTS public.complete_challenge_match_with_bonuses CASCADE;
DROP FUNCTION IF EXISTS public.complete_challenge_match_from_club_confirmation CASCADE;
DROP FUNCTION IF EXISTS public.complete_challenge_with_daily_limits CASCADE;
DROP FUNCTION IF EXISTS public.update_spa_points CASCADE;
DROP FUNCTION IF EXISTS public.subtract_spa_points CASCADE;
DROP FUNCTION IF EXISTS public.transfer_spa_points CASCADE;
DROP FUNCTION IF EXISTS public.process_spa_transfer CASCADE;
DROP FUNCTION IF EXISTS public.process_spa_on_completion CASCADE;
DROP FUNCTION IF EXISTS public.process_club_confirmation CASCADE;
DROP FUNCTION IF EXISTS public.process_club_approval CASCADE;
DROP FUNCTION IF EXISTS public.handle_club_approval_spa CASCADE;
DROP FUNCTION IF EXISTS public.update_challenge_status CASCADE;
DROP FUNCTION IF EXISTS public.validate_challenge_spa_balance CASCADE;
DROP FUNCTION IF EXISTS public.calculate_challenge_spa CASCADE;
DROP FUNCTION IF EXISTS public.get_challenge_winner CASCADE;
DROP FUNCTION IF EXISTS public.create_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS public.send_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS public.notify_challenge_created CASCADE;
DROP FUNCTION IF EXISTS public.notify_challenge_accepted CASCADE;
DROP FUNCTION IF EXISTS public.notify_club_approval CASCADE;
DROP FUNCTION IF EXISTS public.process_tournament_completion CASCADE;
DROP FUNCTION IF EXISTS public.admin_complete_challenge CASCADE;
DROP FUNCTION IF EXISTS public.on_club_approval CASCADE;
DROP FUNCTION IF EXISTS public.on_challenge_status_change CASCADE;
DROP FUNCTION IF EXISTS public.accept_challenge CASCADE;
DROP FUNCTION IF EXISTS public.update_spa_balance CASCADE;
DROP FUNCTION IF EXISTS public.validate_spa_requirement CASCADE;

-- STEP 3: VERIFY CLEANUP
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND (routine_name ILIKE '%challenge%' OR routine_name ILIKE '%spa%' OR routine_name ILIKE '%accept%');
      
    RAISE NOTICE '🔍 REMAINING FUNCTIONS AFTER CLEANUP: %', remaining_count;
    
    IF remaining_count > 0 THEN
        RAISE NOTICE '⚠️ Some functions still exist, but proceeding with rebuild...';
    ELSE
        RAISE NOTICE '✅ CLEANUP COMPLETE - All functions dropped!';
    END IF;
END $$;
