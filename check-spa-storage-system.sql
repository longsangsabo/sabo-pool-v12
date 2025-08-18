-- ============================================================================
-- CHECK SPA STORAGE TABLES AND FUNCTIONS
-- ============================================================================
-- Purpose: Identify where SPA points are stored and how they're updated
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Check what tables contain SPA-related columns
SELECT 
    'TABLE STRUCTURE - SPA Columns' as section,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE column_name ILIKE '%spa%'
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 2. Check player_rankings table structure (main SPA storage)
SELECT 
    'PLAYER_RANKINGS STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'player_rankings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check spa_transactions table structure (SPA history)
SELECT 
    'SPA_TRANSACTIONS STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'spa_transactions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Find the update_spa_points function definition
SELECT 
    'UPDATE_SPA_POINTS FUNCTION' as section,
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_spa_points'
AND routine_schema = 'public';

-- 5. Check recent SPA transactions to see the pattern
SELECT 
    'RECENT SPA TRANSACTIONS' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    transaction_type,
    amount,
    description,
    created_at
FROM spa_transactions
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check current SPA balances in player_rankings
SELECT 
    'CURRENT SPA BALANCES' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    spa_points,
    updated_at
FROM player_rankings
WHERE spa_points > 0
ORDER BY spa_points DESC
LIMIT 10;

-- 7. Check if there are any other tables that might store SPA
SELECT 
    'ALL TABLES WITH NUMERIC COLUMNS (Potential SPA storage)' as section,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND data_type IN ('integer', 'bigint', 'numeric', 'decimal')
AND (column_name ILIKE '%point%' OR column_name ILIKE '%balance%' OR column_name ILIKE '%amount%')
ORDER BY table_name, column_name;
