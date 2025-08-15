-- Kiểm tra SPA points được lưu ở đâu trong database
-- Copy và chạy trong Supabase SQL Editor

-- 1. Kiểm tra tất cả table có cột spa_points
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE column_name LIKE '%spa%'
  AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 2. Kiểm tra table player_rankings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'player_rankings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Kiểm tra có data trong player_rankings không
SELECT user_id, spa_points, verified_rank
FROM player_rankings 
WHERE user_id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
LIMIT 5;
