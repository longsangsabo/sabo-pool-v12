-- =====================================================
-- DEBUG SCRIPT - TÌM VẤN ĐỀ THÁCH ĐẤU KHÔNG HIỂN THỊ
-- =====================================================

-- 1. Kiểm tra tổng số thách đấu trong DB
SELECT 
  'Total challenges in DB' as check_name,
  COUNT(*) as count
FROM public.challenges;

-- 2. Kiểm tra thách đấu theo status
SELECT 
  'Challenges by status' as check_name,
  status,
  COUNT(*) as count
FROM public.challenges 
GROUP BY status
ORDER BY status;

-- 3. Kiểm tra thách đấu mở (open challenges) - không có opponent_id
SELECT 
  'Open challenges (no opponent)' as check_name,
  COUNT(*) as count
FROM public.challenges 
WHERE opponent_id IS NULL 
  AND status = 'pending';

-- 4. Kiểm tra RLS có được enable không
SELECT 
  'RLS enabled on challenges' as check_name,
  CASE 
    WHEN relrowsecurity THEN 'ENABLED' 
    ELSE 'DISABLED' 
  END as rls_status
FROM pg_class 
WHERE relname = 'challenges';

-- 5. Kiểm tra policies hiện tại
SELECT 
  'RLS policies' as check_name,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'challenges';

-- 6. Test query thực tế như trong hook
SELECT 
  'Test actual query from hook' as check_name,
  id,
  challenger_id,
  opponent_id,
  status,
  bet_points,
  created_at
FROM public.challenges 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Kiểm tra nếu có user_id cụ thể (thay YOUR_USER_ID bằng user ID thực)
-- SELECT 
--   'User specific challenges' as check_name,
--   id,
--   challenger_id,
--   opponent_id,
--   status
-- FROM public.challenges 
-- WHERE challenger_id = 'YOUR_USER_ID' 
--    OR opponent_id = 'YOUR_USER_ID'
-- ORDER BY created_at DESC;

-- 8. TẠM THỜI DISABLE RLS ĐỂ TEST (NẾU CẦN)
-- CHẠY NẾU NGHI NGỜ RLS LÀ VẤN ĐỀ:
-- ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;

-- 9. ENABLE LẠI RLS SAU KHI TEST XONG
-- ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
