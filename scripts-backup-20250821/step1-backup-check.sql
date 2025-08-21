-- ===================================================================
-- 🛡️ BACKUP SCRIPT - Chạy trước khi deploy migrations
-- Copy và paste vào Supabase Dashboard > SQL Editor
-- ===================================================================

-- 📋 STEP 1A: Check current data volume
SELECT 
  'CURRENT_DATA_OVERVIEW' as check_type,
  'tournaments' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM tournaments
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'CURRENT_DATA_OVERVIEW' as check_type,
  'tournament_matches' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM tournament_matches

UNION ALL

SELECT 
  'CURRENT_DATA_OVERVIEW' as check_type,
  'tournament_results' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM tournament_results;

-- 📋 STEP 1B: Manual backup tables (will be auto-created in migration, but good to check)
SELECT 
  'BACKUP_VERIFICATION' as status,
  table_name,
  CASE WHEN table_name LIKE '%backup%' THEN 'BACKUP_EXISTS' ELSE 'MAIN_TABLE' END as table_type
FROM information_schema.tables 
WHERE table_name LIKE '%tournament%' 
  AND table_schema = 'public'
ORDER BY table_name;
