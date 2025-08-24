-- =============================================================================
-- STEP 3: CLUB APPROVAL SYSTEM
-- Deploy này trên Supabase SQL Editor
-- =============================================================================

-- 1. Function: Process Club Approval/Rejection
CREATE OR REPLACE FUNCTION process_club_approval(
  p_challenge_id UUID,
  p_club_admin_id UUID,
  p_approved BOOLEAN,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_result JSONB;
BEGIN
  -- Validate challenge exists and is pending club approval
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = p_challenge_id
    AND status = 'pending_club_approval';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found or not pending club approval'
    );
  END IF;

  -- Update challenge status based on approval
  UPDATE challenges
  SET
    status = CASE WHEN p_approved THEN 'club_approved' ELSE 'club_rejected' END,
    club_approved_by = p_club_admin_id,
    club_approved_at = NOW(),
    club_admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_challenge_id;

  -- Create notification for challenger and opponent
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES
    (v_challenge.challenger_id, 'challenge_club_decision',
     CASE WHEN p_approved THEN 'Challenge Approved by Club' ELSE 'Challenge Rejected by Club' END,
     CASE WHEN p_approved
       THEN 'Your challenge has been approved by the club admin and is ready to play'
       ELSE 'Your challenge has been rejected by the club admin: ' || COALESCE(p_admin_notes, 'No reason provided')
     END,
     p_challenge_id, 'challenge'),
    (v_challenge.opponent_id, 'challenge_club_decision',
     CASE WHEN p_approved THEN 'Challenge Approved by Club' ELSE 'Challenge Rejected by Club' END,
     CASE WHEN p_approved
       THEN 'A challenge you accepted has been approved by the club admin and is ready to play'
       ELSE 'A challenge you accepted has been rejected by the club admin: ' || COALESCE(p_admin_notes, 'No reason provided')
     END,
     p_challenge_id, 'challenge');

  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'approved', p_approved,
    'new_status', CASE WHEN p_approved THEN 'club_approved' ELSE 'club_rejected' END
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

-- 2. Function: Auto Approve Challenge (for trusted scenarios)
CREATE OR REPLACE FUNCTION auto_approve_challenge(
  p_challenge_id UUID,
  p_reason TEXT DEFAULT 'Automatic approval'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
BEGIN
  -- Get challenge info
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = p_challenge_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found'
    );
  END IF;

  -- Auto approve the challenge
  UPDATE challenges
  SET
    status = 'club_approved',
    club_approved_at = NOW(),
    club_admin_notes = p_reason,
    updated_at = NOW()
  WHERE id = p_challenge_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES
    (v_challenge.challenger_id, 'challenge_approved',
     'Challenge Auto-Approved',
     'Your challenge has been automatically approved and is ready to play',
     p_challenge_id, 'challenge'),
    (v_challenge.opponent_id, 'challenge_approved',
     'Challenge Auto-Approved', 
     'A challenge you accepted has been automatically approved and is ready to play',
     p_challenge_id, 'challenge');

  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'approved', true,
    'reason', p_reason
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

-- 3. Function: Get Pending Club Approvals
CREATE OR REPLACE FUNCTION get_pending_club_approvals()
RETURNS TABLE (
  challenge_id UUID,
  challenger_name TEXT,
  opponent_name TEXT,
  bet_points INTEGER,
  created_at TIMESTAMPTZ,
  time_pending INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as challenge_id,
    p1.display_name as challenger_name,
    p2.display_name as opponent_name,
    c.bet_points,
    c.created_at,
    NOW() - c.created_at as time_pending
  FROM challenges c
  JOIN profiles p1 ON c.challenger_id = p1.user_id
  JOIN profiles p2 ON c.opponent_id = p2.user_id
  WHERE c.status = 'pending_club_approval'
  ORDER BY c.created_at ASC;
END;
$$;

-- =============================================================================

-- 4. Function: Bulk Auto Approve Old Challenges
CREATE OR REPLACE FUNCTION bulk_auto_approve_old_challenges(
  p_hours_old INTEGER DEFAULT 24
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_ids UUID[];
  v_count INTEGER;
BEGIN
  -- Get old pending challenges
  SELECT ARRAY_AGG(id) INTO v_challenge_ids
  FROM challenges
  WHERE status = 'pending_club_approval'
    AND created_at < NOW() - (p_hours_old || ' hours')::INTERVAL;

  v_count := COALESCE(array_length(v_challenge_ids, 1), 0);

  IF v_count = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'approved_count', 0,
      'message', 'No old pending challenges found'
    );
  END IF;

  -- Auto approve all old challenges
  UPDATE challenges
  SET
    status = 'club_approved',
    club_approved_at = NOW(),
    club_admin_notes = 'Auto-approved after ' || p_hours_old || ' hours',
    updated_at = NOW()
  WHERE id = ANY(v_challenge_ids);

  RETURN jsonb_build_object(
    'success', true,
    'approved_count', v_count,
    'challenge_ids', v_challenge_ids
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
-- COMMENT: STEP 3 CLUB APPROVAL SYSTEM DEPLOYED
-- Các functions đã tạo:
-- 1. process_club_approval(challenge_id, admin_id, approved, notes)
-- 2. auto_approve_challenge(challenge_id, reason)
-- 3. get_pending_club_approvals()
-- 4. bulk_auto_approve_old_challenges(hours_old)
-- =============================================================================
