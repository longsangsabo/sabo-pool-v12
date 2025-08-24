-- =============================================================================
-- STEP 4: MATCH MANAGEMENT SYSTEM (CORRECTED SCHEMA)
-- Deploy này sau Step 3 trên Supabase SQL Editor
-- =============================================================================

-- DROP existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS create_match_from_challenge(UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_match(UUID, INTEGER, INTEGER, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_active_matches(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_match_history(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS cancel_match(UUID, UUID, TEXT) CASCADE;

-- =============================================================================

-- 1. Function: Create Match from Club-Approved Challenge - CORRECTED SCHEMA
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
  -- Get challenge info using REAL SCHEMA - FIXED CONDITION
  SELECT 
    c.*,
    p1.display_name as challenger_name,
    p2.display_name as opponent_name
  INTO v_challenge
  FROM challenges c
  JOIN profiles p1 ON c.challenger_id = p1.user_id
  LEFT JOIN profiles p2 ON c.opponent_id = p2.user_id
  WHERE c.id = p_challenge_id
    AND c.status IN ('accepted', 'club_confirmed', 'matched') -- Allow multiple statuses
    AND c.club_confirmed = true; -- Check the boolean field

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found or not club approved'
    );
  END IF;

  -- Generate new match ID
  v_match_id := gen_random_uuid();

  -- Create match record using REAL MATCHES SCHEMA
  INSERT INTO matches (
    id,
    challenge_id,
    player1_id,
    player2_id,
    score_player1,  -- Real schema uses score_player1
    score_player2,  -- Real schema uses score_player2
    status,
    match_type,
    tournament_id,
    scheduled_time,
    created_at,
    updated_at
  ) VALUES (
    v_match_id,
    p_challenge_id,
    v_challenge.challenger_id,
    v_challenge.opponent_id,
    0,
    0,
    'scheduled',  -- Real status values
    'challenge',  -- Match type for challenge matches
    NULL,         -- Not a tournament match
    v_challenge.scheduled_time,
    NOW(),
    NOW()
  );

    -- Update challenge status to indicate match created (use valid status)
  UPDATE challenges
  SET updated_at = NOW()
  WHERE id = p_challenge_id;

  -- Create notifications using REAL NOTIFICATIONS SCHEMA
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    match_id,
    category,
    priority,
    is_read,
    created_at,
    updated_at
  ) VALUES
    (gen_random_uuid(),
     v_challenge.challenger_id,
     'match_created',
     'Match Ready to Play',
     'Your challenge has been converted to a match. Ready to play!',
     p_challenge_id,
     v_match_id,
     'match',
     'high',
     false,
     NOW(),
     NOW()),
    (gen_random_uuid(),
     v_challenge.opponent_id,
     'match_created',
     'Match Ready to Play',
     'A match is ready for you to play!',
     p_challenge_id,
     v_match_id,
     'match',
     'high',
     false,
     NOW(),
     NOW());

  RETURN jsonb_build_object(
    'success', true,
    'match_id', v_match_id,
    'challenge_id', p_challenge_id,
    'player1_id', v_challenge.challenger_id,
    'player2_id', v_challenge.opponent_id,
    'bet_points', v_challenge.bet_points
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

-- 2. Function: Complete Match with Score - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION complete_match(
  p_match_id UUID,
  p_player1_score INTEGER,
  p_player2_score INTEGER,
  p_completing_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match RECORD;
  v_challenge RECORD;
  v_winner_id UUID;
  v_loser_id UUID;
  v_winner_spa_gain INTEGER;
BEGIN
  -- Get match info using REAL MATCHES SCHEMA
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id
    AND status IN ('scheduled', 'in_progress');

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Match not found or not in progress'
    );
  END IF;

  -- Get related challenge info
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = v_match.challenge_id;

  -- Validate completing user is one of the players
  IF p_completing_user_id NOT IN (v_match.player1_id, v_match.player2_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only match players can complete the match'
    );
  END IF;

  -- Determine winner/loser
  IF p_player1_score > p_player2_score THEN
    v_winner_id := v_match.player1_id;
    v_loser_id := v_match.player2_id;
  ELSIF p_player2_score > p_player1_score THEN
    v_winner_id := v_match.player2_id;
    v_loser_id := v_match.player1_id;
  ELSE
    -- Tie - return bet points to both players using SPA functions
    PERFORM refund_challenge_spa(v_match.player1_id, v_challenge.id, v_challenge.bet_points);
    PERFORM refund_challenge_spa(v_match.player2_id, v_challenge.id, v_challenge.bet_points);
    
    -- Update match as completed (tie) using REAL SCHEMA
    UPDATE matches
    SET 
      score_player1 = p_player1_score,
      score_player2 = p_player2_score,
      status = 'completed',
      winner_id = NULL,
      actual_end_time = NOW(),
      updated_at = NOW()
    WHERE id = p_match_id;

    -- Update challenge
    UPDATE challenges
    SET
      status = 'completed',
      challenger_score = p_player1_score,
      opponent_score = p_player2_score,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = v_match.challenge_id;

    RETURN jsonb_build_object(
      'success', true,
      'match_id', p_match_id,
      'result', 'tie',
      'player1_score', p_player1_score,
      'player2_score', p_player2_score
    );
  END IF;

  -- Calculate SPA transfers (winner gets double the bet)
  v_winner_spa_gain := v_challenge.bet_points * 2;

  -- Reward winner using SPA function
  PERFORM reward_challenge_spa(v_winner_id, v_challenge.id, v_winner_spa_gain);

  -- Update match as completed using REAL SCHEMA
  UPDATE matches
  SET 
    score_player1 = p_player1_score,
    score_player2 = p_player2_score,
    status = 'completed',
    winner_id = v_winner_id,
    actual_end_time = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;

  -- Update challenge status using REAL SCHEMA
  UPDATE challenges
  SET 
    status = 'completed',
    winner_id = v_winner_id,
    challenger_score = p_player1_score,
    opponent_score = p_player2_score,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_match.challenge_id;

  -- Create notifications using REAL SCHEMA
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    match_id,
    category,
    priority,
    is_read,
    created_at,
    updated_at
  ) VALUES
    (gen_random_uuid(),
     v_winner_id,
     'match_won',
     'Match Won!',
     'Congratulations! You won the match and gained ' || v_winner_spa_gain || ' SPA points',
     v_challenge.id,
     p_match_id,
     'match',
     'high',
     false,
     NOW(),
     NOW()),
    (gen_random_uuid(),
     v_loser_id,
     'match_lost',
     'Match Result',
     'Match completed. Better luck next time!',
     v_challenge.id,
     p_match_id,
     'match',
     'medium',
     false,
     NOW(),
     NOW());

  RETURN jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'winner_id', v_winner_id,
    'loser_id', v_loser_id,
    'player1_score', p_player1_score,
    'player2_score', p_player2_score,
    'spa_transferred', v_winner_spa_gain
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

-- 3. Function: Get Active Matches for User - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION get_user_active_matches(
  p_user_id UUID
)
RETURNS TABLE (
  match_id UUID,
  challenge_id UUID,
  opponent_id UUID,
  opponent_name TEXT,
  bet_points INTEGER,
  status TEXT,
  scheduled_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  is_player1 BOOLEAN,
  match_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    m.challenge_id,
    CASE 
      WHEN m.player1_id = p_user_id THEN m.player2_id
      ELSE m.player1_id
    END as opponent_id,
    CASE 
      WHEN m.player1_id = p_user_id THEN p2.display_name
      ELSE p1.display_name
    END as opponent_name,
    c.bet_points,
    m.status,
    m.scheduled_time,
    m.created_at,
    (m.player1_id = p_user_id) as is_player1,
    m.match_type
  FROM matches m
  JOIN profiles p1 ON m.player1_id = p1.user_id
  JOIN profiles p2 ON m.player2_id = p2.user_id
  LEFT JOIN challenges c ON m.challenge_id = c.id
  WHERE (m.player1_id = p_user_id OR m.player2_id = p_user_id)
    AND m.status IN ('scheduled', 'in_progress')
  ORDER BY m.created_at DESC;
END;
$$;

-- =============================================================================

-- 4. Function: Get Match History for User - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION get_user_match_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  match_id UUID,
  opponent_id UUID,
  opponent_name TEXT,
  bet_points INTEGER,
  user_score INTEGER,
  opponent_score INTEGER,
  result TEXT,
  actual_end_time TIMESTAMPTZ,
  match_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    CASE 
      WHEN m.player1_id = p_user_id THEN m.player2_id
      ELSE m.player1_id
    END as opponent_id,
    CASE 
      WHEN m.player1_id = p_user_id THEN p2.display_name
      ELSE p1.display_name
    END as opponent_name,
    COALESCE(c.bet_points, 0) as bet_points,
    CASE 
      WHEN m.player1_id = p_user_id THEN m.score_player1
      ELSE m.score_player2
    END as user_score,
    CASE 
      WHEN m.player1_id = p_user_id THEN m.score_player2
      ELSE m.score_player1
    END as opponent_score,
    CASE 
      WHEN m.winner_id IS NULL THEN 'tie'
      WHEN m.winner_id = p_user_id THEN 'won'
      ELSE 'lost'
    END as result,
    m.actual_end_time,
    m.match_type
  FROM matches m
  JOIN profiles p1 ON m.player1_id = p1.user_id
  JOIN profiles p2 ON m.player2_id = p2.user_id
  LEFT JOIN challenges c ON m.challenge_id = c.id
  WHERE (m.player1_id = p_user_id OR m.player2_id = p_user_id)
    AND m.status = 'completed'
  ORDER BY m.actual_end_time DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- =============================================================================

-- 5. Function: Cancel Active Match - CORRECTED SCHEMA
CREATE OR REPLACE FUNCTION cancel_match(
  p_match_id UUID,
  p_canceling_user_id UUID,
  p_reason TEXT DEFAULT 'Match cancelled'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match RECORD;
  v_challenge RECORD;
BEGIN
  -- Get match info using REAL SCHEMA
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id
    AND status IN ('scheduled', 'in_progress');

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Match not found or not active'
    );
  END IF;

  -- Get challenge info
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = v_match.challenge_id;

  -- Validate user can cancel (must be one of the players)
  IF p_canceling_user_id NOT IN (v_match.player1_id, v_match.player2_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only match players can cancel the match'
    );
  END IF;

  -- Return bet points to both players using SPA functions
  IF v_challenge.bet_points > 0 THEN
    PERFORM refund_challenge_spa(v_match.player1_id, v_challenge.id, v_challenge.bet_points);
    PERFORM refund_challenge_spa(v_match.player2_id, v_challenge.id, v_challenge.bet_points);
  END IF;

  -- Update match as cancelled using REAL SCHEMA
  UPDATE matches
  SET 
    status = 'cancelled',
    actual_end_time = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;

  -- Update related challenge
  UPDATE challenges
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = v_match.challenge_id;

  -- Create notifications using REAL SCHEMA
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    challenge_id,
    match_id,
    category,
    priority,
    is_read,
    created_at,
    updated_at
  ) VALUES
    (gen_random_uuid(),
     v_match.player1_id,
     'match_cancelled',
     'Match Cancelled',
     'Match has been cancelled. SPA points have been returned.',
     v_challenge.id,
     p_match_id,
     'match',
     'medium',
     false,
     NOW(),
     NOW()),
    (gen_random_uuid(),
     v_match.player2_id,
     'match_cancelled',
     'Match Cancelled',
     'Match has been cancelled. SPA points have been returned.',
     v_challenge.id,
     p_match_id,
     'match',
     'medium',
     false,
     NOW(),
     NOW());

  RETURN jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'reason', p_reason,
    'spa_returned', v_challenge.bet_points
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
-- COMMENT: STEP 4 MATCH MANAGEMENT SYSTEM DEPLOYED (CORRECTED SCHEMA)
-- Các functions đã tạo (sử dụng schema thực tế):
-- 1. create_match_from_challenge(challenge_id)
-- 2. complete_match(match_id, player1_score, player2_score, completing_user_id)
-- 3. get_user_active_matches(user_id)
-- 4. get_user_match_history(user_id, limit)
-- 5. cancel_match(match_id, canceling_user_id, reason)
--
-- SCHEMA COLUMNS USED:
-- matches: score_player1, score_player2, actual_end_time, match_type
-- challenges: challenger_score, opponent_score, started_at, completed_at
-- notifications: challenge_id, match_id, category, priority, is_read
-- Integration with SPA management functions for point transfers
-- =============================================================================
