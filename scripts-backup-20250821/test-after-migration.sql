-- =====================================================
-- SCRIPT TEST SAU KHI ĐÃ THÊM COLUMNS
-- =====================================================

-- Kiểm tra xem columns đã tồn tại chưa
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND column_name IN ('location', 'required_rank');

-- Xem tất cả challenges hiện tại
SELECT 
  id,
  challenger_id,
  bet_points,
  race_to,
  location,
  required_rank,
  status,
  created_at
FROM public.challenges 
ORDER BY created_at DESC;

-- Update một challenge hiện có để test (nếu có)
-- Thay 'challenge-id-here' bằng ID thực của một challenge
/*
UPDATE public.challenges 
SET 
  location = 'CLB Test Location',
  required_rank = 'H'
WHERE id = 'challenge-id-here';
*/

-- Kiểm tra RLS policies có affect không
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

-- Test query để lấy challenges với location và required_rank
SELECT 
  c.id,
  c.challenger_id,
  c.opponent_id,
  c.bet_points,
  c.race_to,
  c.location,
  c.required_rank,
  c.status,
  p1.full_name as challenger_name,
  p2.full_name as opponent_name
FROM public.challenges c
LEFT JOIN public.profiles p1 ON c.challenger_id = p1.user_id
LEFT JOIN public.profiles p2 ON c.opponent_id = p2.user_id
WHERE c.location IS NOT NULL OR c.required_rank IS NOT NULL
ORDER BY c.created_at DESC;
