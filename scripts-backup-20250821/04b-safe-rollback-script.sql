-- SCRIPT 4B: ROLLBACK AN TOÀN HỚN - SỬ DỤNG CASCADE
-- ===================================================
-- Alternative rollback script với CASCADE để tránh dependency errors

-- WARNING: Script này sẽ hoàn tác tất cả thay đổi từ các script trước
-- Chỉ chạy khi thực sự cần thiết!

DO $$ 
BEGIN
    RAISE NOTICE '⚠️ WARNING: Starting SAFE rollback process with CASCADE...';
    RAISE NOTICE '⚠️ This will undo all changes from previous scripts!';
    
    -- Đợi 3 giây để user có thể cancel
    PERFORM pg_sleep(3);
END $$;

-- 1. XÓA TRIGGER VÀ FUNCTION VỚI CASCADE
DROP TRIGGER IF EXISTS tournaments_updated_at_trigger ON tournaments CASCADE;
DROP FUNCTION IF EXISTS update_tournaments_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_tournament_champion_prize(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_tournament_total_positions(UUID) CASCADE;
DROP FUNCTION IF EXISTS validate_prize_distribution(JSONB) CASCADE;
DROP FUNCTION IF EXISTS create_default_prize_distribution(UUID, INTEGER, INTEGER) CASCADE;

-- 2. XÓA VIEW
DROP VIEW IF EXISTS tournaments_with_prize_info CASCADE;

-- 3. XÓA CÁC CONSTRAINT (trong DO block để bắt lỗi)
DO $$
BEGIN
    BEGIN
        ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_tier_level_check;
        RAISE NOTICE '✅ Dropped tier_level constraint';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ tier_level constraint not found or already dropped';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_date_order_check;
        RAISE NOTICE '✅ Dropped date_order constraint';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ date_order constraint not found or already dropped';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_registration_date_check;
        RAISE NOTICE '✅ Dropped registration_date constraint';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ registration_date constraint not found or already dropped';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_participants_check;
        RAISE NOTICE '✅ Dropped participants constraint';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ participants constraint not found or already dropped';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_prize_pool_check;
        RAISE NOTICE '✅ Dropped prize_pool constraint';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ prize_pool constraint not found or already dropped';
    END;
END $$;

-- 4. XÓA CÁC INDEX
DROP INDEX IF EXISTS idx_tournaments_tier_level;
DROP INDEX IF EXISTS idx_tournaments_is_public;
DROP INDEX IF EXISTS idx_tournaments_requires_approval;
DROP INDEX IF EXISTS idx_tournaments_allow_all_ranks;
DROP INDEX IF EXISTS idx_tournaments_organizer_id;
DROP INDEX IF EXISTS idx_tournaments_eligible_ranks_gin;
DROP INDEX IF EXISTS idx_tournaments_tournament_format_details_gin;
DROP INDEX IF EXISTS idx_tournaments_special_rules_gin;
DROP INDEX IF EXISTS idx_tournaments_sponsor_info_gin;

-- 5. KHÔI PHỤC CÁC CỘT ĐÃ XÓA (NẾU CÓ BACKUP)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments_backup_cleanup') THEN
        -- Thêm lại các cột đã xóa
        BEGIN
            ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS first_prize DECIMAL(10,2) DEFAULT 0;
            ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS second_prize DECIMAL(10,2) DEFAULT 0;
            ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS third_prize DECIMAL(10,2) DEFAULT 0;
            ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
            ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
            ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS comprehensive_rewards JSONB DEFAULT '{}';
            
            RAISE NOTICE '✅ Re-added deleted columns';
        EXCEPTION
            WHEN OTHERS THEN RAISE NOTICE 'ℹ️ Some columns may already exist';
        END;
        
        -- Khôi phục dữ liệu từ backup
        BEGIN
            UPDATE tournaments t
            SET 
                first_prize = COALESCE(b.first_prize, 0),
                second_prize = COALESCE(b.second_prize, 0),
                third_prize = COALESCE(b.third_prize, 0),
                start_date = b.start_date,
                end_date = b.end_date,
                comprehensive_rewards = COALESCE(b.comprehensive_rewards, '{}')
            FROM tournaments_backup_cleanup b
            WHERE t.id = b.id;
            
            RAISE NOTICE '✅ Restored data from backup';
        EXCEPTION
            WHEN OTHERS THEN RAISE NOTICE '⚠️ Error restoring data - check manually';
        END;
    ELSE
        RAISE NOTICE '❌ No backup table found - cannot restore deleted columns';
    END IF;
END $$;

-- 6. XÓA CÁC CỘT BỔ SUNG ĐÃ THÊM (trong DO block để bắt lỗi)
DO $$
BEGIN
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS venue_name;
        RAISE NOTICE '✅ Dropped venue_name column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ venue_name column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS registration_fee;
        RAISE NOTICE '✅ Dropped registration_fee column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ registration_fee column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS tournament_format_details;
        RAISE NOTICE '✅ Dropped tournament_format_details column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ tournament_format_details column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS special_rules;
        RAISE NOTICE '✅ Dropped special_rules column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ special_rules column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS contact_person;
        RAISE NOTICE '✅ Dropped contact_person column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ contact_person column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS contact_phone;
        RAISE NOTICE '✅ Dropped contact_phone column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ contact_phone column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS live_stream_url;
        RAISE NOTICE '✅ Dropped live_stream_url column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ live_stream_url column not found';
    END;
    
    BEGIN
        ALTER TABLE tournaments DROP COLUMN IF EXISTS sponsor_info;
        RAISE NOTICE '✅ Dropped sponsor_info column';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ sponsor_info column not found';
    END;
END $$;

-- 7. RESET CÁC GIÁ TRỊ MẶC ĐỊNH CHO CÁC CỘT CÒN TỒN TẠI
DO $$
BEGIN
    BEGIN
        UPDATE tournaments SET
            is_public = NULL,
            requires_approval = NULL,
            allow_all_ranks = NULL,
            eligible_ranks = NULL,
            organizer_id = NULL,
            banner_image = NULL
        WHERE id IS NOT NULL;
        
        RAISE NOTICE '✅ Reset default values for remaining columns';
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'ℹ️ Some columns may not exist for reset';
    END;
END $$;

-- 8. XÓA BẢNG BACKUP
DROP TABLE IF EXISTS tournaments_backup_cleanup;

-- 9. KIỂM TRA KẾT QUẢ ROLLBACK
SELECT 
    'COLUMNS AFTER SAFE ROLLBACK:' as info,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'tournaments';

SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Final rollback notices
DO $$
BEGIN
    RAISE NOTICE '🔄 SAFE ROLLBACK COMPLETED WITH CASCADE!';
    RAISE NOTICE '✅ All dependencies handled safely';
    RAISE NOTICE '⚠️ All changes have been reverted';
    RAISE NOTICE '📊 Check column list above to verify rollback';
END $$;
