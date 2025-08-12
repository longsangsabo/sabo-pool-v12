-- Quick schema check for player_rankings table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'player_rankings'
  AND table_schema = 'public'
ORDER BY ordinal_position;
