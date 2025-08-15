-- Tạo trận ongoing có điểm số để test nút xác nhận
-- Copy và chạy trong Supabase SQL Editor

-- Tạo trận đấu đang diễn ra và đã có điểm số
INSERT INTO challenges (
    challenger_id,
    opponent_id, 
    club_id,
    bet_points,
    race_to,
    location,
    description,
    status,
    challenger_score,
    opponent_score,
    created_at,
    accepted_at
) VALUES (
    'df9d4a8d-42c5-4c7a-8e1f-6b2e5d8c9a7f',  
    '3a2b1c0d-9e8f-7g6h-5i4j-3k2l1m0n9o8p',  
    'c1b2a3d4-e5f6-7890-abcd-ef1234567890',   
    50,
    10,
    'Bàn số 3',
    'Trận đấu đang diễn ra, đã có kết quả',
    'ongoing',  -- Trạng thái ongoing
    8,   -- challenger thắng 8-5
    5,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '45 minutes'
),
(
    '3a2b1c0d-9e8f-7g6h-5i4j-3k2l1m0n9o8p',  
    'df9d4a8d-42c5-4c7a-8e1f-6b2e5d8c9a7f',  
    'c1b2a3d4-e5f6-7890-abcd-ef1234567890',   
    75,
    15,
    'Bàn số 4', 
    'Trận đấu gay cấn, opponent bất ngờ lội ngược dòng',
    'ongoing',  -- Trạng thái ongoing
    12,  -- opponent thắng 15-12
    15,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '90 minutes'
);

-- Kiểm tra kết quả
SELECT 
    c.id,
    c.status,
    c.challenger_score,
    c.opponent_score,
    cp.full_name as challenger_name,
    op.full_name as opponent_name,
    c.club_confirmed,
    c.bet_points,
    c.race_to
FROM challenges c
LEFT JOIN profiles cp ON c.challenger_id = cp.id  
LEFT JOIN profiles op ON c.opponent_id = op.id
WHERE c.status = 'ongoing' AND c.challenger_score IS NOT NULL
ORDER BY c.created_at DESC;
