-- =====================================================
-- SCRIPT THÊM COLUMNS LOCATION VÀ REQUIRED_RANK 
-- CHO BẢNG CHALLENGES
-- =====================================================

-- Bước 1: Kiểm tra cấu trúc hiện tại của bảng challenges
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Bước 2: Thêm các columns mới nếu chưa có
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS required_rank TEXT;

-- Bước 3: Thêm comment cho các columns mới
COMMENT ON COLUMN public.challenges.location IS 'Địa điểm/CLB thi đấu';
COMMENT ON COLUMN public.challenges.required_rank IS 'Yêu cầu hạng tối thiểu để tham gia thách đấu (K, I, H, G, F, E, D, C, B, A)';

-- Bước 4: Kiểm tra lại để đảm bảo columns đã được thêm
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND column_name IN ('location', 'required_rank')
ORDER BY column_name;

-- Bước 5: Test insert một challenge mẫu với location và required_rank
-- (Chạy sau khi đã có user và data thực)
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
  expires_at
) VALUES (
  'user-id-here',  -- Thay bằng user ID thực
  NULL,            -- Open challenge
  300,
  8,
  'Test challenge với location và required rank',
  'CLB Billiards Sài Gòn',
  'H',
  'open',
  NOW() + INTERVAL '48 hours'
);
*/

-- Bước 6: Xem tất cả challenges hiện có với location và required_rank
SELECT 
  id,
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  location,
  required_rank,
  status,
  created_at
FROM public.challenges 
ORDER BY created_at DESC 
LIMIT 10;
