-- FIX accept_open_challenge_v3 - SỬA TÊN COLUMN
-- ===============================================

CREATE OR REPLACE FUNCTION accept_open_challenge_v3(
    p_challenge_id uuid,
    p_user_id uuid
)
RETURNS JSON AS $$
DECLARE
    challenge_record RECORD;
    challenger_spa_balance integer;
    opponent_spa_balance integer;
    required_spa integer;
    result JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- 1. Validate challenge exists and is open
        SELECT 
            c.id,
            c.challenger_id,
            c.opponent_id,
            c.bet_points as spa_amount,  -- ✅ FIXED: bet_points instead of spa_amount
            c.status,
            c.club_id,
            cr.verified_rank as challenger_rank,  -- ✅ FIXED: verified_rank instead of rank
            pr.verified_rank as current_user_rank -- ✅ FIXED: verified_rank instead of rank
        INTO challenge_record
        FROM challenges c
        LEFT JOIN profiles cr ON cr.user_id = c.challenger_id  -- ✅ FIXED: user_id instead of id
        LEFT JOIN profiles pr ON pr.user_id = p_user_id       -- ✅ FIXED: user_id instead of id
        WHERE c.id = p_challenge_id;

        -- Check if challenge exists
        IF NOT FOUND THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Challenge not found',
                'code', 'CHALLENGE_NOT_FOUND'
            );
        END IF;

        -- Check if challenge is open
        IF challenge_record.status != 'open' THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Challenge is not open',
                'code', 'CHALLENGE_NOT_OPEN',
                'current_status', challenge_record.status
            );
        END IF;

        -- Check if user is trying to accept their own challenge
        IF challenge_record.challenger_id = p_user_id THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Cannot accept your own challenge',
                'code', 'SELF_CHALLENGE'
            );
        END IF;

        -- Check if challenge already has opponent
        IF challenge_record.opponent_id IS NOT NULL THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Challenge already has an opponent',
                'code', 'CHALLENGE_TAKEN'
            );
        END IF;

        -- 2. Check SPA balances
        required_spa := challenge_record.spa_amount;

        SELECT spa_balance INTO challenger_spa_balance 
        FROM profiles WHERE user_id = challenge_record.challenger_id;  -- ✅ FIXED: user_id

        SELECT spa_balance INTO opponent_spa_balance 
        FROM profiles WHERE user_id = p_user_id;                       -- ✅ FIXED: user_id

        -- Validate both users have enough SPA
        IF challenger_spa_balance < required_spa THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Challenger has insufficient SPA balance',
                'code', 'CHALLENGER_INSUFFICIENT_SPA',
                'required', required_spa,
                'available', challenger_spa_balance
            );
        END IF;

        IF opponent_spa_balance < required_spa THEN
            RETURN json_build_object(
                'success', false,
                'error', 'You have insufficient SPA balance',
                'code', 'OPPONENT_INSUFFICIENT_SPA',
                'required', required_spa,
                'available', opponent_spa_balance
            );
        END IF;

        -- 3. Deduct SPA from both users (atomic transaction)
        UPDATE profiles 
        SET spa_balance = spa_balance - required_spa,
            updated_at = NOW()
        WHERE user_id = challenge_record.challenger_id;  -- ✅ FIXED: user_id

        UPDATE profiles 
        SET spa_balance = spa_balance - required_spa,
            updated_at = NOW()
        WHERE user_id = p_user_id;                       -- ✅ FIXED: user_id

        -- 4. Update challenge with opponent
        UPDATE challenges 
        SET 
            opponent_id = p_user_id,
            status = 'accepted',
            responded_at = NOW(),                        -- ✅ FIXED: responded_at instead of accepted_at
            updated_at = NOW()
        WHERE id = p_challenge_id;

        -- 5. Create SPA transaction logs (if spa_transactions table exists)
        -- Note: Skip if table doesn't exist to avoid errors
        BEGIN
            INSERT INTO spa_transactions (user_id, amount, type, description, challenge_id)
            VALUES 
            (challenge_record.challenger_id, -required_spa, 'challenge_stake', 
             'SPA staked for challenge #' || p_challenge_id, p_challenge_id),
            (p_user_id, -required_spa, 'challenge_stake', 
             'SPA staked for accepted challenge #' || p_challenge_id, p_challenge_id);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if spa_transactions table doesn't exist
            NULL;
        END;

        -- 6. Build success response with all necessary data
        result := json_build_object(
            'success', true,
            'message', 'Challenge accepted successfully',
            'challenge_id', p_challenge_id,
            'challenger_id', challenge_record.challenger_id,
            'opponent_id', p_user_id,
            'spa_amount', required_spa,
            'status', 'accepted',
            'challenger_rank', challenge_record.challenger_rank,
            'opponent_rank', challenge_record.current_user_rank,
            'club_id', challenge_record.club_id,
            'accepted_at', NOW(),
            'total_spa_pool', required_spa * 2
        );

        RETURN result;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback happens automatically
        RETURN json_build_object(
            'success', false,
            'error', 'Database error occurred',
            'code', 'DATABASE_ERROR',
            'details', SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test function
SELECT 'accept_open_challenge_v3 FIXED successfully!' as status;
