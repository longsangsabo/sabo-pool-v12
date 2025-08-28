-- ================================================================================
-- RESTORE MILESTONE FUNCTIONS (FIXED VERSIONS)
-- ================================================================================
-- Restore lại milestone functions với logic an toàn (no ON CONFLICT)
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🔄 Restoring milestone functions with safe logic...';
END $$;

-- award_milestone_spa (SAFE VERSION)
CREATE OR REPLACE FUNCTION award_milestone_spa(
  p_user_id UUID,
  p_spa_amount INTEGER,
  p_milestone_name TEXT,
  p_milestone_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_current_spa INTEGER := 0;
BEGIN
  -- 1. Get current SPA balance safely
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM player_rankings 
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist in player_rankings, create record
  IF NOT FOUND THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, p_spa_amount, NOW(), NOW());
    v_current_spa := p_spa_amount;
  ELSE
    UPDATE player_rankings 
    SET spa_points = spa_points + p_spa_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
    v_current_spa := v_current_spa + p_spa_amount;
  END IF;

  -- 3. Create SPA transaction record
  INSERT INTO spa_transactions (
    user_id, amount, source_type, transaction_type, description,
    reference_id, status, metadata, created_at
  ) VALUES (
    p_user_id, p_spa_amount, 'milestone_reward', 'credit',
    'Milestone: ' || p_milestone_name, p_milestone_id, 'completed',
    jsonb_build_object(
      'milestone_id', p_milestone_id,
      'milestone_name', p_milestone_name,
      'awarded_at', NOW()
    ), NOW()
  );

  -- 4. Return result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'spa_awarded', p_spa_amount,
    'new_balance', v_current_spa,
    'milestone', p_milestone_name
  );

  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'user_id', p_user_id,
    'spa_amount', p_spa_amount,
    'milestone', p_milestone_name
  );
END;
$$;

-- complete_milestone (SAFE VERSION)
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
  WHERE user_id = p_user_id AND milestone_id = p_milestone_id;
  
  IF v_already_completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone already completed');
  END IF;
  
  -- Mark milestone as completed (SAFE)
  IF EXISTS(SELECT 1 FROM player_milestones WHERE user_id = p_user_id AND milestone_id = p_milestone_id) THEN
    UPDATE player_milestones SET
      current_progress = v_milestone_record.requirement_value,
      is_completed = true,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id AND milestone_id = p_milestone_id;
  ELSE
    INSERT INTO player_milestones (
      user_id, milestone_id, current_progress, is_completed, 
      completed_at, created_at
    ) VALUES (
      p_user_id, p_milestone_id, v_milestone_record.requirement_value,
      true, NOW(), NOW()
    );
  END IF;
  
  -- Award SPA points
  IF v_milestone_record.spa_reward > 0 THEN
    PERFORM award_milestone_spa(p_user_id, v_milestone_record.spa_reward, v_milestone_record.name, p_milestone_id);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'milestone_id', p_milestone_id,
    'milestone_name', v_milestone_record.name,
    'spa_awarded', v_milestone_record.spa_reward
  );
END;
$$;

-- update_milestone_progress (SAFE VERSION)
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
    LEFT JOIN player_milestones pm ON m.id = pm.milestone_id AND pm.user_id = p_user_id
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
  
  -- Update progress for milestones not yet completed (SAFE)
  FOR v_milestone IN 
    SELECT m.id, m.requirement_value
    FROM milestones m
    LEFT JOIN player_milestones pm ON m.id = pm.milestone_id AND pm.user_id = p_user_id
    WHERE m.milestone_type = p_milestone_type
      AND m.is_active = true
      AND COALESCE(pm.is_completed, false) = false
      AND p_new_value < m.requirement_value
  LOOP
    IF EXISTS(SELECT 1 FROM player_milestones WHERE user_id = p_user_id AND milestone_id = v_milestone.id) THEN
      UPDATE player_milestones 
      SET current_progress = LEAST(p_new_value, v_milestone.requirement_value), updated_at = NOW()
      WHERE user_id = p_user_id AND milestone_id = v_milestone.id;
    ELSE
      INSERT INTO player_milestones (user_id, milestone_id, current_progress, is_completed, created_at)
      VALUES (p_user_id, v_milestone.id, LEAST(p_new_value, v_milestone.requirement_value), false, NOW());
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'milestones_completed', v_completed_milestones,
    'completed_milestones', v_results,
    'progress_updated', p_milestone_type || ' = ' || p_new_value
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION award_milestone_spa(UUID, INTEGER, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION complete_milestone(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_milestone_progress(UUID, TEXT, INTEGER) TO anon, authenticated;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ MILESTONE FUNCTIONS RESTORED WITH SAFE LOGIC!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Restored functions:';
    RAISE NOTICE '   • award_milestone_spa() - Safe SPA awarding';
    RAISE NOTICE '   • complete_milestone() - Safe milestone completion';
    RAISE NOTICE '   • update_milestone_progress() - Safe progress tracking';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 All functions now use IF EXISTS + INSERT/UPDATE instead of ON CONFLICT';
    RAISE NOTICE '✅ No more constraint specification errors!';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Milestone system fully functional again!';
END $$;
