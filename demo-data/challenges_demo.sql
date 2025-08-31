-- =============================================================================
-- DEMO: INTELLIGENT CHALLENGE SYSTEM
-- SABO game engine with handicap logic
-- =============================================================================

-- Active Challenges with Different Bet Levels
INSERT INTO challenges (id, challenger_id, opponent_id, bet_points, race_to, status, challenger_handicap, opponent_handicap) VALUES
-- 100-point challenges (Race to 9)
('challenge-001', 'user-001', 'user-002', 100, 9, 'accepted', 0, 0.5),
('challenge-002', 'user-003', 'user-001', 150, 9, 'pending', 1.0, 0),

-- 300-point challenges (Race to 13)  
('challenge-003', 'user-004', 'user-003', 300, 13, 'in_progress', 0, 1.5),
('challenge-004', 'user-005', 'user-004', 350, 13, 'completed', 2.0, 0),

-- 500-point challenges (Race to 18)
('challenge-005', 'user-006', 'user-005', 500, 18, 'completed', 1.5, 0),
('challenge-006', 'user-007', 'user-006', 550, 18, 'accepted', 2.5, 0),

-- High-stakes 600-point challenge (Race to 22)
('challenge-007', 'user-008', 'user-007', 600, 22, 'pending', 3.0, 0);

-- Challenge Results for Completed Matches
INSERT INTO challenge_results (challenge_id, winner_id, challenger_score, opponent_score, match_duration, elo_change_winner, elo_change_loser) VALUES
('challenge-004', 'user-004', 13, 8, 45, 25, -25),
('challenge-005', 'user-006', 18, 12, 62, 30, -30);

-- Verification Records
INSERT INTO challenge_verification (challenge_id, verified_by, verification_status, verification_images, verification_notes) VALUES
('challenge-004', 'user-003', 'verified', '["match1_table.jpg", "match1_final.jpg"]', 'Match verified by club staff'),
('challenge-005', 'user-005', 'verified', '["match2_scoreboard.jpg"]', 'Clear victory for Lan Legend');
