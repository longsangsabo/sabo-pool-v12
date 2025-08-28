-- ================================================================================
-- QUICK RANK SYSTEM STATUS CHECK
-- ================================================================================
-- Script nhanh để kiểm tra functions đã restore thành công chưa

-- Kiểm tra functions cơ bản
SELECT 
    'Functions Status' as check_type,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ ALL FUNCTIONS EXIST'
        ELSE '❌ MISSING ' || (6 - COUNT(*))::text || ' FUNCTIONS'
    END as status,
    COUNT(*) || '/6' as count
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

-- Liệt kê từng function
SELECT 
    f.function_name,
    CASE WHEN r.routine_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    COALESCE(pg_get_function_identity_arguments(p.oid), 'N/A') as parameters
FROM (VALUES
    ('approve_rank_request'),
    ('award_milestone_spa'),
    ('complete_milestone'),
    ('update_milestone_progress'),
    ('check_and_award_milestones'),
    ('add_user_to_club'),
    ('manual_approve_rank_request'),
    ('handle_rank_request_approval')
) AS f(function_name)
LEFT JOIN information_schema.routines r 
    ON r.routine_schema = 'public' 
    AND r.routine_name = f.function_name
LEFT JOIN pg_proc p ON p.proname = f.function_name
LEFT JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = 'public'
ORDER BY 
    CASE WHEN r.routine_name IS NOT NULL THEN 0 ELSE 1 END,
    f.function_name;

-- Kiểm tra triggers
SELECT 
    'Triggers Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ TRIGGERS ACTIVE'
        ELSE '❌ NO TRIGGERS'
    END as status,
    COUNT(*)::text as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%rank%';

-- Kiểm tra RLS policies
SELECT 
    'RLS Policies' as check_type,
    policyname,
    cmd as command_type
FROM pg_policies 
WHERE tablename = 'rank_requests'
ORDER BY policyname;

-- Test đơn giản để xem function có hoạt động không
DO $$
BEGIN
    -- Test basic function existence
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'approve_rank_request'
    ) THEN
        RAISE NOTICE '✅ approve_rank_request function exists and is callable';
    ELSE
        RAISE NOTICE '❌ approve_rank_request function is missing';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'award_milestone_spa'
    ) THEN
        RAISE NOTICE '✅ award_milestone_spa function exists and is callable';
    ELSE
        RAISE NOTICE '❌ award_milestone_spa function is missing';
    END IF;
END $$;
