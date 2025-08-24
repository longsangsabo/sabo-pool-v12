-- =====================================================
-- 🏛️ PHASE 5: CLUB APPROVAL & AUTOMATION SYSTEM
-- =====================================================
-- Intelligent club approval with automatic SPA processing

-- Step 1: Club Approval Processing Function
CREATE OR REPLACE FUNCTION public.process_club_approval(
    p_challenge_id UUID,
    p_club_admin_id UUID,
    p_approved BOOLEAN,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_spa_transfer_result JSONB;
    v_winner_id UUID;
    v_loser_id UUID;
BEGIN
    -- Input validation
    IF p_challenge_id IS NULL OR p_club_admin_id IS NULL OR p_approved IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge ID, admin ID, and approval decision are required',
            'error_code', 'INVALID_INPUT'
        );
    END IF;
    
    -- Get challenge details with lock
    SELECT * INTO v_challenge
    FROM challenges 
    WHERE id = p_challenge_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge not found',
            'error_code', 'CHALLENGE_NOT_FOUND'
        );
    END IF;
    
    -- Validate challenge is ready for club approval
    IF v_challenge.status != 'ongoing' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Challenge is not ready for approval (status: %s)', v_challenge.status),
            'error_code', 'INVALID_STATUS'
        );
    END IF;
    
    IF v_challenge.challenger_score IS NULL OR v_challenge.opponent_score IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge scores are missing',
            'error_code', 'MISSING_SCORES'
        );
    END IF;
    
    IF v_challenge.club_confirmed IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge has already been reviewed by club',
            'error_code', 'ALREADY_REVIEWED'
        );
    END IF;
    
    -- TODO: Validate admin has permission for this club
    -- This would require checking club membership/admin role
    
    -- Determine winner/loser for SPA transfer
    IF v_challenge.challenger_score > v_challenge.opponent_score THEN
        v_winner_id := v_challenge.challenger_id;
        v_loser_id := v_challenge.opponent_id;
    ELSIF v_challenge.opponent_score > v_challenge.challenger_score THEN
        v_winner_id := v_challenge.opponent_id;
        v_loser_id := v_challenge.challenger_id;
    ELSE
        -- Draw - no SPA transfer needed
        v_winner_id := NULL;
        v_loser_id := NULL;
    END IF;
    
    -- Process based on approval decision
    IF p_approved THEN
        -- APPROVED: Process SPA transfer and complete challenge
        
        -- Process SPA transfer (only if there's a winner)
        IF v_winner_id IS NOT NULL AND v_loser_id IS NOT NULL AND v_challenge.bet_points > 0 THEN
            SELECT transfer_spa_points(
                v_loser_id,                    -- from (loser)
                v_winner_id,                   -- to (winner)  
                v_challenge.bet_points,        -- points
                'challenge_result',            -- transaction type
                format('Challenge %s result: Winner %s vs Loser %s (Score: %s-%s)', 
                       p_challenge_id, v_winner_id, v_loser_id,
                       v_challenge.challenger_score, v_challenge.opponent_score),
                p_challenge_id,                -- reference_id
                'challenge',                   -- reference_type
                jsonb_build_object(
                    'challenge_id', p_challenge_id,
                    'challenger_id', v_challenge.challenger_id,
                    'opponent_id', v_challenge.opponent_id,
                    'challenger_score', v_challenge.challenger_score,
                    'opponent_score', v_challenge.opponent_score,
                    'approved_by', p_club_admin_id,
                    'approved_at', NOW()
                )
            ) INTO v_spa_transfer_result;
            
            IF NOT (v_spa_transfer_result->>'success')::BOOLEAN THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', 'Failed to process SPA transfer: ' || (v_spa_transfer_result->>'error'),
                    'error_code', 'SPA_TRANSFER_FAILED',
                    'spa_error_details', v_spa_transfer_result
                );
            END IF;
            
            RAISE NOTICE 'SPA Transfer Processed: %s SPA from % to % for challenge %',
                         v_challenge.bet_points, v_loser_id, v_winner_id, p_challenge_id;
        END IF;
        
        -- Update challenge to completed with approval
        UPDATE challenges SET
            club_confirmed = true,
            club_confirmed_at = NOW(),
            club_note = p_admin_notes,
            status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = p_challenge_id;
        
        RAISE NOTICE 'Challenge Approved: ID=% | Winner=% | SPA Transfer=%s | Admin=%',
                     p_challenge_id, COALESCE(v_winner_id::TEXT, 'DRAW'), 
                     v_challenge.bet_points, p_club_admin_id;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Challenge approved and completed successfully',
            'challenge_id', p_challenge_id,
            'approved', true,
            'winner_id', v_winner_id,
            'spa_transferred', CASE 
                WHEN v_winner_id IS NOT NULL THEN v_challenge.bet_points 
                ELSE 0 
            END,
            'spa_transfer_details', v_spa_transfer_result,
            'approved_by', p_club_admin_id,
            'approved_at', NOW(),
            'admin_notes', p_admin_notes,
            'status', 'completed'
        );
        
    ELSE
        -- REJECTED: Update challenge without SPA transfer
        UPDATE challenges SET
            club_confirmed = false,
            club_confirmed_at = NOW(), 
            club_note = p_admin_notes,
            status = 'rejected',
            updated_at = NOW()
        WHERE id = p_challenge_id;
        
        RAISE NOTICE 'Challenge Rejected: ID=% | Admin=% | Reason=%',
                     p_challenge_id, p_club_admin_id, p_admin_notes;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Challenge result rejected',
            'challenge_id', p_challenge_id,
            'approved', false,
            'rejected_by', p_club_admin_id,
            'rejected_at', NOW(),
            'admin_notes', p_admin_notes,
            'status', 'rejected',
            'spa_transferred', 0
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Club approval processing failed: ' || SQLERRM,
        'error_code', 'APPROVAL_PROCESSING_FAILED'
    );
END;
$$;

-- Step 2: Auto Club Approval Function (for trusted scenarios)
CREATE OR REPLACE FUNCTION public.auto_approve_challenge(
    p_challenge_id UUID,
    p_reason TEXT DEFAULT 'Automatic approval',
    p_system_user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Use the main approval function with system user
    RETURN process_club_approval(
        p_challenge_id,
        p_system_user_id,
        true, -- auto approve
        p_reason
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Auto approval failed: ' || SQLERRM,
        'error_code', 'AUTO_APPROVAL_FAILED'
    );
END;
$$;

-- Step 3: Club Approval Trigger Function
CREATE OR REPLACE FUNCTION public.on_club_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This trigger fires when club_confirmed changes to true
    IF NEW.club_confirmed = true AND (OLD.club_confirmed IS NULL OR OLD.club_confirmed = false) THEN
        RAISE NOTICE 'Club Approval Trigger: Challenge % approved by club', NEW.id;
        
        -- Additional automated actions can be added here:
        -- - Send notifications to participants
        -- - Update statistics
        -- - Log approval event
        -- - Integration with external systems
        
        -- For now, the main SPA processing is handled by process_club_approval function
        -- This trigger serves as a hook for additional automation
    END IF;
    
    -- This trigger fires when club_confirmed changes to false (rejected)
    IF NEW.club_confirmed = false AND (OLD.club_confirmed IS NULL OR OLD.club_confirmed != false) THEN
        RAISE NOTICE 'Club Rejection Trigger: Challenge % rejected by club', NEW.id;
        
        -- Additional automated actions for rejections:
        -- - Send rejection notifications
        -- - Log rejection event
        -- - Handle dispute process initiation
    END IF;
    
    RETURN NEW;
END;
$$;

-- Step 4: Challenge Status Change Trigger Function
CREATE OR REPLACE FUNCTION public.on_challenge_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Auto-expire old pending challenges
    IF NEW.status = 'pending' AND NEW.expires_at <= NOW() THEN
        NEW.status := 'expired';
        NEW.updated_at := NOW();
        RAISE NOTICE 'Auto-expired challenge: %', NEW.id;
    END IF;
    
    -- Auto-start matches when challenges are accepted
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Update match status if exists
        UPDATE matches 
        SET status = 'scheduled', updated_at = NOW()
        WHERE challenge_id = NEW.id AND status = 'scheduled';
        
        RAISE NOTICE 'Challenge accepted - match ready: %', NEW.id;
    END IF;
    
    -- Log status changes
    RAISE NOTICE 'Challenge Status Change: % | %s → %s', 
                 NEW.id, OLD.status, NEW.status;
    
    RETURN NEW;
END;
$$;

-- Step 5: Create Triggers
CREATE TRIGGER club_approval_trigger
    AFTER UPDATE ON challenges
    FOR EACH ROW
    WHEN (OLD.club_confirmed IS DISTINCT FROM NEW.club_confirmed)
    EXECUTE FUNCTION on_club_approval();

CREATE TRIGGER challenge_status_change_trigger
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION on_challenge_status_change();

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION public.process_club_approval TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_approve_challenge TO authenticated;

-- Step 7: Success confirmation
DO $$
BEGIN
    RAISE NOTICE '🏛️ CLUB APPROVAL SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE '✅ process_club_approval - Complete approval workflow with SPA processing';
    RAISE NOTICE '✅ auto_approve_challenge - Automated approval for trusted scenarios';  
    RAISE NOTICE '⚡ on_club_approval - Trigger for post-approval automation';
    RAISE NOTICE '⚡ on_challenge_status_change - Status change automation';
    RAISE NOTICE '🎯 Triggers activated: club_approval_trigger, challenge_status_change_trigger';
    RAISE NOTICE '🔥 System ready for full challenge workflow automation!';
END $$;
