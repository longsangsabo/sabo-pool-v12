-- Reset điểm ELO về tương ứng với các mức hạng
-- Migration này sẽ reset tất cả player về điểm ELO chuẩn theo hạng đã verify

-- Function để convert hạng thành ELO rating
CREATE OR REPLACE FUNCTION get_elo_from_rank(rank_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- SABO Pool Arena Ranking System
  CASE rank_text
    WHEN 'E+' THEN RETURN 2800;
    WHEN 'E' THEN RETURN 2600;
    WHEN 'F+' THEN RETURN 2400;
    WHEN 'F' THEN RETURN 2200;
    WHEN 'G+' THEN RETURN 2000;
    WHEN 'G' THEN RETURN 1800;
    WHEN 'H+' THEN RETURN 1600;
    WHEN 'H' THEN RETURN 1400;
    WHEN 'I+' THEN RETURN 1200;
    WHEN 'I' THEN RETURN 1000;
    WHEN 'K+' THEN RETURN 800;
    WHEN 'K' THEN RETURN 600;
    -- Traditional ranks mapping
    WHEN 'Dan1' THEN RETURN 1800;
    WHEN 'Dan2' THEN RETURN 1900;
    WHEN 'Dan3' THEN RETURN 2000;
    WHEN 'Dan4' THEN RETURN 2100;
    WHEN 'Dan5' THEN RETURN 2200;
    WHEN 'Dan6' THEN RETURN 2300;
    WHEN 'Dan7' THEN RETURN 2400;
    -- Kyu ranks
    WHEN 'Kyu1' THEN RETURN 1700;
    WHEN 'Kyu2' THEN RETURN 1600;
    WHEN 'Kyu3' THEN RETURN 1500;
    WHEN 'Kyu4' THEN RETURN 1400;
    WHEN 'Kyu5' THEN RETURN 1300;
    WHEN 'Kyu6' THEN RETURN 1200;
    WHEN 'Kyu7' THEN RETURN 1100;
    WHEN 'Kyu8' THEN RETURN 1000;
    WHEN 'Kyu9' THEN RETURN 900;
    WHEN 'Kyu10' THEN RETURN 800;
    -- Beginner levels
    WHEN 'beginner' THEN RETURN 1000;
    WHEN 'intermediate' THEN RETURN 1400;
    WHEN 'advanced' THEN RETURN 1800;
    -- Default for unrecognized ranks
    ELSE RETURN 1000;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Reset ELO points dựa trên verified rank
UPDATE player_rankings 
SET elo_points = get_elo_from_rank(
  COALESCE(
    (SELECT p.verified_rank FROM profiles p WHERE p.user_id = player_rankings.player_id),
    'beginner'
  )
),
updated_at = NOW()
WHERE player_rankings.player_id IS NOT NULL;

-- Reset ELO cho những user có verified_rank trong profiles nhưng chưa có trong player_rankings
INSERT INTO player_rankings (
  player_id, 
  elo_points, 
  spa_points, 
  total_matches, 
  wins, 
  losses,
  created_at,
  updated_at
)
SELECT 
  p.user_id,
  get_elo_from_rank(COALESCE(p.verified_rank, 'beginner')),
  0, -- SPA points start at 0
  0, -- Total matches start at 0
  0, -- Wins start at 0
  0, -- Losses start at 0
  NOW(),
  NOW()
FROM profiles p
WHERE p.user_id NOT IN (SELECT COALESCE(player_id, '00000000-0000-0000-0000-000000000000') FROM player_rankings)
  AND p.user_id IS NOT NULL;

-- Tạo backup log cho việc reset
INSERT INTO spa_transaction_log (
  user_id,
  transaction_type,
  points_change,
  previous_balance,
  new_balance,
  description,
  created_at
)
SELECT 
  pr.player_id,
  'elo_reset',
  0, -- This is for ELO reset, not SPA points
  0,
  pr.elo_points,
  CONCAT('ELO reset to rank standard. Rank: ', COALESCE(p.verified_rank, 'beginner'), ' -> ELO: ', pr.elo_points),
  NOW()
FROM player_rankings pr
LEFT JOIN profiles p ON p.user_id = pr.player_id
WHERE pr.player_id IS NOT NULL;

-- Tạo function để get rank từ ELO (reverse mapping)
CREATE OR REPLACE FUNCTION get_rank_from_elo(elo_rating INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN elo_rating >= 2800 THEN RETURN 'E+';
    WHEN elo_rating >= 2600 THEN RETURN 'E';
    WHEN elo_rating >= 2400 THEN RETURN 'F+';
    WHEN elo_rating >= 2200 THEN RETURN 'F';
    WHEN elo_rating >= 2000 THEN RETURN 'G+';
    WHEN elo_rating >= 1800 THEN RETURN 'G';
    WHEN elo_rating >= 1600 THEN RETURN 'H+';
    WHEN elo_rating >= 1400 THEN RETURN 'H';
    WHEN elo_rating >= 1200 THEN RETURN 'I+';
    WHEN elo_rating >= 1000 THEN RETURN 'I';
    WHEN elo_rating >= 800 THEN RETURN 'K+';
    ELSE RETURN 'K';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update verified_rank trong profiles để match với ELO đã reset (nếu chưa có)
UPDATE profiles 
SET verified_rank = get_rank_from_elo(
  (SELECT elo_points FROM player_rankings WHERE player_id = profiles.user_id)
),
updated_at = NOW()
WHERE verified_rank IS NULL 
  AND user_id IN (SELECT player_id FROM player_rankings WHERE player_id IS NOT NULL);

-- Tạo view để xem kết quả reset
CREATE OR REPLACE VIEW elo_reset_summary AS
SELECT 
  p.display_name,
  p.verified_rank,
  pr.elo_points,
  get_rank_from_elo(pr.elo_points) as calculated_rank,
  CASE 
    WHEN p.verified_rank = get_rank_from_elo(pr.elo_points) THEN 'MATCH'
    ELSE 'MISMATCH'
  END as rank_elo_consistency,
  pr.total_matches,
  pr.wins,
  pr.losses,
  pr.spa_points
FROM profiles p
JOIN player_rankings pr ON p.user_id = pr.player_id
ORDER BY pr.elo_points DESC;

-- Grant permissions
GRANT SELECT ON elo_reset_summary TO authenticated;

-- Verify reset bằng query report
SELECT 
  'ELO Reset Completed' as status,
  COUNT(*) as total_players_reset,
  MIN(elo_points) as min_elo,
  MAX(elo_points) as max_elo,
  ROUND(AVG(elo_points)) as avg_elo
FROM player_rankings 
WHERE player_id IS NOT NULL;

-- Hiển thị distribution theo rank
SELECT 
  get_rank_from_elo(elo_points) as rank,
  COUNT(*) as player_count,
  MIN(elo_points) as min_elo_in_rank,
  MAX(elo_points) as max_elo_in_rank
FROM player_rankings 
WHERE player_id IS NOT NULL
GROUP BY get_rank_from_elo(elo_points)
ORDER BY MIN(elo_points) DESC;
