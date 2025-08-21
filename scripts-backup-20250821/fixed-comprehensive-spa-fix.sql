-- FIXED COMPREHENSIVE SPA TRANSACTION HISTORY FIX
-- Tạo transaction records cho TẤT CẢ users với gap > 0
-- Không skip users đã có một số transactions

BEGIN;

-- Step 1: Create missing transaction records for ALL users with gaps
INSERT INTO spa_transactions (
  user_id,
  amount,
  transaction_type,
  source_type,
  description,
  status,
  metadata,
  created_at,
  updated_at
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
  ),
  NOW(),
  NOW()
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
  -- Only check if this SPECIFIC gap has been filled
  AND NOT EXISTS (
    SELECT 1 FROM spa_transactions st 
    WHERE st.user_id = pr.user_id 
    AND st.source_type = 'legacy_award'
    AND st.amount = (pr.spa_points - COALESCE(tx_totals.total_amount, 0))
  );

-- Step 2: Create notifications for users who got large legacy awards (≥100 SPA)
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  created_at,
  read,
  metadata
)
SELECT 
  st.user_id,
  'SPA Transaction History Updated',
  'Your SPA transaction history has been updated with historical milestone rewards (' || st.amount || ' SPA).',
  'spa_award',
  NOW(),
  false,
  jsonb_build_object(
    'spa_amount', st.amount,
    'transaction_id', st.id,
    'retroactive_award', true,
    'created_by_system', true
  )
FROM spa_transactions st
WHERE st.source_type = 'legacy_award'
  AND st.amount >= 100
  AND st.created_at >= NOW() - INTERVAL '1 minute'  -- Only recent legacy awards
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = st.user_id
    AND n.type = 'spa_award'
    AND n.metadata->>'transaction_id' = st.id::text
  );

-- Step 3: Create or replace unified SPA update function
CREATE OR REPLACE FUNCTION update_spa_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source_type TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_spa INTEGER;
  new_spa INTEGER;
  transaction_id UUID;
  should_notify BOOLEAN := false;
BEGIN
  -- Get current SPA
  SELECT spa_points INTO current_spa 
  FROM player_rankings 
  WHERE user_id = p_user_id;
  
  IF current_spa IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  new_spa := current_spa + p_points;
  
  -- Prevent negative SPA
  IF new_spa < 0 THEN
    RAISE EXCEPTION 'Insufficient SPA points. Current: %, Requested: %', current_spa, p_points;
  END IF;
  
  -- Update player_rankings
  UPDATE player_rankings 
  SET spa_points = new_spa,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO spa_transactions (
    user_id,
    amount,
    transaction_type,
    source_type,
    description,
    status,
    metadata
  ) VALUES (
    p_user_id,
    p_points,
    CASE WHEN p_points > 0 THEN 'credit' ELSE 'debit' END,
    p_source_type,
    COALESCE(p_description, 
      CASE 
        WHEN p_points > 0 THEN 'SPA points awarded'
        ELSE 'SPA points deducted'
      END
    ),
    'completed',
    jsonb_build_object(
      'previous_balance', current_spa,
      'new_balance', new_spa,
      'automated_transaction', true
    )
  ) RETURNING id INTO transaction_id;
  
  -- Determine if should notify (significant amounts)
  should_notify := ABS(p_points) >= 50;
  
  -- Create notification for significant changes
  IF should_notify THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      metadata
    ) VALUES (
      p_user_id,
      CASE WHEN p_points > 0 THEN 'SPA Points Awarded' ELSE 'SPA Points Deducted' END,
      CASE 
        WHEN p_points > 0 THEN 'You received ' || p_points || ' SPA points!'
        ELSE 'You spent ' || ABS(p_points) || ' SPA points.'
      END,
      'spa_transaction',
      jsonb_build_object(
        'spa_amount', p_points,
        'transaction_id', transaction_id,
        'source_type', p_source_type
      )
    );
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create audit function to check system integrity
CREATE OR REPLACE FUNCTION audit_spa_transaction_completeness()
RETURNS TABLE(
  user_id UUID,
  spa_balance INTEGER,
  transaction_total INTEGER,
  gap INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.user_id,
    pr.spa_points,
    COALESCE(tx_totals.total_amount, 0)::INTEGER as transaction_total,
    (pr.spa_points - COALESCE(tx_totals.total_amount, 0))::INTEGER as gap,
    CASE 
      WHEN pr.spa_points = COALESCE(tx_totals.total_amount, 0) THEN 'PERFECT'
      WHEN pr.spa_points > COALESCE(tx_totals.total_amount, 0) THEN 'MISSING_TX'
      ELSE 'OVER_TX'
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
  ORDER BY gap DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Set up RLS policies for spa_transactions table
-- Allow users to read their own transactions
DROP POLICY IF EXISTS "Users can read own spa transactions" ON spa_transactions;
CREATE POLICY "Users can read own spa transactions" ON spa_transactions
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Allow service role to manage all transactions
DROP POLICY IF EXISTS "Service role can manage spa transactions" ON spa_transactions;
CREATE POLICY "Service role can manage spa transactions" ON spa_transactions
  FOR ALL USING (
    current_setting('role') = 'service_role'
  );

-- Enable RLS
ALTER TABLE spa_transactions ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Final verification query
SELECT 
  'VERIFICATION' as step,
  COUNT(*) as users_with_spa,
  COUNT(CASE WHEN gap = 0 THEN 1 END) as perfect_users,
  COUNT(CASE WHEN gap > 0 THEN 1 END) as users_with_gaps,
  SUM(gap) as total_gap
FROM (
  SELECT 
    pr.user_id,
    pr.spa_points - COALESCE(tx_totals.total_amount, 0) as gap
  FROM player_rankings pr
  LEFT JOIN (
    SELECT user_id, SUM(amount) as total_amount
    FROM spa_transactions 
    GROUP BY user_id
  ) tx_totals ON tx_totals.user_id = pr.user_id
  WHERE pr.spa_points > 0
) gaps;
