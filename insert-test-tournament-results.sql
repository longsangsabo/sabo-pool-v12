-- Tạo test tournament results cho tournament test9
-- Tournament ID: e3ae227d-c191-4208-a604-794b8b2a5c31

INSERT INTO tournament_results (
  tournament_id,
  user_id, 
  final_position,
  wins,
  losses,
  matches_played,
  win_percentage,
  spa_points_earned,
  elo_points_awarded,
  placement_type
) VALUES 
-- Winner - Vị trí 1 (Sang)
('e3ae227d-c191-4208-a604-794b8b2a5c31', 'e30e1d1d-d714-4678-b63c-9f403ea2aeac', 1, 5, 0, 5, 100.00, 50, 25, 'Champion'),

-- Runner-up - Vị trí 2 (Ben)
('e3ae227d-c191-4208-a604-794b8b2a5c31', 'e411093e-144a-46c3-9def-37186c4ee6c8', 2, 4, 1, 5, 80.00, 30, 15, 'Runner-up'),

-- 3rd place (Phan Nam Long)
('e3ae227d-c191-4208-a604-794b8b2a5c31', '519cf7c9-e112-40b2-9e4d-0cd44783ec9e', 3, 3, 2, 5, 60.00, 20, 10, 'Semi-finalist'),

-- 4th place (sabo)
('e3ae227d-c191-4208-a604-794b8b2a5c31', 'f926fc5d-74d8-4d63-a830-0a9676d8e0be', 4, 2, 3, 5, 40.00, 15, 5, 'Semi-finalist'),

-- 5th place (Anh Long)
('e3ae227d-c191-4208-a604-794b8b2a5c31', 'd7d6ce12-490f-4fff-b913-80044de5e169', 5, 2, 2, 4, 50.00, 10, 0, 'Quarterfinalist'),

-- 6th place (Phan Thị Bình)
('e3ae227d-c191-4208-a604-794b8b2a5c31', '4bedc2fd-a85d-483d-80e5-c9541d6ecdc2', 6, 1, 3, 4, 25.00, 10, 0, 'Quarterfinalist'),

-- 7th place (Đặng Linh Hải)  
('e3ae227d-c191-4208-a604-794b8b2a5c31', '0e541971-640e-4a5e-881b-b7f98a2904f7', 7, 1, 2, 3, 33.33, 10, 0, 'Quarterfinalist'),

-- 8th place (Phan Hùng Phong)
('e3ae227d-c191-4208-a604-794b8b2a5c31', '9f5c350d-5ee2-4aa4-bd1e-e1ac2ed57e6a', 8, 0, 3, 3, 0.00, 10, 0, 'Quarterfinalist')

ON CONFLICT (tournament_id, user_id) DO UPDATE SET
  final_position = EXCLUDED.final_position,
  wins = EXCLUDED.wins,
  losses = EXCLUDED.losses,
  matches_played = EXCLUDED.matches_played,
  win_percentage = EXCLUDED.win_percentage,
  spa_points_earned = EXCLUDED.spa_points_earned,
  elo_points_awarded = EXCLUDED.elo_points_awarded,
  placement_type = EXCLUDED.placement_type,
  updated_at = NOW();
