-- ================================================================================
-- KIỂM TRA TẤT CẢ FUNCTIONS VÀ TÌM FUNCTION GÂY CONFLICT
-- ================================================================================
-- Script để debug và tìm ra function nào đang sử dụng ON CONFLICT gây lỗi
-- ================================================================================

-- Step 1: Liệt kê tất cả functions có chứa "approve" hoặc "rank"
-- ================================================================================
SELECT 
    routine_name as function_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_name ILIKE '%approve%' 
    OR routine_name ILIKE '%rank%'
    OR routine_definition ILIKE '%ON CONFLICT%'
)
ORDER BY routine_name;

-- Step 2: Tìm tất cả functions có sử dụng ON CONFLICT
-- ================================================================================
SELECT 
    routine_name as function_name,
    'Contains ON CONFLICT' as issue,
    length(routine_definition) as definition_length
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%ON CONFLICT%'
ORDER BY routine_name;

-- Step 3: Kiểm tra cụ thể function approve_rank_request
-- ================================================================================
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_definition ILIKE '%ON CONFLICT%' THEN 'YES - USES ON CONFLICT'
        ELSE 'NO - SAFE'
    END as has_on_conflict,
    CASE 
        WHEN routine_definition ILIKE '%club_members%' THEN 'YES - TOUCHES CLUB_MEMBERS'
        ELSE 'NO'
    END as touches_club_members
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'approve_rank_request';

-- Step 4: Xem definition đầy đủ của function approve_rank_request
-- ================================================================================
SELECT 
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'approve_rank_request';

-- Step 5: Kiểm tra constraints trên bảng club_members
-- ================================================================================
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'club_members'
ORDER BY constraint_type, constraint_name;

-- Step 6: Kiểm tra columns của bảng club_members  
-- ================================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'club_members'
ORDER BY ordinal_position;

-- Step 7: Tìm tất cả functions có thể gây conflict khác
-- ================================================================================
SELECT 
    routine_name,
    'Potential conflict function' as note
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_definition ILIKE '%club_members%'
    OR routine_definition ILIKE '%player_rankings%'
    OR routine_definition ILIKE '%profiles%'
)
AND routine_definition ILIKE '%ON CONFLICT%'
ORDER BY routine_name;

-- Step 8: Debug info - Show actual error context
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🔍 DEBUGGING APPROVE_RANK_REQUEST FUNCTION';
    RAISE NOTICE '';
    RAISE NOTICE 'Checking for functions with ON CONFLICT issues...';
    RAISE NOTICE 'Look at the results above to identify the problematic function.';
    RAISE NOTICE '';
    RAISE NOTICE '❌ If approve_rank_request shows "USES ON CONFLICT" = YES';
    RAISE NOTICE '   Then the old function is still in database!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ If approve_rank_request shows "USES ON CONFLICT" = NO';  
    RAISE NOTICE '   Then problem is in a different function.';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Next steps:';
    RAISE NOTICE '   1. Find the function with ON CONFLICT from results above';
    RAISE NOTICE '   2. DROP that specific function';
    RAISE NOTICE '   3. Recreate with safe IF/ELSE logic';
END $$;
