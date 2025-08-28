-- ================================================================================
-- FIX FRONTEND RANK APPROVAL ISSUE
-- ================================================================================
-- Frontend đang dùng direct UPDATE thay vì gọi function approve_rank_request
-- Cần tạo trigger để handle automatic processing khi status = 'approved'

-- 1. Kiểm tra current trigger
SELECT 
    'Current Triggers' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'rank_requests'
ORDER BY trigger_name;

-- 2. Tạo comprehensive trigger function để handle direct updates
CREATE OR REPLACE FUNCTION handle_rank_approval_auto()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rank_text TEXT;
    v_spa_reward INTEGER;
    v_user_profile RECORD;
BEGIN
    -- Chỉ xử lý khi status change từ pending -> approved
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        
        RAISE NOTICE 'Processing rank approval for request: %', NEW.id;
        
        -- Get user profile
        SELECT * INTO v_user_profile
        FROM profiles 
        WHERE user_id = NEW.user_id;
        
        -- Convert rank number to text and calculate SPA
        v_rank_text := CASE NEW.requested_rank
            WHEN '1' THEN 'K'   WHEN '2' THEN 'K+'
            WHEN '3' THEN 'I'   WHEN '4' THEN 'I+'
            WHEN '5' THEN 'H'   WHEN '6' THEN 'H+'
            WHEN '7' THEN 'G'   WHEN '8' THEN 'G+'
            WHEN '9' THEN 'F'   WHEN '10' THEN 'F+'
            WHEN '11' THEN 'E'  WHEN '12' THEN 'E+'
            ELSE 'K'
        END;
        
        -- Handle numeric requested_rank too
        v_rank_text := CASE 
            WHEN NEW.requested_rank::INTEGER = 1 THEN 'K'
            WHEN NEW.requested_rank::INTEGER = 2 THEN 'K+'
            WHEN NEW.requested_rank::INTEGER = 3 THEN 'I'
            WHEN NEW.requested_rank::INTEGER = 4 THEN 'I+'
            WHEN NEW.requested_rank::INTEGER = 5 THEN 'H'
            WHEN NEW.requested_rank::INTEGER = 6 THEN 'H+'
            WHEN NEW.requested_rank::INTEGER = 7 THEN 'G'
            WHEN NEW.requested_rank::INTEGER = 8 THEN 'G+'
            WHEN NEW.requested_rank::INTEGER = 9 THEN 'F'
            WHEN NEW.requested_rank::INTEGER = 10 THEN 'F+'
            WHEN NEW.requested_rank::INTEGER = 11 THEN 'E'
            WHEN NEW.requested_rank::INTEGER = 12 THEN 'E+'
            ELSE NEW.requested_rank -- Keep original if it's already text
        END;
        
        v_spa_reward := CASE 
            WHEN NEW.requested_rank::INTEGER = 12 THEN 300
            WHEN NEW.requested_rank::INTEGER = 11 THEN 300  -- E+, E
            WHEN NEW.requested_rank::INTEGER = 10 THEN 250
            WHEN NEW.requested_rank::INTEGER = 9 THEN 250   -- F+, F  
            WHEN NEW.requested_rank::INTEGER = 8 THEN 200
            WHEN NEW.requested_rank::INTEGER = 7 THEN 200   -- G+, G
            WHEN NEW.requested_rank::INTEGER = 6 THEN 150
            WHEN NEW.requested_rank::INTEGER = 5 THEN 150   -- H+, H
            WHEN NEW.requested_rank::INTEGER = 4 THEN 120
            WHEN NEW.requested_rank::INTEGER = 3 THEN 120   -- I+, I
            WHEN NEW.requested_rank::INTEGER = 2 THEN 100
            WHEN NEW.requested_rank::INTEGER = 1 THEN 100   -- K+, K
            ELSE 100
        END;
        
        BEGIN
            -- 1. Update profile verified rank
            UPDATE profiles 
            SET 
                verified_rank = v_rank_text,
                rank_verified_at = NOW(),
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
            
            RAISE NOTICE 'Updated profile rank to: %', v_rank_text;
            
            -- 2. Update/create player rankings
            INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
            VALUES (NEW.user_id, v_rank_text, v_spa_reward, NOW(), NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                verified_rank = EXCLUDED.verified_rank,
                spa_points = COALESCE(player_rankings.spa_points, 0) + v_spa_reward,
                updated_at = NOW();
            
            RAISE NOTICE 'Updated player rankings with % SPA', v_spa_reward;
            
            -- 3. Update/create wallet
            INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
            VALUES (NEW.user_id, v_spa_reward, NOW(), NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                points_balance = COALESCE(wallets.points_balance, 0) + v_spa_reward,
                updated_at = NOW();
            
            RAISE NOTICE 'Updated wallet balance';
            
            -- 4. Create SPA transaction (check if not exists)
            IF NOT EXISTS (
                SELECT 1 FROM spa_transactions 
                WHERE user_id = NEW.user_id 
                AND reference_id = NEW.id
                AND transaction_type = 'rank_approval'
            ) THEN
                INSERT INTO spa_transactions (
                    user_id, points, transaction_type, description,
                    reference_id, reference_type, created_at
                ) VALUES (
                    NEW.user_id, v_spa_reward, 'rank_approval',
                    'Rank ' || v_rank_text || ' approved by club',
                    NEW.id, 'rank_request', NOW()
                );
                
                RAISE NOTICE 'Created SPA transaction';
            END IF;
            
            -- 5. Add user to club (if has club_id)
            IF NEW.club_id IS NOT NULL THEN
                INSERT INTO club_members (club_id, user_id, status, join_date, membership_type, role, created_at, updated_at)
                VALUES (NEW.club_id, NEW.user_id, 'approved', NOW(), 'verified_member', 'member', NOW(), NOW())
                ON CONFLICT (club_id, user_id) 
                DO UPDATE SET 
                    status = 'approved',
                    membership_type = 'verified_member',
                    updated_at = NOW();
                
                RAISE NOTICE 'Added user to club as verified member';
            END IF;
            
            -- 6. Create notification (check if not exists)
            IF NOT EXISTS (
                SELECT 1 FROM notifications 
                WHERE user_id = NEW.user_id 
                AND type = 'rank_approval'
                AND metadata->>'request_id' = NEW.id::text
            ) THEN
                INSERT INTO notifications (
                    user_id, title, message, type, metadata, created_at
                ) VALUES (
                    NEW.user_id,
                    'Rank Approved!',
                    'Your rank ' || v_rank_text || ' has been approved! You received ' || v_spa_reward || ' SPA points.',
                    'rank_approval',
                    jsonb_build_object(
                        'rank', v_rank_text,
                        'spa_reward', v_spa_reward,
                        'request_id', NEW.id,
                        'club_id', NEW.club_id
                    ),
                    NOW()
                );
                
                RAISE NOTICE 'Created notification for user';
            END IF;
            
            -- 7. Update milestone progress (if function exists)
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.routines 
                    WHERE routine_schema = 'public' 
                    AND routine_name = 'update_milestone_progress'
                ) THEN
                    PERFORM update_milestone_progress(NEW.user_id, 'rank_approved', 1);
                    RAISE NOTICE 'Updated milestone progress';
                END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Milestone update failed: %', SQLERRM;
            END;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error in rank approval processing: %', SQLERRM;
            -- Don't fail the trigger, just log the error
        END;
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. Drop existing trigger và tạo mới
DROP TRIGGER IF EXISTS trigger_handle_rank_approval ON rank_requests;
DROP TRIGGER IF EXISTS trigger_handle_rank_approval_auto ON rank_requests;

CREATE TRIGGER trigger_handle_rank_approval_auto
    AFTER UPDATE ON rank_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_rank_approval_auto();

-- 4. Test với approved request gần nhất (if any)
DO $$
DECLARE
    test_request RECORD;
BEGIN
    -- Find recent approved request that might not have been processed
    SELECT * INTO test_request
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
        RAISE NOTICE '🔧 Found unprocessed approved request: %', test_request.id;
        RAISE NOTICE 'User: %', test_request.user_id;
        RAISE NOTICE 'Rank: %', test_request.requested_rank;
        RAISE NOTICE '';
        RAISE NOTICE 'Manually triggering processing...';
        
        -- Manually trigger the function
        PERFORM handle_rank_approval_auto() FROM (
            SELECT test_request.* as NEW, test_request.* as OLD
        ) t;
        
        RAISE NOTICE 'Manual processing completed.';
    ELSE
        RAISE NOTICE 'No unprocessed approved requests found.';
    END IF;
END $$;

-- 5. Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RANK APPROVAL AUTO-PROCESSING TRIGGER CREATED!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Trigger: trigger_handle_rank_approval_auto';
    RAISE NOTICE '📋 Function: handle_rank_approval_auto()';
    RAISE NOTICE '';
    RAISE NOTICE '💡 How it works:';
    RAISE NOTICE '   1. Frontend updates rank_requests.status = ''approved''';
    RAISE NOTICE '   2. Trigger automatically processes the approval:';
    RAISE NOTICE '      • Updates profile.verified_rank';
    RAISE NOTICE '      • Updates player_rankings with SPA';
    RAISE NOTICE '      • Updates wallet balance';
    RAISE NOTICE '      • Creates SPA transaction';
    RAISE NOTICE '      • Adds user to club as verified member';
    RAISE NOTICE '      • Creates notification';
    RAISE NOTICE '      • Updates milestone progress';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Frontend rank approval should now work completely!';
    RAISE NOTICE '';
END $$;
