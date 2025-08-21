-- ============================================================================
-- PART 3C: UPDATE SPA TRANSACTIONS
-- ============================================================================
-- Purpose: Update spa_transactions table with user names
-- Run this FIFTH after Part 3B completes
-- ============================================================================

-- Update spa_transactions table only
UPDATE spa_transactions
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- Show results
SELECT 
    'Updated spa_transactions' as status,
    COUNT(*) as total_records,
    COUNT(user_name) as records_with_names
FROM spa_transactions;
