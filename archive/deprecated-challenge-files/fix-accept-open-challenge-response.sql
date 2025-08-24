-- Fix accept_open_challenge function to ensure consistent JSONB response
-- This ensures the function returns JSONB object, not array

CREATE OR REPLACE FUNCTION public.accept_open_challenge(
  p_challenge_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_challenge RECORD;
  v_user_profile RECORD;
  v_required_spa INTEGER DEFAULT 0;
  v_user_spa INTEGER DEFAULT 0;
BEGIN
  -- Lock the challenge row to prevent race conditions
  SELECT * INTO v_challenge
  FROM public.challenges 
  WHERE id = p_challenge_id 
    AND status = 'pending'
    AND opponent_id IS NULL
    AND challenger_id != p_user_id
    AND expires_at > NOW()
  FOR UPDATE NOWAIT;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu không còn khả dụng hoặc đã được nhận'
    );
  END IF;
  
  -- Get user profile with SPA points (try both id and user_id columns)
  SELECT * INTO v_user_profile
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Fallback to id column if user_id doesn't match
  IF NOT FOUND THEN
    SELECT * INTO v_user_profile
    FROM public.profiles
    WHERE id = p_user_id
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Không tìm thấy thông tin người dùng'
    );
  END IF;
  
  -- Get required SPA (bet_points) and user's current SPA
  v_required_spa := COALESCE(v_challenge.bet_points, 0);
  v_user_spa := COALESCE(v_user_profile.spa_points, 0);
  
  -- Check if user has enough SPA points
  IF v_required_spa > 0 AND v_user_spa < v_required_spa THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Bạn không đủ SPA Points để tham gia thách đấu này',
      'required_spa', v_required_spa,
      'user_spa', v_user_spa,
      'shortage', v_required_spa - v_user_spa
    );
  END IF;
  
  -- Update challenge
  UPDATE public.challenges 
  SET opponent_id = p_user_id,
      status = 'accepted',
      responded_at = NOW(),
      updated_at = NOW()
  WHERE id = p_challenge_id;
  
  -- Create match record (with duplicate prevention)
  INSERT INTO public.matches (
    player1_id, player2_id, challenge_id, 
    status, match_type, scheduled_time
  ) VALUES (
    v_challenge.challenger_id, p_user_id, p_challenge_id,
    'scheduled', 'challenge', 
    COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '1 hour')
  )
  ON CONFLICT (challenge_id) DO NOTHING;
  
  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'message', 'Tham gia thách đấu thành công!',
    'bet_points', v_required_spa,
    'remaining_spa', v_user_spa - v_required_spa
  );
  
EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu đang được xử lý bởi người khác, vui lòng thử lại'
    );
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu này đã được nhận hoặc trận đấu đã được tạo'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Có lỗi xảy ra: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.accept_open_challenge(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_open_challenge(UUID, UUID) TO anon;

-- Test the function
DO $$
DECLARE
  test_result JSONB;
BEGIN
  -- This is just to ensure function compiles correctly
  RAISE NOTICE 'accept_open_challenge function updated successfully';
END $$;
