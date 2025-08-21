-- SCRIPT 2: DỌN DẸP CÁC CỘT TRÙNG LẶP TRONG BẢNG TOURNAMENTS
-- =============================================================
-- CHẠY SAU KHI ĐÃ CHẠY SCRIPT 1
-- Chạy trên Supabase SQL Editor với service_role

-- Kiểm tra dữ liệu trước khi xóa
SELECT 'Checking duplicate columns before cleanup...' as status;

-- 1. BACKUP DỮ LIỆU TRƯỚC KHI XÓA
DO $$ 
BEGIN
    -- Tạo bảng backup nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments_backup_cleanup') THEN
        CREATE TABLE tournaments_backup_cleanup AS 
        SELECT 
            id,
            first_prize,
            second_prize, 
            third_prize,
            start_date,
            end_date,
            comprehensive_rewards,
            created_at as backup_created_at
        FROM tournaments 
        WHERE first_prize IS NOT NULL 
           OR second_prize IS NOT NULL 
           OR third_prize IS NOT NULL
           OR start_date IS NOT NULL
           OR end_date IS NOT NULL
           OR comprehensive_rewards IS NOT NULL;
        
        RAISE NOTICE '✅ Backup table created with existing data';
    ELSE
        RAISE NOTICE '⚠️ Backup table already exists';
    END IF;
END $$;

-- 2. MIGRATE DỮ LIỆU TỪ CÁC CỘT CŨ SANG CỘT MỚI
DO $$
DECLARE
    rec RECORD;
    prize_data JSONB;
    positions_array JSONB := '[]';
BEGIN
    RAISE NOTICE 'Starting data migration from old columns to prize_distribution...';
    
    -- Migrate prize data từ first_prize, second_prize, third_prize -> prize_distribution
    FOR rec IN 
        SELECT id, first_prize, second_prize, third_prize, prize_pool
        FROM tournaments 
        WHERE (first_prize > 0 OR second_prize > 0 OR third_prize > 0)
        AND (prize_distribution IS NULL OR prize_distribution = '{}')
    LOOP
        -- Reset array
        positions_array := '[]';
        
        -- Add first prize
        IF rec.first_prize > 0 THEN
            positions_array := positions_array || jsonb_build_object(
                'position', 1,
                'position_name', 'Vô địch',
                'cash_amount', rec.first_prize,
                'elo_points', 100,
                'spa_points', 50,
                'is_visible', true,
                'color_theme', '#FFD700'
            );
        END IF;
        
        -- Add second prize  
        IF rec.second_prize > 0 THEN
            positions_array := positions_array || jsonb_build_object(
                'position', 2,
                'position_name', 'Á quân',
                'cash_amount', rec.second_prize,
                'elo_points', 80,
                'spa_points', 30,
                'is_visible', true,
                'color_theme', '#C0C0C0'
            );
        END IF;
        
        -- Add third prize
        IF rec.third_prize > 0 THEN
            positions_array := positions_array || jsonb_build_object(
                'position', 3,
                'position_name', 'Hạng 3',
                'cash_amount', rec.third_prize,
                'elo_points', 60,
                'spa_points', 20,
                'is_visible', true,
                'color_theme', '#CD7F32'
            );
        END IF;
        
        -- Build complete prize_distribution
        IF jsonb_array_length(positions_array) > 0 THEN
            prize_data := jsonb_build_object(
                'total_positions', jsonb_array_length(positions_array),
                'total_prize_amount', COALESCE(rec.prize_pool, rec.first_prize + rec.second_prize + rec.third_prize),
                'positions', positions_array,
                'metadata', jsonb_build_object(
                    'migrated_at', NOW(),
                    'source', 'legacy_prize_columns'
                )
            );
            
            -- Update tournament with migrated data
            UPDATE tournaments 
            SET prize_distribution = prize_data
            WHERE id = rec.id;
            
            RAISE NOTICE 'Migrated prizes for tournament: %', rec.id;
        END IF;
    END LOOP;
    
    -- Migrate start_date/end_date to tournament_start/tournament_end
    UPDATE tournaments 
    SET 
        tournament_start = COALESCE(tournament_start, start_date),
        tournament_end = COALESCE(tournament_end, end_date)
    WHERE (tournament_start IS NULL AND start_date IS NOT NULL)
       OR (tournament_end IS NULL AND end_date IS NOT NULL);
    
    RAISE NOTICE '✅ Data migration completed';
END $$;

-- 3. XÓA CÁC CỘT TRÙNG LẶP
DO $$ 
BEGIN
    RAISE NOTICE 'Starting cleanup of duplicate columns...';

    -- Drop first_prize column (thay bằng prize_distribution)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'first_prize'
    ) THEN
        ALTER TABLE tournaments DROP COLUMN first_prize;
        RAISE NOTICE '🗑️ Dropped first_prize column';
    END IF;

    -- Drop second_prize column (thay bằng prize_distribution)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'second_prize'
    ) THEN
        ALTER TABLE tournaments DROP COLUMN second_prize;
        RAISE NOTICE '🗑️ Dropped second_prize column';
    END IF;

    -- Drop third_prize column (thay bằng prize_distribution)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'third_prize'
    ) THEN
        ALTER TABLE tournaments DROP COLUMN third_prize;
        RAISE NOTICE '🗑️ Dropped third_prize column';
    END IF;

    -- Drop start_date column (thay bằng tournament_start)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE tournaments DROP COLUMN start_date;
        RAISE NOTICE '🗑️ Dropped start_date column';
    END IF;

    -- Drop end_date column (thay bằng tournament_end)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE tournaments DROP COLUMN end_date;
        RAISE NOTICE '🗑️ Dropped end_date column';
    END IF;

    -- Drop comprehensive_rewards column (thay bằng prize_distribution)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' AND column_name = 'comprehensive_rewards'
    ) THEN
        ALTER TABLE tournaments DROP COLUMN comprehensive_rewards;
        RAISE NOTICE '🗑️ Dropped comprehensive_rewards column';
    END IF;

    RAISE NOTICE '✅ Cleanup completed successfully!';
END $$;

-- 4. TỐI ƯU HÓA CÁC CỘT CÒN LẠI
DO $$
BEGIN
    RAISE NOTICE 'Optimizing remaining columns...';
    
    -- Cập nhật các giá trị mặc định hợp lý
    UPDATE tournaments 
    SET 
        is_public = COALESCE(is_public, true),
        requires_approval = COALESCE(requires_approval, false),
        allow_all_ranks = COALESCE(allow_all_ranks, true),
        has_third_place_match = COALESCE(has_third_place_match, true),
        eligible_ranks = COALESCE(eligible_ranks, '[]'::jsonb),
        physical_prizes = COALESCE(physical_prizes, '[]'::jsonb),
        spa_points_config = COALESCE(spa_points_config, '{}'::jsonb),
        elo_points_config = COALESCE(elo_points_config, '{}'::jsonb)
    WHERE updated_at < NOW();
    
    RAISE NOTICE '✅ Column optimization completed';
END $$;

-- 5. KIỂM TRA KẾT QUẢ
SELECT 'FINAL COLUMN LIST AFTER CLEANUP:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Kiểm tra số lượng tournaments có prize_distribution
SELECT 
    COUNT(*) as total_tournaments,
    COUNT(*) FILTER (WHERE prize_distribution IS NOT NULL) as tournaments_with_prizes,
    COUNT(*) FILTER (WHERE prize_distribution IS NULL OR prize_distribution = '{}') as tournaments_without_prizes
FROM tournaments;

-- Kiểm tra backup table
SELECT 
    'BACKUP TABLE RECORD COUNT:' as info,
    COUNT(*) as backup_records
FROM tournaments_backup_cleanup;

-- Final completion notices
DO $$
BEGIN
    RAISE NOTICE '🎉 SCRIPT 2 COMPLETED: Database cleanup successful!';
    RAISE NOTICE '💡 Backup data is stored in tournaments_backup_cleanup table';
    RAISE NOTICE '📊 Check the results above to verify the cleanup';
END $$;
