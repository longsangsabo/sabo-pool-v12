-- =============================================================================
-- STEP 5: NOTIFICATION SYSTEM
-- Deploy này trên Supabase SQL Editor
-- =============================================================================

-- 1. Function: Send Challenge Notification
CREATE OR REPLACE FUNCTION send_challenge_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_challenge_id UUID DEFAULT NULL,
  p_match_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT 'challenge'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Generate notification ID
  v_notification_id := gen_random_uuid();

  -- Insert notification
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    match_id,
    category,
    is_read,
    created_at,
    updated_at
  ) VALUES (
    v_notification_id,
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_challenge_id,
    p_match_id,
    p_category,
    false,
    NOW(),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'notification_id', v_notification_id,
    'user_id', p_user_id,
    'type', p_notification_type,
    'title', p_title,
    'challenge_id', p_challenge_id,
    'match_id', p_match_id
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

-- 2. Function: Get User Notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_unread_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  notification_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  challenge_id UUID,
  match_id UUID,
  category TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  time_ago INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id as notification_id,
    n.type,
    n.title,
    n.message,
    n.challenge_id,
    n.match_id,
    n.category,
    n.is_read,
    n.created_at,
    NOW() - n.created_at as time_ago
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =============================================================================

-- 3. Function: Mark Notification as Read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark notification as read
  UPDATE notifications
  SET 
    is_read = true,
    updated_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id
    AND is_read = false;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Notification not found or already read'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'notification_id', p_notification_id,
    'marked_read', true
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

-- 4. Function: Mark All User Notifications as Read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark all unread notifications as read
  UPDATE notifications
  SET 
    is_read = true,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = false;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'notifications_marked', v_updated_count
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

-- 5. Function: Get Unread Notification Count
CREATE OR REPLACE FUNCTION get_unread_count(
  p_user_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false;

  RETURN COALESCE(v_count, 0);

EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;

-- =============================================================================

-- 6. Function: Delete Old Notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_old INTEGER DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete notifications older than specified days
  DELETE FROM notifications
  WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND is_read = true; -- Only delete read notifications

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'days_old', p_days_old,
    'deleted_count', v_deleted_count
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

-- 7. Function: Bulk Send Notifications
CREATE OR REPLACE FUNCTION bulk_send_notifications(
  p_user_ids UUID[],
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_notification_ids UUID[] := '{}';
  v_notification_id UUID;
BEGIN
  -- Send notification to each user
  FOREACH v_user_id IN ARRAY p_user_ids
  LOOP
    v_notification_id := gen_random_uuid();
    
    INSERT INTO notifications (
      id,
      user_id,
      type,
      title,
      message,
      reference_id,
      reference_type,
      read_at,
      created_at,
      updated_at
    ) VALUES (
      v_notification_id,
      v_user_id,
      p_notification_type,
      p_title,
      p_message,
      p_reference_id,
      p_reference_type,
      NULL,
      NOW(),
      NOW()
    );

    v_notification_ids := array_append(v_notification_ids, v_notification_id);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'sent_count', array_length(p_user_ids, 1),
    'notification_ids', v_notification_ids,
    'type', p_notification_type
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

-- 8. Function: Send Challenge-Specific Notifications
CREATE OR REPLACE FUNCTION send_challenge_status_notification(
  p_challenge_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_title TEXT;
  v_message TEXT;
  v_sent_count INTEGER := 0;
BEGIN
  -- Get challenge info
  SELECT 
    c.*,
    p1.display_name as challenger_name,
    p2.display_name as opponent_name
  INTO v_challenge
  FROM challenges c
  JOIN profiles p1 ON c.challenger_id = p1.user_id
  LEFT JOIN profiles p2 ON c.opponent_id = p2.user_id
  WHERE c.id = p_challenge_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found'
    );
  END IF;

  -- Determine notification content based on status
  CASE p_status
    WHEN 'accepted' THEN
      v_title := 'Challenge Accepted!';
      v_message := v_challenge.opponent_name || ' accepted your challenge';
    WHEN 'club_approved' THEN
      v_title := 'Challenge Approved by Club';
      v_message := 'Your challenge has been approved and is ready to play';
    WHEN 'club_rejected' THEN
      v_title := 'Challenge Rejected by Club';
      v_message := 'Your challenge was rejected: ' || COALESCE(p_notes, 'No reason provided');
    WHEN 'completed' THEN
      v_title := 'Challenge Completed';
      v_message := 'Your challenge match has been completed';
    WHEN 'cancelled' THEN
      v_title := 'Challenge Cancelled';
      v_message := 'Challenge was cancelled: ' || COALESCE(p_notes, 'No reason provided');
    ELSE
      v_title := 'Challenge Update';
      v_message := 'Your challenge status has been updated to: ' || p_status;
  END CASE;

  -- Send to challenger
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (v_challenge.challenger_id, 'challenge_' || p_status, v_title, v_message, p_challenge_id, 'challenge');
  v_sent_count := v_sent_count + 1;

  -- Send to opponent if exists
  IF v_challenge.opponent_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (v_challenge.opponent_id, 'challenge_' || p_status, v_title, v_message, p_challenge_id, 'challenge');
    v_sent_count := v_sent_count + 1;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'status', p_status,
    'notifications_sent', v_sent_count
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
-- COMMENT: STEP 5 NOTIFICATION SYSTEM DEPLOYED
-- Các functions đã tạo:
-- 1. send_challenge_notification(user_id, type, title, message, ref_id, ref_type)
-- 2. get_user_notifications(user_id, limit, unread_only)
-- 3. mark_notification_read(notification_id, user_id)
-- 4. mark_all_notifications_read(user_id)
-- 5. get_unread_count(user_id)
-- 6. cleanup_old_notifications(days_old)
-- 7. bulk_send_notifications(user_ids[], type, title, message, ref_id, ref_type)
-- 8. send_challenge_status_notification(challenge_id, status, notes)
-- =============================================================================
