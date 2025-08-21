-- Fix schema tournament_results - thêm column total_score còn thiếu
-- Chạy trong Supabase SQL Editor

-- Thêm column total_score vào bảng tournament_results
ALTER TABLE tournament_results 
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0 CHECK (total_score >= 0);

-- Thêm comment để giải thích
COMMENT ON COLUMN tournament_results.total_score IS 'Tổng điểm ghi được trong tất cả các trận đấu của tournament';

-- Verify column đã được thêm
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tournament_results' 
  AND table_schema = 'public'
  AND column_name = 'total_score';

RAISE NOTICE '✅ Column total_score đã được thêm vào bảng tournament_results';
