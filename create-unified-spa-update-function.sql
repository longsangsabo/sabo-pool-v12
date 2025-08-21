-- UNIFIED SPA UPDATE FUNCTION
-- Đảm bảo mọi SPA update đều tạo transaction và notification
-- Thay thế tất cả direct UPDATE spa_points trong triggers

CREATE OR REPLACE FUNCTION public.update_spa_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source_type TEXT DEFAULT 'system',
  p_description TEXT DEFAULT 'SPA Points Update',
  p_transaction_type TEXT DEFAULT 'credit',
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_spa INTEGER := 0;
  v_new_spa INTEGER := 0;
  v_transaction_id UUID;
  v_result JSONB;
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

  -- 2. Calculate new balance
  IF p_transaction_type = 'credit' THEN
    v_new_spa := v_current_spa + p_points;
  ELSE
    v_new_spa := GREATEST(0, v_current_spa - p_points); -- Don't go below 0
  END IF;

  -- 3. Update SPA balance in player_rankings
  UPDATE player_rankings 
  SET 
    spa_points = v_new_spa,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 4. Create transaction record
  INSERT INTO spa_transactions (
    user_id, 
    amount, 
    transaction_type,
    source_type, 
    description,
    reference_id,
    status,
    metadata
  ) VALUES (
    p_user_id,
    CASE 
      WHEN p_transaction_type = 'credit' THEN p_points
      ELSE -p_points
    END,
    p_transaction_type,
    p_source_type,
    p_description,
    p_reference_id,
    'completed',
    COALESCE(p_metadata, jsonb_build_object(
      'previous_balance', v_current_spa,
      'new_balance', v_new_spa,
      'updated_at', NOW()
    ))
  ) RETURNING id INTO v_transaction_id;

  -- 5. Create notification for significant SPA changes
  IF p_points >= 10 AND p_source_type != 'test' THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      icon,
      priority,
      action_text,
      action_url,
      read,
      metadata
    ) VALUES (
      p_user_id,
      'spa_award',
      CASE 
        WHEN p_transaction_type = 'credit' THEN '🎉 Nhận SPA Points!'
        ELSE '📉 SPA Points đã được sử dụng'
      END,
      CASE 
        WHEN p_transaction_type = 'credit' THEN 
          format('Bạn đã nhận %s SPA từ %s', p_points, 
            CASE p_source_type
              WHEN 'milestone_award' THEN 'hoàn thành milestone'
              WHEN 'tournament_reward' THEN 'giải đấu'
              WHEN 'challenge_win' THEN 'thắng thách đấu'
              WHEN 'rank_verification' THEN 'xác thực hạng'
              ELSE p_description
            END
          )
        ELSE format('Đã sử dụng %s SPA cho %s', p_points, p_description)
      END,
      CASE 
        WHEN p_source_type = 'milestone_award' THEN 'trophy'
        WHEN p_source_type = 'tournament_reward' THEN 'crown'
        WHEN p_source_type = 'challenge_win' THEN 'sword'
        WHEN p_source_type = 'rank_verification' THEN 'medal'
        ELSE 'dollar-sign'
      END,
      'medium',
      'Xem chi tiết',
      '/profile?tab=spa',
      false,
      jsonb_build_object(
        'transaction_id', v_transaction_id,
        'amount', p_points,
        'source_type', p_source_type,
        'new_balance', v_new_spa
      )
    );
  END IF;

  -- 6. Return result
  v_result := jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'previous_balance', v_current_spa,
    'new_balance', v_new_spa,
    'amount_changed', p_points,
    'transaction_type', p_transaction_type
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    RAISE WARNING 'update_spa_points failed for user %: %', p_user_id, SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', p_user_id,
      'attempted_points', p_points
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_spa_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_spa_points TO service_role;

-- Test function
DO $$
BEGIN
  RAISE NOTICE 'update_spa_points function created successfully';
END $$;
