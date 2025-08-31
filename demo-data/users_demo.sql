-- =============================================================================
-- DEMO: USER MANAGEMENT SYSTEM
-- Sample data for SABO Pool user ecosystem
-- =============================================================================

-- Demo Users with Different Skill Levels
INSERT INTO profiles (user_id, full_name, display_name, city, district, elo, skill_level, verified_rank) VALUES
-- Beginners (K rank)
('user-001', 'Nguyễn Văn Anh', 'Anh Billiards', 'Hồ Chí Minh', 'Quận 1', 1000, 'beginner', 'K'),
('user-002', 'Trần Thị Bình', 'Bình Pro', 'Hồ Chí Minh', 'Quận 3', 1050, 'beginner', 'K'),

-- Intermediate (I-H ranks)  
('user-003', 'Lê Văn Cường', 'Cường 9-Ball', 'Hà Nội', 'Ba Đình', 1300, 'intermediate', 'I+'),
('user-004', 'Phạm Thị Dung', 'Dung Queen', 'Đà Nẵng', 'Hải Châu', 1450, 'intermediate', 'H'),

-- Advanced (G-E ranks)
('user-005', 'Hoàng Văn Hiếu', 'Hiếu Ace', 'Hồ Chí Minh', 'Quận 7', 1750, 'advanced', 'G+'),
('user-006', 'Ngô Thị Lan', 'Lan Legend', 'Hà Nội', 'Đống Đa', 1900, 'advanced', 'F'),

-- Professional (D+ and above)
('user-007', 'Vũ Văn Mạnh', 'Mạnh Tiger', 'Hồ Chí Minh', 'Bình Thạnh', 2200, 'pro', 'C+'),
('user-008', 'Đỗ Thị Nga', 'Nga Phoenix', 'Hà Nội', 'Hoàn Kiếm', 2500, 'pro', 'B');

-- Demo Player Statistics
INSERT INTO player_statistics (user_id, total_matches, total_wins, total_losses, win_percentage, current_streak) VALUES
('user-001', 25, 12, 13, 48.0, 2),
('user-002', 30, 18, 12, 60.0, 5),
('user-003', 85, 55, 30, 64.7, 8),
('user-004', 120, 78, 42, 65.0, 3),
('user-005', 200, 140, 60, 70.0, 12),
('user-006', 350, 280, 70, 80.0, 25),
('user-007', 500, 425, 75, 85.0, 18),
('user-008', 800, 720, 80, 90.0, 35);
