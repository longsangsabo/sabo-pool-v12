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
