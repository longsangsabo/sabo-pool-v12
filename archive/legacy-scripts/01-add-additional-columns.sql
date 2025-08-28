-- SCRIPT 1: THÊM CÁC TRƯỜNG BỔ SUNG VÀO BẢNG TOURNAMENTS
-- ===========================================================
-- Chạy trên Supabase SQL Editor với service_role

-- Kiểm tra các cột hiện tại
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Thêm các trường bổ sung để form đầy đủ hơn
DO $$ 
BEGIN
    -- 1. venue_name - Tên địa điểm (khác với venue_address)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'venue_name'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN venue_name VARCHAR(200);
        RAISE NOTICE '✅ Added venue_name column';
    ELSE
        RAISE NOTICE '⚠️ venue_name already exists';
    END IF;

    -- 2. is_public - Giải đấu công khai hay riêng tư
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added is_public column';
    ELSE
        RAISE NOTICE '⚠️ is_public already exists';
    END IF;

    -- 3. requires_approval - Cần phê duyệt đăng ký
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'requires_approval'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added requires_approval column';
    ELSE
        RAISE NOTICE '⚠️ requires_approval already exists';
    END IF;

    -- 4. tier_level - Cấp độ giải đấu (Tier 1, 2, 3...)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'tier_level'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN tier_level VARCHAR(20) CHECK (tier_level IN ('tier_1', 'tier_2', 'tier_3', 'amateur', 'professional'));
        RAISE NOTICE '✅ Added tier_level column';
    ELSE
        RAISE NOTICE '⚠️ tier_level already exists';
    END IF;

    -- 5. allow_all_ranks - Cho phép tất cả rank tham gia
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'allow_all_ranks'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN allow_all_ranks BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added allow_all_ranks column';
    ELSE
        RAISE NOTICE '⚠️ allow_all_ranks already exists';
    END IF;

    -- 6. eligible_ranks - Danh sách các rank được phép (JSON array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'eligible_ranks'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN eligible_ranks JSONB DEFAULT '[]';
        RAISE NOTICE '✅ Added eligible_ranks column';
    ELSE
        RAISE NOTICE '⚠️ eligible_ranks already exists';
    END IF;

    -- 7. organizer_id - ID người tổ chức chính thức (khác created_by)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'organizer_id'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN organizer_id UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ Added organizer_id column';
    ELSE
        RAISE NOTICE '⚠️ organizer_id already exists';
    END IF;

    -- 8. banner_image - URL ảnh banner cho giải đấu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'banner_image'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN banner_image TEXT;
        RAISE NOTICE '✅ Added banner_image column';
    ELSE
        RAISE NOTICE '⚠️ banner_image already exists';
    END IF;

    -- 9. registration_fee - Phí đăng ký riêng (khác entry_fee)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'registration_fee'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN registration_fee DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE '✅ Added registration_fee column';
    ELSE
        RAISE NOTICE '⚠️ registration_fee already exists';
    END IF;

    -- 10. tournament_format_details - Chi tiết format giải đấu (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'tournament_format_details'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN tournament_format_details JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Added tournament_format_details column';
    ELSE
        RAISE NOTICE '⚠️ tournament_format_details already exists';
    END IF;

    -- 11. special_rules - Các quy định đặc biệt (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'special_rules'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN special_rules JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Added special_rules column';
    ELSE
        RAISE NOTICE '⚠️ special_rules already exists';
    END IF;

    -- 12. contact_person - Người liên hệ
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'contact_person'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN contact_person VARCHAR(100);
        RAISE NOTICE '✅ Added contact_person column';
    ELSE
        RAISE NOTICE '⚠️ contact_person already exists';
    END IF;

    -- 13. contact_phone - Số điện thoại liên hệ
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN contact_phone VARCHAR(20);
        RAISE NOTICE '✅ Added contact_phone column';
    ELSE
        RAISE NOTICE '⚠️ contact_phone already exists';
    END IF;

    -- 14. live_stream_url - URL live stream
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'live_stream_url'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN live_stream_url TEXT;
        RAISE NOTICE '✅ Added live_stream_url column';
    ELSE
        RAISE NOTICE '⚠️ live_stream_url already exists';
    END IF;

    -- 15. sponsor_info - Thông tin nhà tài trợ (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'sponsor_info'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN sponsor_info JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Added sponsor_info column';
    ELSE
        RAISE NOTICE '⚠️ sponsor_info already exists';
    END IF;

    RAISE NOTICE '🎉 COMPLETED: All additional columns processed!';
END $$;

-- Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_tournaments_tier_level ON tournaments(tier_level);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_public ON tournaments(is_public);
CREATE INDEX IF NOT EXISTS idx_tournaments_requires_approval ON tournaments(requires_approval);
CREATE INDEX IF NOT EXISTS idx_tournaments_allow_all_ranks ON tournaments(allow_all_ranks);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON tournaments(organizer_id);

-- GIN indexes cho JSONB columns
CREATE INDEX IF NOT EXISTS idx_tournaments_eligible_ranks_gin ON tournaments USING GIN(eligible_ranks);
CREATE INDEX IF NOT EXISTS idx_tournaments_tournament_format_details_gin ON tournaments USING GIN(tournament_format_details);
CREATE INDEX IF NOT EXISTS idx_tournaments_special_rules_gin ON tournaments USING GIN(special_rules);
CREATE INDEX IF NOT EXISTS idx_tournaments_sponsor_info_gin ON tournaments USING GIN(sponsor_info);

-- Kiểm tra kết quả
DO $$
BEGIN
    RAISE NOTICE '🔍 Checking final column list...';
END $$;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Final completion notice
DO $$
BEGIN
    RAISE NOTICE '✅ SCRIPT 1 COMPLETED: Additional columns added successfully!';
END $$;
