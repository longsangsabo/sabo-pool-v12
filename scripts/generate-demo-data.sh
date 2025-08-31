#!/bin/bash

# 🎱 SABO POOL DATABASE DEMO GENERATOR
# Generates interactive demo data and visualizations

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${CYAN}🎱 SABO POOL V12 - DATABASE DEMO GENERATOR${NC}"
echo -e "${CYAN}===========================================${NC}"

# Demo data directory
DEMO_DIR="./demo-data"
mkdir -p "$DEMO_DIR"

echo -e "\n${YELLOW}📊 Generating Demo Data Visualizations...${NC}"

# ============================================================================
# 1. USER MANAGEMENT DEMO DATA
# ============================================================================

echo -e "\n${BLUE}👥 1. USER MANAGEMENT SYSTEM${NC}"

cat > "$DEMO_DIR/users_demo.sql" << 'EOF'
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
EOF

echo -e "${GREEN}   ✅ Generated users_demo.sql (8 demo users)${NC}"

# ============================================================================
# 2. CHALLENGE SYSTEM DEMO DATA  
# ============================================================================

echo -e "\n${BLUE}🎯 2. INTELLIGENT CHALLENGE SYSTEM${NC}"

cat > "$DEMO_DIR/challenges_demo.sql" << 'EOF'
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
EOF

echo -e "${GREEN}   ✅ Generated challenges_demo.sql (7 demo challenges)${NC}"

# ============================================================================
# 3. TOURNAMENT DEMO DATA
# ============================================================================

echo -e "\n${BLUE}🏆 3. TOURNAMENT MANAGEMENT SYSTEM${NC}"

cat > "$DEMO_DIR/tournaments_demo.sql" << 'EOF'
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
EOF

echo -e "${GREEN}   ✅ Generated tournaments_demo.sql (4 demo tournaments)${NC}"

# ============================================================================
# 4. CLUB MANAGEMENT DEMO DATA
# ============================================================================

echo -e "\n${BLUE}🏢 4. CLUB MANAGEMENT SYSTEM${NC}"

cat > "$DEMO_DIR/clubs_demo.sql" << 'EOF'
-- =============================================================================
-- DEMO: CLUB MANAGEMENT SYSTEM  
-- Business operations and table management
-- =============================================================================

-- Demo Clubs
INSERT INTO clubs (id, name, address, city, district, phone, status, table_count, is_sabo_partner) VALUES
('club-001', 'SABO Arena Central', '123 Nguyễn Huệ, Quận 1', 'Hồ Chí Minh', 'Quận 1', '028-1234-5678', 'active', 12, true),
('club-002', 'Billiards Pro Club', '456 Lê Lợi, Quận 3', 'Hồ Chí Minh', 'Quận 3', '028-2345-6789', 'active', 8, false),
('club-003', 'Royal Pool Lounge', '789 Hai Bà Trưng, Ba Đình', 'Hà Nội', 'Ba Đình', '024-3456-7890', 'active', 16, true),
('club-004', 'Champion Billiards', '321 Trường Chinh, Thanh Xuân', 'Hà Nội', 'Thanh Xuân', '024-4567-8901', 'active', 6, false);

-- Club Profiles (Owners)
INSERT INTO club_profiles (id, user_id, club_id, club_name, verification_status, description) VALUES
('profile-001', 'user-007', 'club-001', 'SABO Arena Central', 'approved', 'Premium billiards club với trang thiết bị hiện đại'),
('profile-002', 'user-006', 'club-002', 'Billiards Pro Club', 'approved', 'Club chuyên nghiệp cho các tay cơ thực thụ'),
('profile-003', 'user-008', 'club-003', 'Royal Pool Lounge', 'approved', 'Không gian sang trọng cho giải trí cao cấp'),
('profile-004', 'user-005', 'club-004', 'Champion Billiards', 'pending', 'Club mới với môi trường thân thiện');

-- Club Tables Management
INSERT INTO club_tables (club_id, table_number, table_name, status, hourly_rate) VALUES
-- SABO Arena Central (12 tables)
('club-001', 1, 'VIP Table 1', 'available', 80000),
('club-001', 2, 'VIP Table 2', 'occupied', 80000),
('club-001', 3, 'Standard Table 1', 'available', 60000),
('club-001', 4, 'Standard Table 2', 'maintenance', 60000),
('club-001', 5, 'Standard Table 3', 'available', 60000),

-- Billiards Pro Club (8 tables)
('club-002', 1, 'Pro Table A', 'available', 70000),
('club-002', 2, 'Pro Table B', 'occupied', 70000),
('club-002', 3, 'Training Table', 'available', 50000),

-- Royal Pool Lounge (16 tables)
('club-003', 1, 'Royal Suite 1', 'available', 120000),
('club-003', 2, 'Royal Suite 2', 'reserved', 120000),
('club-003', 3, 'Premium Table 1', 'available', 90000);

-- Club Bookings
INSERT INTO club_bookings (club_id, user_id, table_number, booking_date, start_time, end_time, total_amount, status) VALUES
('club-001', 'user-001', 1, CURRENT_DATE + INTERVAL '1 day', '14:00', '16:00', 160000, 'confirmed'),
('club-001', 'user-003', 3, CURRENT_DATE + INTERVAL '2 days', '19:00', '21:00', 120000, 'confirmed'),
('club-002', 'user-002', 1, CURRENT_DATE, '20:00', '22:00', 140000, 'completed'),
('club-003', 'user-004', 1, CURRENT_DATE + INTERVAL '3 days', '15:00', '17:00', 240000, 'pending');

-- Club Statistics
INSERT INTO club_stats (club_id, total_members, monthly_revenue, average_rating, popular_time_slots) VALUES
('club-001', 150, 25000000, 4.8, '["19:00-21:00", "20:00-22:00", "14:00-16:00"]'),
('club-002', 80, 12000000, 4.5, '["18:00-20:00", "20:00-22:00"]'),
('club-003', 200, 35000000, 4.9, '["19:00-21:00", "21:00-23:00", "15:00-17:00"]'),
('club-004', 45, 6000000, 4.2, '["19:00-21:00", "20:00-22:00"]');
EOF

echo -e "${GREEN}   ✅ Generated clubs_demo.sql (4 demo clubs with tables & bookings)${NC}"

# ============================================================================
# 5. FINANCIAL SYSTEM DEMO DATA
# ============================================================================

echo -e "\n${BLUE}💰 5. DIGITAL WALLET & ECONOMICS${NC}"

cat > "$DEMO_DIR/wallet_demo.sql" << 'EOF'
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
EOF

echo -e "${GREEN}   ✅ Generated wallet_demo.sql (8 wallets with transactions)${NC}"

# ============================================================================
# 6. RANKING DEMO DATA
# ============================================================================

echo -e "\n${BLUE}📊 6. RANKING & ANALYTICS SYSTEM${NC}"

cat > "$DEMO_DIR/ranking_demo.sql" << 'EOF'
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
EOF

echo -e "${GREEN}   ✅ Generated ranking_demo.sql (21 ranks + ELO tracking)${NC}"

# ============================================================================
# 7. GENERATE DEMO SUMMARY
# ============================================================================

echo -e "\n${YELLOW}📋 Generating Demo Summary...${NC}"

cat > "$DEMO_DIR/demo_summary.md" << 'EOF'
# 🎱 SABO POOL V12 - DEMO DATA SUMMARY

**Generated**: $(date)
**Database**: PostgreSQL + Supabase
**Demo Environment**: Complete SABO Pool ecosystem

## 📊 Demo Data Overview

### 👥 Users & Profiles
- **8 Demo Users** across all skill levels (K to B rank)
- **ELO Range**: 1000-2500 (complete spectrum)
- **Geographic Distribution**: Hồ Chí Minh, Hà Nội, Đà Nẵng
- **Player Statistics**: Complete match history & win rates

### 🎯 Challenge System
- **7 Active Challenges** with different bet levels
- **Handicap Logic**: Smart handicap based on rank difference
- **Bet Range**: 100-600 points (race to 9-22)
- **Challenge States**: pending, accepted, in_progress, completed

### 🏆 Tournament Management
- **4 Demo Tournaments** (weekly, rookie, pro, club)
- **Complete Bracket System**: Round progression with results
- **Prize Distribution**: Automated prize allocation
- **Tournament Types**: Single elimination with seeding

### 🏢 Club Operations
- **4 Partner Clubs** (2 SABO partners, 2 independent)
- **Table Management**: 42+ tables across all clubs
- **Booking System**: Active reservations and history
- **Business Analytics**: Revenue and member statistics

### 💰 Financial Ecosystem
- **8 Digital Wallets** with VND and points
- **Transaction History**: Challenge wins, tournament prizes, bookings
- **SPA Points System**: Activity-based point earning
- **Milestone Rewards**: Achievement-based rewards

### 📊 Ranking & Analytics
- **21-Tier Rank System** (K to Pro with color coding)
- **ELO Tracking**: Complete ELO history with changes
- **Monthly Rankings**: City and district leaderboards
- **Promotion System**: Rank request and verification process

## 🎮 Demo Scenarios Ready

### Scenario 1: New Player Journey
```
User: Nguyễn Văn Anh (user-001)
- Started at K rank, 1000 ELO
- Played 25 matches, won 12 (48% win rate)
- Currently in challenge vs Trần Thị Bình
- Requested promotion to K+ rank
- Wallet: 250 points, 100,000 VND
```

### Scenario 2: Tournament Champion
```
User: Đỗ Thị Nga (user-008)
- B rank, 2500 ELO (top player)
- Won Pro Masters Series (800,000 VND prize)
- 90% win rate over 800 matches
- Owns Royal Pool Lounge club
- Wallet: 3,420 points, 1,500,000 VND
```

### Scenario 3: Club Business
```
Club: SABO Arena Central
- 12 VIP and standard tables
- 150 members, 25M VND monthly revenue
- 4.8/5 rating, peak hours 19:00-21:00
- Hosting SABO Weekly Championship
- Partner club with premium features
```

### Scenario 4: Live Challenge
```
Challenge: Vũ Văn Mạnh vs Đỗ Thị Nga
- High-stakes 600-point bet (Race to 22)
- Handicap: 3.0 for Mạnh (rank difference)
- Status: Pending acceptance
- Estimated match duration: 60+ minutes
- Winner gets 600 points + ELO boost
```

## 🔧 Demo Data Files

1. **users_demo.sql** - User profiles and statistics
2. **challenges_demo.sql** - Challenge system with handicap
3. **tournaments_demo.sql** - Tournament management
4. **clubs_demo.sql** - Club operations and bookings  
5. **wallet_demo.sql** - Financial system and transactions
6. **ranking_demo.sql** - Ranking and ELO tracking

## 🚀 How to Use Demo Data

```bash
# Load all demo data
psql -d sabo_pool -f demo-data/users_demo.sql
psql -d sabo_pool -f demo-data/challenges_demo.sql
psql -d sabo_pool -f demo-data/tournaments_demo.sql
psql -d sabo_pool -f demo-data/clubs_demo.sql
psql -d sabo_pool -f demo-data/wallet_demo.sql
psql -d sabo_pool -f demo-data/ranking_demo.sql

# Or use the combined demo loader
psql -d sabo_pool -f demo-data/load_all_demo.sql
```

## 📈 Business Metrics (Demo Environment)

- **Total Users**: 8 active players
- **Active Challenges**: 7 matches in various stages
- **Running Tournaments**: 2 accepting registrations
- **Partner Clubs**: 4 clubs with 42+ tables
- **Monthly Revenue**: 78M VND across all clubs
- **Transaction Volume**: 2.5M VND in last 30 days
- **Average ELO**: 1,637 (healthy distribution)
- **Win Rate Range**: 48%-90% (skill diversity)

*Demo environment showcases complete SABO Pool ecosystem with realistic data for all user journeys and business scenarios.*
EOF

# Create master demo loader
cat > "$DEMO_DIR/load_all_demo.sql" << 'EOF'
-- =============================================================================
-- SABO POOL V12 - MASTER DEMO LOADER
-- Loads complete demo environment with all systems
-- =============================================================================

\echo 'Loading SABO Pool Demo Data...'

\echo '1. Loading user profiles and statistics...'
\i users_demo.sql

\echo '2. Loading challenge system...'  
\i challenges_demo.sql

\echo '3. Loading tournament management...'
\i tournaments_demo.sql

\echo '4. Loading club operations...'
\i clubs_demo.sql

\echo '5. Loading financial system...'
\i wallet_demo.sql

\echo '6. Loading ranking system...'
\i ranking_demo.sql

\echo 'Demo data loaded successfully!'
\echo 'SABO Pool V12 demo environment ready.'
EOF

echo -e "${GREEN}   ✅ Generated demo_summary.md and load_all_demo.sql${NC}"

# ============================================================================
# 8. CREATE INTERACTIVE DEMO SCRIPT
# ============================================================================

echo -e "\n${YELLOW}🎮 Creating Interactive Demo Script...${NC}"

cat > "$DEMO_DIR/interactive_demo.sh" << 'EOF'
#!/bin/bash

# 🎱 SABO POOL V12 - INTERACTIVE DEMO
# Showcases live database operations

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}🎱 SABO POOL V12 - INTERACTIVE DEMO${NC}"
echo -e "${CYAN}==================================${NC}"

echo -e "\n${YELLOW}Choose demo scenario:${NC}"
echo -e "${BLUE}1. New Player Registration Journey${NC}"
echo -e "${BLUE}2. Challenge Match Simulation${NC}"
echo -e "${BLUE}3. Tournament Bracket Progression${NC}"
echo -e "${BLUE}4. Club Business Dashboard${NC}"
echo -e "${BLUE}5. Financial Transaction Flow${NC}"
echo -e "${BLUE}6. Ranking System Demo${NC}"
echo -e "${BLUE}7. Complete Platform Overview${NC}"

read -p "Enter choice (1-7): " choice

case $choice in
1)
    echo -e "\n${GREEN}🎮 NEW PLAYER REGISTRATION JOURNEY${NC}"
    echo -e "${CYAN}Simulating: Nguyễn Văn Anh joins SABO Pool${NC}"
    
    echo -e "\n${YELLOW}Step 1: User Registration${NC}"
    echo "✅ Account created with phone verification"
    echo "✅ Initial ELO: 1000 (K rank)"
    echo "✅ Welcome bonus: 100 SPA points"
    
    echo -e "\n${YELLOW}Step 2: Profile Setup${NC}"
    echo "✅ Location: Hồ Chí Minh, Quận 1"
    echo "✅ Skill level: Beginner"
    echo "✅ Avatar uploaded"
    
    echo -e "\n${YELLOW}Step 3: First Challenge${NC}"
    echo "✅ Matched with Trần Thị Bình (similar skill)"
    echo "✅ Bet: 100 points (Race to 9)"
    echo "✅ Handicap: 0.5 for opponent"
    
    echo -e "\n${YELLOW}Step 4: Challenge Result${NC}"
    echo "✅ Match completed: Lost 3-9"
    echo "✅ ELO change: 1000 → 985 (-15)"
    echo "✅ SPA points: +50 for participation"
    
    echo -e "\n${GREEN}✨ Player journey complete! Ready for more matches.${NC}"
    ;;
    
2)
    echo -e "\n${GREEN}🎯 CHALLENGE MATCH SIMULATION${NC}"
    echo -e "${CYAN}Live Match: Vũ Văn Mạnh vs Đỗ Thị Nga${NC}"
    
    echo -e "\n${YELLOW}Match Setup:${NC}"
    echo "🔥 High-stakes challenge: 600 points"
    echo "🎱 Format: Race to 22"
    echo "⚖️ Handicap: 3.0 for Mạnh (rank difference C+ vs B)"
    echo "🏆 Winner takes all 600 points + ELO boost"
    
    echo -e "\n${YELLOW}Match Progress:${NC}"
    for i in {1..5}; do
        echo "🎱 Rack $i: Simulating..."
        sleep 1
    done
    
    echo -e "\n${YELLOW}Final Score:${NC}"
    echo "🏆 Winner: Đỗ Thị Nga"
    echo "📊 Score: 22-18 (close match despite handicap)"
    echo "💰 Prize: 600 points to winner"
    echo "📈 ELO: Nga +15, Mạnh -15"
    
    echo -e "\n${GREEN}✨ Epic match completed!${NC}"
    ;;
    
3)
    echo -e "\n${GREEN}🏆 TOURNAMENT BRACKET PROGRESSION${NC}"
    echo -e "${CYAN}SABO Weekly Championship - Live Bracket${NC}"
    
    echo -e "\n${YELLOW}Tournament Info:${NC}"
    echo "👥 Participants: 16 players"
    echo "💰 Entry fee: 50,000 VND"
    echo "🏆 Prize pool: 500,000 VND"
    echo "🎱 Format: Single elimination"
    
    echo -e "\n${YELLOW}Bracket Progression:${NC}"
    echo "🔸 Round 1: 16 → 8 players"
    echo "🔸 Round 2: 8 → 4 players (Quarterfinals)"
    echo "🔸 Round 3: 4 → 2 players (Semifinals)"
    echo "🔸 Round 4: 2 → 1 player (Final)"
    
    echo -e "\n${YELLOW}Current Status:${NC}"
    echo "✅ Semifinals completed"
    echo "🎯 Final: Vũ Văn Mạnh vs Đỗ Thị Nga"
    echo "📅 Scheduled for tonight"
    echo "🎥 Live streaming available"
    
    echo -e "\n${GREEN}✨ Tournament reaching climax!${NC}"
    ;;
    
4)
    echo -e "\n${GREEN}🏢 CLUB BUSINESS DASHBOARD${NC}"
    echo -e "${CYAN}SABO Arena Central - Live Dashboard${NC}"
    
    echo -e "\n${YELLOW}Club Overview:${NC}"
    echo "🏢 Location: 123 Nguyễn Huệ, Quận 1, HCMC"
    echo "🎱 Tables: 12 (8 standard, 4 VIP)"
    echo "👥 Members: 150 active"
    echo "⭐ Rating: 4.8/5 stars"
    
    echo -e "\n${YELLOW}Today's Performance:${NC}"
    echo "💰 Revenue: 2,850,000 VND"
    echo "🎱 Table utilization: 78%"
    echo "👥 Visitors: 45 players"
    echo "🏆 Events: SABO Weekly Championship"
    
    echo -e "\n${YELLOW}Live Table Status:${NC}"
    echo "🟢 VIP 1: Available (80k/hour)"
    echo "🔴 VIP 2: Occupied (Challenge match)"
    echo "🟢 Standard 1: Available (60k/hour)"
    echo "🟡 Standard 2: Maintenance"
    echo "🟢 Standard 3: Available (60k/hour)"
    
    echo -e "\n${GREEN}✨ Business thriving!${NC}"
    ;;
    
5)
    echo -e "\n${GREEN}💰 FINANCIAL TRANSACTION FLOW${NC}"
    echo -e "${CYAN}Multi-currency wallet system demo${NC}"
    
    echo -e "\n${YELLOW}Wallet Overview - Hoàng Văn Hiếu:${NC}"
    echo "💵 VND Balance: 450,000"
    echo "⭐ SPA Points: 1,240"
    echo "🎯 ELO Points: 1,750"
    echo "📊 Total Earned: 2,000,000 VND"
    
    echo -e "\n${YELLOW}Recent Transactions:${NC}"
    echo "✅ +300,000 VND - Tournament prize"
    echo "✅ +200 SPA - Challenge victory"
    echo "❌ -50,000 VND - Tournament entry"
    echo "❌ -160,000 VND - Table booking"
    echo "✅ +100,000 VND - Wallet top-up"
    
    echo -e "\n${YELLOW}Earning Methods:${NC}"
    echo "🎯 Challenge wins: 50-600 points/match"
    echo "🏆 Tournament prizes: 100k-2M VND"
    echo "📅 Daily check-in: 10 SPA points"
    echo "🎖️ Achievements: 50-500 SPA points"
    echo "👥 Referrals: 100,000 VND bonus"
    
    echo -e "\n${GREEN}✨ Comprehensive economy!${NC}"
    ;;
    
6)
    echo -e "\n${GREEN}📊 RANKING SYSTEM DEMO${NC}"
    echo -e "${CYAN}21-tier intelligent ranking system${NC}"
    
    echo -e "\n${YELLOW}Rank Progression:${NC}"
    echo "🥉 K → K+ → I → I+ → H → H+ → G → G+"
    echo "🥈 F → F+ → E → E+ → D → D+ → C → C+"
    echo "🥇 B → B+ → A → A+ → PRO"
    
    echo -e "\n${YELLOW}Current Top Players:${NC}"
    echo "🏆 #1 Đỗ Thị Nga (B, 2500 ELO, 90% WR)"
    echo "🥈 #2 Vũ Văn Mạnh (C+, 2200 ELO, 85% WR)"  
    echo "🥉 #3 Ngô Thị Lan (F, 1900 ELO, 80% WR)"
    echo "    #4 Hoàng Văn Hiếu (G+, 1750 ELO, 70% WR)"
    echo "    #5 Phạm Thị Dung (H, 1450 ELO, 65% WR)"
    
    echo -e "\n${YELLOW}Promotion System:${NC}"
    echo "📝 Rank requests: Submit with evidence"
    echo "🎯 Practical test: Club verification"
    echo "📊 Auto-promotion: Based on ELO thresholds"
    echo "⏰ Monthly rankings: City leaderboards"
    
    echo -e "\n${GREEN}✨ Merit-based advancement!${NC}"
    ;;
    
7)
    echo -e "\n${GREEN}🌟 COMPLETE PLATFORM OVERVIEW${NC}"
    echo -e "${CYAN}SABO Pool V12 - Full Ecosystem Demo${NC}"
    
    echo -e "\n${YELLOW}📊 Platform Statistics:${NC}"
    echo "👥 Active Users: 8 demo players"
    echo "🎯 Active Challenges: 7 matches"
    echo "🏆 Running Tournaments: 2 competitions"
    echo "🏢 Partner Clubs: 4 venues"
    echo "💰 Transaction Volume: 2.5M VND/month"
    echo "📈 Average ELO: 1,637"
    
    echo -e "\n${YELLOW}🎮 Game Engine Features:${NC}"
    echo "⚖️ Smart handicap system"
    echo "🎯 Dynamic bet sizing (100-600 points)"
    echo "🏁 Race format (9-22 racks)"
    echo "📸 Result verification"
    echo "🤖 AI opponent matching"
    
    echo -e "\n${YELLOW}🏆 Tournament Management:${NC}"
    echo "📋 Auto bracket generation"
    echo "📊 Live leaderboards"
    echo "💰 Automated prize distribution"
    echo "🎥 Streaming integration"
    echo "📱 Mobile-optimized"
    
    echo -e "\n${YELLOW}🏢 Business Features:${NC}"
    echo "🎱 Table management"
    echo "📅 Online booking"
    echo "👥 Member portals"
    echo "💰 Revenue analytics"
    echo "🤝 Partnership program"
    
    echo -e "\n${GREEN}✨ Complete billiards ecosystem ready!${NC}"
    ;;
    
*)
    echo -e "\n${YELLOW}Invalid choice. Please run again.${NC}"
    ;;
esac

echo -e "\n${CYAN}Demo completed! 🎱${NC}"
EOF

chmod +x "$DEMO_DIR/interactive_demo.sh"

echo -e "${GREEN}   ✅ Generated interactive_demo.sh${NC}"

# ============================================================================
# COMPLETION SUMMARY
# ============================================================================

echo -e "\n${CYAN}🎉 DEMO DATA GENERATION COMPLETE${NC}"
echo -e "${CYAN}=================================${NC}"

echo -e "\n${GREEN}📁 Generated Demo Files:${NC}"
ls -la "$DEMO_DIR"

echo -e "\n${YELLOW}📊 Demo Data Summary:${NC}"
echo -e "${BLUE}   • 8 Demo Users (K to B rank)${NC}"
echo -e "${BLUE}   • 7 Challenge Scenarios${NC}"
echo -e "${BLUE}   • 4 Tournament Examples${NC}"
echo -e "${BLUE}   • 4 Club Operations${NC}"
echo -e "${BLUE}   • Complete Financial System${NC}"
echo -e "${BLUE}   • 21-Tier Ranking System${NC}"

echo -e "\n${YELLOW}🚀 Ready to Demo:${NC}"
echo -e "${CYAN}   ./demo-data/interactive_demo.sh${NC}"
echo -e "${CYAN}   ./demo-data/load_all_demo.sql${NC}"

echo -e "\n${GREEN}✨ SABO Pool V12 demo environment ready!${NC}"
