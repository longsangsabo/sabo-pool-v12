-- ================================================================================
-- RESTORE ALL DROPPED FUNCTIONS
-- ================================================================================
-- Restore all functions that were dropped during rank approval fix

-- Step 1: Restore milestone functions from backup
SELECT restore_milestone_functions();

-- Step 2: Check if functions exist and restore manually if needed
DO $$
DECLARE
    missing_functions TEXT[] := ARRAY[
        'award_milestone_spa',
        'complete_milestone', 
        'complete_milestone_dual_id',
        'check_and_award_milestones',
        'process_spa_on_completion',
        'update_milestone_progress',
        'handle_rank_request_approval'
    ];
    func_name TEXT;
    func_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Checking for missing functions...';
    
    FOREACH func_name IN ARRAY missing_functions
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON n.oid = p.pronamespace 
            WHERE n.nspname = 'public' AND p.proname = func_name
        ) INTO func_exists;
        
        IF NOT func_exists THEN
            RAISE NOTICE '❌ Missing function: %', func_name;
        ELSE
            RAISE NOTICE '✅ Function exists: %', func_name;
        END IF;
    END LOOP;
END $$;

-- Step 3: Recreate core milestone functions manually
-- ================================================================================

-- 1. Award Milestone SPA Function
CREATE OR REPLACE FUNCTION public.award_milestone_spa(
    p_user_id UUID,
    p_spa_amount INTEGER,
    p_milestone_type TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id UUID;
    v_transaction_id UUID;
BEGIN
    -- Get or create wallet
    INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update wallet balance
    UPDATE wallets 
    SET 
        points_balance = COALESCE(points_balance, 0) + p_spa_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING id INTO v_wallet_id;
    
    -- Create transaction record
    INSERT INTO spa_transactions (
        user_id, 
        points, 
        transaction_type, 
        description,
        reference_id,
        reference_type,
        created_at
    ) VALUES (
        p_user_id,
        p_spa_amount,
        'milestone_completion',
        format('SPA awarded for %s milestone', p_milestone_type),
        p_reference_id,
        'milestone',
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'spa_awarded', p_spa_amount,
        'wallet_id', v_wallet_id,
        'transaction_id', v_transaction_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END $$;

-- 2. Complete Milestone Function
CREATE OR REPLACE FUNCTION public.complete_milestone(
    p_milestone_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_milestone RECORD;
    v_spa_reward INTEGER;
    v_result JSONB;
BEGIN
    -- Get milestone details
    SELECT * INTO v_milestone
    FROM milestones 
    WHERE id = p_milestone_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Milestone not found');
    END IF;
    
    -- Check if already completed
    IF EXISTS (
        SELECT 1 FROM user_milestones 
        WHERE milestone_id = p_milestone_id 
        AND user_id = p_user_id 
        AND completed_at IS NOT NULL
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Milestone already completed');
    END IF;
    
    -- Mark as completed
    INSERT INTO user_milestones (user_id, milestone_id, completed_at, created_at, updated_at)
    VALUES (p_user_id, p_milestone_id, NOW(), NOW(), NOW())
    ON CONFLICT (user_id, milestone_id) DO UPDATE SET
        completed_at = NOW(),
        updated_at = NOW();
    
    -- Award SPA if milestone has reward
    v_spa_reward := COALESCE(v_milestone.spa_reward, 0);
    
    IF v_spa_reward > 0 THEN
        SELECT award_milestone_spa(p_user_id, v_spa_reward, v_milestone.title, p_milestone_id) INTO v_result;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'milestone_id', p_milestone_id,
        'spa_awarded', v_spa_reward,
        'award_result', v_result
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END $$;

-- 3. Update Milestone Progress Function
CREATE OR REPLACE FUNCTION public.update_milestone_progress(
    p_user_id UUID,
    p_milestone_type TEXT,
    p_progress_increment INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_milestone RECORD;
    v_user_milestone RECORD;
    v_new_progress INTEGER;
    v_completed_milestones INTEGER := 0;
    v_results JSONB := '[]'::jsonb;
BEGIN
    -- Find relevant milestones
    FOR v_milestone IN 
        SELECT * FROM milestones 
        WHERE milestone_type = p_milestone_type 
        AND is_active = true
        ORDER BY target_value ASC
    LOOP
        -- Get current progress
        SELECT * INTO v_user_milestone
        FROM user_milestones 
        WHERE user_id = p_user_id AND milestone_id = v_milestone.id;
        
        -- Skip if already completed
        IF v_user_milestone.completed_at IS NOT NULL THEN
            CONTINUE;
        END IF;
        
        -- Calculate new progress
        v_new_progress := COALESCE(v_user_milestone.progress, 0) + p_progress_increment;
        
        -- Update progress
        INSERT INTO user_milestones (user_id, milestone_id, progress, created_at, updated_at)
        VALUES (p_user_id, v_milestone.id, v_new_progress, NOW(), NOW())
        ON CONFLICT (user_id, milestone_id) DO UPDATE SET
            progress = v_new_progress,
            updated_at = NOW();
        
        -- Check if milestone completed
        IF v_new_progress >= v_milestone.target_value THEN
            -- Complete the milestone
            UPDATE user_milestones 
            SET completed_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id AND milestone_id = v_milestone.id;
            
            -- Award SPA
            IF v_milestone.spa_reward > 0 THEN
                PERFORM award_milestone_spa(p_user_id, v_milestone.spa_reward, v_milestone.title, v_milestone.id);
            END IF;
            
            v_completed_milestones := v_completed_milestones + 1;
            
            -- Add to results
            v_results := v_results || jsonb_build_object(
                'milestone_id', v_milestone.id,
                'title', v_milestone.title,
                'spa_reward', v_milestone.spa_reward,
                'completed', true
            );
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'milestones_completed', v_completed_milestones,
        'completed_milestones', v_results
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END $$;

-- 4. Process SPA on Completion Function
CREATE OR REPLACE FUNCTION public.process_spa_on_completion(
    p_user_id UUID,
    p_spa_amount INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN award_milestone_spa(p_user_id, p_spa_amount, 'match_completion', NULL);
END $$;

-- 5. Check and Award Milestones Function
CREATE OR REPLACE FUNCTION public.check_and_award_milestones(
    p_user_id UUID,
    p_activity_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN update_milestone_progress(p_user_id, p_activity_type, p_increment);
END $$;

-- 6. Recreate Rank Request Approval Function
CREATE OR REPLACE FUNCTION public.handle_rank_request_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_spa_amount INTEGER;
    v_rank_text TEXT;
BEGIN
    -- Only process when status changes to approved
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        
        -- Convert rank to text and calculate SPA
        CASE NEW.requested_rank
            WHEN 1 THEN v_rank_text := 'K'; v_spa_amount := 100;
            WHEN 2 THEN v_rank_text := 'K+'; v_spa_amount := 100;
            WHEN 3 THEN v_rank_text := 'I'; v_spa_amount := 120;
            WHEN 4 THEN v_rank_text := 'I+'; v_spa_amount := 120;
            WHEN 5 THEN v_rank_text := 'H'; v_spa_amount := 150;
            WHEN 6 THEN v_rank_text := 'H+'; v_spa_amount := 150;
            WHEN 7 THEN v_rank_text := 'G'; v_spa_amount := 200;
            WHEN 8 THEN v_rank_text := 'G+'; v_spa_amount := 200;
            WHEN 9 THEN v_rank_text := 'F'; v_spa_amount := 250;
            WHEN 10 THEN v_rank_text := 'F+'; v_spa_amount := 250;
            WHEN 11 THEN v_rank_text := 'E'; v_spa_amount := 300;
            WHEN 12 THEN v_rank_text := 'E+'; v_spa_amount := 300;
            ELSE v_rank_text := 'K'; v_spa_amount := 100;
        END CASE;
        
        -- Update player profile
        UPDATE profiles 
        SET 
            verified_rank = v_rank_text,
            rank_verified_at = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Award SPA
        PERFORM award_milestone_spa(NEW.user_id, v_spa_amount, 'rank_approval', NEW.id);
        
        -- Update player rankings
        INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
        VALUES (NEW.user_id, v_rank_text, v_spa_amount, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            verified_rank = EXCLUDED.verified_rank,
            spa_points = COALESCE(player_rankings.spa_points, 0) + v_spa_amount,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END $$;

-- Step 4: Grant permissions to all functions
GRANT EXECUTE ON FUNCTION award_milestone_spa(UUID, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_milestone(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_milestone_progress(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION process_spa_on_completion(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_milestones(UUID, TEXT, INTEGER) TO authenticated;

-- Step 5: Recreate trigger (optional - you can enable later if needed)
-- DROP TRIGGER IF EXISTS trigger_handle_rank_approval ON rank_requests;
-- CREATE TRIGGER trigger_handle_rank_approval
--     AFTER UPDATE ON rank_requests
--     FOR EACH ROW
--     EXECUTE FUNCTION handle_rank_request_approval();

-- Step 6: Verification
DO $$
DECLARE
    restored_functions TEXT[] := ARRAY[
        'award_milestone_spa',
        'complete_milestone',
        'update_milestone_progress', 
        'process_spa_on_completion',
        'check_and_award_milestones',
        'handle_rank_request_approval'
    ];
    func_name TEXT;
    func_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 FUNCTION RESTORATION COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Restored functions:';
    
    FOREACH func_name IN ARRAY restored_functions
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON n.oid = p.pronamespace 
            WHERE n.nspname = 'public' AND p.proname = func_name
        ) THEN
            RAISE NOTICE '   ✅ %', func_name;
            func_count := func_count + 1;
        ELSE
            RAISE NOTICE '   ❌ %', func_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary: %/% functions restored', func_count, array_length(restored_functions, 1);
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Note: Trigger is disabled for now to prevent conflicts';
    RAISE NOTICE '    You can enable it later if needed.';
    RAISE NOTICE '';
END $$;
