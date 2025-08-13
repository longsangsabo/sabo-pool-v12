-- ============================================
-- SCRIPT TEST CREATION CHALLENGE VỚI LOCATION VÀ REQUIRED_RANK
-- Chạy trên Supabase Dashboard để test
-- ============================================

-- 1. KIỂM TRA CẤU TRÚC BẢNG HIỆN TẠI
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND column_name IN ('location', 'required_rank', 'challenger_name', 'is_sabo')
ORDER BY column_name;

-- ============================================

-- 2. KIỂM TRA DỮ LIỆU GẦN NHẤT
SELECT 
  id,
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  message,
  club_id,
  location,
  required_rank,
  challenger_name,
  is_sabo,
  status,
  created_at
FROM challenges 
ORDER BY created_at DESC 
LIMIT 3;

-- ============================================

-- 3. TEST INSERT VỚI LOCATION VÀ REQUIRED_RANK
-- Thay thế USER_ID_HERE bằng ID thật của bạn
INSERT INTO challenges (
  challenger_id,
  bet_points,
  race_to,
  message,
  location,
  required_rank,
  challenger_name,
  is_sabo,
  status,
  expires_at
) VALUES (
  '12345678-1234-1234-1234-123456789012'::uuid, -- Thay bằng user ID thật
  200,
  12,
  'Test challenge với location và required_rank',
  'Test Location - Billiard Club ABC',
  'H',
  'Test Player Name',
  true,
  'pending',
  NOW() + INTERVAL '48 hours'
) RETURNING 
  id,
  location,
  required_rank,
  challenger_name,
  is_sabo,
  created_at;

-- ============================================

-- 4. KIỂM TRA KẾT QUẢ SAU KHI INSERT
SELECT 
  'AFTER INSERT TEST' as test_phase,
  location,
  required_rank,
  challenger_name,
  is_sabo,
  CASE 
    WHEN location IS NOT NULL THEN '✅ location saved'
    ELSE '❌ location is NULL'
  END as location_check,
  CASE 
    WHEN required_rank IS NOT NULL THEN '✅ required_rank saved'
    ELSE '❌ required_rank is NULL'
  END as required_rank_check
FROM challenges 
WHERE message = 'Test challenge với location và required_rank'
ORDER BY created_at DESC
LIMIT 1;

-- ============================================

-- 5. XÓA DỮ LIỆU TEST
DELETE FROM challenges 
WHERE message = 'Test challenge với location và required_rank'
  AND created_at > NOW() - INTERVAL '5 minutes';

-- ============================================

-- 6. KIỂM TRA TRIGGERS (nếu có)
-- Xem có trigger nào làm thay đổi data không
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'challenges';

-- ============================================

-- 7. KIỂM TRA DEFAULT VALUES
SELECT 
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND column_name IN ('location', 'required_rank')
ORDER BY column_name;

-- ============================================
-- HƯỚNG DẪN:
-- 1. Chạy script 1 để xem cấu trúc
-- 2. Chạy script 3 để test insert (nhớ thay USER_ID)
-- 3. Chạy script 4 để kiểm tra kết quả
-- 4. Chạy script 5 để cleanup
-- ============================================
