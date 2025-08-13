-- ============================================
-- SCRIPT KIỂM TRA VÀ DEBUG CHALLENGES TABLE
-- Chạy từng phần một trên Supabase Dashboard
-- ============================================

-- 1. KIỂM TRA CẤU TRÚC BẢNG CHALLENGES
-- Chạy script này để xem tất cả các cột trong bảng challenges
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================

-- 2. KIỂM TRA CÁC CỘT CẦN THIẾT CHO FORM
-- Kiểm tra xem các cột mà form cần có tồn tại không
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'bet_points'
        AND table_schema = 'public'
    ) THEN '✅ bet_points exists'
    ELSE '❌ bet_points MISSING'
  END AS bet_points_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'race_to'
        AND table_schema = 'public'
    ) THEN '✅ race_to exists'
    ELSE '❌ race_to MISSING'
  END AS race_to_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'message'
        AND table_schema = 'public'
    ) THEN '✅ message exists'
    ELSE '❌ message MISSING'
  END AS message_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'club_id'
        AND table_schema = 'public'
    ) THEN '✅ club_id exists'
    ELSE '❌ club_id MISSING'
  END AS club_id_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'scheduled_time'
        AND table_schema = 'public'
    ) THEN '✅ scheduled_time exists'
    ELSE '❌ scheduled_time MISSING'
  END AS scheduled_time_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'location'
        AND table_schema = 'public'
    ) THEN '✅ location exists'
    ELSE '❌ location MISSING'
  END AS location_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'is_sabo'
        AND table_schema = 'public'
    ) THEN '✅ is_sabo exists'
    ELSE '❌ is_sabo MISSING'
  END AS is_sabo_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'handicap_1_rank'
        AND table_schema = 'public'
    ) THEN '✅ handicap_1_rank exists'
    ELSE '❌ handicap_1_rank MISSING'
  END AS handicap_1_rank_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'handicap_05_rank'
        AND table_schema = 'public'
    ) THEN '✅ handicap_05_rank exists'
    ELSE '❌ handicap_05_rank MISSING'
  END AS handicap_05_rank_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'required_rank'
        AND table_schema = 'public'
    ) THEN '✅ required_rank exists'
    ELSE '❌ required_rank MISSING'
  END AS required_rank_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'challenges' 
        AND column_name = 'challenger_name'
        AND table_schema = 'public'
    ) THEN '✅ challenger_name exists'
    ELSE '❌ challenger_name MISSING'
  END AS challenger_name_check;

-- ============================================

-- 3. KIỂM TRA RLS (ROW LEVEL SECURITY) POLICIES
-- Xem các policy hiện tại của bảng challenges
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'challenges';

-- ============================================

-- 4. KIỂM TRA DỮ LIỆU MẪU TRONG BẢNG
-- Xem 5 records gần nhất trong bảng challenges
SELECT 
  id,
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  message,
  club_id,
  scheduled_time,
  location,
  is_sabo,
  handicap_1_rank,
  handicap_05_rank,
  required_rank,
  challenger_name,
  status,
  created_at
FROM challenges 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================

-- 5. KIỂM TRA AUTHENTICATION
-- Kiểm tra xem user có đăng nhập không
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NOT LOGGED IN - auth.uid() is NULL'
    ELSE '✅ LOGGED IN - User ID: ' || auth.uid()::text
  END as auth_status;

-- ============================================

-- 5A. TEST INSERT DỮ LIỆU MẪU (CHỈ KHI ĐÃ ĐĂNG NHẬP)
-- Thử insert một record test với user ID cụ thể
-- THAY ĐỔI user_id_here THÀNH ID THẬT CỦA BẠN
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Lấy user_id từ bảng profiles (nếu có data)
  SELECT user_id INTO test_user_id 
  FROM profiles 
  LIMIT 1;
  
  -- Nếu không có user nào, tạo UUID test
  IF test_user_id IS NULL THEN
    test_user_id := '12345678-1234-1234-1234-123456789012'::uuid;
  END IF;
  
  -- Insert test challenge
  INSERT INTO challenges (
    challenger_id,
    bet_points,
    race_to,
    message,
    status,
    is_sabo,
    handicap_1_rank,
    handicap_05_rank,
    expires_at
  ) VALUES (
    test_user_id,
    100,
    8,
    'Test challenge from SQL - Script',
    'pending',
    true,
    0,
    0,
    NOW() + INTERVAL '48 hours'
  );
  
  RAISE NOTICE 'Test challenge inserted with user_id: %', test_user_id;
END $$;

-- Xem kết quả
SELECT * FROM challenges 
WHERE message LIKE '%Test challenge from SQL%' 
ORDER BY created_at DESC 
LIMIT 3;

-- ============================================

-- 6. THÊM CÁC CỘT THIẾU (NẾU CẦN)
-- Script để thêm các cột còn thiếu vào bảng challenges
DO $$
BEGIN
  -- Thêm cột location nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' 
      AND column_name = 'location'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE challenges ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column';
  END IF;
  
  -- Thêm cột required_rank nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' 
      AND column_name = 'required_rank'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE challenges ADD COLUMN required_rank TEXT DEFAULT 'all';
    RAISE NOTICE 'Added required_rank column';
  END IF;
  
  -- Thêm cột challenger_name nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' 
      AND column_name = 'challenger_name'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE challenges ADD COLUMN challenger_name TEXT;
    RAISE NOTICE 'Added challenger_name column';
  END IF;
  
  -- Thêm cột is_sabo nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' 
      AND column_name = 'is_sabo'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE challenges ADD COLUMN is_sabo BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_sabo column';
  END IF;
  
END $$;

-- ============================================

-- 7. FIX RLS POLICIES CHO CHALLENGES
-- Tạo lại các RLS policies chính xác
DROP POLICY IF EXISTS "Users can view challenges" ON challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their challenges" ON challenges;

-- Policy cho SELECT
CREATE POLICY "Users can view challenges" ON challenges
  FOR SELECT USING (
    auth.role() = 'authenticated' OR
    auth.uid() = challenger_id OR 
    auth.uid() = opponent_id OR
    opponent_id IS NULL  -- Open challenges
  );

-- Policy cho INSERT  
CREATE POLICY "Users can create challenges" ON challenges
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = challenger_id
  );

-- Policy cho UPDATE
CREATE POLICY "Users can update their challenges" ON challenges
  FOR UPDATE USING (
    auth.uid() = challenger_id OR 
    auth.uid() = opponent_id OR
    auth.role() = 'service_role'
  );

-- ============================================

-- 8. XÓA DỮ LIỆU TEST (chạy sau khi test insert thành công)
-- DELETE FROM challenges 
-- WHERE message = 'Test challenge from SQL' 
--   AND challenger_id = auth.uid()
--   AND created_at > NOW() - INTERVAL '5 minutes';

-- 8. XÓA DỮ LIỆU TEST (chạy sau khi test insert thành công)
DELETE FROM challenges 
WHERE message LIKE '%Test challenge from SQL%' 
  AND created_at > NOW() - INTERVAL '10 minutes';

-- ============================================

-- 9. KIỂM TRA VÀ TẠO FUNCTION TẠO CHALLENGE (NẾU CẦN)
-- Function để tạo challenge an toàn với validation
CREATE OR REPLACE FUNCTION create_challenge_safe(
  p_opponent_id uuid DEFAULT NULL,
  p_bet_points integer DEFAULT 100,
  p_race_to integer DEFAULT 8,
  p_message text DEFAULT NULL,
  p_club_id uuid DEFAULT NULL,
  p_scheduled_time timestamptz DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_is_sabo boolean DEFAULT true,
  p_handicap_1_rank integer DEFAULT 0,
  p_handicap_05_rank integer DEFAULT 0,
  p_required_rank text DEFAULT 'all',
  p_challenger_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenger_id uuid;
  v_challenge_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Get current user
  v_challenger_id := auth.uid();
  
  -- Validation
  IF v_challenger_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  IF p_bet_points < 100 OR p_bet_points > 650 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid bet points');
  END IF;
  
  -- Set expiration (48 hours from now)
  v_expires_at := NOW() + INTERVAL '48 hours';
  
  -- Insert challenge
  INSERT INTO challenges (
    challenger_id,
    opponent_id,
    bet_points,
    race_to,
    message,
    club_id,
    scheduled_time,
    location,
    is_sabo,
    handicap_1_rank,
    handicap_05_rank,
    required_rank,
    challenger_name,
    status,
    expires_at
  ) VALUES (
    v_challenger_id,
    p_opponent_id,
    p_bet_points,
    p_race_to,
    p_message,
    p_club_id,
    p_scheduled_time,
    p_location,
    p_is_sabo,
    p_handicap_1_rank,
    p_handicap_05_rank,
    p_required_rank,
    p_challenger_name,
    CASE WHEN p_opponent_id IS NULL THEN 'open' ELSE 'pending' END,
    v_expires_at
  ) RETURNING id INTO v_challenge_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'challenge_id', v_challenge_id,
    'challenger_id', v_challenger_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END $$;

-- Test function
SELECT create_challenge_safe(
  p_bet_points := 200,
  p_race_to := 12,
  p_message := 'Test challenge via function',
  p_is_sabo := true
);

-- ============================================

-- 10. KIỂM TRA CÁC CONSTRAINT VÀ FOREIGN KEYS
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'challenges'
  AND tc.table_schema = 'public';

-- ============================================

-- 11. KIỂM TRA PERMISSIONS CỦA USER HIỆN TẠI
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Kiểm tra xem user có quyền INSERT vào bảng challenges không
SELECT has_table_privilege(auth.uid()::text, 'public.challenges', 'INSERT') as can_insert;
SELECT has_table_privilege(auth.uid()::text, 'public.challenges', 'SELECT') as can_select;
SELECT has_table_privilege(auth.uid()::text, 'public.challenges', 'UPDATE') as can_update;

-- ============================================

-- 12. KIỂM TRA LOGS LỖI GẦN ĐÂY (nếu có extension log)
-- Chỉ chạy nếu có pg_stat_statements extension
-- SELECT * FROM pg_stat_statements 
-- WHERE query LIKE '%challenges%' 
--   AND calls > 0 
-- ORDER BY last_exec_time DESC 
-- LIMIT 10;

-- ============================================

-- 13. SCRIPT TROUBLESHOOT CHO CLIENT
-- Kiểm tra exact data mà client đang gửi
SELECT 
  'CURRENT CHALLENGES COUNT:' as info,
  COUNT(*) as total_challenges
FROM challenges;

-- Kiểm tra challenges gần đây nhất
SELECT 
  'LATEST CHALLENGES:' as info,
  id,
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  status,
  created_at,
  CASE 
    WHEN challenger_id IS NULL THEN '❌ NULL challenger_id'
    ELSE '✅ Valid challenger_id'
  END as challenger_check
FROM challenges 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================

-- 14. ENABLE/DISABLE RLS ĐỂ TEST
-- Tạm thời tắt RLS để test (NGUY HIỂM - CHỈ ĐỂ DEBUG)
-- ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;

-- Bật lại RLS (sau khi test xong)
-- ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- ============================================

-- 15. TẠO TRIGGER ĐỂ LOG INSERT ATTEMPTS
CREATE OR REPLACE FUNCTION log_challenge_insert()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Challenge INSERT attempt - challenger_id: %, bet_points: %, status: %', 
    NEW.challenger_id, NEW.bet_points, NEW.status;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger (uncomment để enable)
-- DROP TRIGGER IF EXISTS challenge_insert_log ON challenges;
-- CREATE TRIGGER challenge_insert_log
--   BEFORE INSERT ON challenges
--   FOR EACH ROW EXECUTE FUNCTION log_challenge_insert();

-- ============================================

-- 16. FINAL VALIDATION CHECK
-- Script cuối cùng để validate mọi thứ
SELECT 
  'VALIDATION SUMMARY' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Table exists and has data'
    ELSE '⚠️ Table exists but empty'
  END as table_status
FROM challenges

UNION ALL

SELECT 
  'RLS STATUS' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'challenges' 
        AND rowsecurity = true
    ) THEN '✅ RLS is enabled'
    ELSE '❌ RLS is disabled'
  END as table_status

UNION ALL

SELECT 
  'POLICIES COUNT' as check_type,
  COUNT(*)::text || ' policies found' as table_status
FROM pg_policies 
WHERE tablename = 'challenges';

-- ============================================
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Chạy từng section một theo thứ tự
-- 2. Kiểm tra kết quả của section 1-4 trước
-- 3. Nếu có cột thiếu, chạy section 6
-- 4. Nếu có vấn đề RLS, chạy section 7  
-- 5. Test với function ở section 9
-- 6. Nếu vẫn lỗi, enable trigger ở section 15
-- ============================================
