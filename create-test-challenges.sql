-- =====================================================
-- TẠO THÁCH ĐẤU TEST NHANH
-- =====================================================

-- Lấy user ID đầu tiên từ profiles để làm challenger
WITH first_user AS (
  SELECT user_id FROM public.profiles LIMIT 1
)
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
) 
SELECT 
  user_id,  -- Challenger
  NULL,     -- Open challenge (no opponent)
  500,      -- Bet points
  8,        -- Race to
  'Test challenge để debug hiển thị',
  'CLB Test Location',
  'H',      -- Required rank
  'pending',
  NOW() + INTERVAL '24 hours',
  NOW()
FROM first_user;

-- Tạo thêm 2 thách đấu nữa với user khác nhau
WITH users AS (
  SELECT user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
  FROM public.profiles 
  LIMIT 3
)
INSERT INTO public.challenges (
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  message,
  status,
  expires_at,
  created_at
) 
SELECT 
  user_id,
  NULL,
  CASE rn 
    WHEN 2 THEN 300
    WHEN 3 THEN 700
  END,
  CASE rn 
    WHEN 2 THEN 6
    WHEN 3 THEN 10
  END,
  'Test challenge #' || rn || ' cho debug',
  'pending',
  NOW() + INTERVAL '48 hours',
  NOW()
FROM users 
WHERE rn IN (2, 3);

-- Kiểm tra kết quả
SELECT 
  id,
  challenger_id,
  opponent_id,
  bet_points,
  race_to,
  message,
  status,
  created_at
FROM public.challenges 
WHERE message LIKE '%Test challenge%' 
   OR message LIKE '%debug%'
ORDER BY created_at DESC;
