-- Script kiểm tra và sửa SPA transfer
-- Copy và chạy trong Supabase SQL Editor

-- Bước 1: Kiểm tra SPA hiện tại
SELECT 
  p.id,
  p.full_name,
  p.spa_points
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY p.full_name;

-- Bước 2: Kiểm tra challenge status
SELECT 
  id,
  status,
  club_confirmed,
  club_confirmed_at,
  winner_id,
  challenger_score,
  opponent_score,
  bet_points
FROM challenges 
WHERE id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

-- Bước 3: Test manual SPA update với transaction
BEGIN;

-- Check before update
SELECT 
  'BEFORE UPDATE' as timing,
  p.id,
  p.full_name,
  p.spa_points
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5');

-- Manual update: Sang +100, Đức -100
UPDATE profiles 
SET spa_points = spa_points + 100 
WHERE id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'; -- Sang

UPDATE profiles 
SET spa_points = spa_points - 100 
WHERE id = '18f6e853-b072-47fb-9c9a-e5d42a5446a5'; -- Đức

-- Check after update
SELECT 
  'AFTER UPDATE' as timing,
  p.id,
  p.full_name,
  p.spa_points
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5');

-- If everything looks good, COMMIT; if not, ROLLBACK;
COMMIT;
