-- Debug script kiểm tra tại sao SPA không thay đổi
-- Copy và chạy từng bước trong Supabase SQL Editor

-- Bước 1: Kiểm tra kiểu dữ liệu điểm số trong challenges
SELECT 
  id,
  challenger_score,
  opponent_score,
  pg_typeof(challenger_score) as challenger_score_type,
  pg_typeof(opponent_score) as opponent_score_type,
  bet_points,
  pg_typeof(bet_points) as bet_points_type
FROM challenges 
WHERE id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

-- Bước 2: Kiểm tra SPA hiện tại của 2 users
SELECT 
  p.id,
  p.full_name,
  p.spa_points,
  pg_typeof(p.spa_points) as spa_type
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5');

-- Bước 3: Test function với debug info
CREATE OR REPLACE FUNCTION debug_spa_transfer(
  p_challenge_id UUID
)
RETURNS TABLE(
  step TEXT,
  info TEXT,
  challenger_id UUID,
  opponent_id UUID,
  challenger_score TEXT,
  opponent_score TEXT,
  winner_id UUID,
  spa_amount INTEGER
) AS $$
DECLARE
  v_challenge RECORD;
  v_winner_id UUID;
  v_loser_id UUID;
  v_spa_amount INTEGER;
BEGIN
  -- Get challenge data
  SELECT 
    challenges.id, 
    challenges.challenger_id, 
    challenges.opponent_id,
    challenges.bet_points,
    challenges.status,
    challenges.challenger_score,
    challenges.opponent_score
  INTO v_challenge
  FROM challenges 
  WHERE challenges.id = p_challenge_id;

  RETURN QUERY SELECT 'Step 1'::TEXT, 'Challenge data loaded'::TEXT, 
    v_challenge.challenger_id, v_challenge.opponent_id, 
    v_challenge.challenger_score::TEXT, v_challenge.opponent_score::TEXT,
    NULL::UUID, v_challenge.bet_points;

  -- Convert scores and determine winner
  IF v_challenge.challenger_score::INTEGER > v_challenge.opponent_score::INTEGER THEN
    v_winner_id := v_challenge.challenger_id;
    v_loser_id := v_challenge.opponent_id;
  ELSIF v_challenge.opponent_score::INTEGER > v_challenge.challenger_score::INTEGER THEN
    v_winner_id := v_challenge.opponent_id;
    v_loser_id := v_challenge.challenger_id;
  ELSE
    v_winner_id := NULL;
    v_loser_id := NULL;
  END IF;

  v_spa_amount := COALESCE(v_challenge.bet_points, 0);

  RETURN QUERY SELECT 'Step 2'::TEXT, 'Winner determined'::TEXT,
    v_challenge.challenger_id, v_challenge.opponent_id,
    v_challenge.challenger_score::TEXT, v_challenge.opponent_score::TEXT,
    v_winner_id, v_spa_amount;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Chạy debug function
SELECT * FROM debug_spa_transfer('16879f9a-e5fd-4ffb-91e7-0941b5a1b47c');

-- Bước 4: Test manual SPA update
DO $$
DECLARE
    v_winner_id UUID := 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'; -- Sang
    v_loser_id UUID := '18f6e853-b072-47fb-9c9a-e5d42a5446a5';  -- Dức
    v_spa_amount INTEGER := 100;
    v_winner_current INTEGER;
    v_loser_current INTEGER;
BEGIN
    -- Get current SPA
    SELECT spa_points INTO v_winner_current FROM profiles WHERE id = v_winner_id;
    SELECT spa_points INTO v_loser_current FROM profiles WHERE id = v_loser_id;
    
    RAISE NOTICE 'Before: Winner has %, Loser has %', v_winner_current, v_loser_current;
    
    -- Manual update
    UPDATE profiles SET spa_points = spa_points + v_spa_amount WHERE id = v_winner_id;
    UPDATE profiles SET spa_points = spa_points - v_spa_amount WHERE id = v_loser_id;
    
    -- Check after
    SELECT spa_points INTO v_winner_current FROM profiles WHERE id = v_winner_id;
    SELECT spa_points INTO v_loser_current FROM profiles WHERE id = v_loser_id;
    
    RAISE NOTICE 'After: Winner has %, Loser has %', v_winner_current, v_loser_current;
END $$;
