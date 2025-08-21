-- ============================================================================
-- FIND UPDATE_SPA_POINTS FUNCTION ISSUE
-- ============================================================================
-- Purpose: Check why update_spa_points function is not working
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Check if update_spa_points function exists at all
SELECT 
    'FUNCTION SEARCH' as section,
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    prosrc as source_code_preview
FROM pg_proc 
WHERE proname ILIKE '%spa%' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Check all functions that might be related to SPA
SELECT 
    'ALL SPA RELATED FUNCTIONS' as section,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name ILIKE '%spa%' 
AND routine_schema = 'public';

-- 3. Try to call update_spa_points function to see what happens
DO $$
BEGIN
    -- Try to see if function exists with different signatures
    PERFORM update_spa_points(
        'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid,
        1,
        'test',
        'test function call',
        'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid
    );
    RAISE NOTICE 'update_spa_points function works with 5 parameters!';
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'update_spa_points function with 5 parameters NOT FOUND!';
    WHEN others THEN
        RAISE NOTICE 'update_spa_points function exists but error: %', SQLERRM;
END $$;

-- 4. Try different parameter signatures
DO $$
BEGIN
    PERFORM update_spa_points(
        'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid,
        1,
        'test',
        'test function call'
    );
    RAISE NOTICE 'update_spa_points function works with 4 parameters!';
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'update_spa_points function with 4 parameters NOT FOUND!';
    WHEN others THEN
        RAISE NOTICE 'update_spa_points function (4 params) exists but error: %', SQLERRM;
END $$;

-- 5. Check if there are any SPA-related triggers
SELECT 
    'SPA RELATED TRIGGERS' as section,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name ILIKE '%spa%' 
OR action_statement ILIKE '%spa%';

-- 6. Check what happened during our retroactive script execution
-- Look for any errors or issues
SELECT 
    'RECENT PLAYER_MILESTONES CHANGES' as section,
    SUBSTRING(player_id::text, 1, 8) || '...' as user_id,
    milestone_id,
    is_completed,
    completed_at,
    created_at,
    updated_at
FROM player_milestones 
WHERE completed_at >= NOW() - INTERVAL '24 hours'
ORDER BY completed_at DESC;

-- 7. Check if SPA values in player_rankings changed recently
SELECT 
    'RECENT SPA CHANGES IN PLAYER_RANKINGS' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    spa_points,
    created_at,
    updated_at
FROM player_rankings 
WHERE updated_at >= NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;

-- 8. Check the exact milestone records for our test user
SELECT 
    'TEST USER MILESTONE DETAILS' as section,
    pm.player_id,
    pm.milestone_id,
    m.name,
    m.spa_reward,
    pm.is_completed,
    pm.completed_at,
    pm.created_at as milestone_created,
    pm.updated_at as milestone_updated
FROM player_milestones pm
JOIN milestones m ON pm.milestone_id = m.id
WHERE pm.player_id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid;

-- 9. Calculate what SPA SHOULD be vs what it IS
WITH expected_spa AS (
    SELECT 
        pm.player_id,
        SUM(m.spa_reward) as expected_from_milestones
    FROM player_milestones pm
    JOIN milestones m ON pm.milestone_id = m.id
    WHERE pm.is_completed = true
    AND pm.player_id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid
    GROUP BY pm.player_id
),
current_spa AS (
    SELECT 
        user_id,
        spa_points as current_spa_balance
    FROM player_rankings
    WHERE user_id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid
)
SELECT 
    'SPA CALCULATION CHECK' as section,
    e.expected_from_milestones,
    c.current_spa_balance,
    c.current_spa_balance - e.expected_from_milestones as spa_from_other_sources,
    CASE 
        WHEN c.current_spa_balance >= e.expected_from_milestones THEN '✅ Has milestone SPA or more'
        ELSE '❌ Missing milestone SPA'
    END as status
FROM expected_spa e
FULL OUTER JOIN current_spa c ON e.player_id = c.user_id;
