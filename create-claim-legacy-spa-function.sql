-- Create function to claim legacy SPA points
-- This function handles the complete transaction for claiming legacy SPA points

CREATE OR REPLACE FUNCTION public.claim_legacy_spa_points(
  p_user_id UUID,
  p_claim_code TEXT,
  p_user_email TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_legacy_entry RECORD;
  v_current_spa INTEGER := 0;
  v_new_spa INTEGER := 0;
  v_result JSON;
BEGIN
  -- 1. Find and lock the legacy entry
  SELECT * INTO v_legacy_entry
  FROM public.legacy_spa_points
  WHERE claim_code = p_claim_code
  FOR UPDATE;

  -- Check if legacy entry exists
  IF v_legacy_entry IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_CODE',
      'message', 'Mã claim không tồn tại'
    );
  END IF;

  -- Check if already claimed
  IF v_legacy_entry.claimed = true THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ALREADY_CLAIMED',
      'message', 'Mã này đã được claim rồi'
    );
  END IF;

  -- 2. Get current user SPA points
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM public.player_rankings
  WHERE user_id = p_user_id;

  -- 3. Calculate new SPA points
  v_new_spa := v_current_spa + v_legacy_entry.spa_points;

  -- 4. Update legacy entry as claimed
  UPDATE public.legacy_spa_points
  SET 
    claimed = true,
    claimed_by = p_user_id,
    claimed_at = NOW(),
    verification_method = 'claim_code',
    admin_notes = CONCAT(
      COALESCE(admin_notes, ''), 
      E'\n[' || NOW()::text || '] Claimed via code by user: ' || p_user_id::text ||
      CASE WHEN p_user_email IS NOT NULL THEN ' (' || p_user_email || ')' ELSE '' END
    )
  WHERE id = v_legacy_entry.id;

  -- 5. Update or create player ranking
  INSERT INTO public.player_rankings (
    user_id, 
    spa_points, 
    total_matches, 
    wins, 
    losses,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    v_legacy_entry.spa_points,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    spa_points = player_rankings.spa_points + v_legacy_entry.spa_points,
    updated_at = NOW();

  -- 6. Log the SPA transaction
  INSERT INTO public.spa_points_log (
    user_id,
    source_type,
    points_earned,
    description,
    created_at
  )
  VALUES (
    p_user_id,
    'legacy_claim',
    v_legacy_entry.spa_points,
    'Legacy SPA claim: ' || v_legacy_entry.full_name || ' (' || v_legacy_entry.claim_code || ')',
    NOW()
  );

  -- 7. Return success result
  RETURN json_build_object(
    'success', true,
    'message', 'Claim thành công',
    'spa_points_awarded', v_legacy_entry.spa_points,
    'legacy_player_name', v_legacy_entry.full_name,
    'legacy_player_nick', v_legacy_entry.nick_name,
    'new_total_spa', v_new_spa
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN json_build_object(
      'success', false,
      'error', 'SYSTEM_ERROR',
      'message', 'Lỗi hệ thống: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_legacy_spa_points(UUID, TEXT, TEXT) TO authenticated;

-- Test function (uncomment to test)
-- SELECT public.claim_legacy_spa_points(
--   'test-user-id'::UUID,
--   'LEGACY-01-VIN',
--   'test@example.com'
-- );
