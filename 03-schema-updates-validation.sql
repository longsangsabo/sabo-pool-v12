-- SCRIPT 3: CẬP NHẬT FORM SCHEMA VÀ VALIDATION
-- ==============================================
-- Script này để update các schema và validation sau khi database đã được cleanup

-- 1. CẬP NHẬT CÁC CONSTRAINT CHO CÁC CỘT MỚI
DO $$ 
BEGIN
    RAISE NOTICE 'Adding constraints and validations...';

    -- Constraint cho tier_level
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'tournaments_tier_level_check'
    ) THEN
        ALTER TABLE tournaments 
        ADD CONSTRAINT tournaments_tier_level_check 
        CHECK (tier_level IN ('tier_1', 'tier_2', 'tier_3', 'amateur', 'professional') OR tier_level IS NULL);
        RAISE NOTICE '✅ Added tier_level constraint';
    END IF;

    -- Constraint cho tournament dates
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'tournaments_date_order_check'
    ) THEN
        ALTER TABLE tournaments 
        ADD CONSTRAINT tournaments_date_order_check 
        CHECK (tournament_end > tournament_start);
        RAISE NOTICE '✅ Added date order constraint';
    END IF;

    -- Constraint cho registration dates
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'tournaments_registration_date_check'
    ) THEN
        ALTER TABLE tournaments 
        ADD CONSTRAINT tournaments_registration_date_check 
        CHECK (registration_end > registration_start AND registration_end <= tournament_start);
        RAISE NOTICE '✅ Added registration date constraint';
    END IF;

    -- Constraint cho participants
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'tournaments_participants_check'
    ) THEN
        ALTER TABLE tournaments 
        ADD CONSTRAINT tournaments_participants_check 
        CHECK (max_participants >= 4 AND max_participants <= 64 AND current_participants <= max_participants);
        RAISE NOTICE '✅ Added participants constraint';
    END IF;

    -- Constraint cho prize_pool
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'tournaments_prize_pool_check'
    ) THEN
        ALTER TABLE tournaments 
        ADD CONSTRAINT tournaments_prize_pool_check 
        CHECK (prize_pool >= 0 AND entry_fee >= 0);
        RAISE NOTICE '✅ Added prize pool constraint';
    END IF;

END $$;

-- 2. TẠO CÁC FUNCTION HỖ TRỢ CHO PRIZE DISTRIBUTION
CREATE OR REPLACE FUNCTION get_tournament_champion_prize(tournament_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT (prize_distribution -> 'positions' -> 0 ->> 'cash_amount')::int
        FROM tournaments 
        WHERE id = tournament_id
        AND prize_distribution IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tournament_total_positions(tournament_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT (prize_distribution ->> 'total_positions')::int
        FROM tournaments 
        WHERE id = tournament_id
        AND prize_distribution IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_prize_distribution(prize_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Kiểm tra structure cơ bản
    IF prize_data IS NULL OR NOT (prize_data ? 'positions') THEN
        RETURN false;
    END IF;
    
    -- Kiểm tra positions array
    IF jsonb_typeof(prize_data -> 'positions') != 'array' THEN
        RETURN false;
    END IF;
    
    -- Kiểm tra mỗi position có đủ fields
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(prize_data -> 'positions') AS pos
        WHERE NOT (pos ? 'position' AND pos ? 'position_name' AND pos ? 'cash_amount')
    ) THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 3. TẠO VIEW ĐỂ DỄ QUERY HỢN
CREATE OR REPLACE VIEW tournaments_with_prize_info AS
SELECT 
    t.*,
    (t.prize_distribution ->> 'total_positions')::int as total_prize_positions,
    (t.prize_distribution ->> 'total_prize_amount')::int as calculated_prize_amount,
    (t.prize_distribution -> 'positions' -> 0 ->> 'cash_amount')::int as champion_prize,
    (t.prize_distribution -> 'positions' -> 0 ->> 'position_name') as champion_title,
    CASE 
        WHEN t.prize_distribution IS NOT NULL AND jsonb_array_length(t.prize_distribution -> 'positions') > 0 
        THEN true 
        ELSE false 
    END as has_prize_distribution,
    CASE
        WHEN t.registration_start <= NOW() AND t.registration_end >= NOW() THEN 'open'
        WHEN t.registration_end < NOW() THEN 'closed'
        WHEN t.registration_start > NOW() THEN 'not_started'
        ELSE 'unknown'
    END as registration_status,
    (t.max_participants - t.current_participants) as available_slots
FROM tournaments t;

-- 4. TẠO TRIGGER ĐỂ TỰ ĐỘNG CẬP NHẬT updated_at
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tournaments_updated_at_trigger ON tournaments;
CREATE TRIGGER tournaments_updated_at_trigger
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_tournaments_updated_at();

-- 5. TẠO FUNCTION ĐỂ TẠO DEFAULT PRIZE DISTRIBUTION
CREATE OR REPLACE FUNCTION create_default_prize_distribution(
    tournament_id UUID,
    total_prize_amount INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 16
)
RETURNS JSONB AS $$
DECLARE
    positions_data JSONB := '[]';
    position_names TEXT[] := ARRAY['Vô địch', 'Á quân', 'Hạng 3', 'Hạng 4', 'Hạng 5', 'Hạng 6', 'Hạng 7', 'Hạng 8', 'Hạng 9', 'Hạng 10', 'Hạng 11', 'Hạng 12', 'Hạng 13', 'Hạng 14', 'Hạng 15', 'Hạng 16'];
    prize_amounts INTEGER[] := ARRAY[800000, 500000, 300000, 200000, 150000, 100000, 80000, 60000, 50000, 40000, 30000, 25000, 20000, 15000, 10000, 5000];
    elo_points INTEGER[] := ARRAY[100, 80, 60, 50, 40, 35, 30, 25, 20, 18, 15, 12, 10, 8, 5, 3];
    color_themes TEXT[] := ARRAY['#FFD700', '#C0C0C0', '#CD7F32', '#4A90E2', '#50C878', '#FF6B6B', '#9B59B6', '#F39C12', '#1ABC9C', '#E74C3C', '#34495E', '#95A5A6', '#2C3E50', '#8E44AD', '#27AE60', '#E67E22'];
    i INTEGER;
    num_positions INTEGER := LEAST(max_participants, 16);
BEGIN
    -- Tạo positions array
    FOR i IN 1..num_positions LOOP
        positions_data := positions_data || jsonb_build_object(
            'position', i,
            'position_name', position_names[i],
            'cash_amount', CASE 
                WHEN total_prize_amount > 0 THEN 
                    ROUND(total_prize_amount * (prize_amounts[i]::float / 2000000))
                ELSE prize_amounts[i] 
            END,
            'elo_points', elo_points[i],
            'spa_points', ROUND(elo_points[i] * 0.5),
            'physical_items', CASE 
                WHEN i <= 3 THEN ARRAY['Cup ' || CASE WHEN i=1 THEN 'vàng' WHEN i=2 THEN 'bạc' ELSE 'đồng' END]
                ELSE ARRAY[]::TEXT[]
            END,
            'is_visible', true,
            'color_theme', color_themes[i]
        );
    END LOOP;

    -- Return complete structure
    RETURN jsonb_build_object(
        'total_positions', num_positions,
        'total_prize_amount', total_prize_amount,
        'positions', positions_data,
        'prize_summary', (
            SELECT jsonb_object_agg('position_' || (pos ->> 'position'), (pos ->> 'cash_amount')::int)
            FROM jsonb_array_elements(positions_data) pos
        ),
        'metadata', jsonb_build_object(
            'created_at', NOW(),
            'template_type', 'standard',
            'auto_generated', true,
            'tournament_id', tournament_id
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 6. DEMO VÀ KIỂM TRA
SELECT 'TESTING NEW FUNCTIONS:' as info;

-- Test tạo prize distribution mẫu
SELECT create_default_prize_distribution(
    '00000000-0000-0000-0000-000000000000'::uuid,
    2000000,
    16
) as sample_prize_distribution;

-- Kiểm tra view
SELECT COUNT(*) as tournaments_count FROM tournaments_with_prize_info;

-- Kiểm tra constraints
SELECT 
    constraint_name,
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'tournaments'
ORDER BY constraint_name;

-- Final completion notices
DO $$
BEGIN
    RAISE NOTICE '🎉 SCRIPT 3 COMPLETED: Schema updates and validations added!';
    RAISE NOTICE '📊 New functions available: get_tournament_champion_prize, get_tournament_total_positions, validate_prize_distribution, create_default_prize_distribution';
    RAISE NOTICE '👀 New view available: tournaments_with_prize_info';
    RAISE NOTICE '🔒 Constraints and triggers added for data integrity';
END $$;
