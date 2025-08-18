-- ============================================================================
-- PART 4: FINAL VERIFICATION
-- ============================================================================
-- Purpose: Verify all tables have user names populated
-- Run this LAST after all previous parts complete
-- ============================================================================

-- Overall status check
SELECT 'FINAL VERIFICATION' as section;

-- Check player_rankings
SELECT 
    'player_rankings' as table_name,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names,
    ROUND(COUNT(user_name) * 100.0 / COUNT(*), 2) as percentage_complete
FROM player_rankings
UNION ALL

-- Check player_milestones  
SELECT 
    'player_milestones' as table_name,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names,
    ROUND(COUNT(user_name) * 100.0 / COUNT(*), 2) as percentage_complete
FROM player_milestones
UNION ALL

-- Check spa_transactions
SELECT 
    'spa_transactions' as table_name,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names,
    ROUND(COUNT(user_name) * 100.0 / COUNT(*), 2) as percentage_complete
FROM spa_transactions
UNION ALL

-- Check challenge_notifications
SELECT 
    'challenge_notifications' as table_name,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names,
    ROUND(COUNT(user_name) * 100.0 / COUNT(*), 2) as percentage_complete
FROM challenge_notifications;

-- Sample data verification
SELECT 'SAMPLE DATA - Player Rankings' as section;
SELECT 
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    user_name,
    spa_points,
    created_at
FROM player_rankings 
WHERE user_name IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'SAMPLE DATA - SPA Transactions' as section;
SELECT 
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    user_name,
    transaction_type,
    amount,
    description,
    created_at
FROM spa_transactions 
WHERE user_name IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;
