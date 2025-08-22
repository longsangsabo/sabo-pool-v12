-- Create SPA Update Function for Milestone Awards
-- This function awards SPA points and creates transaction records

CREATE OR REPLACE FUNCTION public.award_milestone_spa(
  p_user_id UUID,
  p_spa_amount INTEGER,
  p_milestone_name TEXT,
  p_milestone_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_current_spa INTEGER := 0;
BEGIN
  -- 1. Get current SPA balance
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM player_rankings 
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist in player_rankings, create record
  IF NOT FOUND THEN
    INSERT INTO player_rankings (user_id, spa_points)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_current_spa := 0;
  END IF;

  -- 2. Update SPA balance in player_rankings
  UPDATE player_rankings 
  SET spa_points = COALESCE(spa_points, 0) + p_spa_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 3. Create SPA transaction record
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
    p_spa_amount,
    'milestone_reward',
    'credit',
    'Milestone: ' || p_milestone_name,
    p_milestone_id,
    'completed',
    jsonb_build_object(
      'milestone_id', p_milestone_id,
      'milestone_name', p_milestone_name,
      'awarded_at', NOW()
    ),
    NOW()
  );

  -- 4. Return result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'spa_awarded', p_spa_amount,
    'previous_balance', v_current_spa,
    'new_balance', v_current_spa + p_spa_amount,
    'milestone', p_milestone_name
  );

  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error details
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'user_id', p_user_id,
    'spa_amount', p_spa_amount,
    'milestone', p_milestone_name
  );
END;
$$;
