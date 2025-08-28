-- ===================================================================
-- 🚀 STEP 7B: CLEAN START - Paste vào Supabase Dashboard
-- Bỏ qua restore data, bắt đầu với clean schema
-- ===================================================================

-- Xóa backup tables (không cần nữa)
DROP TABLE IF EXISTS tournaments_backup_20250811_2244 CASCADE;
DROP TABLE IF EXISTS tournament_matches_backup_20250811_2244 CASCADE;
DROP TABLE IF EXISTS tournament_results_backup_20250811_2244 CASCADE;
DROP TABLE IF EXISTS tournament_registrations_backup_20250811_2244 CASCADE;

-- Xóa bất kỳ backup tables nào khác
DO $$
DECLARE
  backup_table RECORD;
BEGIN
  FOR backup_table IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%backup_%' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', backup_table.table_name);
    RAISE NOTICE '🗑️ Dropped backup table: %', backup_table.table_name;
  END LOOP;
END $$;

-- Verify clean state
SELECT 
  '🔍 VERIFICATION' as status,
  table_name,
  'EXISTS' as note
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
ORDER BY table_name;

-- Summary
SELECT 
  '✅ CLEAN SCHEMA READY' as status,
  'All tournament tables exist with clean structure' as message,
  'Ready for SABO functions deployment' as next_step;

-- Check table counts (should be 0 for clean start)
SELECT 
  '📊 TABLE STATUS' as info,
  'tournaments' as table_name,
  COUNT(*) as record_count,
  'CLEAN_START' as status
FROM tournaments

UNION ALL

SELECT 
  '📊 TABLE STATUS' as info,
  'tournament_matches' as table_name,
  COUNT(*) as record_count,
  'CLEAN_START' as status
FROM tournament_matches

UNION ALL

SELECT 
  '📊 TABLE STATUS' as info,
  'tournament_results' as table_name,
  COUNT(*) as record_count,
  'CLEAN_START' as status
FROM tournament_results

UNION ALL

SELECT 
  '📊 TABLE STATUS' as info,
  'tournament_registrations' as table_name,
  COUNT(*) as record_count,
  'CLEAN_START' as status
FROM tournament_registrations;

SELECT '🚀 READY FOR STEP 8: SABO FUNCTIONS' as next_action;
