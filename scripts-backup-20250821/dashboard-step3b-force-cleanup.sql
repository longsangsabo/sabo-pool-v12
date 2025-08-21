-- ===================================================================
-- 🧹 STEP 3B: FORCE CLEANUP - Paste vào Supabase Dashboard
-- Drop existing tournament tables để tạo lại clean schema
-- ===================================================================

-- Disable RLS trước khi drop
ALTER TABLE IF EXISTS tournament_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tournament_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tournament_registrations DISABLE ROW LEVEL SECURITY;

-- Drop existing tables (trong thứ tự phụ thuộc)
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS tournament_results CASCADE;
DROP TABLE IF EXISTS tournament_registrations CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Verify tables đã bị xóa
SELECT 
  '🔍 VERIFICATION' as status,
  table_name,
  'STILL_EXISTS' as note
FROM information_schema.tables 
WHERE table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND table_schema = 'public'
ORDER BY table_name;

-- If no rows returned = SUCCESS
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ ALL TOURNAMENT TABLES DROPPED SUCCESSFULLY'
    ELSE '❌ ' || COUNT(*) || ' TABLES STILL EXIST'
  END as cleanup_result
FROM information_schema.tables 
WHERE table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND table_schema = 'public';

SELECT '🚀 Ready for clean table creation' as next_step;
