-- Debug Tournament Matches Table Structure
-- Check table structure and constraints

-- 1. Check tournament_matches table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournament_matches'
ORDER BY ordinal_position;

-- 2. Check if table exists with different name
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%match%'
  AND table_schema = 'public';

-- 3. Check constraints and foreign keys
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'tournament_matches';

-- 4. Sample insert to test structure
-- INSERT INTO tournament_matches (
--   tournament_id,
--   round_number,
--   match_number,
--   player1_id,
--   player2_id,
--   winner_id,
--   status,
--   score_player1,
--   score_player2,
--   bracket_type,
--   next_match_id
-- ) VALUES (
--   'test-tournament',
--   1,
--   1,
--   'player1',
--   'player2',
--   null,
--   'scheduled',
--   null,
--   null,
--   'winner',
--   null
-- );
