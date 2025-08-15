-- Tạo thử thách với trạng thái pending_approval để test nút xác nhận
-- Copy và chạy trong Supabase SQL Editor

-- Tạo thử thách đã có điểm số và đang chờ phê duyệt từ club
INSERT INTO challenges (
    challenger_id,
    opponent_id, 
    club_id,
    bet_amount,
    game_format,
    location,
    description,
    status,
    challenger_score,
    opponent_score,
    winner_id,
    created_at,
    accepted_at,
    completed_at
) VALUES (
    'df9d4a8d-42c5-4c7a-8e1f-6b2e5d8c9a7f',  -- challenger_id (user có sẵn)
    '3a2b1c0d-9e8f-7g6h-5i4j-3k2l1m0n9o8p',  -- opponent_id (user có sẵn) 
    'c1b2a3d4-e5f6-7890-abcd-ef1234567890',   -- club_id (club có sẵn)
    100,
    'Race to 8',
    'Bàn số 1',
    'Trận đấu đã hoàn thành, chờ club xác nhận',
    'pending_approval',  -- Trạng thái chờ phê duyệt
    8,   -- challenger thắng 8-6
    6,
    'df9d4a8d-42c5-4c7a-8e1f-6b2e5d8c9a7f',  -- winner_id = challenger_id
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 30 minutes', 
    NOW() - INTERVAL '30 minutes'
);

-- Tạo thêm một thử thách nữa
INSERT INTO challenges (
    challenger_id,
    opponent_id,
    club_id, 
    bet_amount,
    game_format,
    location,
    description,
    status,
    challenger_score,
    opponent_score,
    winner_id,
    created_at,
    accepted_at,
    completed_at
) VALUES (
    '3a2b1c0d-9e8f-7g6h-5i4j-3k2l1m0n9o8p',  -- challenger_id
    'df9d4a8d-42c5-4c7a-8e1f-6b2e5d8c9a7f',  -- opponent_id
    'c1b2a3d4-e5f6-7890-abcd-ef1234567890',   -- club_id
    150,
    'Race to 10', 
    'Bàn số 2',
    'Trận đấu căng thẳng, opponent thắng sát nút',
    'pending_approval',  -- Trạng thái chờ phê duyệt
    9,   -- challenger thua 9-10
    10,
    'df9d4a8d-42c5-4c7a-8e1f-6b2e5d8c9a7f',  -- winner_id = opponent_id
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours 30 minutes',
    NOW() - INTERVAL '1 hour'
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
    c.club_note
FROM challenges c
LEFT JOIN profiles cp ON c.challenger_id = cp.id  
LEFT JOIN profiles op ON c.opponent_id = op.id
WHERE c.status = 'pending_approval'
ORDER BY c.created_at DESC;
