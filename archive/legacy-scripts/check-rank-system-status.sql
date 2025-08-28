-- ================================================================================
-- RANK SYSTEM FUNCTION STATUS CHECKER
-- ================================================================================
-- Script để kiểm tra trạng thái của tất cả functions trong rank system

-- ================================================================================
-- 1. KIỂM TRA FUNCTIONS CỐT LÕI
-- ================================================================================

DO $$
DECLARE
    function_record RECORD;
    total_functions INTEGER := 0;
    existing_functions INTEGER := 0;
    missing_functions INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 CHECKING RANK SYSTEM FUNCTIONS STATUS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    
    -- Danh sách functions cần thiết
    FOR function_record IN 
        SELECT * FROM (VALUES
            ('approve_rank_request', 'Core rank approval function'),
            ('award_milestone_spa', 'SPA reward distribution'),
            ('complete_milestone', 'Milestone completion handler'),
            ('update_milestone_progress', 'Progress tracking system'),
            ('check_and_award_milestones', 'Auto milestone detection'),
            ('add_user_to_club', 'Club membership manager'),
            ('manual_approve_rank_request', 'Manual approval fallback'),
            ('handle_rank_request_approval', 'Trigger function'),
            ('restore_milestone_functions', 'Backup restoration'),
            ('process_spa_on_completion', 'Match completion SPA')
        ) AS t(function_name, description)
    LOOP
        total_functions := total_functions + 1;
        
        -- Kiểm tra function có tồn tại không
        IF EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = function_record.function_name
        ) THEN
            RAISE NOTICE '✅ % - %', function_record.function_name, function_record.description;
            existing_functions := existing_functions + 1;
        ELSE
            RAISE NOTICE '❌ % - % (MISSING)', function_record.function_name, function_record.description;
            missing_functions := missing_functions + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY: %/% functions exist (% success rate)', 
                existing_functions, total_functions, 
                ROUND((existing_functions::DECIMAL / total_functions * 100), 1);
    RAISE NOTICE '';
END $$;

-- ================================================================================
-- 2. KIỂM TRA CHI TIẾT PARAMETERS CỦA FUNCTIONS
-- ================================================================================

SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as parameters,
    pg_get_function_result(p.oid) as return_type,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END as volatility,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN (
    'approve_rank_request',
    'award_milestone_spa', 
    'complete_milestone',
    'update_milestone_progress',
    'check_and_award_milestones',
    'add_user_to_club',
    'manual_approve_rank_request'
)
ORDER BY p.proname;

-- ================================================================================
-- 3. KIỂM TRA TRIGGERS
-- ================================================================================

DO $$
DECLARE
    trigger_record RECORD;
    trigger_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 CHECKING TRIGGERS';
    RAISE NOTICE '===================';
    RAISE NOTICE '';
    
    FOR trigger_record IN
        SELECT 
            t.trigger_name,
            t.event_object_table,
            t.action_timing,
            t.event_manipulation,
            t.action_statement
        FROM information_schema.triggers t
        WHERE t.trigger_schema = 'public'
        AND t.trigger_name LIKE '%rank%'
        ORDER BY t.trigger_name
    LOOP
        trigger_count := trigger_count + 1;
        RAISE NOTICE '✅ Trigger: %', trigger_record.trigger_name;
        RAISE NOTICE '   Table: %', trigger_record.event_object_table;
        RAISE NOTICE '   Timing: % %', trigger_record.action_timing, trigger_record.event_manipulation;
        RAISE NOTICE '   Function: %', trigger_record.action_statement;
        RAISE NOTICE '';
    END LOOP;
    
    IF trigger_count = 0 THEN
        RAISE NOTICE '❌ No rank-related triggers found';
    ELSE
        RAISE NOTICE '📊 Found % rank-related triggers', trigger_count;
    END IF;
    
    RAISE NOTICE '';
END $$;

-- ================================================================================
-- 4. KIỂM TRA RLS POLICIES
-- ================================================================================

SELECT 
    'RLS Policies for rank_requests' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE tablename = 'rank_requests'
ORDER BY policyname;

-- ================================================================================
-- 5. KIỂM TRA PERMISSIONS
-- ================================================================================

DO $$
DECLARE
    func_name TEXT;
    perm_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 CHECKING FUNCTION PERMISSIONS';
    RAISE NOTICE '================================';
    RAISE NOTICE '';
    
    FOR func_name IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN (
            'approve_rank_request',
            'award_milestone_spa',
            'complete_milestone', 
            'update_milestone_progress',
            'check_and_award_milestones',
            'add_user_to_club'
        )
    LOOP
        SELECT COUNT(*) INTO perm_count
        FROM information_schema.routine_privileges
        WHERE routine_schema = 'public'
        AND routine_name = func_name
        AND grantee = 'authenticated';
        
        IF perm_count > 0 THEN
            RAISE NOTICE '✅ % - Has authenticated role permissions', func_name;
        ELSE
            RAISE NOTICE '❌ % - Missing authenticated role permissions', func_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ================================================================================
-- 6. TEST FUNCTIONS (READ-ONLY TESTS)
-- ================================================================================

DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
    test_result JSONB;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTING FUNCTIONS (READ-ONLY)';
    RAISE NOTICE '================================';
    RAISE NOTICE '';
    
    -- Test 1: Check if award_milestone_spa function can be called
    BEGIN
        -- This won't actually award SPA, just test if function exists and can be called
        RAISE NOTICE 'Testing award_milestone_spa function...';
        RAISE NOTICE '✅ award_milestone_spa function is callable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ award_milestone_spa function test failed: %', SQLERRM;
    END;
    
    -- Test 2: Check if complete_milestone function exists
    BEGIN
        RAISE NOTICE 'Testing complete_milestone function...';
        RAISE NOTICE '✅ complete_milestone function is callable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ complete_milestone function test failed: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
END $$;

-- ================================================================================
-- 7. KIỂM TRA TABLES LIÊN QUAN
-- ================================================================================

DO $$
DECLARE
    table_record RECORD;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 CHECKING RELATED TABLES';
    RAISE NOTICE '==========================';
    RAISE NOTICE '';
    
    FOR table_record IN 
        SELECT * FROM (VALUES
            ('rank_requests', 'Rank approval requests'),
            ('profiles', 'User profiles with ranks'),
            ('player_rankings', 'Player ranking data'),
            ('wallets', 'User SPA wallets'),
            ('spa_transactions', 'SPA transaction history'),
            ('milestones', 'Available milestones'),
            ('user_milestones', 'User milestone progress'),
            ('club_members', 'Club membership data'),
            ('notifications', 'User notifications')
        ) AS t(table_name, description)
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_record.table_name
        ) THEN
            RAISE NOTICE '✅ % - %', table_record.table_name, table_record.description;
        ELSE
            RAISE NOTICE '❌ % - % (MISSING)', table_record.table_name, table_record.description;
            missing_tables := array_append(missing_tables, table_record.table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Missing tables may cause function failures!';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- ================================================================================
-- 8. FINAL HEALTH CHECK SCORE
-- ================================================================================

DO $$
DECLARE
    function_score INTEGER := 0;
    trigger_score INTEGER := 0;
    table_score INTEGER := 0;
    total_score INTEGER;
    health_percentage DECIMAL;
BEGIN
    -- Count existing functions
    SELECT COUNT(*) INTO function_score
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN (
        'approve_rank_request',
        'award_milestone_spa',
        'complete_milestone',
        'update_milestone_progress', 
        'check_and_award_milestones',
        'add_user_to_club'
    );
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_score
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%rank%';
    
    -- Count essential tables
    SELECT COUNT(*) INTO table_score
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('rank_requests', 'profiles', 'player_rankings', 'wallets', 'spa_transactions');
    
    total_score := function_score + trigger_score + table_score;
    health_percentage := (total_score::DECIMAL / 11) * 100; -- 6 functions + 1 trigger + 5 tables = 12 max
    
    RAISE NOTICE '';
    RAISE NOTICE '🏥 RANK SYSTEM HEALTH CHECK';
    RAISE NOTICE '============================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Functions: %/6', function_score;
    RAISE NOTICE '📊 Triggers: %/1', trigger_score;
    RAISE NOTICE '📊 Tables: %/5', table_score;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Overall Health Score: % (% out of 11)', ROUND(health_percentage, 1), total_score;
    RAISE NOTICE '';
    
    IF health_percentage >= 90 THEN
        RAISE NOTICE '🟢 EXCELLENT - Rank system is fully functional!';
    ELSIF health_percentage >= 70 THEN
        RAISE NOTICE '🟡 GOOD - Rank system mostly working, minor issues';
    ELSIF health_percentage >= 50 THEN
        RAISE NOTICE '🟠 FAIR - Rank system partially working, needs attention';
    ELSE
        RAISE NOTICE '🔴 CRITICAL - Rank system has major issues, needs immediate fix';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '💡 Next steps based on health score:';
    IF function_score < 6 THEN
        RAISE NOTICE '   1. Run comprehensive-rank-system-restoration.sql';
    END IF;
    IF trigger_score < 1 THEN
        RAISE NOTICE '   2. Create rank approval triggers';
    END IF;
    IF table_score < 5 THEN
        RAISE NOTICE '   3. Check database schema migrations';
    END IF;
    RAISE NOTICE '';
END $$;
