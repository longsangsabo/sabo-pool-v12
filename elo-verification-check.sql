-- Script kiểm tra và sync dữ liệu ELO sau reset
-- Chạy để verify tính nhất quán của hệ thống

-- 1. Kiểm tra users có verified_rank nhưng chưa có player_rankings
SELECT 
  'Users with rank but no ELO record' as check_type,
  p.display_name,
  p.verified_rank,
  'Missing ELO record' as issue
FROM profiles p
LEFT JOIN player_rankings pr ON p.user_id = pr.player_id
WHERE p.verified_rank IS NOT NULL 
  AND pr.player_id IS NULL;

-- 2. Kiểm tra inconsistency giữa verified_rank và ELO
WITH rank_elo_mapping AS (
  SELECT 
    p.display_name,
    p.verified_rank,
    pr.elo_points,
    CASE p.verified_rank
      WHEN 'E+' THEN 2800
      WHEN 'E' THEN 2600
      WHEN 'F+' THEN 2400
      WHEN 'F' THEN 2200
      WHEN 'G+' THEN 2000
      WHEN 'G' THEN 1800
      WHEN 'H+' THEN 1600
      WHEN 'H' THEN 1400
      WHEN 'I+' THEN 1200
      WHEN 'I' THEN 1000
      WHEN 'K+' THEN 800
      WHEN 'K' THEN 600
      ELSE 1000
    END as expected_elo,
    CASE 
      WHEN pr.elo_points >= 2800 THEN 'E+'
      WHEN pr.elo_points >= 2600 THEN 'E'
      WHEN pr.elo_points >= 2400 THEN 'F+'
      WHEN pr.elo_points >= 2200 THEN 'F'
      WHEN pr.elo_points >= 2000 THEN 'G+'
      WHEN pr.elo_points >= 1800 THEN 'G'
      WHEN pr.elo_points >= 1600 THEN 'H+'
      WHEN pr.elo_points >= 1400 THEN 'H'
      WHEN pr.elo_points >= 1200 THEN 'I+'
      WHEN pr.elo_points >= 1000 THEN 'I'
      WHEN pr.elo_points >= 800 THEN 'K+'
      ELSE 'K'
    END as elo_derived_rank
  FROM profiles p
  JOIN player_rankings pr ON p.user_id = pr.player_id
  WHERE p.verified_rank IS NOT NULL
)
SELECT 
  'Rank-ELO Consistency Check' as check_type,
  display_name,
  verified_rank,
  elo_points,
  expected_elo,
  elo_derived_rank,
  CASE 
    WHEN elo_points = expected_elo THEN '✅ CONSISTENT'
    ELSE '❌ INCONSISTENT'
  END as status
FROM rank_elo_mapping
ORDER BY elo_points DESC;

-- 3. Statistics summary
SELECT 
  'ELO Reset Summary Statistics' as report_type,
  COUNT(*) as total_players,
  COUNT(CASE WHEN elo_points >= 2000 THEN 1 END) as advanced_players,
  COUNT(CASE WHEN elo_points BETWEEN 1400 AND 1999 THEN 1 END) as intermediate_players,
  COUNT(CASE WHEN elo_points < 1400 THEN 1 END) as beginner_players,
  ROUND(AVG(elo_points)) as average_elo,
  MIN(elo_points) as lowest_elo,
  MAX(elo_points) as highest_elo
FROM player_rankings;

-- 4. Top 20 highest ELO players
SELECT 
  'Top 20 ELO Players' as report_type,
  ROW_NUMBER() OVER (ORDER BY pr.elo_points DESC) as rank,
  p.display_name,
  p.verified_rank,
  pr.elo_points,
  pr.total_matches,
  pr.wins,
  CASE WHEN pr.total_matches > 0 THEN ROUND((pr.wins::float / pr.total_matches * 100), 1) ELSE 0 END as win_rate
FROM player_rankings pr
JOIN profiles p ON pr.player_id = p.user_id
ORDER BY pr.elo_points DESC
LIMIT 20;

-- 5. Rank distribution với percentages
WITH rank_stats AS (
  SELECT 
    CASE 
      WHEN elo_points >= 2800 THEN 'E+'
      WHEN elo_points >= 2600 THEN 'E'
      WHEN elo_points >= 2400 THEN 'F+'
      WHEN elo_points >= 2200 THEN 'F'
      WHEN elo_points >= 2000 THEN 'G+'
      WHEN elo_points >= 1800 THEN 'G'
      WHEN elo_points >= 1600 THEN 'H+'
      WHEN elo_points >= 1400 THEN 'H'
      WHEN elo_points >= 1200 THEN 'I+'
      WHEN elo_points >= 1000 THEN 'I'
      WHEN elo_points >= 800 THEN 'K+'
      ELSE 'K'
    END as rank,
    COUNT(*) as count
  FROM player_rankings
  GROUP BY 
    CASE 
      WHEN elo_points >= 2800 THEN 'E+'
      WHEN elo_points >= 2600 THEN 'E'
      WHEN elo_points >= 2400 THEN 'F+'
      WHEN elo_points >= 2200 THEN 'F'
      WHEN elo_points >= 2000 THEN 'G+'
      WHEN elo_points >= 1800 THEN 'G'
      WHEN elo_points >= 1600 THEN 'H+'
      WHEN elo_points >= 1400 THEN 'H'
      WHEN elo_points >= 1200 THEN 'I+'
      WHEN elo_points >= 1000 THEN 'I'
      WHEN elo_points >= 800 THEN 'K+'
      ELSE 'K'
    END
),
total_count AS (
  SELECT COUNT(*) as total FROM player_rankings
)
SELECT 
  'Rank Distribution with Percentages' as report_type,
  rs.rank,
  rs.count as player_count,
  ROUND((rs.count::float / tc.total * 100), 1) as percentage
FROM rank_stats rs
CROSS JOIN total_count tc
ORDER BY 
  CASE rs.rank
    WHEN 'E+' THEN 1
    WHEN 'E' THEN 2
    WHEN 'F+' THEN 3
    WHEN 'F' THEN 4
    WHEN 'G+' THEN 5
    WHEN 'G' THEN 6
    WHEN 'H+' THEN 7
    WHEN 'H' THEN 8
    WHEN 'I+' THEN 9
    WHEN 'I' THEN 10
    WHEN 'K+' THEN 11
    WHEN 'K' THEN 12
  END;
