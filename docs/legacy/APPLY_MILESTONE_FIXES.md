🔧 **MILESTONE SYSTEM FIXES READY**

## Step 1: Apply Schema Fix

Copy và run script này trong Supabase SQL Editor:

```sql
-- Fix Milestone System Schema Cache Issues
-- Resolves PostgREST schema cache problems

-- 1. Refresh schema cache by recreating functions with proper permissions
DROP FUNCTION IF EXISTS get_user_milestone_progress(UUID);
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

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION get_user_milestone_progress(UUID) TO anon, authenticated;

-- 2. Fix create_challenge_notification to handle missing users gracefully
-- Drop all existing versions to avoid conflicts
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ);

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
  -- Check if user exists first
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Return null for non-existent users instead of failing
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

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION create_challenge_notification(TEXT, UUID, TEXT, TEXT) TO anon, authenticated;

-- 3. Create helper function to get user milestone stats
DROP FUNCTION IF EXISTS get_user_milestone_stats(UUID);
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

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION get_user_milestone_stats(UUID) TO anon, authenticated;

-- 4. Create function to initialize user milestones
DROP FUNCTION IF EXISTS initialize_user_milestones(UUID);
CREATE OR REPLACE FUNCTION initialize_user_milestones(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_exists BOOLEAN;
BEGIN
  -- Check if user profile exists first
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = p_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Return 0 for non-existent users instead of failing
    RETURN 0;
  END IF;

  -- Insert milestone records for user if they don't exist
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

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION initialize_user_milestones(UUID) TO anon, authenticated;

-- 5. Force PostgREST schema cache refresh
NOTIFY pgrst, 'reload schema';
```

## Step 2: Test Functions

Sau khi apply, chạy lệnh test:

```bash
node test-milestone-system.cjs
```

Expected result: ✅ All functions working without errors!

## Summary of Fixes:

✅ **Schema Alignment**: Fixed column names to match actual database schema
- `threshold` → `requirement_value`
- `reward_spa_points` → `spa_reward` 
- `icon` → `badge_icon`
- `unlocked_at` → `completed_at`

✅ **Error Handling**: Added graceful handling for non-existent users

✅ **Function Conflicts**: Resolved duplicate function issues

✅ **Foreign Keys**: Added user existence checks before operations
