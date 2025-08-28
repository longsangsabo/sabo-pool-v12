-- Update milestone trigger system to create spa_transactions for transaction history

-- 1. Update award_milestone_spa function to include transaction history
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
    v_transaction_id UUID;
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
            'awarded_at', NOW()
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
        'milestone_name', v_milestone.name
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

-- 2. Create function to backfill missing transaction records for today's milestones
CREATE OR REPLACE FUNCTION create_milestone_transaction_history()
RETURNS JSON AS $$
DECLARE
    milestone_award RECORD;
    milestone_data RECORD;
    transaction_count INTEGER := 0;
    v_transaction_id UUID;
BEGIN
    -- Process milestone awards from today that don't have transaction records
    FOR milestone_award IN 
        SELECT ma.*, m.name, m.description, m.milestone_type, m.badge_icon, m.badge_name
        FROM milestone_awards ma
        JOIN milestones m ON m.id = ma.milestone_id
        WHERE ma.event_type = 'rank_registration'
        AND ma.awarded_at >= '2025-08-22T00:00:00Z'
        AND ma.status = 'success'
        AND NOT EXISTS (
            SELECT 1 FROM spa_transactions st 
            WHERE st.user_id = ma.player_id 
            AND st.reference_id = ma.milestone_id
            AND st.source_type = 'milestone_reward'
        )
    LOOP
        -- Create transaction record
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
            milestone_award.player_id,
            milestone_award.spa_points_awarded,
            'credit',
            'milestone_reward',
            milestone_award.name || ' - ' || milestone_award.description,
            milestone_award.milestone_id,
            'completed',
            jsonb_build_object(
                'milestone_id', milestone_award.milestone_id,
                'milestone_name', milestone_award.name,
                'milestone_type', milestone_award.milestone_type,
                'badge_icon', milestone_award.badge_icon,
                'badge_name', milestone_award.badge_name,
                'event_type', milestone_award.event_type,
                'awarded_at', milestone_award.awarded_at,
                'backfilled', true
            ),
            milestone_award.awarded_at
        ) RETURNING id INTO v_transaction_id;
        
        transaction_count := transaction_count + 1;
        
        RAISE NOTICE 'Created transaction % for milestone % (+% SPA)', 
            v_transaction_id, milestone_award.name, milestone_award.spa_points_awarded;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'transactions_created', transaction_count,
        'message', 'Transaction history backfill completed'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION award_milestone_spa(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_milestone_transaction_history() TO authenticated;

-- 4. Execute transaction history backfill
SELECT create_milestone_transaction_history() as result;
