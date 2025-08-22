-- Function to sync milestone SPA to player_rankings table
-- Run this in Supabase Dashboard SQL Editor

CREATE OR REPLACE FUNCTION sync_milestone_spa_to_rankings()
RETURNS JSON AS $$
DECLARE
    milestone_user RECORD;
    current_spa INTEGER;
    milestone_spa INTEGER;
    new_spa INTEGER;
    sync_count INTEGER := 0;
    result JSON;
BEGIN
    -- Get users who received rank registration milestones today but may not have SPA in player_rankings
    FOR milestone_user IN 
        SELECT 
            player_id, 
            SUM(spa_points_awarded) as total_spa
        FROM milestone_awards 
        WHERE event_type = 'rank_registration' 
        AND awarded_at >= '2025-08-22T00:00:00Z'
        GROUP BY player_id
    LOOP
        -- Get current SPA from player_rankings
        SELECT COALESCE(spa_points, 0) INTO current_spa
        FROM player_rankings 
        WHERE user_id = milestone_user.player_id;
        
        IF FOUND THEN
            milestone_spa := milestone_user.total_spa;
            
            -- Check if user already has the milestone SPA (avoid double-adding)
            -- We'll add the milestone SPA if current SPA doesn't include it
            -- Simple check: if current SPA < milestone SPA, add the difference
            IF current_spa < milestone_spa THEN
                new_spa := milestone_spa; -- Set to milestone amount
                
                UPDATE player_rankings 
                SET spa_points = new_spa
                WHERE user_id = milestone_user.player_id;
                
                sync_count := sync_count + 1;
                
                RAISE NOTICE 'Updated user % SPA: % -> %', milestone_user.player_id, current_spa, new_spa;
            END IF;
        ELSE
            RAISE NOTICE 'No ranking record found for user %', milestone_user.player_id;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'users_synced', sync_count,
        'message', 'SPA sync completed'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION sync_milestone_spa_to_rankings() TO authenticated;

-- Execute the sync
SELECT sync_milestone_spa_to_rankings() as result;
