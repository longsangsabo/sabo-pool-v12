-- Function xử lý SPA points khi club phê duyệt kết quả
-- Copy và chạy trong Supabase SQL Editor

CREATE OR REPLACE FUNCTION handle_club_approval_spa(
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
BEGIN
  -- Get challenge data với điểm số từ các field thực tế
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
    RETURN json_build_object(
      'success', false,
      'error', 'Challenge not found'
    );
  END IF;

  -- Kiểm tra có điểm số không
  IF v_challenge.challenger_score IS NULL OR v_challenge.opponent_score IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Challenge has no scores to approve'
    );
  END IF;

  IF p_approved THEN
    -- Xác định winner và loser
    IF v_challenge.challenger_score > v_challenge.opponent_score THEN
      v_winner_id := v_challenge.challenger_id;
      v_loser_id := v_challenge.opponent_id;
    ELSIF v_challenge.opponent_score > v_challenge.challenger_score THEN
      v_winner_id := v_challenge.opponent_id;
      v_loser_id := v_challenge.challenger_id;
    ELSE
      -- Hòa - không chuyển SPA
      v_winner_id := NULL;
      v_loser_id := NULL;
    END IF;

    -- Lấy số SPA cần chuyển
    v_spa_amount := COALESCE(v_challenge.bet_points, 0);

    -- Xử lý chuyển SPA nếu có winner
    IF v_winner_id IS NOT NULL AND v_loser_id IS NOT NULL AND v_spa_amount > 0 THEN
      -- Trừ SPA từ người thua
      UPDATE profiles 
      SET spa_points = spa_points - v_spa_amount
      WHERE id = v_loser_id;

      -- Cộng SPA cho người thắng  
      UPDATE profiles 
      SET spa_points = spa_points + v_spa_amount
      WHERE id = v_winner_id;
    END IF;

    -- Update challenge thành completed
    UPDATE challenges SET
      club_confirmed = true,
      club_confirmed_at = NOW(),
      club_note = p_admin_note,
      status = 'completed',
      completed_at = NOW(),
      winner_id = v_winner_id
    WHERE id = p_challenge_id;

    RETURN json_build_object(
      'success', true,
      'message', 'Match approved and SPA processed',
      'status', 'completed',
      'winner_id', v_winner_id,
      'spa_transferred', v_spa_amount
    );
  ELSE
    -- Từ chối - chỉ update status
    UPDATE challenges SET
      club_confirmed = false,
      club_confirmed_at = NOW(),
      club_note = p_admin_note,
      status = 'rejected'
    WHERE id = p_challenge_id;

    RETURN json_build_object(
      'success', true,
      'message', 'Match result rejected',
      'status', 'rejected'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION handle_club_approval_spa TO authenticated;

-- Test function với challenge thực tế
SELECT handle_club_approval_spa(
  '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c'::UUID, 
  true, 
  'Processing SPA for completed challenge'
);
