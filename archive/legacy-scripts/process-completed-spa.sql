-- Script xử lý SPA cho những trận đã completed nhưng chưa được xử lý
-- Copy và chạy từng bước trong Supabase SQL Editor

-- Bước 1: Kiểm tra trận completed nhưng chưa xử lý SPA
SELECT 
  c.id,
  c.status,
  c.club_confirmed,
  cp.full_name as challenger,
  op.full_name as opponent,
  c.challenger_score,
  c.opponent_score,
  c.bet_points,
  cp.spa_points as challenger_spa,
  op.spa_points as opponent_spa,
  CASE 
    WHEN c.challenger_score > c.opponent_score THEN cp.full_name
    WHEN c.opponent_score > c.challenger_score THEN op.full_name
    ELSE 'Hòa'
  END as winner
FROM challenges c
LEFT JOIN profiles cp ON c.challenger_id = cp.id
LEFT JOIN profiles op ON c.opponent_id = op.id
WHERE c.status = 'completed' 
  AND c.club_confirmed = true
  AND c.challenger_score IS NOT NULL 
  AND c.opponent_score IS NOT NULL
  AND c.bet_points > 0
ORDER BY c.completed_at DESC;

-- Bước 2: Function xử lý SPA cho trận đã completed
CREATE OR REPLACE FUNCTION process_completed_challenge_spa(p_challenge_id UUID)
RETURNS JSON AS $$
DECLARE
  v_challenge RECORD;
  v_winner_id UUID;
  v_loser_id UUID;
  v_spa_amount INTEGER;
  v_winner_current_spa INTEGER;
  v_loser_current_spa INTEGER;
BEGIN
  -- Get challenge info
  SELECT 
    id, challenger_id, opponent_id, bet_points,
    challenger_score, opponent_score, status, club_confirmed
  INTO v_challenge
  FROM challenges 
  WHERE id = p_challenge_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Challenge not found');
  END IF;

  IF v_challenge.status != 'completed' OR v_challenge.club_confirmed != true THEN
    RETURN json_build_object('success', false, 'error', 'Challenge not completed or not approved');
  END IF;

  IF v_challenge.challenger_score IS NULL OR v_challenge.opponent_score IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No scores available');
  END IF;

  -- Determine winner
  IF v_challenge.challenger_score > v_challenge.opponent_score THEN
    v_winner_id := v_challenge.challenger_id;
    v_loser_id := v_challenge.opponent_id;
  ELSIF v_challenge.opponent_score > v_challenge.challenger_score THEN
    v_winner_id := v_challenge.opponent_id;
    v_loser_id := v_challenge.challenger_id;
  ELSE
    RETURN json_build_object('success', true, 'message', 'Draw - no SPA transfer');
  END IF;

  v_spa_amount := COALESCE(v_challenge.bet_points, 0);

  IF v_spa_amount <= 0 THEN
    RETURN json_build_object('success', true, 'message', 'No SPA to transfer');
  END IF;

  -- Get current SPA
  SELECT spa_points INTO v_winner_current_spa FROM profiles WHERE id = v_winner_id;
  SELECT spa_points INTO v_loser_current_spa FROM profiles WHERE id = v_loser_id;

  -- Transfer SPA
  UPDATE profiles 
  SET spa_points = GREATEST(0, spa_points - v_spa_amount)
  WHERE id = v_loser_id;

  UPDATE profiles 
  SET spa_points = spa_points + v_spa_amount
  WHERE id = v_winner_id;

  RETURN json_build_object(
    'success', true,
    'message', 'SPA transferred successfully',
    'winner_id', v_winner_id,
    'loser_id', v_loser_id,
    'spa_amount', v_spa_amount,
    'winner_old_spa', v_winner_current_spa,
    'loser_old_spa', v_loser_current_spa
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bước 3: Test function với một challenge cụ thể (thay ID)
-- SELECT process_completed_challenge_spa('your-challenge-id-here');

-- Bước 4: Xử lý tất cả trận completed chưa được xử lý SPA
-- (Chỉ chạy sau khi đã test function ở bước 3)
/*
DO $$
DECLARE
    challenge_record RECORD;
    result JSON;
BEGIN
    FOR challenge_record IN 
        SELECT c.id
        FROM challenges c
        WHERE c.status = 'completed' 
          AND c.club_confirmed = true
          AND c.challenger_score IS NOT NULL 
          AND c.opponent_score IS NOT NULL
          AND c.bet_points > 0
    LOOP
        SELECT process_completed_challenge_spa(challenge_record.id) INTO result;
        RAISE NOTICE 'Processed challenge %: %', challenge_record.id, result;
    END LOOP;
END $$;
*/
