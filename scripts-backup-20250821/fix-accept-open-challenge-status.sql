-- Fix accept_open_challenge function to support both 'pending' and 'open' status
-- File: fix-accept-open-challenge-status.sql

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
  v_existing_match RECORD;
BEGIN
  -- Lock the challenge row to prevent race conditions
  -- Updated to support both 'pending' and 'open' status
  SELECT * INTO v_challenge
  FROM public.challenges 
  WHERE id = p_challenge_id 
    AND status IN ('pending', 'open')  -- Support both statuses
    AND opponent_id IS NULL
    AND challenger_id != p_user_id
    AND expires_at > NOW()
  FOR UPDATE NOWAIT;
  
  IF NOT FOUND THEN
    -- Check if challenge already has an opponent
    SELECT * INTO v_challenge
    FROM public.challenges 
    WHERE id = p_challenge_id;
    
    IF FOUND AND v_challenge.opponent_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Thách đấu này đã được nhận bởi người khác'
      );
    ELSIF FOUND AND v_challenge.challenger_id = p_user_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Bạn không thể tham gia thách đấu của chính mình'
      );
    ELSIF FOUND AND v_challenge.status NOT IN ('pending', 'open') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Thách đấu đã kết thúc hoặc không khả dụng'
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Thách đấu không tồn tại hoặc đã hết hạn'
      );
    END IF;
  END IF;
  
  -- Get user profile with SPA points
  SELECT * INTO v_user_profile
  FROM public.profiles
  WHERE id = p_user_id OR user_id = p_user_id;
  
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
  
  -- Check if match already exists for this challenge
  SELECT * INTO v_existing_match
  FROM public.matches
  WHERE challenge_id = p_challenge_id;
  
  IF FOUND THEN
    -- Match already exists, check if this user is already in it
    IF v_existing_match.player1_id = p_user_id OR v_existing_match.player2_id = p_user_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Bạn đã tham gia thách đấu này rồi'
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Thách đấu này đã có trận đấu được tạo'
      );
    END IF;
  END IF;
  
  -- Deduct SPA points if required
  IF v_required_spa > 0 THEN
    UPDATE public.profiles 
    SET spa_points = spa_points - v_required_spa,
        updated_at = NOW()
    WHERE (id = p_user_id OR user_id = p_user_id);
    
    -- Also deduct from challenger
    UPDATE public.profiles 
    SET spa_points = spa_points - v_required_spa,
        updated_at = NOW()
    WHERE (id = v_challenge.challenger_id OR user_id = v_challenge.challenger_id);
  END IF;
  
  -- Update challenge to accepted status
  UPDATE public.challenges 
  SET opponent_id = p_user_id,
      status = 'accepted',
      responded_at = NOW(),
      updated_at = NOW()
  WHERE id = p_challenge_id;
  
  -- Create match record
  INSERT INTO public.matches (
    player1_id, 
    player2_id, 
    challenge_id, 
    status, 
    match_type,
    scheduled_time,
    created_at,
    updated_at
  ) VALUES (
    v_challenge.challenger_id,
    p_user_id,
    p_challenge_id,
    'scheduled',
    'challenge',
    COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '1 hour'),
    NOW(),
    NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true,
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
    -- Handle unique constraint violation
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu này đã được nhận hoặc đã có trận đấu được tạo'
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
