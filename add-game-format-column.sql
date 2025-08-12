-- Fix tournaments table by adding game_format column
-- This resolves "Could not find the 'game_format' column of 'tournaments' in the schema cache"

-- Step 1: Check and add game_format column if needed
DO $$
BEGIN
  -- Add game_format column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'game_format'
  ) THEN
    -- Add game_format column with default '8-ball'
    ALTER TABLE tournaments ADD COLUMN game_format TEXT NOT NULL DEFAULT '8-ball';
    
    -- Add comment to explain the column
    COMMENT ON COLUMN tournaments.game_format IS 'Game format/variant being played (e.g., 8-ball, 9-ball, 10-ball)';
  END IF;
END
$$;

-- Optional: Add constraint to limit game_format values
DO $$
BEGIN
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tournaments_game_format_check'
  ) THEN
    ALTER TABLE tournaments 
    ADD CONSTRAINT tournaments_game_format_check 
    CHECK (game_format IN ('8-ball', '9-ball', '10-ball', 'straight-pool', 'one-pocket', 'bank-pool', 'rotation', 'custom'));
  END IF;
END
$$;

-- IMPORTANT: Note the distinction between tournament format and game format:
-- 1. Tournament Format (tournament_type/format column): Refers to how the tournament is structured
--    - single_elimination: Loại trực tiếp (thua 1 trận là loại)
--    - double_elimination: Loại kép (có cơ hội phục hồi)
--    - round_robin: Vòng tròn (đấu với tất cả đối thủ)
--    - swiss: Hệ thống Thụy Sĩ (đấu cùng điểm)
--    - sabo_double_elimination: SABO custom format
-- 
-- 2. Game Format (game_format column): Refers to which billiards game variant is being played
--    - 8-ball: Bi-a lỗ 8 bi
--    - 9-ball: Bi-a lỗ 9 bi
--    - 10-ball: Bi-a lỗ 10 bi
--    - straight-pool: Bi-a liên tục (14.1)
--    - one-pocket: Một túi
--    - bank-pool: Băng đá
--    - rotation: Xoay vòng
