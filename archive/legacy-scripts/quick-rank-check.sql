-- ================================================================================
-- QUICK RANK SYSTEM STATUS CHECK
-- ================================================================================
-- Script đơn giản để kiểm tra nhanh status của rank system

-- 1. Kiểm tra functions cốt lõi
SELECT 
    'Function Check' as check_type,
    routine_name as name,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'approve_rank_request',
    'award_milestone_spa',
    'complete_milestone',
    'update_milestone_progress',
    'check_and_award_milestones',
    'add_user_to_club',
    'manual_approve_rank_request',
    'handle_rank_request_approval'
)
ORDER BY routine_name;

-- 2. Kiểm tra missing functions
SELECT 
    'Missing Functions' as check_type,
    missing_func as name,
    'MISSING' as status
FROM (
    SELECT unnest(ARRAY[
        'approve_rank_request',
        'award_milestone_spa', 
        'complete_milestone',
        'update_milestone_progress',
        'check_and_award_milestones',
        'add_user_to_club',
        'manual_approve_rank_request',
        'handle_rank_request_approval'
    ]) as missing_func
) funcs
WHERE missing_func NOT IN (
    SELECT routine_name
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
);

-- 3. Kiểm tra triggers
SELECT 
    'Trigger Check' as check_type,
    trigger_name as name,
    event_object_table as table_name,
    'ACTIVE' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (trigger_name LIKE '%rank%' OR event_object_table = 'rank_requests')
ORDER BY trigger_name;

-- 4. Kiểm tra tables quan trọng
SELECT 
    'Table Check' as check_type,
    table_name as name,
    'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'rank_requests',
    'profiles', 
    'player_rankings',
    'wallets',
    'spa_transactions',
    'milestones',
    'user_milestones'
)
ORDER BY table_name;

-- 5. Summary count
SELECT 
    'SUMMARY' as check_type,
    'Functions: ' || COUNT(*) || '/8' as name,
    CASE 
        WHEN COUNT(*) >= 7 THEN 'GOOD'
        WHEN COUNT(*) >= 5 THEN 'FAIR'
        ELSE 'CRITICAL'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'approve_rank_request',
    'award_milestone_spa',
    'complete_milestone', 
    'update_milestone_progress',
    'check_and_award_milestones',
    'add_user_to_club',
    'manual_approve_rank_request',
    'handle_rank_request_approval'
);

-- 6. Check RLS policies
SELECT 
    'RLS Policy' as check_type,
    policyname as name,
    tablename as table_name,
    'ACTIVE' as status
FROM pg_policies 
WHERE tablename = 'rank_requests'
ORDER BY policyname;
