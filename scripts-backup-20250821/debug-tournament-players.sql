
-- Debug Tournament Players Loading Issue
-- This query checks the tournament_registrations table structure and data

-- 1. Check tournament_registrations structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tournament_registrations'
ORDER BY ordinal_position;

-- 2. Check profiles structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Sample query to test data loading (replace tournament_id)
-- SELECT 
--   tr.tournament_id,
--   tr.user_id,
--   tr.registration_status,
--   p.full_name,
--   p.elo
-- FROM tournament_registrations tr
-- LEFT JOIN profiles p ON tr.user_id = p.id
-- WHERE tr.tournament_id = 'YOUR_TOURNAMENT_ID_HERE'
--   AND tr.registration_status = 'confirmed'
-- LIMIT 16;

-- 4. Check if there's any tournament with registrations
SELECT 
  t.id as tournament_id,
  t.name as tournament_name,
  t.tournament_type,
  COUNT(tr.user_id) as registered_count
FROM tournaments t
LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
WHERE tr.registration_status = 'confirmed'
GROUP BY t.id, t.name, t.tournament_type
HAVING COUNT(tr.user_id) > 0
ORDER BY registered_count DESC
LIMIT 10;

