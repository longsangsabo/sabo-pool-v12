-- Thêm các columns thiếu vào bảng tournament_results

-- Thêm prize_amount column
ALTER TABLE tournament_results 
ADD COLUMN IF NOT EXISTS prize_amount NUMERIC(10,2) DEFAULT 0.00;

-- Thêm total_score column  
ALTER TABLE tournament_results 
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;

-- Comment để giải thích
COMMENT ON COLUMN tournament_results.prize_amount IS 'Số tiền thưởng của player trong tournament';
COMMENT ON COLUMN tournament_results.total_score IS 'Tổng điểm số của player trong tournament';

-- Verify columns đã được thêm
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tournament_results' 
  AND column_name IN ('prize_amount', 'total_score');
