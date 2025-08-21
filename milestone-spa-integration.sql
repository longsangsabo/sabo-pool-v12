-- ================================================================================
-- MILESTONE SPA INTEGRATION COMPLETE SCRIPT
-- ================================================================================
-- Creates missing functions for milestone completion and SPA awards
-- ================================================================================

-- Step 1: Create complete milestone function with SPA award
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🏆 Creating complete_milestone function...';
END $$;

CREATE OR REPLACE FUNCTION complete_milestone(
  p_user_id UUID,
  p_milestone_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone_record RECORD;
  v_result JSONB;
  v_already_completed BOOLEAN := false;
BEGIN
  -- Get milestone details
  SELECT * INTO v_milestone_record
  FROM milestones 
  WHERE id = p_milestone_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone not found');
  END IF;
  
  -- Check if already completed
  SELECT is_completed INTO v_already_completed
  FROM player_milestones 
  WHERE player_id = p_user_id AND milestone_id = p_milestone_id;
  
  IF v_already_completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone already completed');
  END IF;
  
  -- Mark milestone as completed
  INSERT INTO player_milestones (
    player_id, 
    milestone_id, 
    current_progress, 
    is_completed, 
    completed_at,
    created_at
  ) VALUES (
    p_user_id,
    p_milestone_id,
    v_milestone_record.requirement_value,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (player_id, milestone_id) DO UPDATE SET
    current_progress = v_milestone_record.requirement_value,
    is_completed = true,
    completed_at = NOW(),
    updated_at = NOW();
  
  -- Award SPA points
  IF v_milestone_record.spa_reward > 0 THEN
    -- Update player rankings
    INSERT INTO player_rankings (player_id, spa_points, updated_at)
    VALUES (p_user_id, v_milestone_record.spa_reward, NOW())
    ON CONFLICT (player_id) DO UPDATE SET
      spa_points = player_rankings.spa_points + v_milestone_record.spa_reward,
      updated_at = NOW();
    
    -- Create SPA transaction
    INSERT INTO spa_transactions (
      user_id,
      amount,
      source_type,
      transaction_type,
      description,
      status,
      metadata,
      created_at
    ) VALUES (
      p_user_id,
      v_milestone_record.spa_reward,
      'milestone_award',
      'credit',
      'Milestone completed: ' || v_milestone_record.name,
      'completed',
      jsonb_build_object(
        'milestone_id', p_milestone_id,
        'milestone_name', v_milestone_record.name,
        'milestone_category', v_milestone_record.category
      ),
      NOW()
    );
  END IF;
  
  -- Create notification
  INSERT INTO challenge_notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    'milestone_completed',
    'Milestone Unlocked! 🎉',
    'You completed: ' || v_milestone_record.name || 
    CASE WHEN v_milestone_record.spa_reward > 0 
         THEN ' (+' || v_milestone_record.spa_reward || ' SPA)'
         ELSE '' END,
    false,
    NOW()
  );
  
  -- Record in milestone events
  INSERT INTO milestone_events (
    user_id,
    milestone_id,
    event_type,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_milestone_id,
    'completed',
    jsonb_build_object(
      'spa_awarded', v_milestone_record.spa_reward,
      'milestone_name', v_milestone_record.name
    ),
    NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'milestone_id', p_milestone_id,
    'milestone_name', v_milestone_record.name,
    'spa_awarded', v_milestone_record.spa_reward,
    'message', 'Milestone completed successfully!'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION complete_milestone(UUID, UUID) TO anon, authenticated;

-- Step 2: Create update milestone progress function
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '📈 Creating update_milestone_progress function...';
END $$;

CREATE OR REPLACE FUNCTION update_milestone_progress(
  p_user_id UUID,
  p_milestone_type TEXT,
  p_new_value INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone RECORD;
  v_completed_milestones INTEGER := 0;
  v_results JSONB := '[]'::jsonb;
  v_milestone_result JSONB;
BEGIN
  -- Find milestones of this type that user can complete
  FOR v_milestone IN 
    SELECT m.*, COALESCE(pm.current_progress, 0) as current_progress, COALESCE(pm.is_completed, false) as is_completed
    FROM milestones m
    LEFT JOIN player_milestones pm ON m.id = pm.milestone_id AND pm.player_id = p_user_id
    WHERE m.milestone_type = p_milestone_type 
      AND m.is_active = true
      AND COALESCE(pm.is_completed, false) = false
      AND p_new_value >= m.requirement_value
    ORDER BY m.requirement_value
  LOOP
    -- Complete this milestone
    SELECT complete_milestone(p_user_id, v_milestone.id) INTO v_milestone_result;
    
    v_results := v_results || v_milestone_result;
    v_completed_milestones := v_completed_milestones + 1;
  END LOOP;
  
  -- Update progress for milestones not yet completed
  UPDATE player_milestones pm
  SET current_progress = LEAST(p_new_value, m.requirement_value),
      updated_at = NOW()
  FROM milestones m
  WHERE pm.milestone_id = m.id
    AND pm.player_id = p_user_id
    AND m.milestone_type = p_milestone_type
    AND pm.is_completed = false
    AND p_new_value < m.requirement_value;
  
  -- Insert progress for new milestones
  INSERT INTO player_milestones (player_id, milestone_id, current_progress, is_completed, created_at)
  SELECT 
    p_user_id,
    m.id,
    LEAST(p_new_value, m.requirement_value),
    false,
    NOW()
  FROM milestones m
  WHERE m.milestone_type = p_milestone_type
    AND m.is_active = true
    AND p_new_value < m.requirement_value
    AND NOT EXISTS (
      SELECT 1 FROM player_milestones pm 
      WHERE pm.player_id = p_user_id AND pm.milestone_id = m.id
    );
  
  RETURN jsonb_build_object(
    'success', true,
    'milestones_completed', v_completed_milestones,
    'completed_milestones', v_results,
    'progress_updated', p_milestone_type || ' = ' || p_new_value
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_milestone_progress(UUID, TEXT, INTEGER) TO anon, authenticated;

-- Step 3: Force schema cache refresh
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🔄 Refreshing PostgREST schema cache...';
END $$;

NOTIFY pgrst, 'reload schema';

-- Step 4: Verify functions
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Verifying milestone SPA integration functions...';
END $$;

SELECT 
  routine_name as function_name,
  routine_type as type
FROM information_schema.routines 
WHERE routine_name IN (
  'complete_milestone',
  'update_milestone_progress'
)
AND routine_schema = 'public'
ORDER BY routine_name;

-- Step 5: Add helpful comments
-- ================================================================================
COMMENT ON FUNCTION complete_milestone(UUID, UUID) IS 'Completes milestone and awards SPA points with full integration';
COMMENT ON FUNCTION update_milestone_progress(UUID, TEXT, INTEGER) IS 'Updates milestone progress and auto-completes eligible milestones';

-- ================================================================================
-- MILESTONE SPA INTEGRATION COMPLETED
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Milestone SPA integration functions created successfully!';
    RAISE NOTICE 'Functions available:';
    RAISE NOTICE '• complete_milestone(user_id, milestone_id) - Complete specific milestone';
    RAISE NOTICE '• update_milestone_progress(user_id, milestone_type, new_value) - Update progress';
    RAISE NOTICE 'Both functions automatically award SPA points and create notifications!';
END $$;
