-- =============================================================================
-- DEMO: DIGITAL WALLET & ECONOMICS SYSTEM
-- Multi-currency wallet with SPA points
-- =============================================================================

-- User Wallets
INSERT INTO wallets (user_id, points_balance, total_earned, total_spent, wallet_balance) VALUES
('user-001', 250, 500, 250, 100000),
('user-002', 420, 800, 380, 250000),
('user-003', 680, 1200, 520, 180000),
('user-004', 950, 1500, 550, 320000),
('user-005', 1240, 2000, 760, 450000),
('user-006', 1850, 3000, 1150, 680000),
('user-007', 2650, 4500, 1850, 920000),
('user-008', 3420, 6000, 2580, 1500000);

-- Wallet Transactions (Recent Activity)
INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description, transaction_category, created_at) VALUES
-- Challenge winnings
((SELECT id FROM wallets WHERE user_id = 'user-004'), 'credit', 300, 'Won challenge vs user-005', 'challenge_win', NOW() - INTERVAL '2 hours'),
((SELECT id FROM wallets WHERE user_id = 'user-006'), 'credit', 500, 'Won challenge vs user-005', 'challenge_win', NOW() - INTERVAL '1 day'),

-- Tournament prizes
((SELECT id FROM wallets WHERE user_id = 'user-008'), 'credit', 800000, 'Pro Masters Series - 1st Place', 'tournament_prize', NOW() - INTERVAL '3 days'),
((SELECT id FROM wallets WHERE user_id = 'user-007'), 'credit', 400000, 'Pro Masters Series - 2nd Place', 'tournament_prize', NOW() - INTERVAL '3 days'),

-- Entry fees
((SELECT id FROM wallets WHERE user_id = 'user-001'), 'debit', 50000, 'SABO Weekly Championship entry', 'tournament_entry', NOW() - INTERVAL '2 days'),
((SELECT id FROM wallets WHERE user_id = 'user-002'), 'debit', 20000, 'Rookie Cup entry fee', 'tournament_entry', NOW() - INTERVAL '1 day'),

-- Table bookings
((SELECT id FROM wallets WHERE user_id = 'user-001'), 'debit', 160000, 'Table booking at SABO Arena Central', 'table_booking', NOW() - INTERVAL '5 hours'),
((SELECT id FROM wallets WHERE user_id = 'user-003'), 'debit', 120000, 'Table booking at SABO Arena Central', 'table_booking', NOW() - INTERVAL '1 day'),

-- Top-ups
((SELECT id FROM wallets WHERE user_id = 'user-002'), 'credit', 200000, 'Wallet top-up via MoMo', 'deposit', NOW() - INTERVAL '6 hours'),
((SELECT id FROM wallets WHERE user_id = 'user-004'), 'credit', 300000, 'Wallet top-up via ZaloPay', 'deposit', NOW() - INTERVAL '2 days');

-- SPA Points Log (Activity tracking)
INSERT INTO spa_points_log (player_id, source_type, source_id, points_earned, description, created_at) VALUES
-- Challenge participation
('user-001', 'challenge', 'challenge-001', 50, 'Participated in challenge', NOW() - INTERVAL '3 hours'),
('user-002', 'challenge', 'challenge-001', 100, 'Won challenge match', NOW() - INTERVAL '3 hours'),
('user-003', 'challenge', 'challenge-002', 75, 'Participated in challenge', NOW() - INTERVAL '2 days'),

-- Tournament participation  
('user-001', 'tournament', 'tournament-001', 100, 'Tournament registration', NOW() - INTERVAL '2 days'),
('user-007', 'tournament', 'tournament-003', 500, 'Tournament winner', NOW() - INTERVAL '3 days'),
('user-008', 'tournament', 'tournament-003', 500, 'Tournament winner', NOW() - INTERVAL '3 days'),

-- Daily check-ins
('user-001', 'checkin', NULL, 10, 'Daily check-in bonus', NOW() - INTERVAL '1 day'),
('user-002', 'checkin', NULL, 10, 'Daily check-in bonus', NOW()),
('user-003', 'checkin', NULL, 10, 'Daily check-in bonus', NOW() - INTERVAL '6 hours'),

-- Achievements
('user-006', 'achievement', 'milestone-001', 200, 'Reached 100 matches played', NOW() - INTERVAL '1 week'),
('user-007', 'achievement', 'milestone-002', 500, 'Won 10 tournaments', NOW() - INTERVAL '2 weeks');

-- SPA Reward Milestones
INSERT INTO spa_reward_milestones (milestone_name, required_points, reward_type, reward_value, description) VALUES
('First Steps', 100, 'points', 50, 'Complete first 5 challenges'),
('Rising Star', 500, 'points', 200, 'Win 10 matches in a row'),
('Club Champion', 1000, 'cash', 100000, 'Win a club tournament'),
('Tournament Master', 2500, 'cash', 500000, 'Win 5 tournaments'),
('Billiards Legend', 5000, 'special', 0, 'Exclusive legend status and benefits');
