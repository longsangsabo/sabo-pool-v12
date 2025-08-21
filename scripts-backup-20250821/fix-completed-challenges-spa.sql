-- Script xử lý SPA cho những trận completed chưa xử lý
-- Copy và chạy trong Supabase SQL Editor

-- Bước 1: Kiểm tra trận completed chưa xử lý SPA
SELECT 
  c.id,
  c.status,
  c.club_confirmed,
  cp.full_name as challenger,
  op.full_name as opponent,
  c.challenger_score,
  c.opponent_score,
  c.bet_points,
  cp.spa_points as challenger_spa,
  op.spa_points as opponent_spa,
  CASE 
    WHEN c.challenger_score::integer > c.opponent_score::integer THEN cp.full_name
    WHEN c.opponent_score::integer > c.challenger_score::integer THEN op.full_name
    ELSE 'Hòa'
  END as winner
FROM challenges c
LEFT JOIN profiles cp ON c.challenger_id = cp.id
LEFT JOIN profiles op ON c.opponent_id = op.id
WHERE c.status = 'completed' 
  AND c.challenger_score IS NOT NULL 
  AND c.opponent_score IS NOT NULL
  AND c.bet_points > 0
ORDER BY c.completed_at DESC;

-- Bước 2: Xử lý SPA cho trận specific
-- Thay '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c' bằng ID trận cần xử lý
SELECT handle_club_approval_spa(
  '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c'::UUID, 
  true, 
  'Processing SPA retroactively'
);

-- Bước 3: Kiểm tra kết quả sau khi xử lý
SELECT 
  cp.full_name as challenger,
  cp.spa_points as challenger_spa,
  op.full_name as opponent,
  op.spa_points as opponent_spa
FROM challenges c
LEFT JOIN profiles cp ON c.challenger_id = cp.id
LEFT JOIN profiles op ON c.opponent_id = op.id
WHERE c.id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

-- Bước 4: Xử lý trận thứ 2 nếu cần
SELECT handle_club_approval_spa(
  '2485cdd8-eb82-4240-9a28-b6260c8960d7'::UUID, 
  true, 
  'Processing SPA retroactively for second match'
);

-- Bước 5: Kiểm tra tổng quát tất cả SPA sau xử lý
SELECT 
  p.full_name,
  p.spa_points,
  p.current_rank,
  p.verified_rank
FROM profiles p
WHERE p.spa_points != 0
ORDER BY p.spa_points DESC;
