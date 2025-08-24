-- =====================================================
-- 🎯 PHASE 4: CORE CHALLENGE MANAGEMENT FUNCTIONS
-- =====================================================
-- Intelligent challenge system with comprehensive validation

-- Step 1: Challenge Creation Function
CREATE OR REPLACE FUNCTION public.create_challenge(
    p_challenger_id UUID,
    p_opponent_id UUID DEFAULT NULL,
    p_bet_points INTEGER DEFAULT 100,
    p_race_to INTEGER DEFAULT 8,
    p_club_id UUID DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_scheduled_time TIMESTAMPTZ DEFAULT NULL,
    p_is_sabo BOOLEAN DEFAULT TRUE,
    p_handicap_1_rank DECIMAL(3,1) DEFAULT 0,
    p_handicap_05_rank DECIMAL(3,1) DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge_id UUID;
    v_validation_result JSONB;
    v_expires_at TIMESTAMPTZ;
    v_challenge_type VARCHAR(20);
BEGIN
    -- Input validation
    IF p_challenger_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenger ID is required',
            'error_code', 'INVALID_CHALLENGER'
        );
    END IF;
    
    -- Validate bet points
    IF p_bet_points < 100 OR p_bet_points > 650 OR p_bet_points % 50 != 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Bet points must be between 100-650 and divisible by 50',
            'error_code', 'INVALID_BET_POINTS'
        );
    END IF;
    
    -- Validate race_to
    IF p_race_to < 5 OR p_race_to > 15 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Race to must be between 5 and 15',
            'error_code', 'INVALID_RACE_TO'
        );
    END IF;
    
    -- Check challenger can't challenge themselves
    IF p_challenger_id = p_opponent_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot challenge yourself',
            'error_code', 'SELF_CHALLENGE'
        );
    END IF;
    
    -- Validate challenger has sufficient SPA points
    SELECT validate_spa_requirement(p_challenger_id, p_bet_points) INTO v_validation_result;
    
    IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient SPA balance to create challenge',
            'error_code', 'INSUFFICIENT_SPA',
            'spa_validation', v_validation_result
        );
    END IF;
    
    -- Check daily challenge limit (max 10 per day)
    IF (
        SELECT COUNT(*) 
        FROM challenges 
        WHERE challenger_id = p_challenger_id 
          AND created_at >= CURRENT_DATE
          AND status NOT IN ('expired', 'cancelled')
    ) >= 10 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Daily challenge limit reached (10 challenges per day)',
            'error_code', 'DAILY_LIMIT_EXCEEDED'
        );
    END IF;
    
    -- Determine challenge type and expiration
    IF p_opponent_id IS NOT NULL THEN
        v_challenge_type := 'direct';
        v_expires_at := NOW() + INTERVAL '24 hours'; -- Direct challenges expire in 24h
    ELSE
        v_challenge_type := 'open';  
        v_expires_at := NOW() + INTERVAL '48 hours'; -- Open challenges expire in 48h
    END IF;
    
    -- Override expiration if scheduled time is provided
    IF p_scheduled_time IS NOT NULL THEN
        v_expires_at := p_scheduled_time + INTERVAL '2 hours'; -- 2h grace period after scheduled time
    END IF;
    
    -- Create the challenge
    INSERT INTO challenges (
        challenger_id,
        opponent_id,
        bet_points,
        race_to,
        club_id,
        message,
        scheduled_time,
        expires_at,
        status,
        is_sabo,
        handicap_1_rank,
        handicap_05_rank,
        created_at,
        updated_at
    ) VALUES (
        p_challenger_id,
        p_opponent_id,
        p_bet_points,
        p_race_to,
        p_club_id,
        p_message,
        p_scheduled_time,
        v_expires_at,
        'pending',
        p_is_sabo,
        p_handicap_1_rank,
        p_handicap_05_rank,
        NOW(),
        NOW()
    ) RETURNING id INTO v_challenge_id;
    
    RAISE NOTICE 'Challenge Created: ID=% | Type=% | Challenger=% | Opponent=% | Bet=%s SPA | Race to %',
                 v_challenge_id, v_challenge_type, p_challenger_id, 
                 COALESCE(p_opponent_id::TEXT, 'OPEN'), p_bet_points, p_race_to;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Challenge created successfully (%s)', v_challenge_type),
        'challenge_id', v_challenge_id,
        'challenge_type', v_challenge_type,
        'challenger_id', p_challenger_id,
        'opponent_id', p_opponent_id,
        'bet_points', p_bet_points,
        'race_to', p_race_to,
        'expires_at', v_expires_at,
        'scheduled_time', p_scheduled_time,
        'club_id', p_club_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to create challenge: ' || SQLERRM,
        'error_code', 'CREATION_FAILED'
    );
END;
$$;

-- Step 2: Challenge Acceptance Function (Enhanced)
CREATE OR REPLACE FUNCTION public.accept_challenge(
    p_challenge_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_validation_result JSONB;
    v_match_id UUID;
BEGIN
    -- Input validation
    IF p_challenge_id IS NULL OR p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge ID and User ID are required',
            'error_code', 'INVALID_INPUT'
        );
    END IF;
    
    -- Lock the challenge row to prevent race conditions
    SELECT * INTO v_challenge
    FROM challenges 
    WHERE id = p_challenge_id 
    FOR UPDATE NOWAIT;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge not found',
            'error_code', 'CHALLENGE_NOT_FOUND'
        );
    END IF;
    
    -- Validation checks
    IF v_challenge.status != 'pending' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Challenge is no longer available (status: %s)', v_challenge.status),
            'error_code', 'CHALLENGE_UNAVAILABLE'
        );
    END IF;
    
    IF v_challenge.opponent_id IS NOT NULL AND v_challenge.opponent_id != p_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This challenge is for a specific opponent',
            'error_code', 'WRONG_OPPONENT'
        );
    END IF;
    
    IF v_challenge.challenger_id = p_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot accept your own challenge',
            'error_code', 'SELF_ACCEPTANCE'
        );
    END IF;
    
    IF v_challenge.expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge has expired',
            'error_code', 'CHALLENGE_EXPIRED'
        );
    END IF;
    
    -- Validate user has sufficient SPA points
    SELECT validate_spa_requirement(p_user_id, v_challenge.bet_points) INTO v_validation_result;
    
    IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient SPA balance to accept challenge',
            'error_code', 'INSUFFICIENT_SPA',
            'spa_validation', v_validation_result
        );
    END IF;
    
    -- Update challenge to accepted
    UPDATE challenges SET 
        opponent_id = p_user_id,
        status = 'accepted',
        responded_at = NOW(),
        updated_at = NOW()
    WHERE id = p_challenge_id;
    
    -- Create corresponding match
    INSERT INTO matches (
        player1_id,
        player2_id,
        challenge_id,
        status,
        match_type,
        scheduled_time,
        created_at,
        updated_at
    ) VALUES (
        v_challenge.challenger_id,
        p_user_id,
        p_challenge_id,
        'scheduled',
        'challenge',
        COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '2 hours'),
        NOW(),
        NOW()
    ) RETURNING id INTO v_match_id;
    
    RAISE NOTICE 'Challenge Accepted: ID=% | Challenger=% | Opponent=% | Match ID=% | Bet=%s SPA',
                 p_challenge_id, v_challenge.challenger_id, p_user_id, v_match_id, v_challenge.bet_points;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully accepted challenge',
        'challenge_id', p_challenge_id,
        'match_id', v_match_id,
        'challenger_id', v_challenge.challenger_id,
        'opponent_id', p_user_id,
        'bet_points', v_challenge.bet_points,
        'race_to', v_challenge.race_to,
        'scheduled_time', COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '2 hours')
    );
    
EXCEPTION 
    WHEN lock_not_available THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge is currently being processed by another user',
            'error_code', 'CONCURRENT_ACCESS'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to accept challenge: ' || SQLERRM,
            'error_code', 'ACCEPTANCE_FAILED'
        );
END;
$$;

-- Step 3: Challenge Completion Function
CREATE OR REPLACE FUNCTION public.complete_challenge(
    p_challenge_id UUID,
    p_challenger_score INTEGER,
    p_opponent_score INTEGER,
    p_completing_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_winner_id UUID;
    v_loser_id UUID;
    v_is_draw BOOLEAN;
BEGIN
    -- Input validation
    IF p_challenge_id IS NULL OR p_completing_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge ID and completing user ID are required',
            'error_code', 'INVALID_INPUT'
        );
    END IF;
    
    IF p_challenger_score IS NULL OR p_opponent_score IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Both scores must be provided',
            'error_code', 'MISSING_SCORES'
        );
    END IF;
    
    IF p_challenger_score < 0 OR p_opponent_score < 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Scores cannot be negative',
            'error_code', 'INVALID_SCORES'
        );
    END IF;
    
    -- Get challenge details
    SELECT * INTO v_challenge
    FROM challenges 
    WHERE id = p_challenge_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge not found',
            'error_code', 'CHALLENGE_NOT_FOUND'
        );
    END IF;
    
    -- Validate user can complete this challenge
    IF p_completing_user_id NOT IN (v_challenge.challenger_id, v_challenge.opponent_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only participants can complete the challenge',
            'error_code', 'UNAUTHORIZED'
        );
    END IF;
    
    IF v_challenge.status NOT IN ('accepted', 'ongoing') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Challenge cannot be completed (status: %s)', v_challenge.status),
            'error_code', 'INVALID_STATUS'
        );
    END IF;
    
    -- Validate scores make sense for race_to
    IF p_challenger_score > v_challenge.race_to OR p_opponent_score > v_challenge.race_to THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Scores cannot exceed race_to value (%s)', v_challenge.race_to),
            'error_code', 'INVALID_RACE_SCORE'
        );
    END IF;
    
    -- Determine winner and check for valid win condition
    v_is_draw := (p_challenger_score = p_opponent_score);
    
    IF NOT v_is_draw THEN
        IF p_challenger_score > p_opponent_score THEN
            IF p_challenger_score != v_challenge.race_to THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', format('Winner must reach exactly %s points', v_challenge.race_to),
                    'error_code', 'INCOMPLETE_GAME'
                );
            END IF;
            v_winner_id := v_challenge.challenger_id;
            v_loser_id := v_challenge.opponent_id;
        ELSE
            IF p_opponent_score != v_challenge.race_to THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', format('Winner must reach exactly %s points', v_challenge.race_to),
                    'error_code', 'INCOMPLETE_GAME'
                );
            END IF;
            v_winner_id := v_challenge.opponent_id;
            v_loser_id := v_challenge.challenger_id;
        END IF;
    END IF;
    
    -- Update challenge with results
    UPDATE challenges SET
        challenger_score = p_challenger_score,
        opponent_score = p_opponent_score,
        winner_id = v_winner_id,
        status = 'ongoing', -- Status becomes 'ongoing' awaiting club approval
        actual_end_time = NOW(),
        updated_at = NOW()
    WHERE id = p_challenge_id;
    
    -- Update corresponding match
    UPDATE matches SET
        player1_score = p_challenger_score,
        player2_score = p_opponent_score,
        winner_id = v_winner_id,
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE challenge_id = p_challenge_id;
    
    RAISE NOTICE 'Challenge Completed: ID=% | Score: %-%s | Winner=% | Status=ongoing (awaiting club approval)',
                 p_challenge_id, p_challenger_score, p_opponent_score, 
                 COALESCE(v_winner_id::TEXT, 'DRAW');
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Challenge completed successfully, awaiting club approval',
        'challenge_id', p_challenge_id,
        'challenger_score', p_challenger_score,
        'opponent_score', p_opponent_score,
        'winner_id', v_winner_id,
        'is_draw', v_is_draw,
        'status', 'ongoing',
        'next_step', 'Club admin approval required for SPA transfer'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to complete challenge: ' || SQLERRM,
        'error_code', 'COMPLETION_FAILED'
    );
END;
$$;

-- Step 4: Challenge Status Update Function
CREATE OR REPLACE FUNCTION public.update_challenge_status(
    p_challenge_id UUID,
    p_new_status VARCHAR(20),
    p_notes TEXT DEFAULT NULL,
    p_updating_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge RECORD;
    v_valid_statuses VARCHAR(20)[] := ARRAY['pending', 'accepted', 'declined', 'ongoing', 'completed', 'cancelled', 'expired'];
BEGIN
    -- Input validation
    IF p_challenge_id IS NULL OR p_new_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge ID and new status are required',
            'error_code', 'INVALID_INPUT'
        );
    END IF;
    
    -- Validate status value
    IF NOT (p_new_status = ANY(v_valid_statuses)) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Invalid status. Must be one of: %s', array_to_string(v_valid_statuses, ', ')),
            'error_code', 'INVALID_STATUS'
        );
    END IF;
    
    -- Get current challenge
    SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge not found',
            'error_code', 'CHALLENGE_NOT_FOUND'
        );
    END IF;
    
    -- Update challenge status
    UPDATE challenges SET
        status = p_new_status,
        updated_at = NOW(),
        -- Update specific timestamps based on status
        responded_at = CASE 
            WHEN p_new_status IN ('accepted', 'declined') AND responded_at IS NULL 
            THEN NOW() 
            ELSE responded_at 
        END,
        actual_start_time = CASE 
            WHEN p_new_status = 'ongoing' AND actual_start_time IS NULL 
            THEN NOW() 
            ELSE actual_start_time 
        END,
        completed_at = CASE 
            WHEN p_new_status = 'completed' AND completed_at IS NULL 
            THEN NOW() 
            ELSE completed_at 
        END
    WHERE id = p_challenge_id;
    
    RAISE NOTICE 'Challenge Status Updated: ID=% | %s → %s | Updated by: %',
                 p_challenge_id, v_challenge.status, p_new_status, 
                 COALESCE(p_updating_user_id::TEXT, 'SYSTEM');
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Challenge status updated from %s to %s', v_challenge.status, p_new_status),
        'challenge_id', p_challenge_id,
        'previous_status', v_challenge.status,
        'new_status', p_new_status,
        'updated_by', p_updating_user_id,
        'notes', p_notes
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to update status: ' || SQLERRM,
        'error_code', 'UPDATE_FAILED'
    );
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.create_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_challenge_status TO authenticated;

-- Step 6: Success confirmation
DO $$
BEGIN
    RAISE NOTICE '🎯 CORE CHALLENGE FUNCTIONS CREATED SUCCESSFULLY!';
    RAISE NOTICE '✅ create_challenge - Intelligent challenge creation with validation';
    RAISE NOTICE '✅ accept_challenge - Enhanced acceptance with race condition protection';
    RAISE NOTICE '✅ complete_challenge - Score submission with game logic validation';
    RAISE NOTICE '✅ update_challenge_status - Flexible status management';
    RAISE NOTICE '🏗️ Ready for club approval and trigger integration!';
END $$;
