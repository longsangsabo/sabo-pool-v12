-- ================================================================================
-- MANUAL RANK APPROVAL FIX
-- ================================================================================
-- Function để manually approve rank request và cập nhật tất cả related data

CREATE OR REPLACE FUNCTION manual_fix_rank_approval(
    p_request_id UUID,
    p_force_update BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request RECORD;
    v_rank_text TEXT;
    v_spa_reward INTEGER;
    v_result JSONB;
    v_updated_records INTEGER := 0;
BEGIN
    -- Get rank request details
    SELECT * INTO v_request
    FROM rank_requests 
    WHERE id = p_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Rank request not found',
            'request_id', p_request_id
        );
    END IF;
    
    -- Convert rank number to text and calculate SPA
    v_rank_text := CASE v_request.requested_rank
        WHEN 1 THEN 'K'   WHEN 2 THEN 'K+'
        WHEN 3 THEN 'I'   WHEN 4 THEN 'I+'
        WHEN 5 THEN 'H'   WHEN 6 THEN 'H+'
        WHEN 7 THEN 'G'   WHEN 8 THEN 'G+'
        WHEN 9 THEN 'F'   WHEN 10 THEN 'F+'
        WHEN 11 THEN 'E'  WHEN 12 THEN 'E+'
        ELSE 'K'
    END;
    
    v_spa_reward := CASE v_request.requested_rank
        WHEN 12 THEN 300  WHEN 11 THEN 300  -- E+, E
        WHEN 10 THEN 250  WHEN 9 THEN 250   -- F+, F  
        WHEN 8 THEN 200   WHEN 7 THEN 200   -- G+, G
        WHEN 6 THEN 150   WHEN 5 THEN 150   -- H+, H
        WHEN 4 THEN 120   WHEN 3 THEN 120   -- I+, I
        WHEN 2 THEN 100   WHEN 1 THEN 100   -- K+, K
        ELSE 100
    END;
    
    -- Start manual fixes
    BEGIN
        -- 1. Update rank request status (if not already approved)
        IF v_request.status != 'approved' OR p_force_update THEN
            UPDATE rank_requests 
            SET 
                status = 'approved',
                approved_by = COALESCE(v_request.approved_by, auth.uid()),
                approved_at = COALESCE(v_request.approved_at, NOW()),
                updated_at = NOW()
            WHERE id = p_request_id;
            v_updated_records := v_updated_records + 1;
        END IF;
        
        -- 2. Update profile verified rank
        UPDATE profiles 
        SET 
            verified_rank = v_rank_text,
            rank_verified_at = NOW(),
            updated_at = NOW()
        WHERE user_id = v_request.user_id
        AND (verified_rank != v_rank_text OR verified_rank IS NULL OR p_force_update);
        
        IF FOUND THEN
            v_updated_records := v_updated_records + 1;
        END IF;
        
        -- 3. Update/create player rankings
        INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
        VALUES (v_request.user_id, v_rank_text, v_spa_reward, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            verified_rank = EXCLUDED.verified_rank,
            spa_points = COALESCE(player_rankings.spa_points, 0) + 
                CASE WHEN p_force_update OR player_rankings.verified_rank != v_rank_text 
                     THEN v_spa_reward ELSE 0 END,
            updated_at = NOW();
        v_updated_records := v_updated_records + 1;
        
        -- 4. Update/create wallet
        INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
        VALUES (v_request.user_id, v_spa_reward, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            points_balance = COALESCE(wallets.points_balance, 0) + 
                CASE WHEN p_force_update OR NOT EXISTS (
                    SELECT 1 FROM spa_transactions 
                    WHERE user_id = v_request.user_id 
                    AND reference_id = p_request_id
                    AND transaction_type = 'rank_approval'
                ) THEN v_spa_reward ELSE 0 END,
            updated_at = NOW();
        v_updated_records := v_updated_records + 1;
        
        -- 5. Create SPA transaction (if not exists)
        INSERT INTO spa_transactions (
            user_id, points, transaction_type, description,
            reference_id, reference_type, created_at
        )
        SELECT 
            v_request.user_id, 
            v_spa_reward, 
            'rank_approval',
            'Manual fix: Rank ' || v_rank_text || ' approved',
            p_request_id,
            'rank_request',
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM spa_transactions 
            WHERE user_id = v_request.user_id 
            AND reference_id = p_request_id
            AND transaction_type = 'rank_approval'
        ) OR p_force_update;
        
        IF FOUND THEN
            v_updated_records := v_updated_records + 1;
        END IF;
        
        -- 6. Create notification (if not exists)
        INSERT INTO notifications (
            user_id, title, message, type, metadata, created_at
        )
        SELECT 
            v_request.user_id,
            'Rank Approved!',
            'Your rank ' || v_rank_text || ' has been approved! You received ' || v_spa_reward || ' SPA points.',
            'rank_approval',
            jsonb_build_object(
                'rank', v_rank_text,
                'spa_reward', v_spa_reward,
                'manual_fix', true,
                'request_id', p_request_id
            ),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM notifications 
            WHERE user_id = v_request.user_id 
            AND type = 'rank_approval'
            AND metadata->>'request_id' = p_request_id::text
        ) OR p_force_update;
        
        IF FOUND THEN
            v_updated_records := v_updated_records + 1;
        END IF;
        
        -- 7. Update milestone progress
        PERFORM update_milestone_progress(v_request.user_id, 'rank_approved', 1);
        
        -- Return success result
        v_result := jsonb_build_object(
            'success', true,
            'message', 'Rank approval manually fixed',
            'request_id', p_request_id,
            'user_id', v_request.user_id,
            'rank', v_rank_text,
            'spa_reward', v_spa_reward,
            'updated_records', v_updated_records,
            'details', jsonb_build_object(
                'profile_updated', true,
                'rankings_updated', true,
                'wallet_updated', true,
                'transaction_created', true,
                'notification_sent', true,
                'milestone_updated', true
            )
        );
        
        RETURN v_result;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'request_id', p_request_id,
            'user_id', v_request.user_id,
            'rank', v_rank_text,
            'updated_records', v_updated_records
        );
    END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION manual_fix_rank_approval(UUID, BOOLEAN) TO authenticated;

-- Function to fix ALL pending approved requests
CREATE OR REPLACE FUNCTION fix_all_broken_rank_approvals()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request RECORD;
    v_fixed_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_results JSONB := '[]'::jsonb;
    v_fix_result JSONB;
BEGIN
    -- Find all approved requests that don't have corresponding SPA transactions
    FOR v_request IN
        SELECT r.*
        FROM rank_requests r
        WHERE r.status = 'approved'
        AND NOT EXISTS (
            SELECT 1 FROM spa_transactions st 
            WHERE st.user_id = r.user_id 
            AND st.reference_id = r.id
            AND st.transaction_type = 'rank_approval'
        )
        ORDER BY r.approved_at DESC
        LIMIT 10  -- Limit to prevent timeout
    LOOP
        -- Fix each request
        SELECT manual_fix_rank_approval(v_request.id, false) INTO v_fix_result;
        
        IF (v_fix_result->>'success')::boolean THEN
            v_fixed_count := v_fixed_count + 1;
        ELSE
            v_error_count := v_error_count + 1;
        END IF;
        
        v_results := v_results || v_fix_result;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'fixed_count', v_fixed_count,
        'error_count', v_error_count,
        'total_processed', v_fixed_count + v_error_count,
        'details', v_results
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION fix_all_broken_rank_approvals() TO authenticated;

-- Verification query
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 MANUAL RANK APPROVAL FIX FUNCTIONS CREATED';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Functions available:';
    RAISE NOTICE '   • manual_fix_rank_approval(request_id, force_update)';
    RAISE NOTICE '   • fix_all_broken_rank_approvals()';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Usage examples:';
    RAISE NOTICE '   -- Fix specific request:';
    RAISE NOTICE '   SELECT manual_fix_rank_approval(''your-request-id-here'', false);';
    RAISE NOTICE '';
    RAISE NOTICE '   -- Fix all broken approvals:';
    RAISE NOTICE '   SELECT fix_all_broken_rank_approvals();';
    RAISE NOTICE '';
    RAISE NOTICE '   -- Force update existing approval:';
    RAISE NOTICE '   SELECT manual_fix_rank_approval(''your-request-id'', true);';
    RAISE NOTICE '';
END $$;
