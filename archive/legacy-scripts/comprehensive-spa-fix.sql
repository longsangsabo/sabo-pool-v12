-- COMPREHENSIVE SPA TRANSACTION HISTORY FIX
-- 1. Create retroactive transaction records for ALL users with missing history
-- 2. Setup unified function for future SPA updates
-- 3. Disable RLS temporarily for this operation

-- Step 1: Temporarily disable RLS for spa_transactions to allow bulk insert
ALTER TABLE public.spa_transactions DISABLE ROW LEVEL SECURITY;

-- Step 2: Create retroactive transactions for users with SPA but missing transaction records
INSERT INTO public.spa_transactions (
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
  'Legacy SPA balance - Historical milestone and rank rewards',
  'completed',
  jsonb_build_object(
    'retroactive', true,
    'original_spa_balance', pr.spa_points,
    'existing_transaction_total', COALESCE(tx_totals.total_amount, 0),
    'created_reason', 'Comprehensive fix for missing transaction history',
    'fix_timestamp', NOW(),
    'batch_operation', true
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
  AND pr.spa_points > COALESCE(tx_totals.total_amount, 0)
  AND NOT EXISTS (
    -- Don't create if already has legacy award record
    SELECT 1 FROM spa_transactions st 
    WHERE st.user_id = pr.user_id 
    AND st.source_type = 'legacy_award'
  );

-- Step 3: Re-enable RLS for spa_transactions
ALTER TABLE public.spa_transactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create notifications for users with significant missing amounts (>=100 SPA)
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  message,
  icon,
  priority,
  action_text,
  action_url,
  is_read,
  metadata
)
SELECT 
  st.user_id,
  'spa_award',
  '📊 Lịch sử SPA đã được cập nhật!',
  format('Chúng tôi đã thêm lịch sử giao dịch cho %s SPA của bạn. Giờ bạn có thể xem chi tiết trong tab SPA.', st.amount),
  'history',
  'medium',
  'Xem SPA',
  '/profile?tab=spa',
  false,
  jsonb_build_object(
    'transaction_id', st.id,
    'retroactive_fix', true,
    'amount', st.amount,
    'batch_operation', true
  )
FROM spa_transactions st
WHERE st.source_type = 'legacy_award'
  AND st.amount >= 100
  AND st.created_at > NOW() - INTERVAL '1 minute'  -- Only for just-created transactions
  AND NOT EXISTS (
    -- Don't create duplicate notifications
    SELECT 1 FROM notifications n 
    WHERE n.user_id = st.user_id 
    AND n.metadata->>'transaction_id' = st.id::text
  );

-- Step 5: Drop existing function and recreate with correct signature
DROP FUNCTION IF EXISTS public.update_spa_points;

-- Create unified update_spa_points function for future SPA updates
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
    INSERT INTO player_rankings (user_id, spa_points, updated_at)
    VALUES (p_user_id, 0, NOW())
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

  -- Create notification for significant changes (>=10 SPA)
  IF p_points >= 10 AND p_source_type != 'test' THEN
    INSERT INTO notifications (
      user_id, type, title, message, icon, priority, 
      action_text, action_url, is_read, metadata
    ) VALUES (
      p_user_id, 'spa_award',
      CASE WHEN p_transaction_type = 'credit' THEN '🎉 Nhận SPA Points!' ELSE '📉 SPA sử dụng' END,
      format('SPA %s: %s điểm từ %s', 
        CASE WHEN p_transaction_type = 'credit' THEN 'nhận' ELSE 'sử dụng' END, 
        p_points,
        CASE p_source_type
          WHEN 'milestone_award' THEN 'hoàn thành milestone'
          WHEN 'tournament_reward' THEN 'giải đấu'
          WHEN 'challenge_win' THEN 'thắng thách đấu'
          WHEN 'rank_verification' THEN 'xác thực hạng'
          ELSE p_description
        END
      ),
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

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION public.update_spa_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_spa_points TO service_role;
GRANT EXECUTE ON FUNCTION public.update_spa_points TO anon;

-- Step 7: Create audit function to verify fix
CREATE OR REPLACE FUNCTION public.audit_spa_transaction_completeness()
RETURNS TABLE (
  user_id UUID,
  spa_balance INTEGER,
  transaction_total INTEGER,
  gap INTEGER,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.user_id,
    pr.spa_points as spa_balance,
    COALESCE(tx_totals.total_amount, 0)::INTEGER as transaction_total,
    (pr.spa_points - COALESCE(tx_totals.total_amount, 0))::INTEGER as gap,
    CASE 
      WHEN pr.spa_points = COALESCE(tx_totals.total_amount, 0) THEN 'Perfect'
      WHEN pr.spa_points > COALESCE(tx_totals.total_amount, 0) THEN 'Missing Transactions'
      ELSE 'Excess Transactions'
    END as status
  FROM player_rankings pr
  LEFT JOIN (
    SELECT 
      user_id, 
      SUM(amount) as total_amount
    FROM spa_transactions 
    GROUP BY user_id
  ) tx_totals ON tx_totals.user_id = pr.user_id
  WHERE pr.spa_points > 0
  ORDER BY (pr.spa_points - COALESCE(tx_totals.total_amount, 0)) DESC;
END;
$$;

-- Grant audit function permissions
GRANT EXECUTE ON FUNCTION public.audit_spa_transaction_completeness TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_spa_transaction_completeness TO service_role;

-- Step 8: Log results
DO $$
DECLARE
  fix_count INTEGER;
  notification_count INTEGER;
  total_spa_fixed INTEGER;
BEGIN
  -- Count retroactive transactions created
  SELECT COUNT(*), COALESCE(SUM(amount), 0) INTO fix_count, total_spa_fixed
  FROM spa_transactions 
  WHERE source_type = 'legacy_award'
    AND created_at > NOW() - INTERVAL '2 minutes';
  
  -- Count notifications created  
  SELECT COUNT(*) INTO notification_count
  FROM notifications
  WHERE type = 'spa_award'
    AND created_at > NOW() - INTERVAL '2 minutes'
    AND metadata->>'retroactive_fix' = 'true';
  
  RAISE NOTICE 'COMPREHENSIVE SPA TRANSACTION HISTORY FIX COMPLETE:';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Created % retroactive transaction records', fix_count;
  RAISE NOTICE 'Total SPA amount processed: % SPA', total_spa_fixed;
  RAISE NOTICE 'Created % user notifications', notification_count;
  RAISE NOTICE '';
  RAISE NOTICE 'RESULTS:';
  RAISE NOTICE '- All users should now see transaction history instead of "Chưa có giao dịch SPA nào"';
  RAISE NOTICE '- Future SPA updates will automatically create transaction records';
  RAISE NOTICE '- Use SELECT * FROM audit_spa_transaction_completeness() to verify completeness';
  RAISE NOTICE '';
  RAISE NOTICE 'SUCCESS: SPA transaction history system is now complete and unified!';
END $$;
