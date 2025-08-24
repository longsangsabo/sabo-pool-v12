-- 📋 STEP 3: CLUB APPROVAL SYSTEM FUNCTIONS
-- Following REBUILD_CHALLENGE_SYSTEM_PLAN.md - Day 3: Match & Approval System

-- ==================================================
-- 4.1 Club Approval Processing Function
-- ==================================================
CREATE OR REPLACE FUNCTION process_club_approval(
  p_challenge_id UUID,
  p_club_admin_id UUID,
  p_approved BOOLEAN,
  p_admin_notes TEXT DEFAULT NULL
) 
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_challenge challenges%ROWTYPE;
  v_challenger_profile profiles%ROWTYPE;
  v_opponent_profile profiles%ROWTYPE;
  v_result JSONB;
BEGIN
  -- 🔍 Kiểm tra challenge tồn tại và ở trạng thái 'accepted'
  SELECT * INTO v_challenge
  FROM challenges 
  WHERE id = p_challenge_id 
    AND status = 'accepted';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Challenge not found or not in accepted status'
    );
  END IF;

  -- 🔍 Lấy thông tin profiles
  SELECT * INTO v_challenger_profile FROM profiles WHERE user_id = v_challenge.challenger_id;
  SELECT * INTO v_opponent_profile FROM profiles WHERE user_id = v_challenge.opponent_id;

  -- ✅ Nếu APPROVED - Cập nhật status và tạo match
  IF p_approved THEN
    -- Update challenge status
    UPDATE challenges 
    SET 
      status = 'club_approved',
      club_approved_at = NOW(),
      club_admin_id = p_club_admin_id,
      admin_notes = p_admin_notes,
      updated_at = NOW()
    WHERE id = p_challenge_id;

    -- Tạo match record (nếu chưa có)
    INSERT INTO matches (
      id,
      challenge_id,
      player1_id,
      player2_id,
      player1_name,
      player2_name,
      race_to,
      status,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      p_challenge_id,
      v_challenge.challenger_id,
      v_challenge.opponent_id,
      v_challenger_profile.display_name,
      v_opponent_profile.display_name,
      v_challenge.race_to,
      'ready',
      NOW()
    )
    ON CONFLICT (challenge_id) DO NOTHING;

    v_result := json_build_object(
      'success', true,
      'message', 'Challenge approved and match created',
      'challenge_id', p_challenge_id,
      'status', 'club_approved'
    );

  -- ❌ Nếu REJECTED - Hoàn SPA và reject challenge  
  ELSE
    -- Hoàn SPA cho challenger
    UPDATE profiles 
    SET 
      spa_points = spa_points + v_challenge.bet_points,
      updated_at = NOW()
    WHERE user_id = v_challenge.challenger_id;

    -- Update challenge status
    UPDATE challenges 
    SET 
      status = 'rejected_by_club',
      club_approved_at = NOW(),
      club_admin_id = p_club_admin_id,
      admin_notes = COALESCE(p_admin_notes, 'Rejected by club admin'),
      updated_at = NOW()
    WHERE id = p_challenge_id;

    v_result := json_build_object(
      'success', true,
      'message', 'Challenge rejected and SPA refunded',
      'challenge_id', p_challenge_id,
      'status', 'rejected_by_club',
      'refunded_points', v_challenge.bet_points
    );
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- ==================================================
-- 4.2 Auto Club Approval Function (for trusted scenarios)
-- ==================================================
CREATE OR REPLACE FUNCTION auto_approve_challenge(
  p_challenge_id UUID,
  p_reason TEXT DEFAULT 'Automatic approval'
) 
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_system_admin_id UUID := '00000000-0000-0000-0000-000000000000'; -- System admin UUID
  v_result JSONB;
BEGIN
  -- Gọi function process_club_approval với system admin
  SELECT process_club_approval(
    p_challenge_id,
    v_system_admin_id,
    true, -- approved = true
    p_reason
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- ==================================================
-- 3.1 Match Creation Function (if needed separately)
-- ==================================================
CREATE OR REPLACE FUNCTION create_match_from_challenge(
  p_challenge_id UUID
) 
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_challenge challenges%ROWTYPE;
  v_challenger_profile profiles%ROWTYPE;
  v_opponent_profile profiles%ROWTYPE;
  v_match_id UUID;
BEGIN
  -- Kiểm tra challenge
  SELECT * INTO v_challenge
  FROM challenges 
  WHERE id = p_challenge_id 
    AND status = 'club_approved';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Challenge not found or not club approved'
    );
  END IF;

  -- Lấy profiles
  SELECT * INTO v_challenger_profile FROM profiles WHERE user_id = v_challenge.challenger_id;
  SELECT * INTO v_opponent_profile FROM profiles WHERE user_id = v_challenge.opponent_id;

  -- Tạo match
  INSERT INTO matches (
    id,
    challenge_id,
    player1_id,
    player2_id,
    player1_name,
    player2_name,
    race_to,
    status,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    p_challenge_id,
    v_challenge.challenger_id,
    v_challenge.opponent_id,
    v_challenger_profile.display_name,
    v_opponent_profile.display_name,
    v_challenge.race_to,
    'ready',
    NOW()
  )
  RETURNING id INTO v_match_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Match created successfully',
    'match_id', v_match_id,
    'challenge_id', p_challenge_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- ==================================================
-- 🔧 UTILITY: Get Club Pending Challenges
-- ==================================================
CREATE OR REPLACE FUNCTION get_club_pending_challenges(
  p_club_id UUID DEFAULT NULL
) 
RETURNS TABLE(
  challenge_id UUID,
  challenger_name TEXT,
  opponent_name TEXT,
  bet_points INTEGER,
  race_to INTEGER,
  created_at TIMESTAMPTZ,
  message TEXT
)
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    cp.display_name,
    op.display_name,
    c.bet_points,
    c.race_to,
    c.created_at,
    c.message
  FROM challenges c
  INNER JOIN profiles cp ON cp.user_id = c.challenger_id
  INNER JOIN profiles op ON op.user_id = c.opponent_id
  WHERE c.status = 'accepted'
    AND (p_club_id IS NULL OR c.club_id = p_club_id)
  ORDER BY c.created_at ASC;
END;
$$;

-- ==================================================
-- 📝 COMMENTS & DOCUMENTATION
-- ==================================================

COMMENT ON FUNCTION process_club_approval(UUID, UUID, BOOLEAN, TEXT) IS 
'Club admin approves or rejects a challenge. If approved, creates match. If rejected, refunds SPA to challenger.';

COMMENT ON FUNCTION auto_approve_challenge(UUID, TEXT) IS 
'Automatically approve a challenge for trusted scenarios (e.g., internal matches, admin challenges).';

COMMENT ON FUNCTION create_match_from_challenge(UUID) IS 
'Creates a match record from an approved challenge. Usually called by club approval process.';

COMMENT ON FUNCTION get_club_pending_challenges(UUID) IS 
'Returns all challenges waiting for club approval, optionally filtered by club_id.';
