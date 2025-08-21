-- =====================================================
-- DEBUG SCRIPT KIỂM TRA RANK REQUESTS
-- =====================================================

-- Kiểm tra cấu trúc bảng rank_requests
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rank_requests' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Xem 5 rank requests mới nhất
SELECT 
  id,
  user_id,
  requested_rank,
  club_id,
  status,
  created_at
FROM public.rank_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- Kiểm tra type của requested_rank trong các records
SELECT 
  requested_rank,
  CASE 
    WHEN requested_rank ~ '^[0-9]+$' THEN 'NUMBERS'
    WHEN requested_rank ~ '^[A-Z][+]?$' THEN 'RANK_TEXT'
    ELSE 'OTHER'
  END as data_type,
  COUNT(*) as count
FROM public.rank_requests 
GROUP BY requested_rank
ORDER BY requested_rank;

-- Test insert một rank request mới (để test)
/*
INSERT INTO public.rank_requests (
  user_id,
  requested_rank,
  club_id,
  status
) VALUES (
  'user-id-here',  -- Thay bằng user ID thực
  'H',             -- Rank text
  'club-id-here',  -- Thay bằng club ID thực
  'pending'
);
*/

-- Xem all rank requests với profile info
SELECT 
  rr.id,
  rr.requested_rank,
  rr.status,
  rr.created_at,
  p.full_name as user_name,
  cp.club_name
FROM public.rank_requests rr
LEFT JOIN public.profiles p ON p.user_id = rr.user_id
LEFT JOIN public.club_profiles cp ON cp.id = rr.club_id
ORDER BY rr.created_at DESC
LIMIT 10;
