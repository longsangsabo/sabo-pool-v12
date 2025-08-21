-- PHÂN TÍCH FLOW SPA TRANSFER TRONG SYSTEM
-- Copy và chạy trong Supabase SQL Editor

-- 1. Kiểm tra cấu trúc bảng profiles (nơi lưu SPA)
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND (column_name LIKE '%spa%' OR column_name LIKE '%point%')
ORDER BY ordinal_position;

-- 2. Kiểm tra có bảng spa_transactions không?
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%spa%';

-- 3. Kiểm tra có bảng transactions hoặc point_history không?
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%transaction%' OR table_name LIKE '%point%' OR table_name LIKE '%history%');

-- 4. Kiểm tra SPA hiện tại của 2 users
SELECT 
  p.id,
  p.full_name,
  p.spa_points,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY p.full_name;

-- 5. Kiểm tra có trigger nào trên profiles không?
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 6. Test manual SPA update để xem có hoạt động không
BEGIN;

-- Backup current values
CREATE TEMP TABLE spa_backup AS
SELECT id, full_name, spa_points, 'BEFORE_TEST' as timing
FROM profiles 
WHERE id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5');

-- Manual test update
UPDATE profiles 
SET spa_points = spa_points + 50 
WHERE id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac'; -- Sang +50

UPDATE profiles 
SET spa_points = spa_points - 50 
WHERE id = '18f6e853-b072-47fb-9c9a-e5d42a5446a5'; -- Đức -50

-- Check after update
SELECT id, full_name, spa_points, 'AFTER_TEST' as timing
FROM profiles 
WHERE id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
UNION ALL
SELECT id, full_name, spa_points, timing FROM spa_backup
ORDER BY timing, full_name;

-- Rollback để không ảnh hưởng data thực
ROLLBACK;
