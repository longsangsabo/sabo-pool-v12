-- Cập nhật function để lấy phần thưởng từ bảng tournaments thay vì hardcode

-- Drop existing function first
DROP FUNCTION IF EXISTS calculate_tournament_rewards(integer, integer);
DROP FUNCTION IF EXISTS calculate_tournament_rewards(integer, uuid, integer);

-- 3. Function để tính SPA points, ELO và lấy prize từ tournament settings
CREATE OR REPLACE FUNCTION calculate_tournament_rewards(
  p_final_position integer,
  p_tournament_id uuid,
  p_total_participants integer DEFAULT 16
)
RETURNS TABLE(
  spa_points integer,
  elo_points integer,
  prize_amount numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_first_prize numeric := 0;
  v_second_prize numeric := 0;
  v_third_prize numeric := 0;
BEGIN
  -- Lấy thông tin phần thưởng từ bảng tournaments
  SELECT 
    COALESCE(first_prize, 0),
    COALESCE(second_prize, 0), 
    COALESCE(third_prize, 0)
  INTO v_first_prize, v_second_prize, v_third_prize
  FROM tournaments 
  WHERE id = p_tournament_id;

  RETURN QUERY
  SELECT 
    CASE p_final_position
      WHEN 1 THEN 50    -- Champion
      WHEN 2 THEN 30    -- Runner-up  
      WHEN 3 THEN 20    -- 3rd place
      WHEN 4 THEN 15    -- 4th place
      WHEN 5 THEN 10    -- 5th-8th place
      WHEN 6 THEN 10
      WHEN 7 THEN 10
      WHEN 8 THEN 10
      ELSE 5            -- 9th-16th place
    END as spa_points,
    
    CASE p_final_position
      WHEN 1 THEN 25    -- Champion ELO boost
      WHEN 2 THEN 15    -- Runner-up ELO boost
      WHEN 3 THEN 10    -- 3rd place ELO boost
      WHEN 4 THEN 5     -- 4th place ELO boost
      ELSE 0            -- No ELO for lower positions
    END as elo_points,
    
    -- Sử dụng phần thưởng từ tournament settings
    CASE p_final_position
      WHEN 1 THEN v_first_prize   -- Champion prize từ tournaments.first_prize
      WHEN 2 THEN v_second_prize  -- Runner-up prize từ tournaments.second_prize
      WHEN 3 THEN v_third_prize   -- 3rd place prize từ tournaments.third_prize
      ELSE 0.00                   -- No monetary prize for other positions
    END as prize_amount;
END;
$$;
