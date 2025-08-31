-- Migration to update existing challenges with correct handicap calculation
-- Run this after updating the handicap calculation logic

-- First, let's create a function to update handicap for existing challenges
CREATE OR REPLACE FUNCTION public.update_existing_challenge_handicaps()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_challenge record;
    v_updated_count integer := 0;
    v_error_count integer := 0;
    v_handicap_result jsonb;
BEGIN
    -- Loop through all challenges that have both challenger and opponent
    FOR v_challenge IN 
        SELECT 
            c.id,
            c.bet_amount,
            cp.current_rank as challenger_rank,
            op.current_rank as opponent_rank,
            c.handicap_data
        FROM challenges c
        JOIN profiles cp ON c.challenger_id = cp.id
        JOIN profiles op ON c.opponent_id = op.id
        WHERE c.opponent_id IS NOT NULL
        AND cp.current_rank IS NOT NULL 
        AND op.current_rank IS NOT NULL
    LOOP
        BEGIN
            -- Calculate new handicap using the enhanced function
            SELECT calculate_sabo_handicap_enhanced(
                v_challenge.challenger_rank,
                v_challenge.opponent_rank,
                COALESCE(v_challenge.bet_amount, 100)
            ) INTO v_handicap_result;
            
            -- Update the challenge if calculation is valid
            IF (v_handicap_result ->> 'is_valid')::boolean THEN
                UPDATE challenges 
                SET 
                    handicap_data = v_handicap_result,
                    challenger_initial_score = (v_handicap_result ->> 'handicap_challenger')::decimal,
                    opponent_initial_score = (v_handicap_result ->> 'handicap_opponent')::decimal,
                    race_to = (v_handicap_result ->> 'race_to')::integer,
                    handicap_applied = true,
                    handicap_applied_at = NOW()
                WHERE id = v_challenge.id;
                
                v_updated_count := v_updated_count + 1;
                
                -- Log the update
                RAISE NOTICE 'Updated challenge %: % vs % => %', 
                    v_challenge.id, 
                    v_challenge.challenger_rank, 
                    v_challenge.opponent_rank,
                    v_handicap_result ->> 'explanation';
            ELSE
                v_error_count := v_error_count + 1;
                RAISE NOTICE 'Skipped challenge % due to error: %', 
                    v_challenge.id, 
                    v_handicap_result ->> 'error_message';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE 'Error updating challenge %: %', v_challenge.id, SQLERRM;
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'updated_count', v_updated_count,
        'error_count', v_error_count,
        'message', format('Updated %s challenges, %s errors', v_updated_count, v_error_count)
    );
END;
$$;

-- Execute the update (uncomment to run)
-- SELECT update_existing_challenge_handicaps();

-- Create a view to check handicap data
CREATE OR REPLACE VIEW handicap_check AS
SELECT 
    c.id,
    c.status,
    cp.username as challenger_name,
    cp.current_rank as challenger_rank,
    op.username as opponent_name,
    op.current_rank as opponent_rank,
    c.bet_amount,
    c.handicap_data,
    c.handicap_applied,
    c.handicap_applied_at,
    (c.handicap_data ->> 'handicap_challenger')::decimal as challenger_handicap,
    (c.handicap_data ->> 'handicap_opponent')::decimal as opponent_handicap,
    c.handicap_data ->> 'explanation' as explanation
FROM challenges c
JOIN profiles cp ON c.challenger_id = cp.id
JOIN profiles op ON c.opponent_id = op.id
WHERE c.opponent_id IS NOT NULL
ORDER BY c.created_at DESC;

-- Grant permissions
GRANT SELECT ON handicap_check TO authenticated;
GRANT EXECUTE ON FUNCTION update_existing_challenge_handicaps TO authenticated;

-- Example queries to test:
/*
-- Check current handicap data
SELECT * FROM handicap_check LIMIT 10;

-- Find challenges with K+ vs I ranks (like in the image)
SELECT * FROM handicap_check 
WHERE challenger_rank = 'K+' AND opponent_rank = 'I'
   OR challenger_rank = 'I' AND opponent_rank = 'K+';

-- Update all existing challenges
SELECT update_existing_challenge_handicaps();

-- Check specific challenge types that might need updates
SELECT 
    challenger_rank || ' vs ' || opponent_rank as match_type,
    COUNT(*) as count,
    AVG(COALESCE((handicap_data ->> 'handicap_challenger')::decimal, 0) + 
        COALESCE((handicap_data ->> 'handicap_opponent')::decimal, 0)) as avg_handicap
FROM handicap_check
GROUP BY challenger_rank, opponent_rank
ORDER BY count DESC;
*/
