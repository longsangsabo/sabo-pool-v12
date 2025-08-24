-- =============================================================================
-- FIX CHALLENGE WORKFLOW - CORRECT LOGIC
-- Deploy trên Supabase SQL Editor để fix workflow
-- =============================================================================

-- NEW CORRECT LOGIC:
-- Challenge Created → Accepted → Match Auto-Created → Play → Submit Scores → Club Approve Scores → Complete

-- 1. Fix the challenge status trigger to create match immediately when accepted
DROP FUNCTION IF EXISTS handle_challenge_status_change() CASCADE;

CREATE OR REPLACE FUNCTION handle_challenge_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_result JSONB;
  v_spa_result JSONB;
  v_match_result JSONB;
BEGIN
  -- Log the status change
  RAISE NOTICE 'Challenge % status changed from % to %', NEW.id, OLD.status, NEW.status;

  -- Handle different status transitions
  CASE NEW.status
    WHEN 'accepted' THEN
      -- Send notification to both parties
      SELECT send_challenge_status_notification(NEW.id, 'accepted', NULL) INTO v_notification_result;
      RAISE NOTICE 'Acceptance notification sent: %', v_notification_result;
      
      -- ✅ AUTO-CREATE MATCH IMMEDIATELY when accepted (not waiting for club approval)
      SELECT create_match_from_challenge(NEW.id) INTO v_match_result;
      RAISE NOTICE 'Match created from accepted challenge: %', v_match_result;

    WHEN 'club_confirmed' THEN
      -- Club confirmed - this is now for SCORE APPROVAL, not match creation
      SELECT send_challenge_status_notification(NEW.id, 'club_confirmed', NEW.club_note) INTO v_notification_result;
      -- Match should already exist, so no match creation here

    WHEN 'rejected' THEN
      -- Challenge rejected - refund SPA if deducted
      SELECT send_challenge_status_notification(NEW.id, 'rejected', NEW.club_note) INTO v_notification_result;
      
      -- Refund SPA points to challenger
      IF NEW.bet_points > 0 THEN
        SELECT reward_challenge_spa(
          NEW.challenger_id, 
          NEW.bet_points, 
          'challenge_refund', 
          'Challenge rejected - SPA refunded'
        ) INTO v_spa_result;
        RAISE NOTICE 'SPA refunded to challenger: %', v_spa_result;
      END IF;

    WHEN 'completed' THEN
      -- Challenge completed - send completion notifications
      SELECT send_challenge_status_notification(NEW.id, 'completed', NULL) INTO v_notification_result;

    WHEN 'cancelled' THEN
      -- Challenge cancelled - refund SPA and notify
      SELECT send_challenge_status_notification(NEW.id, 'cancelled', 'Challenge was cancelled') INTO v_notification_result;
      
      IF NEW.bet_points > 0 THEN
        SELECT reward_challenge_spa(
          NEW.challenger_id, 
          NEW.bet_points, 
          'challenge_refund', 
          'Challenge cancelled - SPA refunded'
        ) INTO v_spa_result;
      END IF;

    WHEN 'expired' THEN
      -- Auto-expire old challenges and refund SPA
      IF NEW.bet_points > 0 THEN
        SELECT reward_challenge_spa(
          NEW.challenger_id, 
          NEW.bet_points, 
          'challenge_refund', 
          'Challenge expired - SPA refunded'
        ) INTO v_spa_result;
      END IF;

    ELSE
      -- Generic status change notification
      SELECT send_challenge_status_notification(NEW.id, NEW.status, NULL) INTO v_notification_result;
  END CASE;

  -- Update the updated_at timestamp
  NEW.updated_at = NOW();

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in challenge status trigger: %', SQLERRM;
    RETURN NEW;  -- Continue with the update even if trigger logic fails
END;
$$;

-- 2. Fix the create_match_from_challenge function to work with 'accepted' status
DROP FUNCTION IF EXISTS create_match_from_challenge(UUID) CASCADE;

CREATE OR REPLACE FUNCTION create_match_from_challenge(
  p_challenge_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_match_id UUID;
BEGIN
  -- Get challenge info - should work with 'accepted' status, not requiring club_confirmed
  SELECT
    c.*,
    p1.display_name as challenger_name,
    p2.display_name as opponent_name
  INTO v_challenge
  FROM challenges c
  JOIN profiles p1 ON c.challenger_id = p1.user_id
  LEFT JOIN profiles p2 ON c.opponent_id = p2.user_id
  WHERE c.id = p_challenge_id
    AND c.status = 'accepted'  -- Only require 'accepted' status
    AND c.opponent_id IS NOT NULL;  -- Must have an opponent

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found, not accepted, or missing opponent'
    );
  END IF;

  -- Check if match already exists
  SELECT id INTO v_match_id
  FROM matches
  WHERE challenge_id = p_challenge_id;

  IF v_match_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Match already exists for this challenge',
      'match_id', v_match_id
    );
  END IF;

  -- Generate match ID
  v_match_id := gen_random_uuid();

  -- Create match using REAL MATCHES SCHEMA
  INSERT INTO matches (
    id,
    challenge_id,
    player1_id,
    player2_id,
    status,
    match_type,
    created_at,
    updated_at
  ) VALUES (
    v_match_id,
    p_challenge_id,
    v_challenge.challenger_id,
    v_challenge.opponent_id,
    'scheduled',  -- Ready to play
    'challenge',
    NOW(),
    NOW()
  );

  -- Update challenge status to indicate match is created
  UPDATE challenges 
  SET status = 'matched', updated_at = NOW()
  WHERE id = p_challenge_id;

  RETURN jsonb_build_object(
    'success', true,
    'match_id', v_match_id,
    'challenge_id', p_challenge_id,
    'player1_id', v_challenge.challenger_id,
    'player2_id', v_challenge.opponent_id,
    'challenger_name', v_challenge.challenger_name,
    'opponent_name', v_challenge.opponent_name,
    'status', 'Match created and ready to play'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER trigger_challenge_status_update
  BEFORE UPDATE OF status ON challenges
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_challenge_status_change();

-- =============================================================================
-- COMMENT: WORKFLOW FIXED
-- 
-- ✅ NEW CORRECT WORKFLOW:
-- 1. Challenge Created (status: pending)
-- 2. Challenge Accepted (status: accepted) → MATCH AUTO-CREATED
-- 3. Match appears in UI (status: scheduled)
-- 4. Players play match
-- 5. Players submit scores
-- 6. Club approves final scores → SPA distributed
-- 7. Match completed
-- 
-- Club chỉ approve TỶ SỐ CUỐI CÙNG, không approve để bắt đầu trận đấu!
-- =============================================================================
