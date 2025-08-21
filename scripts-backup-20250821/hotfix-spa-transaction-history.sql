-- HOTFIX: Create transaction records for users with SPA but no transaction history
-- Specifically fixes users with 350 SPA (BOSA and sabo users)

-- Step 1: Create retroactive transactions for users with SPA > transaction total
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
  'Legacy SPA balance - Historical milestone rewards',
  'completed',
  jsonb_build_object(
    'retroactive', true,
    'original_spa_balance', pr.spa_points,
    'existing_transaction_total', COALESCE(tx_totals.total_amount, 0),
    'created_reason', 'Fix missing transaction history for UI display',
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
  AND pr.spa_points > COALESCE(tx_totals.total_amount, 0)
  AND NOT EXISTS (
    -- Don't create if already has retroactive record
    SELECT 1 FROM spa_transactions st 
    WHERE st.user_id = pr.user_id 
    AND st.source_type = 'legacy_award'
  );

-- Step 2: Create notifications for affected users
INSERT INTO public.notifications (
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
    'amount', st.amount
  )
FROM spa_transactions st
WHERE st.source_type = 'legacy_award'
  AND st.created_at > NOW() - INTERVAL '1 minute'  -- Only notify for transactions just created
  AND NOT EXISTS (
    -- Don't create duplicate notifications
    SELECT 1 FROM notifications n 
    WHERE n.user_id = st.user_id 
    AND n.metadata->>'transaction_id' = st.id::text
  );

-- Step 3: Log the fix
DO $$
DECLARE
  fix_count INTEGER;
  notification_count INTEGER;
BEGIN
  -- Count how many transactions were created
  SELECT COUNT(*) INTO fix_count
  FROM spa_transactions 
  WHERE source_type = 'legacy_award'
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Count how many notifications were created  
  SELECT COUNT(*) INTO notification_count
  FROM notifications
  WHERE type = 'spa_award'
    AND created_at > NOW() - INTERVAL '1 minute'
    AND metadata->>'retroactive_fix' = 'true';
  
  RAISE NOTICE 'SPA Transaction History Fix Complete:';
  RAISE NOTICE '- Created % retroactive transaction records', fix_count;
  RAISE NOTICE '- Created % user notifications', notification_count;
  RAISE NOTICE 'Users should now see transaction history in SPA tab instead of "Chưa có giao dịch SPA nào"';
END $$;
