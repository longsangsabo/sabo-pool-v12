-- ============================================================================
-- FIX TOURNAMENT RESULTS SCHEMA - THÊM COLUMN TOTAL_SCORE
-- Chạy script này trong Supabase SQL Editor để fix lỗi triệt để
-- ============================================================================

-- Step 1: Thêm column total_score vào bảng tournament_results
ALTER TABLE tournament_results 
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0 CHECK (total_score >= 0);

-- Step 2: Thêm comment cho column
COMMENT ON COLUMN tournament_results.total_score IS 'Tổng điểm ghi được trong tất cả các trận đấu của tournament';

-- Step 3: Verify column đã được thêm
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_results' 
      AND table_schema = 'public'
      AND column_name = 'total_score'
  ) THEN
    RAISE NOTICE '✅ Column total_score đã tồn tại trong bảng tournament_results';
  ELSE
    RAISE NOTICE '❌ Column total_score chưa được thêm';
  END IF;
END $$;
