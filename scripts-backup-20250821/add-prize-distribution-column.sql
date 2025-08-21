-- Kiểm tra cấu trúc bảng tournaments và thêm column prize_distribution nếu chưa có

-- 1. Kiểm tra bảng hiện tại
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- 2. Thêm column prize_distribution nếu chưa có
DO $$ 
BEGIN
    -- Kiểm tra xem column đã tồn tại chưa
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'prize_distribution'
    ) THEN
        -- Thêm column prize_distribution kiểu JSONB
        ALTER TABLE tournaments 
        ADD COLUMN prize_distribution JSONB DEFAULT NULL;
        
        -- Tạo index cho JSONB để query nhanh hơn
        CREATE INDEX IF NOT EXISTS idx_tournaments_prize_distribution_gin 
        ON tournaments USING GIN (prize_distribution);
        
        RAISE NOTICE 'Column prize_distribution đã được thêm vào bảng tournaments';
    ELSE
        RAISE NOTICE 'Column prize_distribution đã tồn tại trong bảng tournaments';
    END IF;
END $$;

-- 3. Kiểm tra lại sau khi thêm
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND column_name = 'prize_distribution';
