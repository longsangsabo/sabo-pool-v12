-- ============================================================================
-- TRIGGER TỰ ĐỘNG GHI DỮ LIỆU VÀO BẢNG TOURNAMENT_RESULTS SAU KHI CÓ KẾT QUẢ FINAL
-- Trigger này sẽ tự động tạo dữ liệu tournament_results khi trận final hoàn thành
-- ============================================================================

-- Tạo bảng tournament_prizes để lưu chi tiết giải thưởng
CREATE TABLE IF NOT EXISTS public.tournament_prizes (
  id uuid not null default gen_random_uuid (),
  tournament_id uuid not null,
  prize_position integer not null,
  position_name text not null,
  position_description text null,
  cash_amount numeric(15, 2) null default 0,
  cash_currency text null default 'VND'::text,
  elo_points integer null default 0,
  spa_points integer null default 0,
  physical_items text[] null default '{}'::text[],
  is_visible boolean null default true,
  is_guaranteed boolean null default true,
  special_conditions text null,
  display_order integer null,
  color_theme text null,
  icon_name text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  constraint tournament_prizes_pkey primary key (id),
  constraint tournament_prizes_tournament_id_prize_position_key unique (tournament_id, prize_position),
  constraint tournament_prizes_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint tournament_prizes_tournament_id_fkey foreign KEY (tournament_id) references tournaments (id) on delete CASCADE,
  constraint tournament_prizes_prize_position_check check ((prize_position > 0)),
  constraint tournament_prizes_elo_points_check check ((elo_points >= 0)),
  constraint tournament_prizes_cash_amount_check check ((cash_amount >= (0)::numeric)),
  constraint tournament_prizes_spa_points_check check ((spa_points >= 0))
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_tournament_prizes_tournament_id ON public.tournament_prizes USING btree (tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_prizes_position ON public.tournament_prizes USING btree (tournament_id, prize_position);
CREATE INDEX IF NOT EXISTS idx_tournament_prizes_display_order ON public.tournament_prizes USING btree (tournament_id, display_order);

-- Tạo trigger function cho updated_at
CREATE OR REPLACE FUNCTION update_tournament_prizes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Tạo trigger
DROP TRIGGER IF EXISTS update_tournament_prizes_updated_at ON tournament_prizes;
CREATE TRIGGER update_tournament_prizes_updated_at 
  BEFORE UPDATE ON tournament_prizes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_tournament_prizes_updated_at();

-- Thêm columns thiếu vào bảng tournament_results trước khi tạo functions
ALTER TABLE tournament_results 
ADD COLUMN IF NOT EXISTS prize_amount NUMERIC(10,2) DEFAULT 0.00;

ALTER TABLE tournament_results 
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;

-- Drop constraint gây conflict unique final_position
ALTER TABLE tournament_results 
DROP CONSTRAINT IF EXISTS tournament_results_tournament_id_final_position_key;

-- Thêm winner_id column vào bảng tournaments nếu chưa có
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES auth.users(id);

-- Drop trigger trước khi drop function để tránh dependency conflict
DROP TRIGGER IF EXISTS trigger_auto_tournament_results ON tournament_matches;

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS calculate_player_tournament_stats(uuid, uuid);
DROP FUNCTION IF EXISTS determine_final_position(uuid, uuid, uuid, uuid);
DROP FUNCTION IF EXISTS calculate_tournament_rewards(integer, integer);
DROP FUNCTION IF EXISTS process_tournament_results_completion(uuid, uuid, uuid);
DROP FUNCTION IF EXISTS auto_generate_tournament_results();
DROP FUNCTION IF EXISTS manual_complete_tournament(uuid);
DROP FUNCTION IF EXISTS test_tournament_results_trigger(uuid);

-- 1. Function để tính toán thống kê người chơi trong giải đấu
CREATE OR REPLACE FUNCTION calculate_player_tournament_stats(
  p_tournament_id uuid,
  p_user_id uuid
)
RETURNS TABLE(
  matches_played integer,
  wins integer,
  losses integer,
  win_percentage numeric,
  total_score integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as matches_played,
    COUNT(CASE WHEN winner_id = p_user_id THEN 1 END)::integer as wins,
    COUNT(CASE WHEN winner_id IS NOT NULL AND winner_id != p_user_id THEN 1 END)::integer as losses,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN winner_id = p_user_id THEN 1 END) * 100.0 / COUNT(*))::numeric, 2)
      ELSE 0
    END as win_percentage,
    COALESCE(
      SUM(CASE WHEN player1_id = p_user_id THEN score_player1 ELSE 0 END) +
      SUM(CASE WHEN player2_id = p_user_id THEN score_player2 ELSE 0 END), 0
    )::integer as total_score
  FROM tournament_matches 
  WHERE tournament_id = p_tournament_id 
    AND (player1_id = p_user_id OR player2_id = p_user_id)
    AND status = 'completed';
END;
$$;

-- 2. Function để xác định vị trí cuối cùng của người chơi
CREATE OR REPLACE FUNCTION determine_final_position(
  p_tournament_id uuid,
  p_user_id uuid,
  p_winner_id uuid,
  p_runner_up_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_position integer;
  v_semifinal_loser boolean;
  v_elimination_round integer;
  v_existing_positions integer[];
  v_base_position integer;
  v_next_available_position integer;
BEGIN
  -- Champion (Vị trí 1)
  IF p_user_id = p_winner_id THEN
    RETURN 1;
  END IF;
  
  -- Runner-up (Vị trí 2) 
  IF p_user_id = p_runner_up_id THEN
    RETURN 2;
  END IF;
  
  -- Kiểm tra xem có phải là người thua trong semifinals không
  SELECT COUNT(*) > 0 INTO v_semifinal_loser
  FROM tournament_matches 
  WHERE tournament_id = p_tournament_id 
    AND round_number = 250 -- Semifinals
    AND (player1_id = p_user_id OR player2_id = p_user_id)
    AND winner_id IS NOT NULL 
    AND winner_id != p_user_id;
    
  -- Nếu thua trong semifinals thì vị trí 3-4
  IF v_semifinal_loser THEN
    -- Tìm vị trí available từ 3-4
    SELECT COALESCE(array_agg(final_position), ARRAY[]::integer[]) INTO v_existing_positions
    FROM tournament_results 
    WHERE tournament_id = p_tournament_id 
      AND final_position BETWEEN 3 AND 4;
    
    IF 3 = ANY(v_existing_positions) THEN
      RETURN 4;
    ELSE
      RETURN 3;
    END IF;
  END IF;
  
  -- Tìm round cuối cùng mà người chơi bị loại
  SELECT COALESCE(MAX(round_number), 1) INTO v_elimination_round
  FROM tournament_matches 
  WHERE tournament_id = p_tournament_id 
    AND (player1_id = p_user_id OR player2_id = p_user_id)
    AND winner_id IS NOT NULL 
    AND winner_id != p_user_id;
  
  -- Xác định base position dựa trên round bị loại
  CASE v_elimination_round
    WHEN 1 THEN v_base_position := 9;    -- Thua ở Round 1 (9-16)
    WHEN 2 THEN v_base_position := 5;    -- Thua ở Round 2 (5-8)
    WHEN 3 THEN v_base_position := 3;    -- Thua ở Round 3 (3-4)
    WHEN 101, 102, 103 THEN v_base_position := 7;  -- Thua ở Losers Bracket A (5-8)
    WHEN 201, 202 THEN v_base_position := 5;       -- Thua ở Losers Bracket B (5-8)
    ELSE v_base_position := 9; -- Default fallback
  END CASE;
  
  -- Tìm vị trí available từ base position
  SELECT COALESCE(array_agg(final_position), ARRAY[]::integer[]) INTO v_existing_positions
  FROM tournament_results 
  WHERE tournament_id = p_tournament_id;
  
  -- Tìm vị trí available bắt đầu từ base_position
  v_next_available_position := v_base_position;
  WHILE v_next_available_position = ANY(v_existing_positions) LOOP
    v_next_available_position := v_next_available_position + 1;
    -- Safety check để tránh infinite loop
    IF v_next_available_position > 16 THEN
      v_next_available_position := 16;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_next_available_position;
END;
$$;

-- 3. Function để tính SPA points, ELO và lấy prize từ bảng tournament_prizes
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
  v_prize_record record;
  v_cash_amount numeric := 0;
  v_spa_points integer := 0;
  v_elo_points integer := 0;
BEGIN
  -- Lấy thông tin phần thưởng chi tiết từ bảng tournament_prizes
  SELECT 
    COALESCE(tp.cash_amount, 0) as cash_amount,
    COALESCE(tp.spa_points, 0) as spa_points,
    COALESCE(tp.elo_points, 0) as elo_points
  INTO v_prize_record
  FROM tournament_prizes tp
  WHERE tp.tournament_id = p_tournament_id 
    AND tp.prize_position = p_final_position
    AND tp.is_visible = true;

  -- Nếu có dữ liệu trong tournament_prizes thì dùng, không thì dùng default
  IF FOUND THEN
    v_cash_amount := v_prize_record.cash_amount;
    v_spa_points := v_prize_record.spa_points;
    v_elo_points := v_prize_record.elo_points;
  ELSE
    -- Default SPA points nếu không có trong tournament_prizes
    v_spa_points := CASE p_final_position
      WHEN 1 THEN 50    -- Champion
      WHEN 2 THEN 30    -- Runner-up  
      WHEN 3 THEN 20    -- 3rd place
      WHEN 4 THEN 15    -- 4th place
      WHEN 5 THEN 10    -- 5th-8th place
      WHEN 6 THEN 10
      WHEN 7 THEN 10
      WHEN 8 THEN 10
      ELSE 5            -- 9th-16th place
    END;
    
    -- Default ELO points nếu không có trong tournament_prizes  
    v_elo_points := CASE p_final_position
      WHEN 1 THEN 25    -- Champion ELO boost
      WHEN 2 THEN 15    -- Runner-up ELO boost
      WHEN 3 THEN 10    -- 3rd place ELO boost
      WHEN 4 THEN 5     -- 4th place ELO boost
      ELSE 0            -- No ELO for lower positions
    END;
    
    -- Default cash amount = 0 nếu không có trong tournament_prizes
    v_cash_amount := 0;
  END IF;

  RETURN QUERY
  SELECT 
    v_spa_points as spa_points,
    v_elo_points as elo_points,
    v_cash_amount as prize_amount;
END;
$$;

-- 4. Main function để process tournament completion
CREATE OR REPLACE FUNCTION process_tournament_results_completion(
  p_tournament_id uuid,
  p_final_match_id uuid,
  p_winner_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_final_match record;
  v_runner_up_id uuid;
  v_participant record;
  v_stats record;
  v_rewards record;
  v_final_position integer;
  v_existing_result uuid;
BEGIN
  -- Lấy thông tin trận final
  SELECT * INTO v_final_match 
  FROM tournament_matches 
  WHERE id = p_final_match_id;
  
  -- Xác định runner-up
  v_runner_up_id := CASE 
    WHEN v_final_match.player1_id = p_winner_id THEN v_final_match.player2_id
    ELSE v_final_match.player1_id 
  END;
  
    -- Lấy tất cả participants trong tournament từ tournament_registrations
  FOR v_participant IN (
    SELECT DISTINCT user_id
    FROM tournament_registrations 
    WHERE tournament_id = p_tournament_id
      AND registration_status = 'confirmed'
  ) LOOP
    
    -- Kiểm tra xem đã có result chưa
    SELECT id INTO v_existing_result 
    FROM tournament_results 
    WHERE tournament_id = p_tournament_id 
      AND user_id = v_participant.user_id;
    
    -- Nếu chưa có thì tạo mới
    IF v_existing_result IS NULL THEN
      
      -- Tính toán stats của player
      SELECT * INTO v_stats 
      FROM calculate_player_tournament_stats(p_tournament_id, v_participant.user_id);
      
      -- Xác định vị trí cuối cùng
      v_final_position := determine_final_position(
        p_tournament_id, 
        v_participant.user_id, 
        p_winner_id, 
        v_runner_up_id
      );
      
      -- Tính toán rewards
      SELECT * INTO v_rewards 
      FROM calculate_tournament_rewards(v_final_position, p_tournament_id);
      
      -- Insert vào tournament_results
      INSERT INTO tournament_results (
        tournament_id,
        user_id,
        final_position,
        matches_played,
        wins,
        losses,
        win_percentage,
        total_score,
        spa_points_earned,
        elo_points_awarded,
        prize_amount
      ) VALUES (
        p_tournament_id,
        v_participant.user_id,
        v_final_position,
        v_stats.matches_played,
        v_stats.wins,
        v_stats.losses,
        v_stats.win_percentage,
        v_stats.total_score,
        v_rewards.spa_points,
        v_rewards.elo_points,
        v_rewards.prize_amount
      );
      
      RAISE NOTICE 'Created tournament result for user % - Position: % (% SPA points)', 
        v_participant.user_id, v_final_position, v_rewards.spa_points;
    END IF;
    
  END LOOP;
  
  -- Update tournament status
  UPDATE tournaments 
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE id = p_tournament_id;

  -- Try to update winner_id if column exists
  BEGIN
    UPDATE tournaments 
    SET winner_id = p_winner_id
    WHERE id = p_tournament_id;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, skip this update
      RAISE NOTICE 'winner_id column not found, skipping...';
  END;
  
  -- Try to update completed_at if column exists
  BEGIN
    UPDATE tournaments 
    SET completed_at = NOW()
    WHERE id = p_tournament_id;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, skip this update
      RAISE NOTICE 'completed_at column not found, skipping...';
  END;
  
  RAISE NOTICE '🏆 Tournament % completed! Results generated for all participants.', p_tournament_id;
END;
$$;

-- 5. Trigger function để tự động gọi khi final match completed
CREATE OR REPLACE FUNCTION auto_generate_tournament_results()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tournament_type text;
  v_is_final_match boolean;
BEGIN
  -- Chỉ process khi match vừa được completed và có winner
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
    
    -- Kiểm tra tournament type
    SELECT tournament_type INTO v_tournament_type 
    FROM tournaments 
    WHERE id = NEW.tournament_id;
    
    -- Chỉ handle SABO tournaments
    IF v_tournament_type IN ('sabo', 'double_elimination') THEN
      
      -- Kiểm tra xem có phải final match không (Round 300)
      v_is_final_match := (NEW.round_number = 300 AND NEW.match_number = 1);
      
      IF v_is_final_match THEN
        -- Gọi function để tạo tournament results
        PERFORM process_tournament_results_completion(
          NEW.tournament_id,
          NEW.id,
          NEW.winner_id
        );
        
        RAISE NOTICE '🎯 Auto-generated tournament results for final match completion!';
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Install trigger
DROP TRIGGER IF EXISTS trigger_auto_tournament_results ON tournament_matches;
CREATE TRIGGER trigger_auto_tournament_results
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_tournament_results();

-- 7. Manual completion function (for backup button)
CREATE OR REPLACE FUNCTION manual_complete_tournament(
  p_tournament_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_final_match record;
  v_tournament_status text;
  v_result_count integer;
BEGIN
  -- Kiểm tra tournament status
  SELECT status INTO v_tournament_status 
  FROM tournaments 
  WHERE id = p_tournament_id;
  
  IF v_tournament_status = 'completed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Tournament đã được hoàn thành rồi!'
    );
  END IF;
  
  -- Tìm final match
  SELECT * INTO v_final_match
  FROM tournament_matches 
  WHERE tournament_id = p_tournament_id 
    AND round_number = 300 
    AND match_number = 1;
  
  IF v_final_match IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Không tìm thấy trận final!'
    );
  END IF;
  
  IF v_final_match.status != 'completed' OR v_final_match.winner_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Trận final chưa hoàn thành hoặc chưa có winner!'
    );
  END IF;
  
  -- Kiểm tra xem đã có results chưa
  SELECT COUNT(*) INTO v_result_count 
  FROM tournament_results 
  WHERE tournament_id = p_tournament_id;
  
  IF v_result_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Tournament results đã được tạo rồi!'
    );
  END IF;
  
  -- Tạo tournament results
  PERFORM process_tournament_results_completion(
    p_tournament_id,
    v_final_match.id,
    v_final_match.winner_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Tournament đã được hoàn thành thành công!',
    'winner_id', v_final_match.winner_id
  );
END;
$$;

-- ============================================================================
-- VERIFICATION & TESTING
-- ============================================================================

-- Function để test trigger
CREATE OR REPLACE FUNCTION test_tournament_results_trigger(p_tournament_id uuid)
RETURNS TABLE(
  test_result text,
  details jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_final_match record;
  v_result_count integer;
BEGIN
  -- Kiểm tra final match
  SELECT * INTO v_final_match
  FROM tournament_matches 
  WHERE tournament_id = p_tournament_id 
    AND round_number = 300;
  
  SELECT COUNT(*) INTO v_result_count
  FROM tournament_results 
  WHERE tournament_id = p_tournament_id;
  
  RETURN QUERY
  SELECT 
    'Tournament Results Status'::text,
    jsonb_build_object(
      'tournament_id', p_tournament_id,
      'final_match_status', COALESCE(v_final_match.status, 'not_found'),
      'final_match_winner', v_final_match.winner_id,
      'results_generated', v_result_count > 0,
      'total_results', v_result_count
    );
END;
$$;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- ✅ Trigger tự động tạo tournament_results khi final match completed
-- ✅ Function manual completion cho nút backup
-- ✅ Tính toán đầy đủ stats, rankings, rewards
-- ✅ Support cho SABO double elimination tournaments
-- ============================================================================
