-- Script để update status từ 'open' thành 'pending'
-- Chạy thủ công trên Supabase Dashboard > SQL Editor

-- 1. Kiểm tra các thách đấu có status 'open'
SELECT 
  id,
  challenger_id,
  opponent_id,
  status,
  challenge_type,
  bet_points,
  created_at,
  expires_at
FROM challenges 
WHERE status = 'open';

-- 2. Update tất cả challenges từ 'open' thành 'pending'
UPDATE challenges 
SET 
  status = 'pending',
  updated_at = NOW()
WHERE status = 'open';

-- 3. Kiểm tra kết quả sau khi update
SELECT 
  COUNT(*) as total_pending_challenges,
  COUNT(CASE WHEN opponent_id IS NULL THEN 1 END) as open_challenges,
  COUNT(CASE WHEN opponent_id IS NOT NULL THEN 1 END) as specific_challenges
FROM challenges 
WHERE status = 'pending';

-- 4. Hiển thị thông tin chi tiết các thách đấu pending
SELECT 
  id,
  challenger_id,
  opponent_id,
  challenge_type,
  bet_points,
  CASE 
    WHEN opponent_id IS NULL THEN 'Thách đấu mở'
    ELSE 'Thách đấu riêng'
  END as challenge_category,
  created_at,
  expires_at
FROM challenges 
WHERE status = 'pending'
ORDER BY created_at DESC;
