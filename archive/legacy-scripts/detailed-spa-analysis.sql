-- ============================================================================
-- DETAILED SPA SYSTEM ANALYSIS
-- ============================================================================
-- Purpose: Understand exactly how SPA points are stored and updated
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Check if update_spa_points function exists and get its definition
DO $$
DECLARE
    func_def TEXT;
BEGIN
    SELECT pg_get_functiondef(oid) INTO func_def
    FROM pg_proc 
    WHERE proname = 'update_spa_points' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LIMIT 1;
    
    IF func_def IS NOT NULL THEN
        RAISE NOTICE 'UPDATE_SPA_POINTS FUNCTION EXISTS:';
        RAISE NOTICE '%', func_def;
    ELSE
        RAISE NOTICE 'update_spa_points function NOT FOUND!';
    END IF;
END $$;

-- 2. Check all tables that might store SPA points
SELECT 
    'TABLES WITH SPA COLUMNS' as analysis,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (column_name ILIKE '%spa%' OR column_name ILIKE '%point%')
ORDER BY table_name;

-- 3. Check player_rankings table sample data
SELECT 
    'PLAYER_RANKINGS - Current SPA Data' as analysis,
    COUNT(*) as total_users,
    COUNT(spa_points) as users_with_spa,
    MIN(spa_points) as min_spa,
    MAX(spa_points) as max_spa,
    AVG(spa_points) as avg_spa
FROM player_rankings;

-- 4. Check spa_transactions table sample data
SELECT 
    'SPA_TRANSACTIONS - Transaction Data' as analysis,
    COUNT(*) as total_transactions,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount,
    SUM(amount) as total_spa_transacted
FROM spa_transactions;

-- 5. Check recent milestone-related SPA transactions
SELECT 
    'RECENT MILESTONE SPA TRANSACTIONS' as analysis,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    transaction_type,
    amount,
    description,
    created_at
FROM spa_transactions
WHERE description ILIKE '%milestone%' OR transaction_type = 'retroactive_milestone'
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check if there's any direct UPDATE to player_rankings.spa_points
SELECT 
    'SPA BALANCE CHECK - Top SPA Holders' as analysis,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    spa_points,
    created_at,
    updated_at
FROM player_rankings
WHERE spa_points > 0
ORDER BY spa_points DESC
LIMIT 10;

-- 7. Check for any triggers on player_rankings that might handle SPA updates
SELECT 
    'TRIGGERS ON PLAYER_RANKINGS' as analysis,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'player_rankings'
AND event_object_schema = 'public';

-- 8. Check if spa_transactions and player_rankings are in sync
WITH spa_summary AS (
    SELECT 
        user_id,
        SUM(amount) as total_from_transactions
    FROM spa_transactions
    GROUP BY user_id
),
ranking_summary AS (
    SELECT 
        user_id,
        spa_points as total_from_rankings
    FROM player_rankings
    WHERE spa_points IS NOT NULL
)
SELECT 
    'SPA SYNC CHECK' as analysis,
    COUNT(*) as total_comparisons,
    COUNT(CASE WHEN s.total_from_transactions = r.total_from_rankings THEN 1 END) as matching_balances,
    COUNT(CASE WHEN s.total_from_transactions != r.total_from_rankings THEN 1 END) as mismatched_balances
FROM spa_summary s
FULL OUTER JOIN ranking_summary r ON s.user_id = r.user_id;
