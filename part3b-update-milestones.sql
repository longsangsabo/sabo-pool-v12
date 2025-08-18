-- ============================================================================
-- PART 3B: UPDATE PLAYER MILESTONES
-- ============================================================================
-- Purpose: Update player_milestones table with user names
-- Run this FOURTH after Part 3A completes
-- ============================================================================

-- Update player_milestones table only
UPDATE player_milestones
SET user_name = get_user_display_name(player_id)
WHERE user_name IS NULL;

-- Show results
SELECT 
    'Updated player_milestones' as status,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names
FROM player_milestones;
