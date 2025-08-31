-- =============================================================================
-- DEMO: RANKING & ANALYTICS SYSTEM
-- Advanced ELO and SPA tracking
-- =============================================================================

-- Rank System (SABO 14-tier system)
INSERT INTO ranks (rank_code, rank_name, rank_order, rank_color, min_elo, description) VALUES
('K', 'K', 1, '#8B4513', 1000, 'Hạng K - Người mới bắt đầu'),
('K+', 'K+', 2, '#A0522D', 1100, 'Hạng K+ - Có tiến bộ'),
('I', 'I', 3, '#CD853F', 1200, 'Hạng I - Trung bình'),
('I+', 'I+', 4, '#D2691E', 1300, 'Hạng I+ - Trung bình khá'),
('H', 'H', 5, '#FF8C00', 1400, 'Hạng H - Khá'),
('H+', 'H+', 6, '#FF7F50', 1500, 'Hạng H+ - Khá giỏi'),
('G', 'G', 7, '#FF6347', 1600, 'Hạng G - Giỏi'),
('G+', 'G+', 8, '#FF4500', 1700, 'Hạng G+ - Rất giỏi'),
('F', 'F', 9, '#FF0000', 1800, 'Hạng F - Xuất sắc'),
('F+', 'F+', 10, '#DC143C', 1900, 'Hạng F+ - Rất xuất sắc'),
('E', 'E', 11, '#B22222', 2000, 'Hạng E - Chuyên nghiệp'),
('E+', 'E+', 12, '#8B0000', 2100, 'Hạng E+ - Chuyên nghiệp cao'),
('D', 'D', 13, '#4B0082', 2200, 'Hạng D - Bậc thầy'),
('D+', 'D+', 14, '#483D8B', 2300, 'Hạng D+ - Siêu bậc thầy'),
('C', 'C', 15, '#9400D3', 2400, 'Hạng C - Huyền thoại'),
('C+', 'C+', 16, '#8A2BE2', 2500, 'Hạng C+ - Đại huyền thoại'),
('B', 'B', 17, '#9932CC', 2600, 'Hạng B - Thần thoại'),
('B+', 'B+', 18, '#BA55D3', 2700, 'Hạng B+ - Đại thần thoại'),
('A', 'A', 19, '#DA70D6', 2800, 'Hạng A - Vô địch'),
('A+', 'A+', 20, '#FF1493', 2900, 'Hạng A+ - Siêu vô địch'),
('Pro', 'PRO', 21, '#FFD700', 3000, 'Hạng Pro - Chuyên nghiệp quốc tế');

-- Player Rankings (Monthly tracking)
INSERT INTO player_rankings (player_id, month, year, city, district, rank_category, total_wins, total_matches, win_rate, ranking_points, position) VALUES
-- Current month rankings
('user-001', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hồ Chí Minh', 'Quận 1', 'K', 12, 25, 48.0, 1000, 150),
('user-002', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hồ Chí Minh', 'Quận 3', 'K+', 18, 30, 60.0, 1100, 120),
('user-003', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hà Nội', 'Ba Đình', 'I+', 55, 85, 64.7, 1300, 85),
('user-004', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Đà Nẵng', 'Hải Châu', 'H', 78, 120, 65.0, 1450, 65),
('user-005', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hồ Chí Minh', 'Quận 7', 'G+', 140, 200, 70.0, 1750, 35),
('user-006', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hà Nội', 'Đống Đa', 'F', 280, 350, 80.0, 1900, 15),
('user-007', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hồ Chí Minh', 'Bình Thạnh', 'C+', 425, 500, 85.0, 2200, 5),
('user-008', EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 'Hà Nội', 'Hoàn Kiếm', 'B', 720, 800, 90.0, 2500, 1);

-- ELO History (Track ELO changes over time)
INSERT INTO elo_history (player_id, old_elo, new_elo, elo_change, opponent_id, match_result, match_type, created_at) VALUES
-- Recent ELO changes
('user-004', 1425, 1450, 25, 'user-005', 'win', 'challenge', NOW() - INTERVAL '2 hours'),
('user-005', 1775, 1750, -25, 'user-004', 'loss', 'challenge', NOW() - INTERVAL '2 hours'),
('user-006', 1870, 1900, 30, 'user-005', 'win', 'challenge', NOW() - INTERVAL '1 day'),
('user-005', 1800, 1770, -30, 'user-006', 'loss', 'challenge', NOW() - INTERVAL '1 day'),
('user-008', 2450, 2500, 50, 'user-007', 'win', 'tournament', NOW() - INTERVAL '3 days'),
('user-007', 2250, 2200, -50, 'user-008', 'loss', 'tournament', NOW() - INTERVAL '3 days');

-- Rank Requests (Promotion attempts)
INSERT INTO rank_requests (user_id, current_rank, requested_rank, request_reason, status, club_id) VALUES
('user-001', 'K', 'K+', 'Đã có 20+ trận thắng, win rate 48%', 'pending', 'club-001'),
('user-002', 'K+', 'I', 'Win rate 60%, có kinh nghiệm thi đấu', 'approved', 'club-002'),
('user-003', 'I+', 'H', 'Đã thắng nhiều thách đấu khó', 'under_review', 'club-003'),
('user-005', 'G', 'G+', 'Thành tích tournament tốt', 'approved', 'club-001');

-- Rank Verifications (Test results)
INSERT INTO rank_verifications (rank_request_id, verified_by, verification_method, test_result, verification_notes, status) VALUES
((SELECT id FROM rank_requests WHERE user_id = 'user-002'), 'user-006', 'practical_test', 'pass', 'Đã pass test thực hành với điểm số tốt', 'approved'),
((SELECT id FROM rank_requests WHERE user_id = 'user-005'), 'user-007', 'practical_test', 'pass', 'Kỹ thuật vững, đủ tiêu chuẩn G+', 'approved');
