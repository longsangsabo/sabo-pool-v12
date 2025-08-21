-- Tạo test data cho tournament_results để test tab

-- Kiểm tra tournament hiện có
SELECT id, name, status, tournament_type FROM tournaments 
WHERE tournament_type IN ('sabo', 'double_elimination') 
ORDER BY created_at DESC 
LIMIT 5;

-- Tạo test tournament results (thay tournament_id bằng ID thực tế)
-- Ví dụ với tournament_id = '123e4567-e89b-12d3-a456-426614174000'

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
-- Winner - Vị trí 1
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174001', 1, 5, 0, 5, 100.00, 50, 25, 'Champion'),

-- Runner-up - Vị trí 2  
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174002', 2, 4, 1, 5, 80.00, 30, 15, 'Runner-up'),

-- 3rd place
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174003', 3, 3, 2, 5, 60.00, 20, 10, 'Semi-finalist'),

-- 4th place
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174004', 4, 2, 3, 5, 40.00, 15, 5, 'Semi-finalist'),

-- 5th-8th places
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174005', 5, 2, 2, 4, 50.00, 10, 0, 'Quarterfinalist'),
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174006', 6, 1, 3, 4, 25.00, 10, 0, 'Quarterfinalist'),
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174007', 7, 1, 2, 3, 33.33, 10, 0, 'Quarterfinalist'),
('123e4567-e89b-12d3-a456-426614174000', 'b1234567-e89b-12d3-a456-426614174008', 8, 0, 3, 3, 0.00, 10, 0, 'Quarterfinalist')

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

-- Verify results
SELECT 
  tr.final_position,
  tr.user_id,
  tr.wins,
  tr.losses,
  tr.matches_played,
  tr.win_percentage,
  tr.spa_points_earned,
  tr.elo_points_awarded,
  tr.placement_type
FROM tournament_results tr
WHERE tr.tournament_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY tr.final_position;
