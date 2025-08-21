-- ============================================================================
-- PART 3A: UPDATE PLAYER RANKINGS
-- ============================================================================
-- Purpose: Update player_rankings table with user names
-- Run this THIRD after Part 2 completes
-- ============================================================================

-- Update player_rankings table only
UPDATE player_rankings 
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- Show results
SELECT 
    'Updated player_rankings' as status,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names
FROM player_rankings;
