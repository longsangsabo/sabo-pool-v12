-- =====================================================
-- 🔥 PHASE 2: COMPLETE CLEANUP - DROP ALL FUNCTIONS
-- =====================================================
-- Execute this script to safely drop all existing challenge-related functions

-- SAFETY CHECK: Verify we're in the right database
DO $$
BEGIN
    IF current_database() != 'postgres' THEN
        RAISE EXCEPTION 'Safety check failed: Wrong database. Expected postgres, got %', current_database();
    END IF;
    RAISE NOTICE '✅ Safety check passed. Database: %', current_database();
END $$;

-- Step 1: Drop all triggers first (to avoid dependency issues)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '🔥 DROPPING ALL CHALLENGE-RELATED TRIGGERS...';
    
    FOR trigger_record IN
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
          AND (
            event_object_table IN ('challenges', 'matches', 'player_rankings', 'spa_transactions')
            OR action_statement ILIKE '%challenge%'
            OR action_statement ILIKE '%spa%'
            OR action_statement ILIKE '%club%'
          )
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', 
                          trigger_record.trigger_name, 
                          trigger_record.event_object_table);
            RAISE NOTICE '✅ Dropped trigger: % on %', 
                         trigger_record.trigger_name, 
                         trigger_record.event_object_table;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Failed to drop trigger %: %', trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 2: Drop all challenge-related functions
DO $$
DECLARE
    func_record RECORD;
    drop_sql TEXT;
BEGIN
    RAISE NOTICE '🔥 DROPPING ALL CHALLENGE-RELATED FUNCTIONS...';
    
    FOR func_record IN
        SELECT 
            routine_name,
            routine_type,
            specific_name,
            routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND routine_type = 'FUNCTION'
          AND (
            routine_name ILIKE '%challenge%'
            OR routine_name ILIKE '%spa%'
            OR routine_name ILIKE '%accept%'
            OR routine_name ILIKE '%complete%'
            OR routine_name ILIKE '%approve%'
            OR routine_name ILIKE '%transfer%'
            OR routine_name ILIKE '%notification%'
            OR routine_name ILIKE '%process_%'
            OR routine_name ILIKE '%update_%'
            OR routine_name ILIKE '%subtract_%'
            OR routine_name ILIKE '%create_%'
            OR routine_name ILIKE '%handle_%'
          )
        ORDER BY routine_name
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', 
                          func_record.routine_schema, 
                          func_record.routine_name);
            RAISE NOTICE '✅ Dropped function: %', func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Failed to drop function %: %', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Specific cleanup for known problematic functions
DO $$
BEGIN
    RAISE NOTICE '🔥 EXPLICIT CLEANUP OF KNOWN FUNCTIONS...';
    
    -- Challenge management functions
    DROP FUNCTION IF EXISTS public.accept_open_challenge CASCADE;
    DROP FUNCTION IF EXISTS public.admin_create_challenge CASCADE;
    DROP FUNCTION IF EXISTS public.create_challenge CASCADE;
    DROP FUNCTION IF EXISTS public.create_challenge_safe CASCADE;
    DROP FUNCTION IF EXISTS public.complete_challenge CASCADE;
    DROP FUNCTION IF EXISTS public.complete_challenge_match CASCADE;
    DROP FUNCTION IF EXISTS public.complete_challenge_match_with_bonuses CASCADE;
    DROP FUNCTION IF EXISTS public.complete_challenge_match_from_club_confirmation CASCADE;
    DROP FUNCTION IF EXISTS public.complete_challenge_with_daily_limits CASCADE;
    
    -- SPA management functions
    DROP FUNCTION IF EXISTS public.update_spa_points CASCADE;
    DROP FUNCTION IF EXISTS public.subtract_spa_points CASCADE;
    DROP FUNCTION IF EXISTS public.transfer_spa_points CASCADE;
    DROP FUNCTION IF EXISTS public.process_spa_transfer CASCADE;
    DROP FUNCTION IF EXISTS public.process_spa_on_completion CASCADE;
    
    -- Club and approval functions
    DROP FUNCTION IF EXISTS public.process_club_confirmation CASCADE;
    DROP FUNCTION IF EXISTS public.process_club_approval CASCADE;
    DROP FUNCTION IF EXISTS public.handle_club_approval_spa CASCADE;
    
    -- Status and utility functions
    DROP FUNCTION IF EXISTS public.update_challenge_status CASCADE;
    DROP FUNCTION IF EXISTS public.validate_challenge_spa_balance CASCADE;
    DROP FUNCTION IF EXISTS public.calculate_challenge_spa CASCADE;
    DROP FUNCTION IF EXISTS public.get_challenge_winner CASCADE;
    
    -- Notification functions
    DROP FUNCTION IF EXISTS public.create_challenge_notification CASCADE;
    DROP FUNCTION IF EXISTS public.send_challenge_notification CASCADE;
    DROP FUNCTION IF EXISTS public.notify_challenge_created CASCADE;
    DROP FUNCTION IF EXISTS public.notify_challenge_accepted CASCADE;
    DROP FUNCTION IF EXISTS public.notify_club_approval CASCADE;
    
    -- Tournament and admin functions  
    DROP FUNCTION IF EXISTS public.process_tournament_completion CASCADE;
    DROP FUNCTION IF EXISTS public.admin_complete_challenge CASCADE;
    
    RAISE NOTICE '✅ Explicit cleanup completed!';
END $$;

-- Step 4: Verify cleanup success
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFYING CLEANUP SUCCESS...';
    
    SELECT COUNT(*) INTO remaining_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND (
        routine_name ILIKE '%challenge%'
        OR routine_name ILIKE '%spa%'
        OR routine_name ILIKE '%accept%'
        OR routine_name ILIKE '%complete%'
        OR routine_name ILIKE '%approve%'
        OR routine_name ILIKE '%transfer%'
      );
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS! All challenge-related functions have been dropped!';
    ELSE
        RAISE NOTICE '⚠️ WARNING: % challenge-related functions still remain', remaining_count;
        
        -- Show remaining functions
        FOR func_record IN
            SELECT routine_name
            FROM information_schema.routines 
            WHERE routine_schema = 'public'
              AND routine_type = 'FUNCTION'
              AND (
                routine_name ILIKE '%challenge%'
                OR routine_name ILIKE '%spa%'
                OR routine_name ILIKE '%accept%'
                OR routine_name ILIKE '%complete%'
              )
        LOOP
            RAISE NOTICE '📋 Remaining function: %', func_record.routine_name;
        END LOOP;
    END IF;
    
    -- Check remaining triggers
    SELECT COUNT(*) INTO remaining_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
      AND (
        event_object_table IN ('challenges', 'matches', 'player_rankings')
        OR action_statement ILIKE '%challenge%'
        OR action_statement ILIKE '%spa%'
      );
      
    RAISE NOTICE '📊 Remaining triggers on challenge tables: %', remaining_count;
END $$;

-- Final status report
SELECT 
    '🎯 CLEANUP COMPLETE' as status,
    NOW() as completed_at,
    current_user as executed_by,
    current_database() as database_name;
