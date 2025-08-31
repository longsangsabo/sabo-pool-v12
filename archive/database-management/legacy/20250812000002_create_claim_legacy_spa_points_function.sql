-- Create function to claim legacy SPA points using direct code claim
-- This allows users to instantly claim SPA points by entering a valid claim code

CREATE OR REPLACE FUNCTION public.claim_legacy_spa_points(
  p_claim_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_legacy_entry RECORD;
  v_user_profile RECORD;
  v_result JSON;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn cần đăng nhập để claim SPA points'
    );
  END IF;

  -- Validate claim code format
  IF p_claim_code IS NULL OR LENGTH(TRIM(p_claim_code)) < 5 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Mã claim code không hợp lệ'
    );
  END IF;

  -- Clean the claim code
  p_claim_code := UPPER(TRIM(p_claim_code));

  -- Get user profile
  SELECT * INTO v_user_profile
  FROM public.profiles
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Không tìm thấy profile người dùng'
    );
  END IF;

  -- Find legacy entry with matching claim code
  SELECT * INTO v_legacy_entry
  FROM public.legacy_spa_points
  WHERE claim_code = p_claim_code;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Mã claim code không tồn tại hoặc không hợp lệ'
    );
  END IF;

  -- Check if already claimed
  IF v_legacy_entry.claimed = true THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Mã claim code này đã được sử dụng',
      'claimed_by', v_legacy_entry.claimed_by,
      'claimed_at', v_legacy_entry.claimed_at
    );
  END IF;

  -- Check if user has already claimed any legacy points
  IF EXISTS (
    SELECT 1 FROM public.legacy_spa_points 
    WHERE claimed = true AND claimed_by = v_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn đã claim SPA points từ hệ thống legacy rồi. Mỗi người chỉ được claim một lần.'
    );
  END IF;

  -- Start transaction
  BEGIN
    -- Mark legacy entry as claimed
    UPDATE public.legacy_spa_points
    SET 
      claimed = true,
      claimed_by = v_user_id,
      claimed_at = NOW(),
      admin_notes = 'Claimed via direct code system by ' || v_user_profile.full_name
    WHERE id = v_legacy_entry.id;

    -- Add SPA points to user profile
    UPDATE public.profiles
    SET 
      spa_points = COALESCE(spa_points, 0) + v_legacy_entry.spa_points,
      updated_at = NOW()
    WHERE user_id = v_user_id;

    -- Create SPA transaction record
    INSERT INTO public.spa_transactions (
      user_id,
      transaction_type,
      amount,
      description,
      reference_id,
      created_at
    ) VALUES (
      v_user_id,
      'legacy_claim',
      v_legacy_entry.spa_points,
      'Legacy SPA Points claim: ' || v_legacy_entry.full_name || ' (' || v_legacy_entry.nick_name || ')',
      v_legacy_entry.id::text,
      NOW()
    );

    -- Return success result
    v_result := json_build_object(
      'success', true,
      'message', 'Chúc mừng! Bạn đã claim thành công ' || v_legacy_entry.spa_points || ' SPA Points',
      'spa_points_claimed', v_legacy_entry.spa_points,
      'legacy_player_name', v_legacy_entry.full_name,
      'legacy_nick_name', v_legacy_entry.nick_name,
      'new_total_spa_points', (v_user_profile.spa_points + v_legacy_entry.spa_points)
    );

    RETURN v_result;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback is automatic in function
      RETURN json_build_object(
        'success', false,
        'error', 'Có lỗi xảy ra khi xử lý claim: ' || SQLERRM
      );
  END;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_legacy_spa_points(TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.claim_legacy_spa_points(TEXT) IS 'Direct code claim system for legacy SPA points - users can instantly claim by entering valid claim code';
