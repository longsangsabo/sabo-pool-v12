-- SABO Handicap System Database Migration
-- Adds support for enhanced handicap calculation and storage

-- Add enhanced handicap columns to challenges table
DO $$ 
BEGIN
    -- Add handicap_data column if not exists (JSON storage for detailed handicap info)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'handicap_data') THEN
        ALTER TABLE public.challenges ADD COLUMN handicap_data jsonb DEFAULT '{}';
    END IF;

    -- Add initial scores columns for handicap application
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'challenger_initial_score') THEN
        ALTER TABLE public.challenges ADD COLUMN challenger_initial_score decimal(3,1) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'opponent_initial_score') THEN
        ALTER TABLE public.challenges ADD COLUMN opponent_initial_score decimal(3,1) DEFAULT 0;
    END IF;

    -- Add handicap_applied flag to track processing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'handicap_applied') THEN
        ALTER TABLE public.challenges ADD COLUMN handicap_applied boolean DEFAULT false;
    END IF;

    -- Add handicap_applied_at timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'handicap_applied_at') THEN
        ALTER TABLE public.challenges ADD COLUMN handicap_applied_at timestamptz;
    END IF;
END $$;

-- Create enhanced SABO handicap calculation function
CREATE OR REPLACE FUNCTION public.calculate_sabo_handicap_enhanced(
    p_challenger_rank text,
    p_opponent_rank text,
    p_bet_points integer
) RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    -- Rank mapping
    rank_values jsonb := '{
        "K": 1, "K+": 2, "I": 3, "I+": 4, "H": 5, "H+": 6,
        "G": 7, "G+": 8, "F": 9, "F+": 10, "E": 11, "E+": 12
    }';
    
    -- Handicap configurations
    handicap_configs jsonb := '[
        {"bet_points": 100, "race_to": 8, "handicap_1_rank": 1.0, "handicap_05_rank": 0.5},
        {"bet_points": 200, "race_to": 12, "handicap_1_rank": 1.5, "handicap_05_rank": 1.0},
        {"bet_points": 300, "race_to": 14, "handicap_1_rank": 2.0, "handicap_05_rank": 1.5},
        {"bet_points": 400, "race_to": 16, "handicap_1_rank": 2.5, "handicap_05_rank": 1.5},
        {"bet_points": 500, "race_to": 18, "handicap_1_rank": 3.0, "handicap_05_rank": 2.0},
        {"bet_points": 600, "race_to": 22, "handicap_1_rank": 3.5, "handicap_05_rank": 2.5}
    ]';
    
    v_challenger_value integer;
    v_opponent_value integer;
    v_rank_diff integer;
    v_config jsonb;
    v_main_rank_diff integer;
    v_is_sub_rank_diff boolean;
    v_handicap_challenger decimal(3,1) := 0;
    v_handicap_opponent decimal(3,1) := 0;
    v_race_to integer;
    v_explanation text;
    v_is_valid boolean := true;
    v_error_message text := '';
BEGIN
    -- Get rank values
    v_challenger_value := (rank_values ->> p_challenger_rank)::integer;
    v_opponent_value := (rank_values ->> p_opponent_rank)::integer;
    
    -- Validate ranks exist
    IF v_challenger_value IS NULL OR v_opponent_value IS NULL THEN
        RETURN jsonb_build_object(
            'is_valid', false,
            'error_message', 'Invalid rank provided',
            'handicap_challenger', 0,
            'handicap_opponent', 0
        );
    END IF;
    
    v_rank_diff := v_opponent_value - v_challenger_value;
    
    -- Find matching configuration
    SELECT config INTO v_config
    FROM jsonb_array_elements(handicap_configs) AS config
    WHERE (config ->> 'bet_points')::integer = p_bet_points;
    
    -- Use default config if not found
    IF v_config IS NULL THEN
        v_config := handicap_configs -> 0;
    END IF;
    
    v_race_to := (v_config ->> 'race_to')::integer;
    
    -- Validate rank difference (max ±2 main ranks = 4 sub-ranks)
    IF ABS(v_rank_diff) > 4 THEN
        v_is_valid := false;
        v_error_message := 'Chênh lệch hạng quá lớn. Chỉ được thách đấu trong phạm vi ±2 hạng chính.';
    END IF;
    
    IF v_is_valid THEN
        -- Calculate handicap
        v_main_rank_diff := ABS(v_rank_diff) / 2;
        v_is_sub_rank_diff := (ABS(v_rank_diff) % 2) = 1;
        
        IF v_main_rank_diff > 0 THEN
            -- 1+ main rank difference
            IF v_rank_diff > 0 THEN
                v_handicap_challenger := (v_config ->> 'handicap_1_rank')::decimal * v_main_rank_diff;
            ELSE
                v_handicap_opponent := (v_config ->> 'handicap_1_rank')::decimal * v_main_rank_diff;
            END IF;
        ELSIF v_is_sub_rank_diff THEN
            -- Only sub-rank difference
            IF v_rank_diff > 0 THEN
                v_handicap_challenger := (v_config ->> 'handicap_05_rank')::decimal;
            ELSE
                v_handicap_opponent := (v_config ->> 'handicap_05_rank')::decimal;
            END IF;
        END IF;
        
        -- Generate explanation
        IF v_rank_diff = 0 THEN
            v_explanation := format('Cùng hạng %s - Không có handicap', p_challenger_rank);
        ELSE
            v_explanation := format('%s được cộng %s bàn ban đầu (chênh %s cấp hạng)',
                CASE WHEN v_rank_diff > 0 THEN 'Challenger' ELSE 'Opponent' END,
                GREATEST(v_handicap_challenger, v_handicap_opponent),
                ABS(v_rank_diff)
            );
        END IF;
    ELSE
        v_explanation := v_error_message;
    END IF;
    
    RETURN jsonb_build_object(
        'is_valid', v_is_valid,
        'error_message', v_error_message,
        'handicap_challenger', v_handicap_challenger,
        'handicap_opponent', v_handicap_opponent,
        'challenger_rank', p_challenger_rank,
        'opponent_rank', p_opponent_rank,
        'bet_points', p_bet_points,
        'race_to', v_race_to,
        'rank_difference', ABS(v_rank_diff),
        'explanation', v_explanation
    );
END;
$$;

-- Function to apply handicap to a challenge
CREATE OR REPLACE FUNCTION public.apply_handicap_to_challenge(
    p_challenge_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_challenge record;
    v_challenger_rank text;
    v_opponent_rank text;
    v_handicap_result jsonb;
BEGIN
    -- Get challenge details
    SELECT c.*, 
           cp.current_rank as challenger_rank,
           op.current_rank as opponent_rank
    INTO v_challenge
    FROM challenges c
    JOIN profiles cp ON c.challenger_id = cp.id
    JOIN profiles op ON c.opponent_id = op.id
    WHERE c.id = p_challenge_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge not found'
        );
    END IF;
    
    -- Skip if already has handicap
    IF v_challenge.handicap_applied = true THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Handicap already applied to this challenge'
        );
    END IF;
    
    -- Calculate handicap
    v_handicap_result := calculate_sabo_handicap_enhanced(
        v_challenge.challenger_rank,
        v_challenge.opponent_rank,
        COALESCE(v_challenge.bet_amount, 100)
    );
    
    IF (v_handicap_result ->> 'is_valid')::boolean = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', v_handicap_result ->> 'error_message'
        );
    END IF;
    
    -- Update challenge with handicap data
    UPDATE challenges 
    SET handicap_data = v_handicap_result,
        challenger_initial_score = (v_handicap_result ->> 'handicap_challenger')::decimal,
        opponent_initial_score = (v_handicap_result ->> 'handicap_opponent')::decimal,
        race_to = (v_handicap_result ->> 'race_to')::integer,
        handicap_applied = true,
        handicap_applied_at = NOW()
    WHERE id = p_challenge_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'handicap_data', v_handicap_result
    );
END;
$$;

-- Function to bulk apply handicap to pending challenges
CREATE OR REPLACE FUNCTION public.bulk_apply_handicap_to_challenges(
    p_status_filter text[] DEFAULT ARRAY['pending', 'accepted']
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_challenge_id uuid;
    v_result jsonb;
    v_success_count integer := 0;
    v_error_count integer := 0;
    v_errors jsonb := '[]'::jsonb;
BEGIN
    -- Process each eligible challenge
    FOR v_challenge_id IN 
        SELECT id 
        FROM challenges 
        WHERE status = ANY(p_status_filter)
        AND (handicap_applied = false OR handicap_applied IS NULL)
        AND opponent_id IS NOT NULL
    LOOP
        -- Apply handicap to challenge
        SELECT apply_handicap_to_challenge(v_challenge_id) INTO v_result;
        
        IF (v_result ->> 'success')::boolean THEN
            v_success_count := v_success_count + 1;
        ELSE
            v_error_count := v_error_count + 1;
            v_errors := v_errors || jsonb_build_object(
                'challenge_id', v_challenge_id,
                'error', v_result ->> 'error'
            );
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'processed_count', v_success_count + v_error_count,
        'success_count', v_success_count,
        'error_count', v_error_count,
        'errors', v_errors
    );
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_handicap_applied ON challenges(handicap_applied);
CREATE INDEX IF NOT EXISTS idx_challenges_handicap_data ON challenges USING GIN(handicap_data);

-- Create view for handicap statistics
CREATE OR REPLACE VIEW public.handicap_statistics AS
SELECT 
    COUNT(*) as total_challenges,
    COUNT(*) FILTER (WHERE handicap_applied = true) as handicap_applied_count,
    COUNT(*) FILTER (WHERE handicap_applied = false OR handicap_applied IS NULL) as handicap_pending_count,
    AVG((handicap_data ->> 'handicap_challenger')::decimal) as avg_challenger_handicap,
    AVG((handicap_data ->> 'handicap_opponent')::decimal) as avg_opponent_handicap,
    COUNT(*) FILTER (WHERE (handicap_data ->> 'handicap_challenger')::decimal > 0) as challenger_handicap_count,
    COUNT(*) FILTER (WHERE (handicap_data ->> 'handicap_opponent')::decimal > 0) as opponent_handicap_count
FROM challenges 
WHERE opponent_id IS NOT NULL;

-- Grant permissions
GRANT SELECT ON public.handicap_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_sabo_handicap_enhanced TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_handicap_to_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_apply_handicap_to_challenges TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.calculate_sabo_handicap_enhanced IS 'Calculate SABO handicap based on player ranks and bet points using official configuration matrix';
COMMENT ON FUNCTION public.apply_handicap_to_challenge IS 'Apply calculated handicap to a specific challenge';
COMMENT ON FUNCTION public.bulk_apply_handicap_to_challenges IS 'Bulk apply handicap to all eligible pending challenges';
COMMENT ON VIEW public.handicap_statistics IS 'Statistical view of handicap system usage and distribution';
