-- Function với DEBUG logs để xem tại sao SPA không update
-- Copy và chạy trong Supabase SQL Editor

CREATE OR REPLACE FUNCTION handle_club_approval_spa_debug(
  p_challenge_id UUID,
  p_approved BOOLEAN,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_challenge RECORD;
  v_challenger_score INTEGER;
  v_opponent_score INTEGER;
  v_winner_id UUID;
  v_loser_id UUID;
  v_spa_amount INTEGER;
  v_winner_spa_before INTEGER;
  v_loser_spa_before INTEGER;
  v_winner_spa_after INTEGER;
  v_loser_spa_after INTEGER;
  v_update_result_winner INTEGER;
  v_update_result_loser INTEGER;
BEGIN
  RAISE NOTICE 'DEBUG: Starting function with challenge_id: %', p_challenge_id;

  -- Get challenge data
  SELECT 
    id, 
    challenger_id, 
    opponent_id,
    bet_points,
    status,
    challenger_score,
    opponent_score
  INTO v_challenge
  FROM challenges 
  WHERE id = p_challenge_id;

  IF NOT FOUND THEN
    RAISE NOTICE 'DEBUG: Challenge not found!';
    RETURN json_build_object('success', false, 'error', 'Challenge not found');
  END IF;

  RAISE NOTICE 'DEBUG: Challenge found - status: %, scores: % vs %', v_challenge.status, v_challenge.challenger_score, v_challenge.opponent_score;

  IF v_challenge.challenger_score IS NULL OR v_challenge.opponent_score IS NULL THEN
    RAISE NOTICE 'DEBUG: No scores to approve';
    RETURN json_build_object('success', false, 'error', 'Challenge has no scores to approve');
  END IF;

  IF p_approved THEN
    -- Determine winner
    IF v_challenge.challenger_score > v_challenge.opponent_score THEN
      v_winner_id := v_challenge.challenger_id;
      v_loser_id := v_challenge.opponent_id;
    ELSIF v_challenge.opponent_score > v_challenge.challenger_score THEN
      v_winner_id := v_challenge.opponent_id;
      v_loser_id := v_challenge.challenger_id;
    ELSE
      v_winner_id := NULL;
      v_loser_id := NULL;
    END IF;

    RAISE NOTICE 'DEBUG: Winner: %, Loser: %', v_winner_id, v_loser_id;

    v_spa_amount := COALESCE(v_challenge.bet_points, 0);
    RAISE NOTICE 'DEBUG: SPA amount to transfer: %', v_spa_amount;

    IF v_winner_id IS NOT NULL AND v_loser_id IS NOT NULL AND v_spa_amount > 0 THEN
      -- Get SPA before
      SELECT spa_points INTO v_winner_spa_before FROM profiles WHERE id = v_winner_id;
      SELECT spa_points INTO v_loser_spa_before FROM profiles WHERE id = v_loser_id;
      
      RAISE NOTICE 'DEBUG: SPA before - Winner: %, Loser: %', v_winner_spa_before, v_loser_spa_before;

      -- Update loser (subtract)
      UPDATE profiles 
      SET spa_points = spa_points - v_spa_amount
      WHERE id = v_loser_id;
      
      GET DIAGNOSTICS v_update_result_loser = ROW_COUNT;
      RAISE NOTICE 'DEBUG: Loser update affected % rows', v_update_result_loser;

      -- Update winner (add)
      UPDATE profiles 
      SET spa_points = spa_points + v_spa_amount
      WHERE id = v_winner_id;
      
      GET DIAGNOSTICS v_update_result_winner = ROW_COUNT;
      RAISE NOTICE 'DEBUG: Winner update affected % rows', v_update_result_winner;

      -- Get SPA after
      SELECT spa_points INTO v_winner_spa_after FROM profiles WHERE id = v_winner_id;
      SELECT spa_points INTO v_loser_spa_after FROM profiles WHERE id = v_loser_id;
      
      RAISE NOTICE 'DEBUG: SPA after - Winner: %, Loser: %', v_winner_spa_after, v_loser_spa_after;
    END IF;

    -- Update challenge
    UPDATE challenges SET
      club_confirmed = true,
      club_confirmed_at = NOW(),
      club_note = p_admin_note,
      status = 'completed',
      completed_at = NOW(),
      winner_id = v_winner_id
    WHERE id = p_challenge_id;

    RAISE NOTICE 'DEBUG: Challenge updated to completed';

    RETURN json_build_object(
      'success', true,
      'message', 'Match approved and SPA processed',
      'status', 'completed',
      'winner_id', v_winner_id,
      'spa_transferred', v_spa_amount,
      'winner_spa_before', v_winner_spa_before,
      'winner_spa_after', v_winner_spa_after,
      'loser_spa_before', v_loser_spa_before,
      'loser_spa_after', v_loser_spa_after,
      'update_results', json_build_object('winner_rows', v_update_result_winner, 'loser_rows', v_update_result_loser)
    );
  ELSE
    UPDATE challenges SET
      club_confirmed = false,
      club_confirmed_at = NOW(),
      club_note = p_admin_note,
      status = 'rejected'
    WHERE id = p_challenge_id;

    RETURN json_build_object('success', true, 'message', 'Match result rejected', 'status', 'rejected');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test debug function
SELECT handle_club_approval_spa_debug(
  '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c'::UUID, 
  true, 
  'DEBUG TEST - Processing SPA for completed challenge'
);
