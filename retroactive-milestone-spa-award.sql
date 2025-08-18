-- ============================================================================
-- RETROACTIVE MILESTONE SPA AWARD SCRIPT
-- ============================================================================
-- Purpose: Award milestone SPA to users created before milestone system
-- Run this script in Supabase Dashboard → SQL Editor
-- ============================================================================

DO $$
DECLARE
    user_record RECORD;
    milestone_record RECORD;
    user_count INTEGER := 0;
    total_spa_awarded INTEGER := 0;
    
BEGIN
    RAISE NOTICE '🔄 STARTING RETROACTIVE MILESTONE SPA AWARD...';
    RAISE NOTICE '';
    
    -- Get users who don't have any milestone progress records
    FOR user_record IN 
        SELECT pr.user_id, pr.spa_points, pr.created_at
        FROM player_rankings pr
        WHERE pr.user_id NOT IN (
            SELECT DISTINCT pm.player_id 
            FROM player_milestones pm 
            WHERE pm.player_id IS NOT NULL
        )
    LOOP
        RAISE NOTICE '👤 Processing user: %', SUBSTRING(user_record.user_id::text, 1, 8);
        RAISE NOTICE '   Current SPA: %', COALESCE(user_record.spa_points, 0);
        
        user_count := user_count + 1;
        
        -- Award account_creation milestone (all users should get this)
        FOR milestone_record IN
            SELECT * FROM milestones 
            WHERE milestone_type = 'account_creation' 
            AND is_active = true
        LOOP
            RAISE NOTICE '   ⚡ Awarding: % (+% SPA)', milestone_record.name, milestone_record.spa_reward;
            
            -- 1. Create milestone progress record
            INSERT INTO player_milestones (
                player_id,
                milestone_id,
                current_progress,
                is_completed,
                completed_at,
                times_completed
            ) VALUES (
                user_record.user_id,
                milestone_record.id,
                milestone_record.requirement_value,
                true,
                NOW(),
                1
            ) ON CONFLICT (player_id, milestone_id) DO NOTHING;
            
            -- 2. Award SPA using function
            PERFORM update_spa_points(
                user_record.user_id,
                milestone_record.spa_reward,
                'retroactive_milestone',
                'Retroactive: ' || milestone_record.name,
                milestone_record.id
            );
            
            -- 3. Create notification
            PERFORM create_challenge_notification(
                'milestone_completed'::text,
                user_record.user_id,
                '🏆 Hoàn thành milestone!'::text,
                ('🎉 ' || milestone_record.name || ' - Nhận ' || milestone_record.spa_reward || ' SPA! (Retroactive award)')::text,
                NULL, -- challenge_id is NULL for milestone notifications
                'trophy'::text,
                'medium'::text,
                'Xem milestone'::text,
                '/milestones'::text,
                ('{"milestone_id":"' || milestone_record.id || '","milestone_type":"' || milestone_record.milestone_type || '","spa_reward":' || milestone_record.spa_reward || ',"retroactive":true}')::jsonb
            );
            
            total_spa_awarded := total_spa_awarded + milestone_record.spa_reward;
            RAISE NOTICE '   ✅ Awarded % SPA', milestone_record.spa_reward;
        END LOOP;
        
        -- Award rank_registration milestone (users with ranking records)
        IF user_record.spa_points IS NOT NULL THEN
            FOR milestone_record IN
                SELECT * FROM milestones 
                WHERE milestone_type = 'rank_registration' 
                AND is_active = true
            LOOP
                RAISE NOTICE '   ⚡ Awarding: % (+% SPA)', milestone_record.name, milestone_record.spa_reward;
                
                -- 1. Create milestone progress record
                INSERT INTO player_milestones (
                    player_id,
                    milestone_id,
                    current_progress,
                    is_completed,
                    completed_at,
                    times_completed
                ) VALUES (
                    user_record.user_id,
                    milestone_record.id,
                    milestone_record.requirement_value,
                    true,
                    NOW(),
                    1
                ) ON CONFLICT (player_id, milestone_id) DO NOTHING;
                
                -- 2. Award SPA using function
                PERFORM update_spa_points(
                    user_record.user_id,
                    milestone_record.spa_reward,
                    'retroactive_milestone',
                    'Retroactive: ' || milestone_record.name,
                    milestone_record.id
                );
                
                -- 3. Create notification
                PERFORM create_challenge_notification(
                    'milestone_completed'::text,
                    user_record.user_id,
                    '🏆 Hoàn thành milestone!'::text,
                    ('🎉 ' || milestone_record.name || ' - Nhận ' || milestone_record.spa_reward || ' SPA! (Retroactive award)')::text,
                    NULL, -- challenge_id is NULL for milestone notifications
                    'trophy'::text,
                    'medium'::text,
                    'Xem milestone'::text,
                    '/milestones'::text,
                    ('{"milestone_id":"' || milestone_record.id || '","milestone_type":"' || milestone_record.milestone_type || '","spa_reward":' || milestone_record.spa_reward || ',"retroactive":true}')::jsonb
                );
                
                total_spa_awarded := total_spa_awarded + milestone_record.spa_reward;
                RAISE NOTICE '   ✅ Awarded % SPA', milestone_record.spa_reward;
            END LOOP;
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 FINAL SUMMARY:';
    RAISE NOTICE '================';
    RAISE NOTICE '✅ Users processed: %', user_count;
    RAISE NOTICE '💰 Total SPA awarded: % SPA', total_spa_awarded;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 RETROACTIVE AWARD COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 WHAT HAPPENED:';
    RAISE NOTICE '✅ Existing users got milestone progress records';
    RAISE NOTICE '✅ SPA points awarded retroactively';
    RAISE NOTICE '✅ Notifications created for milestone completions';
    RAISE NOTICE '✅ Users can now see their milestone achievements';
    RAISE NOTICE '';
    RAISE NOTICE '🔔 USERS WILL NOW SEE:';
    RAISE NOTICE '• Notification bell badges for new milestone notifications';
    RAISE NOTICE '• Updated SPA balances in their profiles';
    RAISE NOTICE '• Completed milestones in milestone pages';
    RAISE NOTICE '• Future milestones will work normally';
    
END $$;
