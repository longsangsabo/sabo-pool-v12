-- ============================================================================
-- CREATE MISSING UPDATE_SPA_POINTS FUNCTION
-- ============================================================================
-- Purpose: Create the missing update_spa_points function that should award SPA
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Create the update_spa_points function
CREATE OR REPLACE FUNCTION update_spa_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- 1. Insert transaction record into spa_transactions
    INSERT INTO spa_transactions (
        user_id,
        amount,
        source_type,
        transaction_type,
        description,
        reference_id,
        status,
        metadata,
        created_at
    ) VALUES (
        p_user_id,
        p_amount,
        'milestone',
        p_transaction_type,
        p_description,
        p_reference_id,
        'completed',
        '{}',
        NOW()
    );
    
    -- 2. Update player_rankings spa_points
    UPDATE player_rankings 
    SET 
        spa_points = COALESCE(spa_points, 0) + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- 3. If user doesn't exist in player_rankings, create record
    IF NOT FOUND THEN
        INSERT INTO player_rankings (
            user_id,
            spa_points,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_amount,
            NOW(),
            NOW()
        );
    END IF;
    
    RAISE NOTICE 'Successfully awarded % SPA to user % (%)', p_amount, SUBSTRING(p_user_id::text, 1, 8), p_description;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_spa_points(UUID, INTEGER, TEXT, TEXT, UUID) TO public;
GRANT EXECUTE ON FUNCTION update_spa_points(UUID, INTEGER, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_spa_points(UUID, INTEGER, TEXT, TEXT, UUID) TO service_role;

-- Test the function with our test user
SELECT 'Testing update_spa_points function...' as status;

-- Test call (will award 1 SPA as test)
SELECT update_spa_points(
    'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid,
    1,
    'function_test',
    'Testing update_spa_points function',
    NULL
);

-- Check if it worked
SELECT 
    'FUNCTION TEST RESULT' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    spa_points as current_spa,
    updated_at
FROM player_rankings 
WHERE user_id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid;

-- Check transaction was created
SELECT 
    'TRANSACTION TEST RESULT' as section,
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    transaction_type,
    amount,
    description,
    created_at
FROM spa_transactions
WHERE user_id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'::uuid
ORDER BY created_at DESC
LIMIT 3;
