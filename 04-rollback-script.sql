-- SCRIPT 4: ROLLBACK - KHÔI PHỤC LẠI NẾU CẦN
-- ==========================================
-- Chỉ chạy script này nếu cần rollback các thay đổi

-- WARNING: Script này sẽ hoàn tác tất cả thay đổi từ các script trước
-- Chỉ chạy khi thực sự cần thiết!

DO $$ 
BEGIN
    RAISE NOTICE '⚠️ WARNING: Starting rollback process...';
    RAISE NOTICE '⚠️ This will undo all changes from previous scripts!';
    
    -- Đợi 5 giây để user có thể cancel
    PERFORM pg_sleep(5);
END $$;

-- 1. XÓA TRIGGER TRƯỚC (để tránh dependency error)
DROP TRIGGER IF EXISTS tournaments_updated_at_trigger ON tournaments;

-- 2. XÓA VIEW ĐÃ TẠO
DROP VIEW IF EXISTS tournaments_with_prize_info;

-- 3. XÓA CÁC FUNCTION ĐÃ TẠO (sau khi xóa trigger)
DROP FUNCTION IF EXISTS get_tournament_champion_prize(UUID);
DROP FUNCTION IF EXISTS get_tournament_total_positions(UUID);
DROP FUNCTION IF EXISTS validate_prize_distribution(JSONB);
DROP FUNCTION IF EXISTS create_default_prize_distribution(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_tournaments_updated_at();

-- 4. KHÔI PHỤC CÁC CỘT ĐÃ XÓA (NẾU CÓ BACKUP)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments_backup_cleanup') THEN
        -- Thêm lại các cột đã xóa
        ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS first_prize DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS second_prize DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS third_prize DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
        ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
        ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS comprehensive_rewards JSONB DEFAULT '{}';
        
        -- Khôi phục dữ liệu từ backup
        UPDATE tournaments t
        SET 
            first_prize = b.first_prize,
            second_prize = b.second_prize,
            third_prize = b.third_prize,
            start_date = b.start_date,
            end_date = b.end_date,
            comprehensive_rewards = b.comprehensive_rewards
        FROM tournaments_backup_cleanup b
        WHERE t.id = b.id;
        
        RAISE NOTICE '✅ Restored columns from backup';
    ELSE
        RAISE NOTICE '❌ No backup table found - cannot restore deleted columns';
    END IF;
END $$;

-- 5. XÓA CÁC CỘT BỔ SUNG ĐÃ THÊM
ALTER TABLE tournaments DROP COLUMN IF EXISTS venue_name;
ALTER TABLE tournaments DROP COLUMN IF EXISTS registration_fee;
ALTER TABLE tournaments DROP COLUMN IF EXISTS tournament_format_details;
ALTER TABLE tournaments DROP COLUMN IF EXISTS special_rules;
ALTER TABLE tournaments DROP COLUMN IF EXISTS contact_person;
ALTER TABLE tournaments DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE tournaments DROP COLUMN IF EXISTS live_stream_url;
ALTER TABLE tournaments DROP COLUMN IF EXISTS sponsor_info;

-- 6. XÓA CÁC CONSTRAINT ĐÃ THÊM
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_tier_level_check;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_date_order_check;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_registration_date_check;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_participants_check;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_prize_pool_check;

-- 7. XÓA CÁC INDEX ĐÃ TẠO
DROP INDEX IF EXISTS idx_tournaments_tier_level;
DROP INDEX IF EXISTS idx_tournaments_is_public;
DROP INDEX IF EXISTS idx_tournaments_requires_approval;
DROP INDEX IF EXISTS idx_tournaments_allow_all_ranks;
DROP INDEX IF EXISTS idx_tournaments_organizer_id;
DROP INDEX IF EXISTS idx_tournaments_eligible_ranks_gin;
DROP INDEX IF EXISTS idx_tournaments_tournament_format_details_gin;
DROP INDEX IF EXISTS idx_tournaments_special_rules_gin;
DROP INDEX IF EXISTS idx_tournaments_sponsor_info_gin;

-- 8. RESET CÁC GIÁ TRỊ MẶC ĐỊNH
UPDATE tournaments SET
    is_public = NULL,
    requires_approval = NULL,
    allow_all_ranks = NULL,
    eligible_ranks = NULL,
    organizer_id = NULL,
    banner_image = NULL;

-- 9. XÓA BẢNG BACKUP
DROP TABLE IF EXISTS tournaments_backup_cleanup;

-- 10. KIỂM TRA KẾT QUẢ ROLLBACK
SELECT 
    'COLUMNS AFTER ROLLBACK:' as info,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'tournaments';

SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Final rollback notices
DO $$
BEGIN
    RAISE NOTICE '🔄 ROLLBACK COMPLETED!';
    RAISE NOTICE '⚠️ All changes have been reverted';
    RAISE NOTICE '📊 Check column list above to verify rollback';
END $$;
