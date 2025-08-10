-- Kiểm tra data legacy đã import chưa
SELECT COUNT(*) as total_legacy_players FROM legacy_spa_points;

-- Xem 10 người đầu tiên
SELECT position_rank, full_name, nick_name, spa_points, claimed 
FROM legacy_spa_points 
ORDER BY position_rank 
LIMIT 10;

-- Kiểm tra view leaderboard
SELECT user_type, full_name, nick_name, spa_points, is_registered
FROM public_spa_leaderboard 
ORDER BY spa_points DESC 
LIMIT 10;
