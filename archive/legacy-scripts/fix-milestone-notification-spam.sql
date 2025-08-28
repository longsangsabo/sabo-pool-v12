-- ========================================
-- FIX MILESTONE NOTIFICATION SPAM
-- ========================================

-- 1. DISABLE TRIGGER CAUSING SPAM
-- The trigger is creating notifications every time milestone is updated
-- This causes spam notifications to users

DROP TRIGGER IF EXISTS trigger_milestone_completion_notification ON player_milestones;
DROP TRIGGER IF EXISTS trigger_milestone_progress_notification ON player_milestones;  
DROP TRIGGER IF EXISTS trigger_milestone_streak_notification ON player_milestones;

-- 2. ADD SAFEGUARD TO NOTIFICATION FUNCTION
-- Prevent duplicate notifications by checking if notification already exists

CREATE OR REPLACE FUNCTION notify_milestone_completion_safe()
RETURNS TRIGGER AS $$
DECLARE
    milestone_info RECORD;
    existing_notification_count INTEGER;
BEGIN
    -- Only process when milestone is newly completed
    IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
        
        -- Check if notification already exists for this milestone
        SELECT COUNT(*) INTO existing_notification_count
        FROM notifications
        WHERE user_id = NEW.player_id 
        AND type = 'milestone_completed'
        AND metadata->>'milestone_id' = NEW.milestone_id::TEXT
        AND created_at > NOW() - INTERVAL '1 hour'; -- Within last hour
        
        -- Only create notification if none exists recently
        IF existing_notification_count = 0 THEN
            
            -- Get milestone info
            SELECT * INTO milestone_info
            FROM milestones
            WHERE id = NEW.milestone_id;
            
            -- Create notification using NEW notification system (not challenge_notifications)
            INSERT INTO notifications (
                user_id,
                type,
                title,
                message,
                priority,
                category,
                is_read,
                metadata,
                created_at
            ) VALUES (
                NEW.player_id,
                'milestone_completed',
                '🏆 Hoàn thành milestone!',
                format('🎉 Chúc mừng! Bạn đã hoàn thành "%s" và nhận được %s SPA!', 
                       COALESCE(milestone_info.name, 'Milestone'),
                       COALESCE(milestone_info.spa_reward, 0)),
                'high',
                'milestone',
                false,
                jsonb_build_object(
                    'milestone_id', NEW.milestone_id,
                    'milestone_name', milestone_info.name,
                    'spa_reward', milestone_info.spa_reward,
                    'action_url', '/milestones'
                ),
                NOW()
            );
            
            RAISE NOTICE 'Milestone notification created for user % milestone %', NEW.player_id, NEW.milestone_id;
        ELSE
            RAISE NOTICE 'Duplicate milestone notification prevented for user % milestone %', NEW.player_id, NEW.milestone_id;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CREATE NEW SAFE TRIGGER (Optional - only enable if needed)
-- UNCOMMENT BELOW TO RE-ENABLE MILESTONE NOTIFICATIONS WITH SAFEGUARDS
/*
CREATE TRIGGER trigger_milestone_completion_notification_safe
    AFTER UPDATE ON player_milestones
    FOR EACH ROW
    EXECUTE FUNCTION notify_milestone_completion_safe();
*/

-- 4. CLEAN UP EXISTING SPAM NOTIFICATIONS
-- Remove duplicate milestone notifications from last 24 hours
WITH duplicate_notifications AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY user_id, type, metadata->>'milestone_id' 
               ORDER BY created_at DESC
           ) as rn
    FROM notifications
    WHERE type LIKE 'milestone%'
    AND created_at > NOW() - INTERVAL '24 hours'
)
DELETE FROM notifications 
WHERE id IN (
    SELECT id FROM duplicate_notifications WHERE rn > 1
);

-- 5. MARK ALL REMAINING MILESTONE NOTIFICATIONS AS READ TO REDUCE NOISE
UPDATE notifications 
SET is_read = true 
WHERE type LIKE 'milestone%' 
AND created_at > NOW() - INTERVAL '24 hours'
AND is_read = false;

-- Success message
SELECT 'Milestone notification spam fix applied successfully!' as status;
