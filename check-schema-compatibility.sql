-- ============================================================================
-- CHECK DATABASE SCHEMA COMPATIBILITY
-- ============================================================================

-- 1. Check if tournaments table exists and its columns
SELECT 'Checking tournaments table structure' as check_title;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tournaments'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if tournament_results table exists
SELECT 'Checking tournament_results table structure' as check_title;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tournament_results'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if tournament_matches table exists
SELECT 'Checking tournament_matches table structure' as check_title;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tournament_matches'
  AND table_schema = 'public'
  AND column_name IN ('round_number', 'status', 'winner_id', 'tournament_id')
ORDER BY ordinal_position;

-- 4. Check if tournament_registrations table exists
SELECT 'Checking tournament_registrations table structure' as check_title;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tournament_registrations'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Safe query for tournaments (using only guaranteed columns)
SELECT 'Safe tournaments query' as check_title;

SELECT 
  id,
  name,
  tournament_type,
  status,
  created_at,
  winner_id
FROM tournaments 
WHERE tournament_type IN ('sabo', 'double_elimination')
ORDER BY created_at DESC
LIMIT 3;

-- ============================================================================
-- SCHEMA COMPATIBILITY RESULTS
-- ============================================================================
-- Run this first to check what columns exist before running main test script
-- ============================================================================
