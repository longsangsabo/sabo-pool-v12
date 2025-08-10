-- Legacy SPA Points System for importing existing leaderboard
-- Allows users to claim their SPA points from the old manual system

-- 1. Create legacy_spa_points table
CREATE TABLE IF NOT EXISTS legacy_spa_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    nick_name VARCHAR(255),
    spa_points INTEGER NOT NULL DEFAULT 0,
    facebook_url TEXT,
    position_rank INTEGER, -- Original position in leaderboard
    claimed BOOLEAN DEFAULT FALSE,
    claimed_by UUID REFERENCES auth.users(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(50) DEFAULT 'facebook', -- 'facebook', 'manual', 'phone'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_legacy_spa_full_name ON legacy_spa_points(full_name);
CREATE INDEX idx_legacy_spa_nick_name ON legacy_spa_points(nick_name);
CREATE INDEX idx_legacy_spa_claimed ON legacy_spa_points(claimed);
CREATE INDEX idx_legacy_spa_facebook ON legacy_spa_points(facebook_url);
CREATE INDEX idx_legacy_spa_points_desc ON legacy_spa_points(spa_points DESC);

-- 2. Function to claim legacy SPA points
CREATE OR REPLACE FUNCTION claim_legacy_spa_points(
    p_user_id UUID,
    p_identifier TEXT, -- Can be full_name, nick_name, or facebook_url
    p_verification_method VARCHAR DEFAULT 'manual'
) RETURNS TABLE (
    success BOOLEAN,
    spa_points INTEGER,
    message TEXT,
    player_name TEXT
) AS $$
DECLARE
    v_legacy_record legacy_spa_points%ROWTYPE;
    v_spa_points INTEGER;
    v_existing_claim UUID;
BEGIN
    -- Check if user already claimed points
    SELECT claimed_by INTO v_existing_claim
    FROM legacy_spa_points 
    WHERE claimed_by = p_user_id 
    LIMIT 1;
    
    IF v_existing_claim IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'Bạn đã nhận điểm SPA trước đó rồi!', ''::TEXT;
        RETURN;
    END IF;
    
    -- Find legacy record by identifier (name, nickname, or facebook)
    SELECT * INTO v_legacy_record 
    FROM legacy_spa_points 
    WHERE (
        LOWER(full_name) = LOWER(p_identifier) OR 
        LOWER(nick_name) = LOWER(p_identifier) OR 
        facebook_url = p_identifier
    )
    AND claimed = FALSE
    ORDER BY spa_points DESC -- Get highest points if multiple matches
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'Không tìm thấy tên của bạn trong BXH cũ. Vui lòng liên hệ admin để xác minh.', ''::TEXT;
        RETURN;
    END IF;
    
    -- Mark as claimed
    UPDATE legacy_spa_points 
    SET 
        claimed = TRUE,
        claimed_by = p_user_id,
        claimed_at = NOW(),
        verification_method = p_verification_method,
        updated_at = NOW()
    WHERE id = v_legacy_record.id;
    
    -- Update or insert into player_rankings
    INSERT INTO player_rankings (
        player_id, 
        spa_points, 
        elo_points,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        v_legacy_record.spa_points,
        1000, -- Default ELO
        NOW(),
        NOW()
    )
    ON CONFLICT (player_id) DO UPDATE
    SET 
        spa_points = player_rankings.spa_points + v_legacy_record.spa_points,
        updated_at = NOW();
    
    -- Log SPA transaction
    INSERT INTO spa_transactions (
        user_id,
        amount,
        transaction_type,
        reference_id,
        description,
        created_at
    ) VALUES (
        p_user_id,
        v_legacy_record.spa_points,
        'legacy_claim',
        v_legacy_record.id::TEXT,
        'Nhận điểm SPA từ BXH cũ: ' || v_legacy_record.full_name,
        NOW()
    );
    
    RETURN QUERY SELECT 
        TRUE, 
        v_legacy_record.spa_points, 
        'Chúc mừng! Bạn đã nhận thành công ' || v_legacy_record.spa_points || ' điểm SPA từ BXH cũ!',
        v_legacy_record.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. View for public leaderboard (combining legacy and current users)
CREATE OR REPLACE VIEW public_spa_leaderboard AS
SELECT 
    'registered' as user_type,
    pr.player_id as user_id,
    p.full_name,
    p.display_name as nick_name,
    pr.spa_points,
    pr.elo_points,
    p.verified_rank,
    p.avatar_url,
    NULL as facebook_url,
    TRUE as is_registered,
    NULL as can_claim
FROM player_rankings pr
JOIN profiles p ON pr.player_id = p.user_id
WHERE pr.spa_points > 0

UNION ALL

SELECT 
    'legacy' as user_type,
    NULL as user_id,
    lsp.full_name,
    lsp.nick_name,
    lsp.spa_points,
    1000 as elo_points, -- Default ELO for legacy users
    NULL as verified_rank,
    NULL as avatar_url,
    lsp.facebook_url,
    FALSE as is_registered,
    NOT lsp.claimed as can_claim
FROM legacy_spa_points lsp

ORDER BY spa_points DESC;

-- 4. Function to get legacy claim suggestions for a user
CREATE OR REPLACE FUNCTION get_legacy_claim_suggestions(
    p_full_name TEXT DEFAULT NULL,
    p_nick_name TEXT DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    full_name TEXT,
    nick_name TEXT,
    spa_points INTEGER,
    facebook_url TEXT,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lsp.id,
        lsp.full_name,
        lsp.nick_name,
        lsp.spa_points,
        lsp.facebook_url,
        CASE 
            WHEN p_full_name IS NOT NULL AND p_nick_name IS NOT NULL THEN
                GREATEST(
                    similarity(LOWER(lsp.full_name), LOWER(p_full_name)),
                    similarity(LOWER(lsp.nick_name), LOWER(p_nick_name))
                )
            WHEN p_full_name IS NOT NULL THEN
                similarity(LOWER(lsp.full_name), LOWER(p_full_name))
            WHEN p_nick_name IS NOT NULL THEN
                similarity(LOWER(lsp.nick_name), LOWER(p_nick_name))
            ELSE 0.0
        END as similarity_score
    FROM legacy_spa_points lsp
    WHERE lsp.claimed = FALSE
    AND (
        (p_full_name IS NOT NULL AND similarity(LOWER(lsp.full_name), LOWER(p_full_name)) > 0.3) OR
        (p_nick_name IS NOT NULL AND similarity(LOWER(lsp.nick_name), LOWER(p_nick_name)) > 0.3)
    )
    ORDER BY similarity_score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- 5. RLS policies
ALTER TABLE legacy_spa_points ENABLE ROW LEVEL SECURITY;

-- Public can view unclaimed legacy points for leaderboard
CREATE POLICY "Public can view legacy leaderboard" ON legacy_spa_points
    FOR SELECT
    USING (TRUE);

-- Only service role can insert/update legacy points
CREATE POLICY "Service role can manage legacy points" ON legacy_spa_points
    FOR ALL
    USING (auth.role() = 'service_role');

-- 6. Insert the actual leaderboard data
INSERT INTO legacy_spa_points (position_rank, full_name, nick_name, spa_points, facebook_url) VALUES
(1, 'ĐĂNG RT', 'ĐĂNG RT', 3600, 'https://www.facebook.com/dpmd.3011'),
(2, 'KHÁNH HOÀNG', 'KHÁNH HOÀNG', 3500, 'https://www.facebook.com/khanh.hoang.14979'),
(3, 'THÙY LINH', 'THÙY LINH', 3450, 'https://www.facebook.com/thuy.linh.196744'),
(4, 'BEN HUYNH', 'BEN SABO', 2300, 'https://www.facebook.com/ben.huynh.99999/'),
(5, 'TRƯỜNG PHÚC', 'TRƯỜNG PHÚC', 2300, 'https://www.facebook.com/truong.phuc.326252'),
(6, 'HUY HÙNG', 'HUY HÙNG', 2100, 'https://www.facebook.com/hung.nguyenhuy.9277583'),
(7, 'BI SỨA', 'BI SỨA', 2050, 'https://www.facebook.com/nam.hoang.635463'),
(8, 'LỌ LEM', 'LỌ LEM', 1650, 'https://www.facebook.com/lo.lem.278023'),
(9, 'NGÔ THẾ BĂNG', 'BẰNG NHIỆT', 1550, 'https://www.facebook.com/bang.ngothe.73'),
(10, 'NGỌC THỎ', 'THÀNH', 1450, 'https://www.facebook.com/ngocthanh.hoang.16906'),
(11, 'NGÔ LỚN', 'NGÔ LỚN', 1200, 'https://www.facebook.com/nho.bap.391'),
(12, 'HẢI BÉ', 'HẢI BÉ', 1150, 'https://www.facebook.com/ailammoc.805340'),
(13, 'VIỆT NHÍM', 'VIỆT NHÍM', 1100, 'https://www.facebook.com/quocviet95media'),
(14, 'ĐẶNG THỦY', 'ĐẶNG THỦY', 1100, 'https://www.facebook.com/thuy.tilo'),
(15, 'QUỐC MINH', 'QUỐC MINH', 500, 'https://www.facebook.com/ng.quoc.minh.933306'),
(16, 'KHÁ NGUYỄN', 'KHÁ NGUYỄN', 500, 'https://www.facebook.com/khanguyen27092000'),
(17, 'NAM DƯƠNG', 'NAM DƯƠNG', 500, 'https://www.facebook.com/pham.nam.duong.272676'),
(18, 'LÊ VƯƠNG', 'LÊ VƯƠNG', 350, 'https://www.facebook.com/le.vuong.665430'),
(19, 'MAI MÈO', 'MAI MÈO', 300, 'https://www.facebook.com/suongmai.nguyen.9615'),
(20, 'QUÂN TRÔI', 'ANH QUÂN', 300, 'https://www.facebook.com/nguyen.anh.quan.528335'),
(21, 'CHỊ DUNG', 'CHỊ DUNG', 150, 'https://www.facebook.com/angel.tran.9212'),
(22, 'NHÂN LÊ', 'NHÂN LÊ', 150, 'https://www.facebook.com/trieu.van.652085'),
(23, 'HIẾU NGUYỄN', 'HIẾU NGUYỄN', 150, 'https://www.facebook.com/hieunguyen.840922'),
(24, 'KEN', 'KEN', 150, 'https://www.facebook.com/formen.ken'),
(25, 'NGHIÊM', 'NGHIÊM', 150, 'https://www.facebook.com/HoangNghiem2307'),
(26, 'QUANG NHẬT', 'QUANG NHẬT', 150, 'https://www.facebook.com/quang.nhat.808703'),
(27, 'DUY NGUYỄN', 'DUY NGUYỄN', 150, 'https://www.facebook.com/nguyen.uc.duy.503201'),
(28, 'ĐÌNH DŨNG', 'ĐÌNH DŨNG', 150, 'https://www.facebook.com/toilaaivtvn'),
(29, 'HUY TRAN', 'HUY TRAN', 150, 'https://www.facebook.com/tran.huy.607959'),
(30, 'MINH', 'MINH', 150, 'https://www.facebook.com/minh.minh.334139'),
(31, 'SỸ NGUYÊN', 'NGUYÊN', 150, 'https://www.facebook.com/sy.nguyen.116671'),
(32, 'PHÚC NHỎ', 'PHÚC NHỎ', 150, 'https://www.facebook.com/phuc.nho.455054'),
(33, 'TIẾN BỊP', 'TIẾN BỊP', 150, 'https://www.facebook.com/linheica23'),
(34, 'TIẾN LƯƠNG', 'TIẾN LƯƠNG', 150, 'https://www.facebook.com/luong.tien.862707'),
(35, 'TN.MINH ĐỨC', 'TN.MINH ĐỨC', 150, 'https://www.facebook.com/truong.nguyen.minh.uc.70129'),
(36, 'TUẤN PHONG', 'TUẤN PHONG', 150, 'https://www.facebook.com/sasori.da.xichsa'),
(37, 'THANH', 'THANH', 150, 'https://www.facebook.com/le.trong.thanh.283820'),
(38, 'QUỐC BÉP', 'QUỐC EM', 150, 'https://www.facebook.com/quoc.em.132489'),
(39, 'LIÊM CON', 'LIÊM CON', 150, 'https://www.facebook.com/huynh.thanh.liem.646564'),
(40, 'TRẦN MINH', 'MINH', 150, 'https://www.facebook.com/groups/1057568155407784/user/100070042594003/'),
(41, 'VIỆT ANH', 'VIỆT ANH', 150, 'https://www.facebook.com/nguyen.vietanh.521441'),
(42, 'TUẤN IT NÓI', 'TUẤN', 150, 'https://www.facebook.com/le.minh.tuan.285386'),
(43, 'TUẤN', 'TUÂN XÍ LỤM', 150, 'https://www.facebook.com/thanh.tuan.796723'),
(44, 'N.LONG', 'NHẬT LONG', 150, 'https://www.facebook.com/long.ares.334'),
(45, 'H.LONG', 'HOÀNG LONG', 150, 'https://www.facebook.com/hlonq2711');

-- 7. Add comments for documentation
COMMENT ON TABLE legacy_spa_points IS 'Stores SPA points from the old manual leaderboard system, allows users to claim their points when they register';
COMMENT ON FUNCTION claim_legacy_spa_points IS 'Allows users to claim their SPA points from the legacy system using name or Facebook URL';
COMMENT ON VIEW public_spa_leaderboard IS 'Combined leaderboard showing both registered users and legacy unclaimed points';

-- 8. Create function to get leaderboard stats
CREATE OR REPLACE FUNCTION get_legacy_spa_stats()
RETURNS TABLE (
    total_players INTEGER,
    claimed_players INTEGER,
    unclaimed_players INTEGER,
    total_spa_points INTEGER,
    claimed_spa_points INTEGER,
    unclaimed_spa_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_players,
        COUNT(CASE WHEN claimed THEN 1 END)::INTEGER as claimed_players,
        COUNT(CASE WHEN NOT claimed THEN 1 END)::INTEGER as unclaimed_players,
        SUM(spa_points)::INTEGER as total_spa_points,
        SUM(CASE WHEN claimed THEN spa_points ELSE 0 END)::INTEGER as claimed_spa_points,
        SUM(CASE WHEN NOT claimed THEN spa_points ELSE 0 END)::INTEGER as unclaimed_spa_points
    FROM legacy_spa_points;
END;
$$ LANGUAGE plpgsql;
