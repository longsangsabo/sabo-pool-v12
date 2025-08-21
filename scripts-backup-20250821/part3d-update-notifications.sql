-- ============================================================================
-- PART 3D: UPDATE CHALLENGE NOTIFICATIONS
-- ============================================================================
-- Purpose: Update challenge_notifications table with user names
-- Run this SIXTH after Part 3C completes
-- ============================================================================

-- Update challenge_notifications table only
UPDATE challenge_notifications
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- Show results
SELECT 
    'Updated challenge_notifications' as status,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names
FROM challenge_notifications;
