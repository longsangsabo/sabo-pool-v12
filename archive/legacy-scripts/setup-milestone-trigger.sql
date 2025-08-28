-- Fix rank registration milestone trigger system

-- 1. First check if the function exists
CREATE OR REPLACE FUNCTION award_milestone_spa(
    p_player_id UUID,
    p_milestone_id UUID,
    p_event_type TEXT
) RETURNS JSON AS $$
DECLARE
    v_milestone RECORD;
    v_existing_award RECORD;
    v_profile RECORD;
    v_result JSON;
BEGIN
    -- Get milestone info
    SELECT * INTO v_milestone 
    FROM milestones 
    WHERE id = p_milestone_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Milestone not found or inactive'
        );
    END IF;
    
    -- Check if milestone already awarded (unless repeatable)
    IF NOT v_milestone.is_repeatable THEN
        SELECT * INTO v_existing_award
        FROM milestone_awards
        WHERE player_id = p_player_id 
        AND milestone_id = p_milestone_id
        AND event_type = p_event_type;
        
        IF FOUND THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Milestone already awarded'
            );
        END IF;
    END IF;
    
    -- Insert milestone award
    INSERT INTO milestone_awards (
        player_id,
        milestone_id,
        event_type,
        spa_points_awarded,
        occurrence,
        status,
        awarded_at
    ) VALUES (
        p_player_id,
        p_milestone_id,
        p_event_type,
        v_milestone.spa_reward,
        1,
        'success',
        NOW()
    );
    
    -- Update user's SPA points in player_rankings (where frontend reads from)
    UPDATE player_rankings 
    SET spa_points = COALESCE(spa_points, 0) + v_milestone.spa_reward
    WHERE user_id = p_player_id;
    
    -- Get updated ranking
    SELECT spa_points INTO v_profile FROM player_rankings WHERE user_id = p_player_id;
    
    RETURN json_build_object(
        'success', true,
        'spa_awarded', v_milestone.spa_reward,
        'new_total', v_profile.spa_points
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Log error to milestone_awards table
    INSERT INTO milestone_awards (
        player_id,
        milestone_id,
        event_type,
        spa_points_awarded,
        occurrence,
        status,
        error_message,
        awarded_at
    ) VALUES (
        p_player_id,
        p_milestone_id,
        p_event_type,
        0,
        1,
        'error',
        SQLERRM,
        NOW()
    );
    
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger function for rank approval
CREATE OR REPLACE FUNCTION trigger_rank_registration_milestone() 
RETURNS TRIGGER AS $$
DECLARE
    v_milestone_id UUID;
    v_result JSON;
BEGIN
    -- Only trigger on rank approval
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Get rank registration milestone ID
        SELECT id INTO v_milestone_id 
        FROM milestones 
        WHERE name = 'Đăng ký hạng thành công'
        AND is_active = true;
        
        IF FOUND THEN
            -- Award the milestone
            SELECT award_milestone_spa(
                NEW.user_id,
                v_milestone_id,
                'rank_registration'
            ) INTO v_result;
            
            -- Log the result (you can remove this in production)
            RAISE NOTICE 'Rank registration milestone result for user %: %', NEW.user_id, v_result;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS rank_registration_milestone_trigger ON rank_requests;

CREATE TRIGGER rank_registration_milestone_trigger
    AFTER UPDATE ON rank_requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_rank_registration_milestone();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION award_milestone_spa(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_rank_registration_milestone() TO authenticated;

-- Test the function
SELECT 'Milestone trigger system setup completed' as result;
