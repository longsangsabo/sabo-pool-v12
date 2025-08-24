-- =============================================================================
-- STEP 4: MATCH MANAGEMENT SYSTEM
-- Deploy này trên Supabase SQL Editor
-- =============================================================================

-- 1. Function: Create Match from Approved Challenge
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
  -- Get approved challenge info
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = p_challenge_id
    AND status = 'club_approved';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found or not club approved'
    );
  END IF;

  -- Generate new match ID
  v_match_id := gen_random_uuid();

  -- Create match record
  INSERT INTO matches (
    id,
    challenge_id,
    player1_id,
    player2_id,
    player1_score,
    player2_score,
    status,
    bet_points,
    created_at,
    updated_at
  ) VALUES (
    v_match_id,
    p_challenge_id,
    v_challenge.challenger_id,
    v_challenge.opponent_id,
    0,
    0,
    'in_progress',
    v_challenge.bet_points,
    NOW(),
    NOW()
  );

  -- Update challenge status to 'match_created'
  UPDATE challenges
  SET 
    status = 'match_created',
    match_id = v_match_id,
    updated_at = NOW()
  WHERE id = p_challenge_id;

  -- Create notifications
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES
    (v_challenge.challenger_id, 'match_created',
     'Match Ready to Play',
     'Your challenge has been converted to a match. Ready to play!',
     v_match_id, 'match'),
    (v_challenge.opponent_id, 'match_created',
     'Match Ready to Play',
     'A match is ready for you to play!',
     v_match_id, 'match');

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

-- 2. Function: Complete Match with Score
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
  v_loser_spa_loss INTEGER;
BEGIN
  -- Get match info
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id
    AND status = 'in_progress';

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
    -- Tie - return bet points to both players
    UPDATE profiles
    SET spa_points = spa_points + v_match.bet_points
    WHERE user_id IN (v_match.player1_id, v_match.player2_id);
    
    -- Update match as completed (tie)
    UPDATE matches
    SET 
      player1_score = p_player1_score,
      player2_score = p_player2_score,
      status = 'completed',
      winner_id = NULL,
      completed_at = NOW(),
      completed_by = p_completing_user_id,
      updated_at = NOW()
    WHERE id = p_match_id;

    RETURN jsonb_build_object(
      'success', true,
      'match_id', p_match_id,
      'result', 'tie',
      'player1_score', p_player1_score,
      'player2_score', p_player2_score
    );
  END IF;

  -- Calculate SPA transfers (winner gets double the bet)
  v_winner_spa_gain := v_match.bet_points * 2;
  v_loser_spa_loss := 0; -- Loser already lost bet_points when challenge was accepted

  -- Update winner's SPA
  UPDATE profiles
  SET spa_points = spa_points + v_winner_spa_gain
  WHERE user_id = v_winner_id;

  -- Update match as completed
  UPDATE matches
  SET 
    player1_score = p_player1_score,
    player2_score = p_player2_score,
    status = 'completed',
    winner_id = v_winner_id,
    completed_at = NOW(),
    completed_by = p_completing_user_id,
    updated_at = NOW()
  WHERE id = p_match_id;

  -- Update challenge status
  UPDATE challenges
  SET 
    status = 'completed',
    winner_id = v_winner_id,
    updated_at = NOW()
  WHERE id = v_match.challenge_id;

  -- Create notifications
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES
    (v_winner_id, 'match_won',
     'Match Won!',
     'Congratulations! You won the match and gained ' || v_winner_spa_gain || ' SPA points',
     p_match_id, 'match'),
    (v_loser_id, 'match_lost',
     'Match Result',
     'Match completed. Better luck next time!',
     p_match_id, 'match');

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

-- 3. Function: Get Active Matches for User
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
  created_at TIMESTAMPTZ,
  is_player1 BOOLEAN
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
    m.bet_points,
    m.status,
    m.created_at,
    (m.player1_id = p_user_id) as is_player1
  FROM matches m
  JOIN profiles p1 ON m.player1_id = p1.user_id
  JOIN profiles p2 ON m.player2_id = p2.user_id
  WHERE (m.player1_id = p_user_id OR m.player2_id = p_user_id)
    AND m.status IN ('in_progress', 'pending_confirmation')
  ORDER BY m.created_at DESC;
END;
$$;

-- =============================================================================

-- 4. Function: Get Match History for User
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
  completed_at TIMESTAMPTZ
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
    m.bet_points,
    CASE 
      WHEN m.player1_id = p_user_id THEN m.player1_score
      ELSE m.player2_score
    END as user_score,
    CASE 
      WHEN m.player1_id = p_user_id THEN m.player2_score
      ELSE m.player1_score
    END as opponent_score,
    CASE 
      WHEN m.winner_id IS NULL THEN 'tie'
      WHEN m.winner_id = p_user_id THEN 'won'
      ELSE 'lost'
    END as result,
    m.completed_at
  FROM matches m
  JOIN profiles p1 ON m.player1_id = p1.user_id
  JOIN profiles p2 ON m.player2_id = p2.user_id
  WHERE (m.player1_id = p_user_id OR m.player2_id = p_user_id)
    AND m.status = 'completed'
  ORDER BY m.completed_at DESC
  LIMIT p_limit;
END;
$$;

-- =============================================================================

-- 5. Function: Cancel Active Match (if needed)
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
BEGIN
  -- Get match info
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id
    AND status = 'in_progress';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Match not found or not in progress'
    );
  END IF;

  -- Validate user can cancel (must be one of the players)
  IF p_canceling_user_id NOT IN (v_match.player1_id, v_match.player2_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only match players can cancel the match'
    );
  END IF;

  -- Return bet points to both players
  UPDATE profiles
  SET spa_points = spa_points + v_match.bet_points
  WHERE user_id IN (v_match.player1_id, v_match.player2_id);

  -- Update match as cancelled
  UPDATE matches
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancelled_by = p_canceling_user_id,
    cancel_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_match_id;

  -- Update related challenge
  UPDATE challenges
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = v_match.challenge_id;

  -- Create notifications
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES
    (v_match.player1_id, 'match_cancelled',
     'Match Cancelled',
     'Match has been cancelled. SPA points have been returned.',
     p_match_id, 'match'),
    (v_match.player2_id, 'match_cancelled',
     'Match Cancelled',
     'Match has been cancelled. SPA points have been returned.',
     p_match_id, 'match');

  RETURN jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'reason', p_reason,
    'spa_returned', v_match.bet_points
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
-- COMMENT: STEP 4 MATCH MANAGEMENT SYSTEM DEPLOYED
-- Các functions đã tạo:
-- 1. create_match_from_challenge(challenge_id)
-- 2. complete_match(match_id, player1_score, player2_score, completing_user_id)
-- 3. get_user_active_matches(user_id)
-- 4. get_user_match_history(user_id, limit)
-- 5. cancel_match(match_id, canceling_user_id, reason)
-- =============================================================================
