-- Fix Missing Milestone Functions
-- Date: 2025-08-21
-- Implements missing RPC functions required by milestone system

-- 1. Create get_user_milestone_progress function
CREATE OR REPLACE FUNCTION public.get_user_milestone_progress(p_user_id UUID)
RETURNS TABLE (
  milestone_id UUID,
  milestone_name TEXT,
  milestone_type TEXT,
  description TEXT,
  icon TEXT,
  requirement_value INTEGER,
  current_progress INTEGER,
  spa_reward INTEGER,
  is_completed BOOLEAN,
  is_repeatable BOOLEAN,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as milestone_id,
    m.name as milestone_name,
    m.milestone_type,
    m.description,
    COALESCE(m.badge_icon, '🏆') as icon,
    m.requirement_value,
    COALESCE(pm.current_progress, 0) as current_progress,
    m.spa_reward,
    COALESCE(pm.is_completed, false) as is_completed,
    m.is_repeatable,
    pm.completed_at
  FROM public.milestones m
  LEFT JOIN public.player_milestones pm 
    ON m.id = pm.milestone_id 
    AND pm.player_id = p_user_id
  WHERE m.is_active = true
  ORDER BY m.category, m.sort_order, m.name;
END;
$$ LANGUAGE plpgsql;

-- 2. Create create_challenge_notification function (simplified)
CREATE OR REPLACE FUNCTION public.create_challenge_notification(
  p_type TEXT,
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_text TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Check if challenge_notifications table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'challenge_notifications'
  ) THEN
    -- Insert into challenge_notifications table
    INSERT INTO public.challenge_notifications (
      user_id,
      type,
      title,
      message,
      icon,
      priority,
      action_text,
      action_url,
      metadata,
      created_at
    )
    VALUES (
      p_user_id,
      p_type,
      p_title,
      p_message,
      p_icon,
      p_priority,
      p_action_text,
      p_action_url,
      p_metadata,
      NOW()
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  ELSE
    -- If table doesn't exist, log and return null
    RAISE NOTICE 'challenge_notifications table not found, skipping notification: %', p_title;
    RETURN null;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and continue gracefully
    RAISE NOTICE 'Error creating notification: %. Title: %', SQLERRM, p_title;
    RETURN null;
END;
$$ LANGUAGE plpgsql;

-- 3. Create helper function to get milestone stats
CREATE OR REPLACE FUNCTION public.get_user_milestone_stats(p_user_id UUID)
RETURNS TABLE (
  total_milestones INTEGER,
  completed_milestones INTEGER,
  total_spa_earned INTEGER,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(m.id)::INTEGER as total_milestones,
    COUNT(CASE WHEN pm.is_completed THEN 1 END)::INTEGER as completed_milestones,
    COALESCE(SUM(CASE WHEN pm.is_completed THEN m.spa_reward ELSE 0 END), 0)::INTEGER as total_spa_earned,
    CASE 
      WHEN COUNT(m.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN pm.is_completed THEN 1 END)::NUMERIC / COUNT(m.id)::NUMERIC) * 100, 2)
      ELSE 0 
    END as completion_rate
  FROM public.milestones m
  LEFT JOIN public.player_milestones pm 
    ON m.id = pm.milestone_id 
    AND pm.player_id = p_user_id
  WHERE m.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to initialize milestones for new users
CREATE OR REPLACE FUNCTION public.initialize_user_milestones(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  milestone_record RECORD;
  inserted_count INTEGER := 0;
BEGIN
  -- Insert player_milestone records for all active milestones
  FOR milestone_record IN 
    SELECT id FROM public.milestones WHERE is_active = true
  LOOP
    INSERT INTO public.player_milestones (
      player_id, 
      milestone_id, 
      current_progress,
      is_completed,
      times_completed
    )
    VALUES (
      p_user_id, 
      milestone_record.id, 
      0,
      false,
      0
    )
    ON CONFLICT (player_id, milestone_id) DO NOTHING;
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    IF inserted_count > 0 THEN
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_milestone_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_challenge_notification(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_milestone_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_milestones(UUID) TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Created missing milestone functions:';
  RAISE NOTICE '   - get_user_milestone_progress()';
  RAISE NOTICE '   - create_challenge_notification()';
  RAISE NOTICE '   - get_user_milestone_stats()';
  RAISE NOTICE '   - initialize_user_milestones()';
END $$;
