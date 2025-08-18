-- ============================================================================
-- CHECK SPA_TRANSACTIONS TABLE STRUCTURE
-- ============================================================================
-- Purpose: Check exact structure of spa_transactions table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Check all columns in spa_transactions table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'spa_transactions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing records to see the pattern
SELECT 
    'EXISTING SPA_TRANSACTIONS SAMPLE' as section,
    user_id,
    amount,
    source_type,
    transaction_type,
    description,
    status,
    metadata,
    created_at
FROM spa_transactions
ORDER BY created_at DESC
LIMIT 5;
