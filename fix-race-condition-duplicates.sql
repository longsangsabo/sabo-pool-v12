-- FIX RACE CONDITION: Clean duplicates first, then add constraint và sửa trigger logic

-- 1. FIRST: Clean up duplicate awards and fix SPA balances (MUST BE DONE BEFORE ADDING CONSTRAINT)
DO $$
DECLARE
    duplicate_record RECORD;
    milestone_spa INTEGER := 150;
    v_profile_spa INTEGER;
BEGIN
    RAISE NOTICE 'Starting duplicate cleanup...';
    
    -- Find and remove duplicate milestone awards, keeping the earliest one
    FOR duplicate_record IN 
        SELECT 
            player_id,
            milestone_id,
            event_type,
            array_agg(id ORDER BY awarded_at) as award_ids,
            COUNT(*) as award_count
        FROM milestone_awards 
        WHERE milestone_id = 'c58b7c77-174c-4b2d-b5a2-b9cfabaf6023'
        AND event_type = 'rank_registration'
        GROUP BY player_id, milestone_id, event_type
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Found % duplicate awards for player %', 
            duplicate_record.award_count, duplicate_record.player_id;
        
        -- Delete duplicate awards (keep first one)
        DELETE FROM milestone_awards 
        WHERE id = ANY(duplicate_record.award_ids[2:]);
        
        RAISE NOTICE 'Deleted % duplicate awards', duplicate_record.award_count - 1;
        
        -- Fix SPA balance (reduce by the extra amount)
        UPDATE player_rankings 
        SET spa_points = spa_points - (milestone_spa * (duplicate_record.award_count - 1))
        WHERE user_id = duplicate_record.player_id;
        
        -- Get updated balance
        SELECT spa_points INTO v_profile_spa 
        FROM player_rankings 
        WHERE user_id = duplicate_record.player_id;
        
        RAISE NOTICE 'Fixed SPA balance for player % to %', 
            duplicate_record.player_id, v_profile_spa;
    END LOOP;
    
    RAISE NOTICE 'Duplicate cleanup completed.';
END $$;

-- 2. NOW: Add unique constraint to prevent future duplicate milestone awards
ALTER TABLE milestone_awards 
ADD CONSTRAINT unique_milestone_award 
UNIQUE (player_id, milestone_id, event_type);

-- 3. Create improved award_milestone_spa function with race condition protection
CREATE OR REPLACE FUNCTION award_milestone_spa(
    p_player_id UUID,
    p_milestone_id UUID,
    p_event_type TEXT
) RETURNS JSON AS $$
DECLARE
    v_milestone RECORD;
    v_profile RECORD;
    v_result JSON;
    v_transaction_id UUID;
    v_award_id UUID;
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
    
    -- Use INSERT ... ON CONFLICT to handle race conditions
    -- This prevents duplicate awards even if two triggers run simultaneously
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
    )
    ON CONFLICT (player_id, milestone_id, event_type) 
    DO NOTHING
    RETURNING id INTO v_award_id;
    
    -- Check if award was actually inserted (not a duplicate)
    IF v_award_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Milestone already awarded (prevented duplicate)'
        );
    END IF;
    
    -- Update user's SPA points in player_rankings (where frontend reads from)
    UPDATE player_rankings 
    SET spa_points = COALESCE(spa_points, 0) + v_milestone.spa_reward
    WHERE user_id = p_player_id;
    
    -- Create SPA transaction record for transaction history
    INSERT INTO spa_transactions (
        user_id,
        amount,
        transaction_type,
        source_type,
        description,
        reference_id,
        status,
        metadata,
        created_at
    ) VALUES (
        p_player_id,
        v_milestone.spa_reward,
        'credit',
        'milestone_reward',
        v_milestone.name || ' - ' || v_milestone.description,
        p_milestone_id,
        'completed',
        jsonb_build_object(
            'milestone_id', p_milestone_id,
            'milestone_name', v_milestone.name,
            'milestone_type', v_milestone.milestone_type,
            'badge_icon', v_milestone.badge_icon,
            'badge_name', v_milestone.badge_name,
            'event_type', p_event_type,
            'awarded_at', NOW(),
            'award_id', v_award_id
        ),
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    -- Get updated ranking
    SELECT spa_points INTO v_profile FROM player_rankings WHERE user_id = p_player_id;
    
    RETURN json_build_object(
        'success', true,
        'spa_awarded', v_milestone.spa_reward,
        'new_total', v_profile.spa_points,
        'transaction_id', v_transaction_id,
        'award_id', v_award_id,
        'milestone_name', v_milestone.name
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Log error to milestone_awards table (with conflict handling)
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
    )
    ON CONFLICT (player_id, milestone_id, event_type) DO NOTHING;
    
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION award_milestone_spa(UUID, UUID, TEXT) TO authenticated;

-- 5. Verification query
SELECT 
    p.display_name,
    ma.player_id,
    COUNT(*) as award_count,
    SUM(ma.spa_points_awarded) as total_spa_awarded,
    pr.spa_points as current_spa_balance
FROM milestone_awards ma
JOIN profiles p ON p.user_id = ma.player_id  
JOIN player_rankings pr ON pr.user_id = ma.player_id
WHERE ma.milestone_id = 'c58b7c77-174c-4b2d-b5a2-b9cfabaf6023'
AND ma.event_type = 'rank_registration'
GROUP BY ma.player_id, p.display_name, pr.spa_points
ORDER BY award_count DESC;
