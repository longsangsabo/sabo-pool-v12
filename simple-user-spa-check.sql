-- ============================================================================
-- SIMPLE USER SPA CHECK - RETURNS ACTUAL DATA
-- ============================================================================
-- Purpose: Check user SPA status using SELECT statements
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Find user by email and get basic info
SELECT 
    'USER BASIC INFO' as section,
    SUBSTRING(id::text, 1, 8) || '...' as user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'lss2ps@gmail.com';

-- 2. Check player rankings and SPA
SELECT 
    'PLAYER RANKINGS & SPA' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    spa_points as current_spa,
    created_at as ranking_created,
    updated_at as last_updated
FROM player_rankings pr
WHERE pr.user_id = (
    SELECT id FROM auth.users WHERE email = 'lss2ps@gmail.com'
);

-- 3. Check milestone progress
SELECT 
    'MILESTONE PROGRESS' as section,
    SUBSTRING(pm.player_id::text, 1, 8) || '...' as user_id,
    m.name as milestone_name,
    m.milestone_type,
    m.spa_reward,
    pm.current_progress,
    m.requirement_value,
    pm.is_completed,
    pm.completed_at,
    pm.times_completed
FROM player_milestones pm
JOIN milestones m ON pm.milestone_id = m.id
WHERE pm.player_id = (
    SELECT id FROM auth.users WHERE email = 'lss2ps@gmail.com'
)
ORDER BY pm.created_at;

-- 4. Check SPA transaction history
SELECT 
    'SPA TRANSACTIONS' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    transaction_type,
    amount,
    description,
    created_at,
    reference_id
FROM spa_transactions
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lss2ps@gmail.com'
)
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check recent notifications
SELECT 
    'RECENT NOTIFICATIONS' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    type,
    title,
    message,
    is_read,
    created_at,
    metadata
FROM challenge_notifications
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lss2ps@gmail.com'
)
ORDER BY created_at DESC
LIMIT 5;

-- 6. Available milestones for comparison
SELECT 
    'AVAILABLE MILESTONES' as section,
    name,
    milestone_type,
    spa_reward,
    requirement_value,
    is_active
FROM milestones
WHERE milestone_type IN ('account_creation', 'rank_registration')
AND is_active = true;

-- 7. Overall statistics
SELECT 
    'OVERALL STATISTICS' as section,
    'Total users in player_rankings' as metric,
    COUNT(*) as value
FROM player_rankings
UNION ALL
SELECT 
    'OVERALL STATISTICS' as section,
    'Users with milestone progress' as metric,
    COUNT(DISTINCT player_id) as value
FROM player_milestones
UNION ALL
SELECT 
    'OVERALL STATISTICS' as section,
    'Users without milestone progress' as metric,
    (SELECT COUNT(*) FROM player_rankings) - COUNT(DISTINCT player_id) as value
FROM player_milestones;
