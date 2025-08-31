-- =============================================================================
-- DEMO: TOURNAMENT MANAGEMENT SYSTEM
-- Automated tournament engine with brackets
-- =============================================================================

-- Demo Tournaments
INSERT INTO tournaments (id, name, description, max_participants, entry_fee, prize_pool, status, club_id) VALUES
('tournament-001', 'SABO Weekly Championship', 'Giải đấu hàng tuần cho mọi level', 16, 50000, 500000, 'in_progress', 'club-001'),
('tournament-002', 'Rookie Cup 2025', 'Giải đấu dành cho người mới (K-I rank)', 8, 20000, 120000, 'registration_open', 'club-002'),
('tournament-003', 'Pro Masters Series', 'Giải đấu chuyên nghiệp (D+ rank trở lên)', 32, 200000, 2000000, 'completed', 'club-001'),
('tournament-004', 'Club Championship', 'Giải vô địch câu lạc bộ', 24, 100000, 1200000, 'registration_open', 'club-003');

-- Tournament Participants
INSERT INTO tournament_participants (tournament_id, user_id, registration_date, seed_position, entry_fee, payment_status) VALUES
-- SABO Weekly Championship
('tournament-001', 'user-001', NOW() - INTERVAL '2 days', 16, 50000, 'paid'),
('tournament-001', 'user-002', NOW() - INTERVAL '2 days', 15, 50000, 'paid'),
('tournament-001', 'user-003', NOW() - INTERVAL '2 days', 8, 50000, 'paid'),
('tournament-001', 'user-004', NOW() - INTERVAL '2 days', 5, 50000, 'paid'),
('tournament-001', 'user-005', NOW() - INTERVAL '2 days', 3, 50000, 'paid'),
('tournament-001', 'user-006', NOW() - INTERVAL '2 days', 2, 50000, 'paid'),
('tournament-001', 'user-007', NOW() - INTERVAL '2 days', 1, 50000, 'paid'),

-- Rookie Cup
('tournament-002', 'user-001', NOW() - INTERVAL '1 day', 1, 20000, 'paid'),
('tournament-002', 'user-002', NOW() - INTERVAL '1 day', 2, 20000, 'paid');

-- Tournament Matches (Sample bracket progression)
INSERT INTO tournament_matches (tournament_id, round_number, match_number, player1_id, player2_id, winner_id, player1_score, player2_score, status) VALUES
-- Round 1 matches
('tournament-001', 1, 1, 'user-007', 'user-001', 'user-007', 8, 3, 'completed'),
('tournament-001', 1, 2, 'user-006', 'user-002', 'user-006', 8, 5, 'completed'),
('tournament-001', 1, 3, 'user-005', 'user-003', 'user-005', 8, 6, 'completed'),
('tournament-001', 1, 4, 'user-004', 'user-008', 'user-008', 5, 8, 'completed'),

-- Semifinals
('tournament-001', 2, 1, 'user-007', 'user-006', 'user-007', 8, 4, 'completed'),
('tournament-001', 2, 2, 'user-005', 'user-008', 'user-008', 6, 8, 'completed'),

-- Final
('tournament-001', 3, 1, 'user-007', 'user-008', NULL, NULL, NULL, 'scheduled');

-- Tournament Results (Completed Pro Masters)
INSERT INTO tournament_results (tournament_id, user_id, final_position, matches_played, matches_won, spa_points_earned, elo_points_earned, prize_amount) VALUES
('tournament-003', 'user-008', 1, 5, 5, 500, 100, 800000),
('tournament-003', 'user-007', 2, 5, 4, 300, 50, 400000),
('tournament-003', 'user-006', 3, 4, 3, 200, 25, 200000),
('tournament-003', 'user-005', 4, 4, 2, 150, 10, 100000);
