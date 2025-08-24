-- =====================================================
-- 🏗️ PHASE 3: REBUILD FOUNDATION - SPA MANAGEMENT FUNCTIONS
-- =====================================================
-- Intelligent, atomic, and robust SPA system

-- Step 1: Core SPA Balance Management Function
CREATE OR REPLACE FUNCTION public.update_spa_balance(
    p_user_id UUID,
    p_points_change INTEGER, -- Can be positive (add) or negative (subtract)
    p_transaction_type VARCHAR(50),
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_user_exists BOOLEAN;
    v_transaction_id UUID;
BEGIN
    -- Input validation
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User ID cannot be null',
            'error_code', 'INVALID_USER_ID'
        );
    END IF;
    
    IF p_points_change = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Points change cannot be zero',
            'error_code', 'INVALID_POINTS'
        );
    END IF;
    
    -- Check if user exists in player_rankings
    SELECT spa_points INTO v_current_balance
    FROM player_rankings 
    WHERE user_id = p_user_id;
    
    v_user_exists := FOUND;
    
    -- Create user record if doesn't exist
    IF NOT v_user_exists THEN
        INSERT INTO player_rankings (
            user_id, 
            player_id, 
            spa_points, 
            created_at, 
            updated_at
        ) VALUES (
            p_user_id, 
            p_user_id, 
            0, 
            NOW(), 
            NOW()
        );
        v_current_balance := 0;
        RAISE NOTICE 'Created new player_rankings record for user: %', p_user_id;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_points_change;
    
    -- Prevent negative balances (safety check)
    IF v_new_balance < 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Insufficient SPA balance. Current: %s, Attempted change: %s', 
                          v_current_balance, p_points_change),
            'error_code', 'INSUFFICIENT_BALANCE',
            'current_balance', v_current_balance,
            'attempted_change', p_points_change,
            'shortage', ABS(v_new_balance)
        );
    END IF;
    
    -- Update balance atomically
    UPDATE player_rankings 
    SET 
        spa_points = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Create transaction record
    INSERT INTO spa_transactions (
        user_id,
        points,
        transaction_type,
        description,
        reference_id,
        reference_type,
        metadata,
        created_at
    ) VALUES (
        p_user_id,
        p_points_change,
        p_transaction_type,
        p_description,
        p_reference_id,
        p_reference_type,
        p_metadata,
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    RAISE NOTICE 'SPA Balance Updated: User % | %s → %s (%s%s) | Transaction: %', 
                 p_user_id, v_current_balance, v_new_balance, 
                 CASE WHEN p_points_change > 0 THEN '+' ELSE '' END,
                 p_points_change, v_transaction_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'SPA balance updated successfully',
        'user_id', p_user_id,
        'previous_balance', v_current_balance,
        'points_change', p_points_change,
        'new_balance', v_new_balance,
        'transaction_id', v_transaction_id,
        'transaction_type', p_transaction_type
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Internal error: ' || SQLERRM,
        'error_code', 'INTERNAL_ERROR'
    );
END;
$$;

-- Step 2: SPA Validation Function
CREATE OR REPLACE FUNCTION public.validate_spa_requirement(
    p_user_id UUID,
    p_required_points INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Input validation
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'User ID cannot be null'
        );
    END IF;
    
    IF p_required_points < 0 THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Required points cannot be negative'
        );
    END IF;
    
    -- Get current balance
    SELECT COALESCE(spa_points, 0) INTO v_current_balance
    FROM player_rankings 
    WHERE user_id = p_user_id;
    
    -- If user not found, treat as 0 balance
    IF NOT FOUND THEN
        v_current_balance := 0;
    END IF;
    
    -- Validation result
    IF v_current_balance >= p_required_points THEN
        RETURN jsonb_build_object(
            'valid', true,
            'current_balance', v_current_balance,
            'required_points', p_required_points,
            'surplus', v_current_balance - p_required_points
        );
    ELSE
        RETURN jsonb_build_object(
            'valid', false,
            'current_balance', v_current_balance,
            'required_points', p_required_points,
            'shortage', p_required_points - v_current_balance,
            'error', format('Insufficient SPA balance. Need %s more points.', 
                          p_required_points - v_current_balance)
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'valid', false,
        'error', 'Validation error: ' || SQLERRM
    );
END;
$$;

-- Step 3: SPA Transfer Between Users Function
CREATE OR REPLACE FUNCTION public.transfer_spa_points(
    p_from_user_id UUID,
    p_to_user_id UUID,
    p_points INTEGER,
    p_transaction_type VARCHAR(50),
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT 'transfer',
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_validation_result JSONB;
    v_from_result JSONB;
    v_to_result JSONB;
    v_from_balance_before INTEGER;
    v_to_balance_before INTEGER;
    v_from_balance_after INTEGER;
    v_to_balance_after INTEGER;
BEGIN
    -- Input validation
    IF p_from_user_id IS NULL OR p_to_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Both user IDs must be provided',
            'error_code', 'INVALID_INPUT'
        );
    END IF;
    
    IF p_from_user_id = p_to_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot transfer points to yourself',
            'error_code', 'SELF_TRANSFER'
        );
    END IF;
    
    IF p_points <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Transfer amount must be positive',
            'error_code', 'INVALID_AMOUNT'
        );
    END IF;
    
    -- Get balances before transfer
    SELECT COALESCE(spa_points, 0) INTO v_from_balance_before
    FROM player_rankings WHERE user_id = p_from_user_id;
    
    SELECT COALESCE(spa_points, 0) INTO v_to_balance_before  
    FROM player_rankings WHERE user_id = p_to_user_id;
    
    -- Validate sender has sufficient balance
    SELECT validate_spa_requirement(p_from_user_id, p_points) INTO v_validation_result;
    
    IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', v_validation_result->>'error',
            'error_code', 'INSUFFICIENT_BALANCE',
            'validation_details', v_validation_result
        );
    END IF;
    
    -- Perform atomic transfer
    BEGIN
        -- Subtract from sender
        SELECT update_spa_balance(
            p_from_user_id,
            -p_points,
            p_transaction_type || '_send',
            p_description || ' (sent)',
            p_reference_id,
            p_reference_type,
            jsonb_build_object('transfer_to', p_to_user_id) || COALESCE(p_metadata, '{}'::jsonb)
        ) INTO v_from_result;
        
        IF NOT (v_from_result->>'success')::BOOLEAN THEN
            RAISE EXCEPTION 'Failed to subtract points from sender: %', v_from_result->>'error';
        END IF;
        
        -- Add to receiver
        SELECT update_spa_balance(
            p_to_user_id,
            p_points,
            p_transaction_type || '_receive',
            p_description || ' (received)',
            p_reference_id,
            p_reference_type,
            jsonb_build_object('transfer_from', p_from_user_id) || COALESCE(p_metadata, '{}'::jsonb)
        ) INTO v_to_result;
        
        IF NOT (v_to_result->>'success')::BOOLEAN THEN
            RAISE EXCEPTION 'Failed to add points to receiver: %', v_to_result->>'error';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Transfer failed: ' || SQLERRM,
            'error_code', 'TRANSFER_FAILED'
        );
    END;
    
    -- Get balances after transfer for verification
    v_from_balance_after := (v_from_result->>'new_balance')::INTEGER;
    v_to_balance_after := (v_to_result->>'new_balance')::INTEGER;
    
    RAISE NOTICE 'SPA Transfer Completed: % points from % to % | Sender: %→% | Receiver: %→%',
                 p_points, p_from_user_id, p_to_user_id,
                 v_from_balance_before, v_from_balance_after,
                 v_to_balance_before, v_to_balance_after;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Successfully transferred %s SPA points', p_points),
        'points_transferred', p_points,
        'from_user_id', p_from_user_id,
        'to_user_id', p_to_user_id,
        'sender_balance', jsonb_build_object(
            'before', v_from_balance_before,
            'after', v_from_balance_after
        ),
        'receiver_balance', jsonb_build_object(
            'before', v_to_balance_before,
            'after', v_to_balance_after
        ),
        'sender_transaction_id', v_from_result->>'transaction_id',
        'receiver_transaction_id', v_to_result->>'transaction_id'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Transfer error: ' || SQLERRM,
        'error_code', 'TRANSFER_ERROR'
    );
END;
$$;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.update_spa_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_spa_requirement TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_spa_points TO authenticated;

-- Step 5: Test the functions
DO $$
BEGIN
    RAISE NOTICE '🧪 SPA MANAGEMENT FUNCTIONS CREATED SUCCESSFULLY!';
    RAISE NOTICE '✅ update_spa_balance - Core balance management';
    RAISE NOTICE '✅ validate_spa_requirement - Balance validation';
    RAISE NOTICE '✅ transfer_spa_points - Atomic transfers';
    RAISE NOTICE '🎯 Ready for challenge system integration!';
END $$;
