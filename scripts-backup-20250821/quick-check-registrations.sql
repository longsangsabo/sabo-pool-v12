-- ============================================================================
-- QUICK CHECK FOR TOURNAMENT_REGISTRATIONS TABLE
-- ============================================================================

-- 1. Check if tournament_registrations table exists
SELECT 'Checking tournament_registrations table structure' as check_title;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tournament_registrations'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check sample data
SELECT 'Sample tournament_registrations data' as check_title;

SELECT 
  tournament_id,
  user_id,
  status,
  created_at
FROM tournament_registrations 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check registrations count by tournament
SELECT 'Registrations count by tournament' as check_title;

SELECT 
  tr.tournament_id,
  t.name as tournament_name,
  COUNT(*) as registration_count
FROM tournament_registrations tr
JOIN tournaments t ON t.id = tr.tournament_id
GROUP BY tr.tournament_id, t.name
ORDER BY COUNT(*) DESC
LIMIT 5;

-- 4. Check if we have the correct column for user_id
SELECT 'Checking user_id column in tournament_registrations' as check_title;

SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tournament_registrations'
  AND table_schema = 'public'
  AND column_name LIKE '%user%'
ORDER BY ordinal_position;
