-- =============================================================================
-- STEP 5: NOTIFICATION SYSTEM (CORRECTED SCHEMA)
-- Deploy này sau Step 4 trên Supabase SQL Editor
-- =============================================================================

-- DROP existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS send_challenge_notification(UUID, TEXT, TEXT, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_notifications(UUID, INTEGER, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_unread_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_notifications(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS bulk_send_notifications(UUID[], TEXT, TEXT, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS send_challenge_status_notification(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS archive_notification(UUID, UUID) CASCADE;

-- =============================================================================

-- 1. Function: Send Notification - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_challenge_id UUID DEFAULT NULL,
  p_match_id UUID DEFAULT NULL,
  p_tournament_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'medium'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Generate notification ID
  v_notification_id := gen_random_uuid();

  -- Insert notification using REAL NOTIFICATIONS SCHEMA
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    match_id,
    tournament_id,
    category,
    priority,
    is_read,
    auto_popup,
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
    p_tournament_id,
    p_category,
    p_priority,
    false,  -- is_read starts as false
    false,  -- auto_popup default false
    NOW(),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'notification_id', v_notification_id,
    'user_id', p_user_id,
    'type', p_notification_type,
    'title', p_title
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

-- 2. Function: Get User Notifications - CORRECTED SCHEMA
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
  tournament_id UUID,
  category TEXT,
  priority TEXT,
  is_read BOOLEAN,
  auto_popup BOOLEAN,
  created_at TIMESTAMPTZ,
  time_ago INTERVAL,
  action_text TEXT,
  action_url TEXT
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
    n.tournament_id,
    n.category,
    n.priority,
    n.is_read,
    n.auto_popup,
    n.created_at,
    NOW() - n.created_at as time_ago,
    n.action_text,
    n.action_url
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = false)
    AND n.deleted_at IS NULL  -- Only show non-deleted notifications
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =============================================================================

-- 3. Function: Mark Notification as Read - CORRECTED SCHEMA
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
  -- Mark notification as read using REAL SCHEMA (is_read instead of read_at)
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

-- 4. Function: Mark All User Notifications as Read - CORRECTED SCHEMA
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
    AND is_read = false
    AND deleted_at IS NULL;

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

-- 5. Function: Get Unread Notification Count - CORRECTED SCHEMA
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
    AND is_read = false
    AND deleted_at IS NULL;

  RETURN COALESCE(v_count, 0);

EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;

-- =============================================================================

-- 6. Function: Soft Delete Old Notifications - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_old INTEGER DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Soft delete old read notifications using REAL SCHEMA
  UPDATE notifications
  SET 
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND is_read = true  -- Only delete read notifications
    AND deleted_at IS NULL;  -- Don't delete already deleted ones

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

-- 7. Function: Bulk Send Notifications - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION bulk_send_notifications(
  p_user_ids UUID[],
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_challenge_id UUID DEFAULT NULL,
  p_match_id UUID DEFAULT NULL,
  p_tournament_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'medium'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_notification_ids UUID[] := '{}';
  v_notification_id UUID;
BEGIN
  -- Send notification to each user using REAL SCHEMA
  FOREACH v_user_id IN ARRAY p_user_ids
  LOOP
    v_notification_id := gen_random_uuid();
    
    INSERT INTO notifications (
      id,
      user_id,
      type,
      title,
      message,
      challenge_id,
      match_id,
      tournament_id,
      category,
      priority,
      is_read,
      auto_popup,
      created_at,
      updated_at
    ) VALUES (
      v_notification_id,
      v_user_id,
      p_notification_type,
      p_title,
      p_message,
      p_challenge_id,
      p_match_id,
      p_tournament_id,
      p_category,
      p_priority,
      false,
      false,
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

-- 8. Function: Send Challenge-Specific Notifications - CORRECTED SCHEMA
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
  v_priority TEXT;
BEGIN
  -- Get challenge info using REAL SCHEMA
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

  -- Determine notification content and priority based on status
  CASE p_status
    WHEN 'accepted' THEN
      v_title := 'Challenge Accepted!';
      v_message := v_challenge.opponent_name || ' accepted your challenge';
      v_priority := 'high';
    WHEN 'club_confirmed' THEN
      v_title := 'Challenge Approved by Club';
      v_message := 'Your challenge has been approved and is ready to play';
      v_priority := 'high';
    WHEN 'rejected' THEN
      v_title := 'Challenge Rejected by Club';
      v_message := 'Your challenge was rejected: ' || COALESCE(p_notes, 'No reason provided');
      v_priority := 'high';
    WHEN 'completed' THEN
      v_title := 'Challenge Completed';
      v_message := 'Your challenge match has been completed';
      v_priority := 'medium';
    WHEN 'cancelled' THEN
      v_title := 'Challenge Cancelled';
      v_message := 'Challenge was cancelled: ' || COALESCE(p_notes, 'No reason provided');
      v_priority := 'medium';
    ELSE
      v_title := 'Challenge Update';
      v_message := 'Your challenge status has been updated to: ' || p_status;
      v_priority := 'medium';
  END CASE;

  -- Send to challenger using REAL SCHEMA
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
  ) VALUES (
    gen_random_uuid(),
    v_challenge.challenger_id,
    'challenge_' || p_status,
    v_title,
    v_message,
    p_challenge_id,
    'challenge',
    v_priority,
    false,
    NOW(),
    NOW()
  );
  v_sent_count := v_sent_count + 1;

  -- Send to opponent if exists
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
    ) VALUES (
      gen_random_uuid(),
      v_challenge.opponent_id,
      'challenge_' || p_status,
      v_title,
      CASE 
        WHEN p_status = 'accepted' THEN 'You accepted a challenge from ' || v_challenge.challenger_name
        ELSE v_message
      END,
      p_challenge_id,
      'challenge',
      v_priority,
      false,
      NOW(),
      NOW()
    );
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

-- 9. Function: Archive Notification - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION archive_notification(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Archive notification using is_archived field if exists, or use deleted_at
  UPDATE notifications
  SET 
    is_archived = COALESCE(is_archived, true),  -- Use is_archived if column exists
    updated_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Notification not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'notification_id', p_notification_id,
    'archived', true
  );

EXCEPTION
  WHEN OTHERS THEN
    -- If is_archived column doesn't exist, use soft delete
    UPDATE notifications
    SET 
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id = p_notification_id
      AND user_id = p_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'notification_id', p_notification_id,
      'archived', true
    );
END;
$$;

-- =============================================================================
-- COMMENT: STEP 5 NOTIFICATION SYSTEM DEPLOYED (CORRECTED SCHEMA)
-- Các functions đã tạo (sử dụng schema thực tế):
-- 1. send_notification(user_id, type, title, message, challenge_id, match_id, tournament_id, category, priority)
-- 2. get_user_notifications(user_id, limit, unread_only) - returns real schema columns
-- 3. mark_notification_read(notification_id, user_id) - uses is_read instead of read_at
-- 4. mark_all_notifications_read(user_id) - batch mark as read
-- 5. get_unread_count(user_id) - count unread notifications
-- 6. cleanup_old_notifications(days_old) - soft delete old notifications
-- 7. bulk_send_notifications(user_ids[], type, title, message, ...)
-- 8. send_challenge_status_notification(challenge_id, status, notes)
-- 9. archive_notification(notification_id, user_id)
--
-- SCHEMA COLUMNS USED:
-- notifications: challenge_id, match_id, tournament_id, category, priority, is_read, 
--               auto_popup, deleted_at, is_archived, action_text, action_url
-- =============================================================================
