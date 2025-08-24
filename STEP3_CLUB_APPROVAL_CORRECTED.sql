-- =============================================================================
-- STEP 3: CLUB APPROVAL SYSTEM (CORRECTED SCHEMA)
-- Deploy này sau Step 2.5 trên Supabase SQL Editor
-- =============================================================================

-- DROP existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS process_club_approval(UUID, UUID, BOOLEAN, TEXT) CASCADE;
DROP FUNCTION IF EXISTS auto_approve_challenge(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_pending_club_approvals() CASCADE;
DROP FUNCTION IF EXISTS bulk_auto_approve_old_challenges(INTEGER) CASCADE;

-- =============================================================================

-- 1. Function: Process Club Approval/Rejection - CORRECTED SCHEMA
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
BEGIN
  -- Validate challenge exists and needs club approval
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = p_challenge_id
    AND status IN ('pending', 'accepted'); -- Real status values from schema

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found or already processed'
    );
  END IF;

  -- Update challenge status based on approval using REAL SCHEMA COLUMNS
  UPDATE challenges
  SET
    status = CASE WHEN p_approved THEN 'club_confirmed' ELSE 'rejected' END,
    club_confirmed = p_approved,
    club_confirmed_by = p_club_admin_id,
    club_confirmed_at = CASE WHEN p_approved THEN NOW() ELSE NULL END,
    club_note = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_challenge_id;

  -- Create notification using REAL NOTIFICATIONS SCHEMA
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    category,
    priority,
    is_read,
    created_at,
    updated_at
  ) VALUES 
    -- Notification to challenger
    (gen_random_uuid(),
     v_challenge.challenger_id,
     CASE WHEN p_approved THEN 'challenge_approved' ELSE 'challenge_rejected' END,
     CASE WHEN p_approved THEN 'Challenge Approved by Club' ELSE 'Challenge Rejected by Club' END,
     CASE WHEN p_approved
       THEN 'Your challenge has been approved by the club admin and is ready to play'
       ELSE 'Your challenge has been rejected: ' || COALESCE(p_admin_notes, 'No reason provided')
     END,
     p_challenge_id,
     'challenge',
     CASE WHEN p_approved THEN 'medium' ELSE 'high' END,
     false,
     NOW(),
     NOW()),
    -- Notification to opponent (if exists)
    (gen_random_uuid(),
     COALESCE(v_challenge.opponent_id, v_challenge.challenger_id), -- Handle open challenges
     CASE WHEN p_approved THEN 'challenge_approved' ELSE 'challenge_rejected' END,
     CASE WHEN p_approved THEN 'Challenge Approved by Club' ELSE 'Challenge Rejected by Club' END,
     CASE WHEN p_approved
       THEN 'A challenge you are involved with has been approved by the club admin'
       ELSE 'A challenge you are involved with has been rejected: ' || COALESCE(p_admin_notes, 'No reason provided')
     END,
     p_challenge_id,
     'challenge',
     CASE WHEN p_approved THEN 'medium' ELSE 'high' END,
     false,
     NOW(),
     NOW());

  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'approved', p_approved,
    'new_status', CASE WHEN p_approved THEN 'club_confirmed' ELSE 'rejected' END
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

-- 2. Function: Auto Approve Challenge - CORRECTED SCHEMA
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

  -- Auto approve using REAL SCHEMA COLUMNS
  UPDATE challenges
  SET
    status = 'club_confirmed',
    club_confirmed = true,
    club_confirmed_at = NOW(),
    club_note = p_reason,
    updated_at = NOW()
  WHERE id = p_challenge_id;

  -- Create notification using REAL SCHEMA
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    category,
    priority,
    is_read,
    created_at,
    updated_at
  ) VALUES 
    (gen_random_uuid(),
     v_challenge.challenger_id,
     'challenge_approved',
     'Challenge Auto-Approved',
     'Your challenge has been automatically approved and is ready to play',
     p_challenge_id,
     'challenge',
     'medium',
     false,
     NOW(),
     NOW());

  -- Also notify opponent if exists
  IF v_challenge.opponent_id IS NOT NULL THEN
    INSERT INTO notifications (
      id,
      user_id,
      type,
      title,
      message,
      challenge_id,
      category,
      priority,
      is_read,
      created_at,
      updated_at
    ) VALUES 
      (gen_random_uuid(),
       v_challenge.opponent_id,
       'challenge_approved',
       'Challenge Auto-Approved', 
       'A challenge you accepted has been automatically approved and is ready to play',
       p_challenge_id,
       'challenge',
       'medium',
       false,
       NOW(),
       NOW());
  END IF;

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

-- 3. Function: Get Pending Club Approvals - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION get_pending_club_approvals()
RETURNS TABLE (
  challenge_id UUID,
  challenger_name TEXT,
  opponent_name TEXT,
  bet_points INTEGER,
  created_at TIMESTAMPTZ,
  time_pending INTERVAL,
  challenge_type TEXT,
  is_open_challenge BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as challenge_id,
    c.challenger_name,
    COALESCE(p2.display_name, 'Open Challenge') as opponent_name,
    c.bet_points,
    c.created_at,
    NOW() - c.created_at as time_pending,
    c.challenge_type,
    c.is_open_challenge
  FROM challenges c
  LEFT JOIN profiles p2 ON c.opponent_id = p2.user_id
  WHERE c.status IN ('accepted', 'pending') 
    AND (c.club_confirmed IS NULL OR c.club_confirmed = false)
  ORDER BY c.created_at ASC;
END;
$$;

-- =============================================================================

-- 4. Function: Bulk Auto Approve Old Challenges - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION bulk_auto_approve_old_challenges(
  p_hours_old INTEGER DEFAULT 24
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_ids UUID[];
  v_count INTEGER;
  v_challenge_id UUID;
BEGIN
  -- Get old pending challenges using REAL SCHEMA
  SELECT ARRAY_AGG(id) INTO v_challenge_ids
  FROM challenges
  WHERE status IN ('accepted', 'pending')
    AND (club_confirmed IS NULL OR club_confirmed = false)
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
    status = 'club_confirmed',
    club_confirmed = true,
    club_confirmed_at = NOW(),
    club_note = 'Auto-approved after ' || p_hours_old || ' hours',
    updated_at = NOW()
  WHERE id = ANY(v_challenge_ids);

  -- Create notifications for each approved challenge
  FOREACH v_challenge_id IN ARRAY v_challenge_ids
  LOOP
    INSERT INTO notifications (
      id,
      user_id,
      type,
      title,
      message,
      challenge_id,
      category,
      priority,
      is_read,
      created_at,
      updated_at
    )
    SELECT 
      gen_random_uuid(),
      challenger_id,
      'challenge_approved',
      'Challenge Auto-Approved',
      'Your challenge has been automatically approved after ' || p_hours_old || ' hours',
      v_challenge_id,
      'challenge',
      'medium',
      false,
      NOW(),
      NOW()
    FROM challenges
    WHERE id = v_challenge_id;
  END LOOP;

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

-- 5. Function: Get Club Confirmation Status - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION get_club_confirmation_status(
  p_challenge_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
BEGIN
  SELECT 
    id,
    status,
    club_confirmed,
    club_confirmed_by,
    club_confirmed_at,
    club_note,
    created_at
  INTO v_challenge
  FROM challenges
  WHERE id = p_challenge_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'status', v_challenge.status,
    'club_confirmed', COALESCE(v_challenge.club_confirmed, false),
    'club_confirmed_by', v_challenge.club_confirmed_by,
    'club_confirmed_at', v_challenge.club_confirmed_at,
    'club_note', v_challenge.club_note,
    'needs_approval', (v_challenge.club_confirmed IS NULL OR v_challenge.club_confirmed = false),
    'time_since_created', NOW() - v_challenge.created_at
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
-- COMMENT: STEP 3 CLUB APPROVAL SYSTEM DEPLOYED (CORRECTED SCHEMA)
-- Các functions đã tạo (sử dụng schema thực tế):
-- 1. process_club_approval(challenge_id, admin_id, approved, notes)
-- 2. auto_approve_challenge(challenge_id, reason)
-- 3. get_pending_club_approvals() - returns challenges needing approval
-- 4. bulk_auto_approve_old_challenges(hours_old)
-- 5. get_club_confirmation_status(challenge_id)
--
-- SCHEMA COLUMNS USED:
-- challenges: club_confirmed, club_confirmed_by, club_confirmed_at, club_note
-- notifications: challenge_id, category, priority, is_read
-- =============================================================================
