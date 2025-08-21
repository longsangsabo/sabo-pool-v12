-- MIGRATION: Fix SPA Transaction History Gap
-- Tạo transaction records cho SPA balances hiện có

-- 1. First create the unified SPA update function
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
  -- Get current SPA balance
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM player_rankings 
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist, create record
  IF NOT FOUND THEN
    INSERT INTO player_rankings (user_id, spa_points)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_current_spa := 0;
  END IF;

  -- Calculate new balance
  IF p_transaction_type = 'credit' THEN
    v_new_spa := v_current_spa + p_points;
  ELSE
    v_new_spa := GREATEST(0, v_current_spa - p_points);
  END IF;

  -- Update SPA balance
  UPDATE player_rankings 
  SET spa_points = v_new_spa, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction record
  INSERT INTO spa_transactions (
    user_id, amount, transaction_type, source_type, 
    description, reference_id, status, metadata
  ) VALUES (
    p_user_id,
    CASE WHEN p_transaction_type = 'credit' THEN p_points ELSE -p_points END,
    p_transaction_type, p_source_type, p_description, p_reference_id, 'completed',
    COALESCE(p_metadata, jsonb_build_object(
      'previous_balance', v_current_spa, 'new_balance', v_new_spa
    ))
  ) RETURNING id INTO v_transaction_id;

  -- Create notification for significant changes
  IF p_points >= 10 AND p_source_type != 'test' THEN
    INSERT INTO notifications (
      user_id, type, title, message, icon, priority, 
      action_text, action_url, read, metadata
    ) VALUES (
      p_user_id, 'spa_award',
      CASE WHEN p_transaction_type = 'credit' THEN '🎉 Nhận SPA Points!' ELSE '📉 SPA sử dụng' END,
      format('SPA %s: %s điểm', 
        CASE WHEN p_transaction_type = 'credit' THEN 'nhận' ELSE 'sử dụng' END, 
        p_points),
      'dollar-sign', 'medium', 'Xem chi tiết', '/profile?tab=spa', false,
      jsonb_build_object('transaction_id', v_transaction_id, 'amount', p_points)
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 'transaction_id', v_transaction_id,
    'previous_balance', v_current_spa, 'new_balance', v_new_spa
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'update_spa_points failed: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Create retroactive transaction records for existing SPA balances
DO $$
DECLARE
  user_record RECORD;
  transaction_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Creating retroactive SPA transaction records...';
  
  -- For each user with SPA > 0, create transaction record if missing
  FOR user_record IN 
    SELECT 
      pr.user_id,
      pr.spa_points,
      COALESCE(SUM(st.amount), 0) as transaction_total
    FROM player_rankings pr
    LEFT JOIN spa_transactions st ON st.user_id = pr.user_id
    WHERE pr.spa_points > 0
    GROUP BY pr.user_id, pr.spa_points
    HAVING pr.spa_points > COALESCE(SUM(st.amount), 0)
  LOOP
    -- Create retroactive transaction for missing amount
    INSERT INTO spa_transactions (
      user_id, amount, transaction_type, source_type, 
      description, status, metadata
    ) VALUES (
      user_record.user_id,
      user_record.spa_points - user_record.transaction_total,
      'credit',
      'legacy_award',
      'Legacy SPA balance - Historical rewards',
      'completed',
      jsonb_build_object(
        'retroactive', true,
        'original_spa', user_record.spa_points,
        'existing_transactions', user_record.transaction_total,
        'created_reason', 'Fix missing transaction history'
      )
    );
    
    transaction_count := transaction_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Created % retroactive transaction records', transaction_count;
END $$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.update_spa_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_spa_points TO service_role;

-- 4. Update existing triggers to use the unified function
-- This will need to be done in separate migration files for each trigger

RAISE NOTICE 'SPA transaction history fix migration completed';
