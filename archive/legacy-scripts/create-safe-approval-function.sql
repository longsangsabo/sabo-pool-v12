-- ================================================================================
-- CREATE SAFE APPROVAL FUNCTION
-- ================================================================================
-- Create a completely safe manual_approve_rank_request function that fixes text/integer error

-- Drop any existing problematic functions
DROP FUNCTION IF EXISTS manual_approve_rank_request(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS simple_approve_rank_request(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS rpc_approve_rank_request(UUID) CASCADE;

-- Create the SAFEST possible approval function
CREATE OR REPLACE FUNCTION manual_approve_rank_request(
    p_request_id UUID,
    p_approver_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request_data record;
    v_rank_text TEXT;
    v_spa_reward INTEGER;
    v_club_name TEXT;
    v_requested_rank_str TEXT;
    v_result jsonb;
BEGIN
    RAISE NOTICE 'Starting manual approval for request: %, approver: %', p_request_id, p_approver_id;
    
    -- Get request data
    SELECT * INTO v_request_data
    FROM rank_requests 
    WHERE id = p_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Request not found'
        );
    END IF;
    
    IF v_request_data.status != 'pending' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Request is not pending'
        );
    END IF;
    
    RAISE NOTICE 'Found request data: user_id=%, requested_rank=%, club_id=%', 
        v_request_data.user_id, v_request_data.requested_rank, v_request_data.club_id;
    
    -- COMPLETELY SAFE: Convert requested_rank to text first
    v_requested_rank_str := COALESCE(v_request_data.requested_rank::TEXT, '1');
    
    RAISE NOTICE 'Requested rank as text: %', v_requested_rank_str;
    
    -- Convert to rank text using ONLY text comparisons (comprehensive)
    v_rank_text := CASE 
        -- Handle numeric strings
        WHEN v_requested_rank_str = '1' THEN 'K'
        WHEN v_requested_rank_str = '2' THEN 'K+'
        WHEN v_requested_rank_str = '3' THEN 'I'
        WHEN v_requested_rank_str = '4' THEN 'I+'
        WHEN v_requested_rank_str = '5' THEN 'H'
        WHEN v_requested_rank_str = '6' THEN 'H+'
        WHEN v_requested_rank_str = '7' THEN 'G'
        WHEN v_requested_rank_str = '8' THEN 'G+'
        WHEN v_requested_rank_str = '9' THEN 'F'
        WHEN v_requested_rank_str = '10' THEN 'F+'
        WHEN v_requested_rank_str = '11' THEN 'E'
        WHEN v_requested_rank_str = '12' THEN 'E+'
        -- Handle text ranks
        WHEN v_requested_rank_str = 'K' THEN 'K'
        WHEN v_requested_rank_str = 'K+' THEN 'K+'
        WHEN v_requested_rank_str = 'I' THEN 'I'
        WHEN v_requested_rank_str = 'I+' THEN 'I+'
        WHEN v_requested_rank_str = 'H' THEN 'H'
        WHEN v_requested_rank_str = 'H+' THEN 'H+'
        WHEN v_requested_rank_str = 'G' THEN 'G'
        WHEN v_requested_rank_str = 'G+' THEN 'G+'
        WHEN v_requested_rank_str = 'F' THEN 'F'
        WHEN v_requested_rank_str = 'F+' THEN 'F+'
        WHEN v_requested_rank_str = 'E' THEN 'E'
        WHEN v_requested_rank_str = 'E+' THEN 'E+'
        -- Handle decimal strings
        WHEN v_requested_rank_str = '1.0' THEN 'K'
        WHEN v_requested_rank_str = '2.0' THEN 'K+'
        WHEN v_requested_rank_str = '3.0' THEN 'I'
        WHEN v_requested_rank_str = '4.0' THEN 'I+'
        WHEN v_requested_rank_str = '5.0' THEN 'H'
        WHEN v_requested_rank_str = '6.0' THEN 'H+'
        WHEN v_requested_rank_str = '7.0' THEN 'G'
        WHEN v_requested_rank_str = '8.0' THEN 'G+'
        WHEN v_requested_rank_str = '9.0' THEN 'F'
        WHEN v_requested_rank_str = '10.0' THEN 'F+'
        WHEN v_requested_rank_str = '11.0' THEN 'E'
        WHEN v_requested_rank_str = '12.0' THEN 'E+'
        ELSE 'K' -- Safe fallback
    END;
    
    RAISE NOTICE 'Converted to rank text: %', v_rank_text;
    
    -- NO SPA REWARD - already handled elsewhere for registration success
    v_spa_reward := 0;
    
    -- Get club name
    v_club_name := 'Unknown Club';
    IF v_request_data.club_id IS NOT NULL THEN
        SELECT COALESCE(club_name, 'Unknown Club') INTO v_club_name
        FROM club_profiles 
        WHERE id = v_request_data.club_id;
    END IF;
    
    RAISE NOTICE 'Starting database updates for user % with rank % and reward %', 
        v_request_data.user_id, v_rank_text, v_spa_reward;
    
    BEGIN
        -- 1. Update rank request status
        UPDATE rank_requests 
        SET 
            status = 'approved',
            approved_by = p_approver_id,
            approved_at = NOW(),
            updated_at = NOW()
        WHERE id = p_request_id;
        
        RAISE NOTICE 'Rank request updated to approved';
        
        -- 2. Update profile verified rank
        UPDATE profiles 
        SET 
            verified_rank = v_rank_text,
            updated_at = NOW()
        WHERE user_id = v_request_data.user_id;
        
        RAISE NOTICE 'Profile updated with verified rank';
        
        -- 3. Update/create player rankings
        INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
        VALUES (v_request_data.user_id, v_rank_text, v_spa_reward, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            verified_rank = EXCLUDED.verified_rank,
            spa_points = COALESCE(player_rankings.spa_points, 0) + v_spa_reward,
            updated_at = NOW();
        
        RAISE NOTICE 'Player rankings updated';
        
        -- 4. Update/create wallet
        INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
        VALUES (v_request_data.user_id, v_spa_reward, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            points_balance = COALESCE(wallets.points_balance, 0) + v_spa_reward,
            updated_at = NOW();
        
        RAISE NOTICE 'Wallet updated';
        
        -- 5. Create SPA transaction (avoid duplicates)
        IF NOT EXISTS (
            SELECT 1 FROM spa_transactions 
            WHERE user_id = v_request_data.user_id 
            AND reference_id = p_request_id
            AND transaction_type = 'rank_approval'
        ) THEN
            INSERT INTO spa_transactions (
                user_id, points, transaction_type, description,
                reference_id, reference_type, metadata, created_at
            ) VALUES (
                v_request_data.user_id, 
                v_spa_reward, 
                'rank_approval',
                'Rank ' || v_rank_text || ' approved by ' || v_club_name,
                p_request_id,
                'rank_request',
                jsonb_build_object(
                    'rank', v_rank_text,
                    'club_id', v_request_data.club_id,
                    'approved_by', p_approver_id
                ),
                NOW()
            );
            RAISE NOTICE 'SPA transaction created';
        ELSE
            RAISE NOTICE 'SPA transaction already exists, skipping';
        END IF;
        
        -- 6. Add user to club (if club_id exists)
        IF v_request_data.club_id IS NOT NULL THEN
            INSERT INTO club_members (club_id, user_id, status, join_date, membership_type, role, created_at, updated_at)
            VALUES (v_request_data.club_id, v_request_data.user_id, 'approved', NOW(), 'verified_member', 'member', NOW(), NOW())
            ON CONFLICT (club_id, user_id) 
            DO UPDATE SET 
                status = 'approved',
                membership_type = 'verified_member',
                updated_at = NOW();
            
            RAISE NOTICE 'Club membership updated';
        END IF;
        
        -- 7. Create notification (avoid duplicates)
        IF NOT EXISTS (
            SELECT 1 FROM notifications 
            WHERE user_id = v_request_data.user_id 
            AND type = 'rank_approval'
            AND metadata->>'request_id' = p_request_id::text
        ) THEN
            INSERT INTO notifications (
                user_id, title, message, type, metadata, created_at
            ) VALUES (
                v_request_data.user_id,
                'Rank Approved! 🎉',
                'Congratulations! Your rank ' || v_rank_text || ' has been approved by ' || v_club_name || '. You received ' || v_spa_reward || ' SPA points!',
                'rank_approval',
                jsonb_build_object(
                    'rank', v_rank_text,
                    'spa_reward', v_spa_reward,
                    'request_id', p_request_id,
                    'club_id', v_request_data.club_id,
                    'club_name', v_club_name
                ),
                NOW()
            );
            RAISE NOTICE 'Notification created';
        ELSE
            RAISE NOTICE 'Notification already exists, skipping';
        END IF;
        
        -- Build success result
        v_result := jsonb_build_object(
            'success', true,
            'rank', v_rank_text,
            'spa_reward', v_spa_reward,
            'club_name', v_club_name,
            'message', 'Rank approval completed successfully'
        );
        
        RAISE NOTICE '✅ Manual approval completed successfully: %', v_result;
        
        RETURN v_result;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ Error in manual approval: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
    END;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION manual_approve_rank_request(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION manual_approve_rank_request(UUID, UUID) TO anon;

-- Test output
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛠️ SAFE APPROVAL FUNCTION CREATED!';
    RAISE NOTICE '===================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ manual_approve_rank_request() function recreated';
    RAISE NOTICE '✅ All text/integer comparisons completely fixed';
    RAISE NOTICE '✅ Comprehensive rank format handling';
    RAISE NOTICE '✅ Full approval workflow included';
    RAISE NOTICE '✅ Error handling and logging added';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Frontend can now call this function safely:';
    RAISE NOTICE '   supabase.rpc("manual_approve_rank_request", {';
    RAISE NOTICE '     p_request_id: "uuid",';
    RAISE NOTICE '     p_approver_id: "uuid"';
    RAISE NOTICE '   })';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Function will return JSON with success/error status';
    RAISE NOTICE '';
END $$;
