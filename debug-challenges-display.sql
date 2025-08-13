-- Script kiểm tra cấu trúc bảng challenges và dữ liệu
-- =====================================================

-- 1. Kiểm tra cấu trúc bảng challenges
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
ORDER BY ordinal_position;

-- 2. Kiểm tra dữ liệu trong bảng challenges
SELECT 
  id,
  challenger_id,
  opponent_id,
  status,
  bet_points,
  race_to,
  created_at,
  expires_at,
  scheduled_time
FROM public.challenges 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Kiểm tra số lượng thách đấu theo status
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN opponent_id IS NULL THEN 1 END) as open_challenges,
  COUNT(CASE WHEN opponent_id IS NOT NULL THEN 1 END) as direct_challenges
FROM public.challenges 
GROUP BY status
ORDER BY status;

-- 4. Kiểm tra RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'challenges';

-- 5. Test query thách đấu cộng đồng (giống logic trong hook)
SELECT 
  c.id,
  c.challenger_id,
  c.opponent_id,
  c.status,
  c.bet_points,
  c.race_to,
  c.created_at,
  p.full_name as challenger_name
FROM public.challenges c
LEFT JOIN public.profiles p ON c.challenger_id = p.user_id
WHERE c.opponent_id IS NULL 
  AND c.status = 'pending'
ORDER BY c.created_at DESC;

-- 6. Kiểm tra profile data có đầy đủ không
SELECT 
  user_id,
  full_name,
  display_name,
  verified_rank,
  avatar_url
FROM public.profiles 
LIMIT 5;
