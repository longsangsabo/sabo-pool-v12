-- ================================================================================
-- MILESTONE SYSTEM COMPLETE FIX SCRIPT
-- ================================================================================
-- This script fixes all milestone system issues in the correct order
-- Run this script in Supabase SQL Editor
-- ================================================================================

-- Step 1: Clean up existing functions to avoid conflicts
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🧹 Cleaning up existing milestone functions...';
END $$;

-- Drop all existing versions of milestone functions
DROP FUNCTION IF EXISTS get_user_milestone_progress(UUID);
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_user_milestone_stats(UUID);
DROP FUNCTION IF EXISTS initialize_user_milestones(UUID);

-- Step 2: Create milestone progress function
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '📊 Creating get_user_milestone_progress function...';
END $$;

CREATE OR REPLACE FUNCTION get_user_milestone_progress(p_user_id UUID)
RETURNS TABLE (
  milestone_id UUID,
  milestone_name TEXT,
  milestone_description TEXT,
  milestone_category TEXT,
  threshold INTEGER,
  current_progress INTEGER,
  is_completed BOOLEAN,
  reward_spa_points INTEGER,
  icon TEXT,
  unlocked_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as milestone_id,
    m.name as milestone_name,
    m.description as milestone_description,
    m.category as milestone_category,
    m.requirement_value as threshold,
    COALESCE(pm.current_progress, 0) as current_progress,
    COALESCE(pm.is_completed, false) as is_completed,
    m.spa_reward as reward_spa_points,
    m.badge_icon as icon,
    pm.completed_at as unlocked_at
  FROM milestones m
  LEFT JOIN player_milestones pm ON m.id = pm.milestone_id AND pm.player_id = p_user_id
  WHERE m.is_active = true
  ORDER BY m.category, m.requirement_value;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_milestone_progress(UUID) TO anon, authenticated;

-- Step 3: Create notification function
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🔔 Creating create_challenge_notification function...';
END $$;

CREATE OR REPLACE FUNCTION create_challenge_notification(
  p_type TEXT,
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Return null for non-existent users (graceful handling)
    RETURN NULL;
  END IF;

  -- Insert notification
  INSERT INTO challenge_notifications (
    type,
    user_id,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    p_type,
    p_user_id,
    p_title,
    p_message,
    false,
    NOW()
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_challenge_notification(TEXT, UUID, TEXT, TEXT) TO anon, authenticated;

-- Step 4: Create milestone stats function
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '📈 Creating get_user_milestone_stats function...';
END $$;

CREATE OR REPLACE FUNCTION get_user_milestone_stats(p_user_id UUID)
RETURNS TABLE (
  total_milestones INTEGER,
  completed_milestones INTEGER,
  total_spa_earned INTEGER,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(m.id)::INTEGER as total_milestones,
    COUNT(CASE WHEN pm.is_completed = true THEN 1 END)::INTEGER as completed_milestones,
    COALESCE(SUM(CASE WHEN pm.is_completed = true THEN m.spa_reward ELSE 0 END), 0)::INTEGER as total_spa_earned,
    CASE 
      WHEN COUNT(m.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN pm.is_completed = true THEN 1 END)::NUMERIC / COUNT(m.id)::NUMERIC) * 100, 2)
      ELSE 0 
    END as completion_percentage
  FROM milestones m
  LEFT JOIN player_milestones pm ON m.id = pm.milestone_id AND pm.player_id = p_user_id
  WHERE m.is_active = true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_milestone_stats(UUID) TO anon, authenticated;

-- Step 5: Create milestone initialization function
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🚀 Creating initialize_user_milestones function...';
END $$;

CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_exists BOOLEAN;
BEGIN
  -- Check if user profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = p_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Return 0 for non-existent users (graceful handling)
    RETURN 0;
  END IF;

  -- Insert milestone tracking records for user
  INSERT INTO player_milestones (player_id, milestone_id, current_progress, is_completed, created_at)
  SELECT 
    p_user_id,
    m.id,
    0,
    false,
    NOW()
  FROM milestones m
  WHERE m.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM player_milestones pm 
      WHERE pm.player_id = p_user_id AND pm.milestone_id = m.id
    );
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  RETURN inserted_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION initialize_user_milestones(UUID) TO anon, authenticated;

-- Step 6: Refresh PostgREST schema cache
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🔄 Refreshing PostgREST schema cache...';
END $$;

NOTIFY pgrst, 'reload schema';

-- Step 7: Verify all functions are created
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Verifying milestone functions...';
END $$;

SELECT 
  routine_name as function_name,
  routine_type as type,
  specific_name as internal_name
FROM information_schema.routines 
WHERE routine_name IN (
  'get_user_milestone_progress',
  'create_challenge_notification', 
  'get_user_milestone_stats',
  'initialize_user_milestones'
)
AND routine_schema = 'public'
ORDER BY routine_name;

-- Step 8: Add helpful comments
-- ================================================================================
COMMENT ON FUNCTION get_user_milestone_progress(UUID) IS 'Returns milestone progress for a specific user';
COMMENT ON FUNCTION create_challenge_notification(TEXT, UUID, TEXT, TEXT) IS 'Creates milestone notifications with graceful error handling';
COMMENT ON FUNCTION get_user_milestone_stats(UUID) IS 'Returns user milestone completion statistics';
COMMENT ON FUNCTION initialize_user_milestones(UUID) IS 'Initializes milestone tracking for new users';

-- ================================================================================
-- MILESTONE SYSTEM FIX COMPLETED
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Milestone system functions have been successfully created!';
    RAISE NOTICE 'You can now test the system with: node test-milestone-system.cjs';
END $$;
