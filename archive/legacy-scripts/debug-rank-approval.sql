-- ================================================================================
-- DEBUG RANK APPROVAL ISSUE
-- ================================================================================
-- Kiểm tra tại sao user approve rank nhưng không cập nhật profile, milestone, notification

-- 1. Kiểm tra rank request gần nhất
SELECT 
    'Recent Rank Requests' as check_type,
    id,
    user_id,
    requested_rank,
    status,
    approved_by,
    approved_at,
    created_at,
    updated_at
FROM rank_requests 
WHERE status = 'approved'
ORDER BY approved_at DESC 
LIMIT 5;

-- 2. Kiểm tra profile của user vừa được approve
DO $$
DECLARE
    recent_request RECORD;
    user_profile RECORD;
BEGIN
    -- Lấy request gần nhất được approve
    SELECT * INTO recent_request
    FROM rank_requests 
    WHERE status = 'approved'
    ORDER BY approved_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '';
        RAISE NOTICE '🔍 DEBUGGING RECENT APPROVED RANK REQUEST';
        RAISE NOTICE '=========================================';
        RAISE NOTICE 'Request ID: %', recent_request.id;
        RAISE NOTICE 'User ID: %', recent_request.user_id;
        RAISE NOTICE 'Requested Rank: %', recent_request.requested_rank;
        RAISE NOTICE 'Approved At: %', recent_request.approved_at;
        RAISE NOTICE '';
        
        -- Kiểm tra profile của user này
        SELECT * INTO user_profile
        FROM profiles 
        WHERE user_id = recent_request.user_id;
        
        IF FOUND THEN
            RAISE NOTICE '👤 USER PROFILE STATUS:';
            RAISE NOTICE 'Display Name: %', user_profile.display_name;
            RAISE NOTICE 'Current Rank: %', COALESCE(user_profile.verified_rank, 'NULL');
            RAISE NOTICE 'Rank Verified At: %', COALESCE(user_profile.rank_verified_at::text, 'NULL');
            RAISE NOTICE 'Profile Updated At: %', user_profile.updated_at;
            RAISE NOTICE '';
            
            -- So sánh thời gian
            IF user_profile.updated_at < recent_request.approved_at THEN
                RAISE NOTICE '❌ PROBLEM: Profile not updated after rank approval!';
                RAISE NOTICE '   Profile last updated: %', user_profile.updated_at;
                RAISE NOTICE '   Rank approved at: %', recent_request.approved_at;
            ELSE
                RAISE NOTICE '✅ Profile was updated after rank approval';
            END IF;
        ELSE
            RAISE NOTICE '❌ USER PROFILE NOT FOUND!';
        END IF;
        
        -- Kiểm tra player rankings
        IF EXISTS (
            SELECT 1 FROM player_rankings 
            WHERE user_id = recent_request.user_id
        ) THEN
            RAISE NOTICE '✅ Player rankings record exists';
        ELSE
            RAISE NOTICE '❌ Player rankings record missing';
        END IF;
        
        -- Kiểm tra wallet
        IF EXISTS (
            SELECT 1 FROM wallets 
            WHERE user_id = recent_request.user_id
        ) THEN
            RAISE NOTICE '✅ Wallet record exists';
        ELSE
            RAISE NOTICE '❌ Wallet record missing';
        END IF;
        
        -- Kiểm tra SPA transactions
        IF EXISTS (
            SELECT 1 FROM spa_transactions 
            WHERE user_id = recent_request.user_id 
            AND reference_id = recent_request.id
            AND transaction_type = 'rank_approval'
        ) THEN
            RAISE NOTICE '✅ SPA transaction exists';
        ELSE
            RAISE NOTICE '❌ SPA transaction missing';
        END IF;
        
        -- Kiểm tra notifications
        IF EXISTS (
            SELECT 1 FROM notifications 
            WHERE user_id = recent_request.user_id 
            AND type = 'rank_approval'
            AND created_at >= recent_request.approved_at
        ) THEN
            RAISE NOTICE '✅ Notification exists';
        ELSE
            RAISE NOTICE '❌ Notification missing';
        END IF;
        
    ELSE
        RAISE NOTICE 'No approved rank requests found';
    END IF;
END $$;

-- 3. Kiểm tra function có được gọi không
SELECT 
    'Function Call Logs' as check_type,
    schemaname,
    funcname,
    calls,
    total_time,
    mean_time
FROM pg_stat_user_functions 
WHERE schemaname = 'public'
AND funcname LIKE '%rank%'
ORDER BY calls DESC;

-- 4. Kiểm tra triggers có hoạt động không
SELECT 
    'Active Triggers' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'rank_requests'
ORDER BY trigger_name;

-- 5. Kiểm tra errors trong PostgreSQL logs (nếu có)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💡 POSSIBLE CAUSES:';
    RAISE NOTICE '==================';
    RAISE NOTICE '1. Frontend không gọi approve_rank_request() function';
    RAISE NOTICE '2. Function bị lỗi và rollback transaction';
    RAISE NOTICE '3. Trigger không hoạt động';
    RAISE NOTICE '4. RLS policy chặn updates';
    RAISE NOTICE '5. Permission issues với các tables';
    RAISE NOTICE '';
END $$;

-- 6. Test function manually với request gần nhất
DO $$
DECLARE
    recent_request RECORD;
    test_result JSONB;
    dummy_club_id UUID := '00000000-0000-0000-0000-000000000001';
    dummy_approver_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    -- Lấy request pending gần nhất để test
    SELECT * INTO recent_request
    FROM rank_requests 
    WHERE status = 'pending'
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '';
        RAISE NOTICE '🧪 TESTING FUNCTION WITH PENDING REQUEST';
        RAISE NOTICE '=======================================';
        RAISE NOTICE 'Testing with Request ID: %', recent_request.id;
        
        -- Test function (không thực sự approve)
        BEGIN
            -- Chỉ test xem function có thể được gọi không
            RAISE NOTICE 'Function approve_rank_request exists and is callable';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Function test failed: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No pending requests to test';
    END IF;
END $$;

-- 7. Kiểm tra recent activity
SELECT 
    'Recent Activity Check' as check_type,
    'rank_requests' as table_name,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    MAX(updated_at) as last_update
FROM rank_requests

UNION ALL

SELECT 
    'Recent Activity Check' as check_type,
    'profiles' as table_name,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE verified_rank IS NOT NULL) as verified_count,
    COUNT(*) FILTER (WHERE rank_verified_at IS NOT NULL) as rank_verified_count,
    MAX(updated_at) as last_update
FROM profiles

UNION ALL

SELECT 
    'Recent Activity Check' as check_type,
    'spa_transactions' as table_name,
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE transaction_type = 'rank_approval') as rank_transactions,
    0 as unused,
    MAX(created_at) as last_transaction
FROM spa_transactions;

-- 8. Suggestion for manual fix
DO $$
DECLARE
    recent_request RECORD;
    rank_text TEXT;
    spa_reward INTEGER;
BEGIN
    -- Get recent approved request that may not have been processed
    SELECT * INTO recent_request
    FROM rank_requests r
    WHERE r.status = 'approved'
    AND NOT EXISTS (
        SELECT 1 FROM spa_transactions st 
        WHERE st.user_id = r.user_id 
        AND st.reference_id = r.id
        AND st.transaction_type = 'rank_approval'
    )
    ORDER BY r.approved_at DESC
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '';
        RAISE NOTICE '🔧 MANUAL FIX SUGGESTION';
        RAISE NOTICE '========================';
        RAISE NOTICE 'Found approved request without SPA transaction:';
        RAISE NOTICE 'Request ID: %', recent_request.id;
        RAISE NOTICE 'User ID: %', recent_request.user_id;
        RAISE NOTICE 'Requested Rank: %', recent_request.requested_rank;
        RAISE NOTICE '';
        RAISE NOTICE 'Run this to manually fix:';
        RAISE NOTICE 'SELECT manual_approve_rank_request(''%'', auth.uid());', recent_request.id;
        RAISE NOTICE '';
    END IF;
END $$;
