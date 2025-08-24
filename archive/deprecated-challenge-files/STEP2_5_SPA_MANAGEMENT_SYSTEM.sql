-- =============================================================================
-- STEP 2.5: SPA MANAGEMENT SYSTEM
-- Deploy này trước Step 3 trên Supabase SQL Editor
-- =============================================================================

-- 1. Function: Update SPA Balance (Core SPA Function)
CREATE OR REPLACE FUNCTION update_spa_balance(
  p_user_id UUID,
  p_points_change INTEGER, -- Can be positive or negative
  p_transaction_type VARCHAR(50),
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current SPA balance
  SELECT spa_points INTO v_current_balance
  FROM profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_points_change;

  -- Prevent negative balance for deductions
  IF v_new_balance < 0 AND p_points_change < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient SPA points',
      'current_balance', v_current_balance,
      'required', ABS(p_points_change)
    );
  END IF;

  -- Update user's SPA balance
  UPDATE profiles
  SET 
    spa_points = v_new_balance,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Generate transaction ID
  v_transaction_id := gen_random_uuid();

  -- Record SPA transaction
  INSERT INTO spa_transactions (
    id,
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    reference_type,
    balance_before,
    balance_after,
    created_at
  ) VALUES (
    v_transaction_id,
    p_user_id,
    p_points_change,
    p_transaction_type,
    p_description,
    p_reference_id,
    p_reference_type,
    v_current_balance,
    v_new_balance,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'user_id', p_user_id,
    'points_change', p_points_change,
    'balance_before', v_current_balance,
    'balance_after', v_new_balance,
    'transaction_type', p_transaction_type
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================

-- 2. Function: Validate SPA Requirement
CREATE OR REPLACE FUNCTION validate_spa_requirement(
  p_user_id UUID,
  p_required_points INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current SPA balance
  SELECT spa_points INTO v_current_balance
  FROM profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if user has enough SPA
  IF v_current_balance >= p_required_points THEN
    RETURN jsonb_build_object(
      'success', true,
      'valid', true,
      'current_balance', v_current_balance,
      'required_points', p_required_points,
      'surplus', v_current_balance - p_required_points
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'valid', false,
      'current_balance', v_current_balance,
      'required_points', p_required_points,
      'shortage', p_required_points - v_current_balance
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================

-- 3. Function: Transfer SPA Points Between Users
CREATE OR REPLACE FUNCTION transfer_spa_points(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(50),
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_balance INTEGER;
  v_to_balance INTEGER;
  v_new_from_balance INTEGER;
  v_new_to_balance INTEGER;
  v_transfer_id UUID;
BEGIN
  -- Validate points is positive
  IF p_points <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transfer amount must be positive'
    );
  END IF;

  -- Validate users are different
  IF p_from_user_id = p_to_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot transfer to the same user'
    );
  END IF;

  -- Get current balances
  SELECT spa_points INTO v_from_balance
  FROM profiles
  WHERE user_id = p_from_user_id;

  SELECT spa_points INTO v_to_balance
  FROM profiles
  WHERE user_id = p_to_user_id;

  IF v_from_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Sender user not found'
    );
  END IF;

  IF v_to_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Recipient user not found'
    );
  END IF;

  -- Check if sender has enough SPA
  IF v_from_balance < p_points THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient SPA points for transfer',
      'current_balance', v_from_balance,
      'required', p_points
    );
  END IF;

  -- Calculate new balances
  v_new_from_balance := v_from_balance - p_points;
  v_new_to_balance := v_to_balance + p_points;

  -- Generate transfer ID
  v_transfer_id := gen_random_uuid();

  -- Update both user balances in transaction
  UPDATE profiles
  SET 
    spa_points = v_new_from_balance,
    updated_at = NOW()
  WHERE user_id = p_from_user_id;

  UPDATE profiles
  SET 
    spa_points = v_new_to_balance,
    updated_at = NOW()
  WHERE user_id = p_to_user_id;

  -- Record transaction for sender (debit)
  INSERT INTO spa_transactions (
    id,
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    reference_type,
    balance_before,
    balance_after,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_from_user_id,
    -p_points,
    p_transaction_type || '_debit',
    p_description || ' (sent)',
    p_reference_id,
    'transfer',
    v_from_balance,
    v_new_from_balance,
    NOW()
  );

  -- Record transaction for recipient (credit)
  INSERT INTO spa_transactions (
    id,
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    reference_type,
    balance_before,
    balance_after,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_to_user_id,
    p_points,
    p_transaction_type || '_credit',
    p_description || ' (received)',
    p_reference_id,
    'transfer',
    v_to_balance,
    v_new_to_balance,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'transfer_id', v_transfer_id,
    'from_user_id', p_from_user_id,
    'to_user_id', p_to_user_id,
    'points_transferred', p_points,
    'from_balance_after', v_new_from_balance,
    'to_balance_after', v_new_to_balance
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================

-- 4. Function: Get User SPA Transaction History
CREATE OR REPLACE FUNCTION get_user_spa_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  transaction_id UUID,
  amount INTEGER,
  transaction_type VARCHAR(50),
  description TEXT,
  reference_id UUID,
  reference_type VARCHAR(50),
  balance_before INTEGER,
  balance_after INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id as transaction_id,
    st.amount,
    st.transaction_type,
    st.description,
    st.reference_id,
    st.reference_type,
    st.balance_before,
    st.balance_after,
    st.created_at
  FROM spa_transactions st
  WHERE st.user_id = p_user_id
  ORDER BY st.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =============================================================================

-- 5. Function: Get Current SPA Balance
CREATE OR REPLACE FUNCTION get_user_spa_balance(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_profile RECORD;
BEGIN
  -- Get user profile info
  SELECT 
    spa_points,
    display_name,
    verified_rank,
    updated_at
  INTO v_user_profile
  FROM profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'spa_points', v_user_profile.spa_points,
    'display_name', v_user_profile.display_name,
    'verified_rank', v_user_profile.verified_rank,
    'last_updated', v_user_profile.updated_at
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================

-- 6. Function: Process Challenge SPA Deduction
CREATE OR REPLACE FUNCTION deduct_challenge_spa(
  p_user_id UUID,
  p_challenge_id UUID,
  p_bet_points INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use the main update_spa_balance function
  RETURN update_spa_balance(
    p_user_id,
    -p_bet_points,
    'challenge_bet',
    'SPA deducted for challenge bet',
    p_challenge_id,
    'challenge'
  );
END;
$$;

-- =============================================================================

-- 7. Function: Process Challenge SPA Reward
CREATE OR REPLACE FUNCTION reward_challenge_spa(
  p_user_id UUID,
  p_challenge_id UUID,
  p_reward_points INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use the main update_spa_balance function
  RETURN update_spa_balance(
    p_user_id,
    p_reward_points,
    'challenge_win',
    'SPA reward for winning challenge',
    p_challenge_id,
    'challenge'
  );
END;
$$;

-- =============================================================================

-- 8. Function: Refund Challenge SPA
CREATE OR REPLACE FUNCTION refund_challenge_spa(
  p_user_id UUID,
  p_challenge_id UUID,
  p_refund_points INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use the main update_spa_balance function
  RETURN update_spa_balance(
    p_user_id,
    p_refund_points,
    'challenge_refund',
    'SPA refunded from cancelled/rejected challenge',
    p_challenge_id,
    'challenge'
  );
END;
$$;

-- =============================================================================
-- COMMENT: STEP 2.5 SPA MANAGEMENT SYSTEM DEPLOYED
-- Các functions đã tạo:
-- 1. update_spa_balance(user_id, points_change, type, description, ref_id, ref_type)
-- 2. validate_spa_requirement(user_id, required_points)
-- 3. transfer_spa_points(from_user, to_user, points, type, description, ref_id)
-- 4. get_user_spa_history(user_id, limit)
-- 5. get_user_spa_balance(user_id)
-- 6. deduct_challenge_spa(user_id, challenge_id, bet_points)
-- 7. reward_challenge_spa(user_id, challenge_id, reward_points)
-- 8. refund_challenge_spa(user_id, challenge_id, refund_points)
-- =============================================================================
