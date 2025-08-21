-- ============================================================================
-- IMPROVED USER SPA CHECK WITH NAMES
-- ============================================================================
-- Purpose: Check user SPA status with readable names
-- Run this AFTER running add-user-name-columns.sql
-- ============================================================================

-- 1. Find user by email and get basic info
SELECT 
    'USER BASIC INFO' as section,
    SUBSTRING(id::text, 1, 8) || '...' as user_id,
    email,
    COALESCE(
        raw_user_meta_data->>'full_name',
        raw_user_meta_data->>'name', 
        raw_user_meta_data->>'display_name',
        email
    ) as display_name,
    created_at
FROM auth.users 
WHERE email = 'lss2ps@gmail.com';

-- 2. Check player rankings and SPA
SELECT 
    'PLAYER RANKINGS & SPA' as section,
    user_name,
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
    pm.user_name,
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
    user_name,
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
    user_name,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    type,
    title,
    message,
    is_read,
    created_at
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

-- 7. Overall statistics with names
SELECT 
    'RECENT ACTIVITY - SPA Transactions' as section,
    user_name,
    transaction_type,
    amount,
    description,
    created_at
FROM spa_transactions
WHERE transaction_type = 'retroactive_milestone'
ORDER BY created_at DESC
LIMIT 20;

-- 8. Recent milestone completions with names
SELECT 
    'RECENT MILESTONE COMPLETIONS' as section,
    pm.user_name,
    m.name as milestone_name,
    m.spa_reward,
    pm.completed_at
FROM player_milestones pm
JOIN milestones m ON pm.milestone_id = m.id
WHERE pm.completed_at >= NOW() - INTERVAL '24 hours'
AND pm.is_completed = true
ORDER BY pm.completed_at DESC;

-- 9. Users without milestone progress (still need retroactive awards)
SELECT 
    'USERS WITHOUT MILESTONES' as section,
    pr.user_name,
    SUBSTRING(pr.user_id::text, 1, 8) || '...' as user_id,
    pr.spa_points,
    pr.created_at
FROM player_rankings pr
LEFT JOIN player_milestones pm ON pr.user_id = pm.player_id
WHERE pm.player_id IS NULL
ORDER BY pr.created_at
LIMIT 20;
