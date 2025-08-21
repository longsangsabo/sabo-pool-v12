-- COMPREHENSIVE SPA FIX FOR ALL USERS
-- Creates transaction history for ALL users with SPA > transaction total
-- Ensures future users automatically get transaction records

-- Step 1: Temporarily disable RLS for bulk insert
ALTER TABLE spa_transactions DISABLE ROW LEVEL SECURITY;

-- Step 2: Create retroactive transactions for ALL users with SPA gaps
INSERT INTO spa_transactions (
  user_id, 
  amount, 
  transaction_type,
  source_type, 
  description, 
  status,
  metadata
)
SELECT 
  pr.user_id,
  pr.spa_points - COALESCE(tx_totals.total_amount, 0) as missing_amount,
  'credit',
  'legacy_award',
  'Legacy SPA balance - Historical milestone rewards',
  'completed',
  jsonb_build_object(
    'retroactive', true,
    'original_spa_balance', pr.spa_points,
    'existing_transaction_total', COALESCE(tx_totals.total_amount, 0),
    'created_reason', 'Bulk fix for missing transaction history',
    'fix_timestamp', NOW()
  )
FROM player_rankings pr
LEFT JOIN (
  SELECT 
    user_id, 
    SUM(amount) as total_amount
  FROM spa_transactions 
  GROUP BY user_id
) tx_totals ON tx_totals.user_id = pr.user_id
WHERE pr.spa_points > 0
  AND pr.spa_points > COALESCE(tx_totals.total_amount, 0);

-- Step 3: Re-enable RLS
ALTER TABLE spa_transactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create/Replace unified SPA update function for future transactions
CREATE OR REPLACE FUNCTION public.update_spa_points_with_transaction(
  p_user_id UUID,
  p_points INTEGER,
  p_source_type TEXT DEFAULT 'system',
  p_description TEXT DEFAULT 'SPA Points Update',
  p_transaction_type TEXT DEFAULT 'credit',
  p_reference_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_spa INTEGER := 0;
  v_new_spa INTEGER := 0;
  v_transaction_id UUID;
BEGIN
  -- Get current SPA balance
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM player_rankings 
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist, create record
  IF NOT FOUND THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW())
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
    description, reference_id, status
  ) VALUES (
    p_user_id,
    CASE WHEN p_transaction_type = 'credit' THEN p_points ELSE -p_points END,
    p_transaction_type, p_source_type, p_description, p_reference_id, 'completed'
  ) RETURNING id INTO v_transaction_id;

  -- Create notification for significant changes
  IF p_points >= 10 AND p_source_type != 'test' THEN
    INSERT INTO notifications (
      user_id, type, title, message, icon, priority, 
      action_text, action_url, is_read
    ) VALUES (
      p_user_id, 'spa_award',
      CASE WHEN p_transaction_type = 'credit' THEN '🎉 Nhận SPA Points!' ELSE '📉 SPA sử dụng' END,
      format('SPA %s: %s điểm từ %s', 
        CASE WHEN p_transaction_type = 'credit' THEN 'nhận' ELSE 'sử dụng' END, 
        p_points, p_source_type),
      'dollar-sign', 'medium', 'Xem chi tiết', '/profile?tab=spa', false
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 'transaction_id', v_transaction_id,
    'previous_balance', v_current_spa, 'new_balance', v_new_spa
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'update_spa_points_with_transaction failed: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.update_spa_points_with_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_spa_points_with_transaction TO service_role;

-- Step 6: Create notifications for users about the fix
INSERT INTO notifications (
  user_id, type, title, message, icon, priority, 
  action_text, action_url, is_read
)
SELECT 
  pr.user_id,
  'spa_award',
  '📊 Lịch sử SPA đã được cập nhật!',
  format('Chúng tôi đã thêm lịch sử giao dịch cho %s SPA của bạn. Giờ bạn có thể xem chi tiết trong tab SPA.', 
    pr.spa_points - COALESCE(tx_totals.total_amount, 0)),
  'history',
  'medium',
  'Xem SPA',
  '/profile?tab=spa',
  false
FROM player_rankings pr
LEFT JOIN (
  SELECT user_id, SUM(amount) as total_amount
  FROM spa_transactions 
  WHERE source_type = 'legacy_award'
  GROUP BY user_id
) tx_totals ON tx_totals.user_id = pr.user_id
WHERE pr.spa_points > 0
  AND pr.spa_points > COALESCE(tx_totals.total_amount, 0)
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.user_id = pr.user_id 
    AND n.title = '📊 Lịch sử SPA đã được cập nhật!'
  );

-- Step 7: Log completion
DO $$
DECLARE
  fix_count INTEGER;
  notification_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fix_count
  FROM spa_transactions 
  WHERE source_type = 'legacy_award'
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  SELECT COUNT(*) INTO notification_count
  FROM notifications
  WHERE title = '📊 Lịch sử SPA đã được cập nhật!'
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  RAISE NOTICE 'COMPREHENSIVE SPA FIX COMPLETED:';
  RAISE NOTICE '- Created % retroactive transaction records', fix_count;
  RAISE NOTICE '- Created % user notifications', notification_count;
  RAISE NOTICE 'ALL users should now see transaction history instead of "Chưa có giao dịch SPA nào"';
  RAISE NOTICE 'Future SPA updates will automatically create transaction records via update_spa_points_with_transaction()';
END $$;
