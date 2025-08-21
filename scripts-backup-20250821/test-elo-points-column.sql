-- =====================================================
-- SCRIPT TEST SAU KHI THÊM ELO_POINTS COLUMN
-- =====================================================

-- Test 1: Kiểm tra cột elo_points đã được thêm
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'rank_requests' 
  AND table_schema = 'public'
  AND column_name IN ('requested_rank', 'elo_points');

-- Test 2: Xem dữ liệu rank requests với format mới
SELECT * FROM public.rank_requests_display LIMIT 5;

-- Test 3: Kiểm tra function elo_to_rank_text
SELECT 
  elo_points,
  public.elo_to_rank_text(elo_points) as rank_text
FROM (VALUES 
  (1000), (1100), (1200), (1300), (1400), 
  (1500), (1600), (1700), (1800), (1900), 
  (2000), (2100)
) AS test_elos(elo_points);

-- Test 4: Kiểm tra rank requests có ELO và rank text đúng không
SELECT 
  id,
  requested_rank,
  elo_points,
  CASE 
    WHEN requested_rank = public.elo_to_rank_text(elo_points) THEN '✅ Khớp'
    ELSE '❌ Không khớp'
  END as validation_status
FROM public.rank_requests 
WHERE elo_points IS NOT NULL
LIMIT 10;

-- Test 5: Tạo sample rank request để test (nếu cần)
/*
INSERT INTO public.rank_requests (
  user_id,
  requested_rank,
  elo_points,
  club_id,
  status
) VALUES (
  'user-id-here',  -- Thay bằng user ID thực
  'H',             -- Rank text
  1400,            -- ELO points
  'club-id-here',  -- Thay bằng club ID thực
  'pending'
);
*/

-- Test 6: Kiểm tra tất cả rank requests
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN elo_points IS NOT NULL THEN 1 END) as with_elo,
  COUNT(CASE WHEN requested_rank IS NOT NULL THEN 1 END) as with_rank_text
FROM public.rank_requests;
