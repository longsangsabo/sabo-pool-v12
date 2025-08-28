-- =========================================
-- TOURNAMENT PRIZES TABLE CREATION SCRIPT
-- =========================================
-- Chạy script này trên Supabase Dashboard > SQL Editor
-- Tạo bảng tournament_prizes để quản lý chi tiết giải thưởng

-- 1. Tạo bảng tournament_prizes
CREATE TABLE IF NOT EXISTS tournament_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL,
    
    -- Thông tin vị trí
    prize_position INTEGER NOT NULL CHECK (prize_position > 0 AND prize_position <= 64),
    position_name VARCHAR(100) NOT NULL, -- "Vô địch", "Á quân", "Hạng 3", "Top 8"...
    position_description TEXT, -- Mô tả chi tiết vị trí
    
    -- Giải thưởng tiền mặt
    cash_amount DECIMAL(15,2) DEFAULT 0 CHECK (cash_amount >= 0),
    cash_currency VARCHAR(10) DEFAULT 'VND',
    
    -- Điểm thưởng
    elo_points INTEGER DEFAULT 0 CHECK (elo_points >= 0),
    spa_points INTEGER DEFAULT 0 CHECK (spa_points >= 0),
    
    -- Phần thưởng vật chất (JSON array)
    physical_items JSONB DEFAULT '[]'::jsonb,
    
    -- Cài đặt hiển thị
    is_visible BOOLEAN DEFAULT true,
    is_guaranteed BOOLEAN DEFAULT true, -- Giải thưởng có đảm bảo hay phụ thuộc điều kiện
    
    -- Điều kiện đặc biệt (nếu có)
    special_conditions TEXT, -- VD: "Cần tối thiểu 80% win rate"
    
    -- Metadata
    display_order INTEGER, -- Thứ tự hiển thị (có thể khác position)
    color_theme VARCHAR(20), -- "gold", "silver", "bronze", "blue"...
    icon_name VARCHAR(50), -- Tên icon để hiển thị
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Reference to user who created this prize
    
    -- Constraints
    CONSTRAINT fk_tournament_prizes_tournament 
        FOREIGN KEY (tournament_id) 
        REFERENCES tournaments(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_tournament_prizes_creator
        FOREIGN KEY (created_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL,
    
    -- Unique constraint: mỗi tournament chỉ có 1 prize per position
    CONSTRAINT uk_tournament_prizes_tournament_position 
        UNIQUE (tournament_id, prize_position)
);

-- 2. Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_tournament_prizes_tournament_id 
    ON tournament_prizes(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_prizes_position 
    ON tournament_prizes(prize_position);

CREATE INDEX IF NOT EXISTS idx_tournament_prizes_cash_amount 
    ON tournament_prizes(cash_amount DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_prizes_visible 
    ON tournament_prizes(is_visible) WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_tournament_prizes_display_order 
    ON tournament_prizes(tournament_id, display_order);

-- 3. Tạo function để tự động update updated_at
CREATE OR REPLACE FUNCTION update_tournament_prizes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Tạo trigger cho auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_tournament_prizes_updated_at ON tournament_prizes;
CREATE TRIGGER trigger_update_tournament_prizes_updated_at
    BEFORE UPDATE ON tournament_prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_tournament_prizes_updated_at();

-- 5. Tạo function để validate physical_items JSON structure
CREATE OR REPLACE FUNCTION validate_physical_items(items JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it's an array
    IF jsonb_typeof(items) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check each item is a string
    FOR i IN 0..jsonb_array_length(items)-1 LOOP
        IF jsonb_typeof(items->i) != 'string' THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. Thêm constraint để validate physical_items structure
ALTER TABLE tournament_prizes 
ADD CONSTRAINT check_physical_items_format 
CHECK (validate_physical_items(physical_items));

-- 7. Tạo view để dễ query với tournament info
CREATE OR REPLACE VIEW tournament_prizes_with_details AS
SELECT 
    tp.*,
    t.name as tournament_name,
    t.tournament_type,
    t.game_format,
    t.prize_pool as tournament_prize_pool,
    t.max_participants,
    t.status as tournament_status,
    -- Calculate percentage of total prize pool
    CASE 
        WHEN t.prize_pool > 0 THEN 
            ROUND((tp.cash_amount / t.prize_pool * 100)::numeric, 2)
        ELSE 0 
    END as prize_percentage
FROM tournament_prizes tp
LEFT JOIN tournaments t ON tp.tournament_id = t.id;

-- 8. Tạo function helper để get prizes by tournament
CREATE OR REPLACE FUNCTION get_tournament_prizes(p_tournament_id UUID)
RETURNS TABLE (
    id UUID,
    prize_position INTEGER,
    position_name VARCHAR(100),
    cash_amount DECIMAL(15,2),
    elo_points INTEGER,
    spa_points INTEGER,
    physical_items JSONB,
    is_visible BOOLEAN,
    display_order INTEGER,
    color_theme VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.id,
        tp.prize_position,
        tp.position_name,
        tp.cash_amount,
        tp.elo_points,
        tp.spa_points,
        tp.physical_items,
        tp.is_visible,
        COALESCE(tp.display_order, tp.prize_position) as display_order,
        tp.color_theme
    FROM tournament_prizes tp
    WHERE tp.tournament_id = p_tournament_id
        AND tp.is_visible = true
    ORDER BY COALESCE(tp.display_order, tp.prize_position);
END;
$$ LANGUAGE plpgsql;

-- 9. Tạo function để calculate total prizes cho tournament
CREATE OR REPLACE FUNCTION calculate_tournament_total_prizes(p_tournament_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    total_amount DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(cash_amount), 0)
    INTO total_amount
    FROM tournament_prizes
    WHERE tournament_id = p_tournament_id
        AND is_visible = true;
    
    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- 10. Tạo sample data templates (optional - có thể skip)
INSERT INTO tournament_prizes (tournament_id, prize_position, position_name, cash_amount, elo_points, spa_points, physical_items, color_theme, display_order)
VALUES 
    -- Template for typical 16-player tournament (sẽ được replace bằng real tournament_id)
    ('00000000-0000-0000-0000-000000000000', 1, 'Vô địch', 5000000, 100, 1000, '["Cúp vàng", "Giấy chứng nhận"]', 'gold', 1),
    ('00000000-0000-0000-0000-000000000000', 2, 'Á quân', 3000000, 80, 800, '["Cúp bạc", "Giấy chứng nhận"]', 'silver', 2),
    ('00000000-0000-0000-0000-000000000000', 3, 'Hạng 3', 2000000, 60, 600, '["Cúp đồng", "Giấy chứng nhận"]', 'bronze', 3),
    ('00000000-0000-0000-0000-000000000000', 4, 'Hạng 4', 1000000, 40, 400, '["Huy chương"]', 'blue', 4)
ON CONFLICT (tournament_id, prize_position) DO NOTHING;

-- 11. Tạo RLS (Row Level Security) policies
ALTER TABLE tournament_prizes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read visible prizes
CREATE POLICY "tournament_prizes_select_policy" ON tournament_prizes
    FOR SELECT USING (is_visible = true);

-- Policy: Tournament creators can manage their prizes
CREATE POLICY "tournament_prizes_crud_policy" ON tournament_prizes
    FOR ALL USING (
        auth.uid() IN (
            SELECT created_by FROM tournaments WHERE id = tournament_id
        )
        OR 
        auth.uid() = created_by
    );

-- Policy: Service role can do everything (for admin functions)
CREATE POLICY "tournament_prizes_service_role_policy" ON tournament_prizes
    FOR ALL TO service_role USING (true);

-- 12. Grant permissions
GRANT SELECT ON tournament_prizes TO authenticated;
GRANT ALL ON tournament_prizes TO service_role;
GRANT USAGE ON SEQUENCE tournament_prizes_id_seq TO authenticated;

-- 13. Comments for documentation
COMMENT ON TABLE tournament_prizes IS 'Chi tiết giải thưởng cho từng vị trí trong tournament';
COMMENT ON COLUMN tournament_prizes.prize_position IS 'Vị trí xếp hạng (1=nhất, 2=nhì, ...)';
COMMENT ON COLUMN tournament_prizes.cash_amount IS 'Số tiền thưởng (VND)';
COMMENT ON COLUMN tournament_prizes.elo_points IS 'Điểm ELO được cộng';
COMMENT ON COLUMN tournament_prizes.spa_points IS 'Điểm SPA Pool Arena được cộng';
COMMENT ON COLUMN tournament_prizes.physical_items IS 'Danh sách phần thưởng vật chất (JSON array)';
COMMENT ON COLUMN tournament_prizes.is_guaranteed IS 'Giải thưởng có đảm bảo hay phụ thuộc điều kiện';

-- =========================================
-- SCRIPT COMPLETED SUCCESSFULLY! 
-- =========================================
-- Bảng tournament_prizes đã được tạo với:
-- ✅ Cấu trúc table hoàn chỉnh
-- ✅ Indexes cho performance  
-- ✅ Triggers cho auto-update
-- ✅ Views và functions helper
-- ✅ RLS security policies
-- ✅ Sample template data
-- 
-- Sẵn sàng sử dụng!
-- =========================================
