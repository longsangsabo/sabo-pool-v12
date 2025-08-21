-- ===================================================================
-- 🎯 STEP 1: BACKUP CHECK - Paste vào Supabase Dashboard
-- Chạy để kiểm tra dữ liệu hiện tại trước khi deploy
-- ===================================================================

-- Check current data volume
SELECT 
  '📊 CURRENT DATA OVERVIEW' as info,
  'tournaments' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN tournament_type = 'double_elimination' THEN 1 END) as double_elim_count,
  MAX(created_at) as latest_record
FROM tournaments
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  '📊 CURRENT DATA OVERVIEW' as info,
  'tournament_matches' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN round_number IN (1,2,3,101,102,103,201,202,250,300) THEN 1 END) as sabo_matches,
  MAX(created_at) as latest_record
FROM tournament_matches

UNION ALL

SELECT 
  '📊 CURRENT DATA OVERVIEW' as info,
  'tournament_results' as table_name,
  COUNT(*) as record_count,
  0 as sabo_matches,
  MAX(created_at) as latest_record
FROM tournament_results;

-- Check existing functions
SELECT 
  '🔧 SABO FUNCTIONS CHECK' as info,
  proname as function_name,
  'EXISTS' as status,
  pronargs as param_count
FROM pg_proc 
WHERE proname LIKE '%sabo%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
