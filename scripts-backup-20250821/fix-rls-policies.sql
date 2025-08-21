-- =====================================================
-- SCRIPT KIỂM TRA VÀ FIX RLS POLICIES CHO CHALLENGES
-- =====================================================

-- Kiểm tra các RLS policies hiện tại
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'challenges'
ORDER BY policyname;

-- Nếu có vấn đề với RLS, có thể tạm thời disable để test
-- CHẠY NẾU CẦN THIẾT:
/*
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
*/

-- Hoặc tạo policy mới cho phép tất cả operations trên challenges
-- CHẠY NẾU CẦN THIẾT:
/*
DROP POLICY IF EXISTS "allow_all_challenges" ON public.challenges;
CREATE POLICY "allow_all_challenges" ON public.challenges FOR ALL USING (true) WITH CHECK (true);
*/

-- Enable lại RLS sau khi test
-- CHẠY SAU KHI TEST XONG:
/*
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
*/

-- Test insert với user thực
-- Thay 'actual-user-id' bằng user ID thực của bạn
/*
INSERT INTO public.challenges (
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  message,
  location,
  required_rank,
  status,
  expires_at,
  created_at
) VALUES (
  'actual-user-id',  -- User ID thực
  NULL,              -- Open challenge
  300,
  8,
  'Test challenge với location và required rank mới',
  'CLB Billiards Test Location',
  'H',
  'open',
  NOW() + INTERVAL '48 hours',
  NOW()
);
*/

-- Kiểm tra kết quả insert
SELECT 
  id,
  challenger_id,
  location,
  required_rank,
  status,
  created_at
FROM public.challenges 
WHERE location IS NOT NULL 
   OR required_rank IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
