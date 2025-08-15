-- Script kiểm tra và bổ sung đầy đủ các cột cho bảng tournaments
-- Chạy trên Supabase Dashboard với service_role

-- 1. KIỂM TRA CẤU TRÚC HIỆN TẠI
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. BỔ SUNG TẤT CẢ CÁC CỘT CẦN THIẾT
DO $$ 
BEGIN
    -- Thêm prize_distribution (JSONB) nếu chưa có
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'prize_distribution'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN prize_distribution JSONB DEFAULT NULL;
        RAISE NOTICE 'Added column: prize_distribution';
    END IF;

    -- Thêm rank requirements nếu chưa có
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'min_rank_requirement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN min_rank_requirement TEXT DEFAULT NULL;
        RAISE NOTICE 'Added column: min_rank_requirement';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'max_rank_requirement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN max_rank_requirement TEXT DEFAULT NULL;
        RAISE NOTICE 'Added column: max_rank_requirement';
    END IF;

    -- Thêm tournament settings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'has_third_place_match'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN has_third_place_match BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column: has_third_place_match';
    END IF;

    -- Thêm approval settings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'requires_approval'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column: requires_approval';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added column: is_public';
    END IF;

    -- Thêm banner image
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'banner_image'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN banner_image TEXT DEFAULT NULL;
        RAISE NOTICE 'Added column: banner_image';
    END IF;

    -- Thêm organizer info
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'organizer_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN organizer_id UUID DEFAULT NULL;
        RAISE NOTICE 'Added column: organizer_id';
    END IF;

    -- Thêm management status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'management_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN management_status TEXT DEFAULT 'open' CHECK (management_status IN ('open', 'locked', 'ongoing', 'completed'));
        RAISE NOTICE 'Added column: management_status';
    END IF;

    -- Thêm registration fields nếu chưa có
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'registration_start'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN registration_start TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added column: registration_start';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'registration_end'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN registration_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days';
        RAISE NOTICE 'Added column: registration_end';
    END IF;

    -- Thêm venue_address nếu chưa có (có thể đã có là venue_name)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'venue_address'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN venue_address TEXT DEFAULT NULL;
        RAISE NOTICE 'Added column: venue_address';
    END IF;

    -- Thêm tier_level nếu chưa có
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'tier_level'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN tier_level TEXT DEFAULT NULL;
        RAISE NOTICE 'Added column: tier_level';
    END IF;

    -- Đảm bảo contact_info là JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'contact_info'
        AND data_type != 'jsonb'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ALTER COLUMN contact_info TYPE JSONB USING contact_info::JSONB;
        RAISE NOTICE 'Updated contact_info to JSONB';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'contact_info'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tournaments 
        ADD COLUMN contact_info JSONB DEFAULT '{}';
        RAISE NOTICE 'Added column: contact_info';
    END IF;

END $$;

-- 3. TẠO CÁC INDEX CẦN THIẾT
CREATE INDEX IF NOT EXISTS idx_tournaments_prize_distribution_gin 
ON tournaments USING GIN (prize_distribution);

CREATE INDEX IF NOT EXISTS idx_tournaments_status 
ON tournaments (status);

CREATE INDEX IF NOT EXISTS idx_tournaments_tournament_type 
ON tournaments (tournament_type);

CREATE INDEX IF NOT EXISTS idx_tournaments_game_format 
ON tournaments (game_format);

CREATE INDEX IF NOT EXISTS idx_tournaments_club_id 
ON tournaments (club_id);

CREATE INDEX IF NOT EXISTS idx_tournaments_created_by 
ON tournaments (created_by);

CREATE INDEX IF NOT EXISTS idx_tournaments_dates 
ON tournaments (tournament_start, tournament_end);

CREATE INDEX IF NOT EXISTS idx_tournaments_registration_dates 
ON tournaments (registration_start, registration_end);

-- 4. KIỂM TRA LẠI CẤU TRÚC SAU KHI THÊM
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. HIỂN THỊ TỔNG SỐ CỘT
SELECT COUNT(*) as total_columns 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND table_schema = 'public';
