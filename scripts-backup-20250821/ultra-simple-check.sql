-- ============================================================================
-- ULTRA SIMPLE SCHEMA CHECK
-- ============================================================================

-- 1. Check if basic tables exist
SELECT 'Checking if tables exist' as check_type;

SELECT 
  'tournaments' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tournaments' AND table_schema = 'public'
  ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'tournament_results' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tournament_results' AND table_schema = 'public'
  ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'tournament_matches' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tournament_matches' AND table_schema = 'public'
  ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 2. Simple tournament count
SELECT 'Basic tournament count' as check_type;

SELECT COUNT(*) as total_tournaments FROM tournaments;

-- 3. SABO tournament count  
SELECT 'SABO tournament count' as check_type;

SELECT COUNT(*) as sabo_tournaments 
FROM tournaments 
WHERE tournament_type IN ('sabo', 'double_elimination');

-- 4. Tournament results count
SELECT 'Tournament results count' as check_type;

SELECT COUNT(*) as total_results FROM tournament_results;

-- 5. Sample tournament data (safe query)
SELECT 'Sample tournament data' as check_type;

SELECT 
  id,
  name,
  tournament_type,
  status
FROM tournaments 
ORDER BY created_at DESC 
LIMIT 3;

-- ============================================================================
-- This script uses only basic queries that should work with any schema
-- ============================================================================
