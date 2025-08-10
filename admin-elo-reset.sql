-- ADMIN SCRIPT: Reset điểm ELO về chuẩn theo hạng
-- Chạy script này trên Supabase SQL Editor với quyền admin

-- Kiểm tra trạng thái hiện tại trước khi reset
SELECT 
  'Current Status Before Reset' as status,
  COUNT(*) as total_players,
  MIN(elo_points) as min_elo,
  MAX(elo_points) as max_elo,
  ROUND(AVG(elo_points)) as avg_elo,
  COUNT(CASE WHEN elo_points IS NULL THEN 1 END) as null_elo_count
FROM player_rankings;

-- Backup dữ liệu hiện tại (tạo snapshot)
CREATE TABLE IF NOT EXISTS elo_backup_before_reset AS
SELECT 
  player_id,
  elo_points as old_elo_points,
  spa_points,
  total_matches,
  wins,
  losses,
  NOW() as backup_timestamp
FROM player_rankings;

-- Reset ELO theo verified rank
DO $$
DECLARE
  reset_count INTEGER := 0;
BEGIN
  -- Update existing records
  UPDATE player_rankings 
  SET elo_points = CASE 
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'E+' THEN 2100
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'E' THEN 2000
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'F+' THEN 1900
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'F' THEN 1800
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'G+' THEN 1700
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'G' THEN 1600
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'H+' THEN 1500
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'H' THEN 1400
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'I+' THEN 1300
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'I' THEN 1200
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'K+' THEN 1100
    WHEN (SELECT verified_rank FROM profiles WHERE user_id = player_rankings.player_id) = 'K' THEN 1000
    ELSE 1000 -- Default cho unranked/beginner
  END,
  updated_at = NOW();
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RAISE NOTICE 'Reset ELO cho % players', reset_count;
END $$;

-- Tạo records cho users chưa có trong player_rankings
INSERT INTO player_rankings (player_id, elo_points, spa_points, total_matches, wins, losses)
SELECT 
  p.user_id,
  CASE p.verified_rank
    WHEN 'E+' THEN 2100
    WHEN 'E' THEN 2000
    WHEN 'F+' THEN 1900
    WHEN 'F' THEN 1800
    WHEN 'G+' THEN 1700
    WHEN 'G' THEN 1600
    WHEN 'H+' THEN 1500
    WHEN 'H' THEN 1400
    WHEN 'I+' THEN 1300
    WHEN 'I' THEN 1200
    WHEN 'K+' THEN 1100
    WHEN 'K' THEN 1000
    ELSE 1000
  END as elo_points,
  0 as spa_points,
  0 as total_matches,
  0 as wins,
  0 as losses
FROM profiles p
WHERE p.user_id NOT IN (SELECT COALESCE(player_id, '00000000-0000-0000-0000-000000000000') FROM player_rankings)
  AND p.user_id IS NOT NULL;

-- Verify sau khi reset
SELECT 
  'After Reset Status' as status,
  COUNT(*) as total_players,
  MIN(elo_points) as min_elo,
  MAX(elo_points) as max_elo,
  ROUND(AVG(elo_points)) as avg_elo
FROM player_rankings;

-- Rank distribution report
SELECT 
  CASE 
    WHEN elo_points >= 2100 THEN 'E+'
    WHEN elo_points >= 2000 THEN 'E'
    WHEN elo_points >= 1900 THEN 'F+'
    WHEN elo_points >= 1800 THEN 'F'
    WHEN elo_points >= 1700 THEN 'G+'
    WHEN elo_points >= 1600 THEN 'G'
    WHEN elo_points >= 1500 THEN 'H+'
    WHEN elo_points >= 1400 THEN 'H'
    WHEN elo_points >= 1300 THEN 'I+'
    WHEN elo_points >= 1200 THEN 'I'
    WHEN elo_points >= 1100 THEN 'K+'
    ELSE 'K'
  END as elo_rank,
  COUNT(*) as player_count,
  MIN(elo_points) as min_elo,
  MAX(elo_points) as max_elo
FROM player_rankings
GROUP BY 
  CASE 
    WHEN elo_points >= 2100 THEN 'E+'
    WHEN elo_points >= 2000 THEN 'E'
    WHEN elo_points >= 1900 THEN 'F+'
    WHEN elo_points >= 1800 THEN 'F'
    WHEN elo_points >= 1700 THEN 'G+'
    WHEN elo_points >= 1600 THEN 'G'
    WHEN elo_points >= 1500 THEN 'H+'
    WHEN elo_points >= 1400 THEN 'H'
    WHEN elo_points >= 1300 THEN 'I+'
    WHEN elo_points >= 1200 THEN 'I'
    WHEN elo_points >= 1100 THEN 'K+'
    ELSE 'K'
  END
ORDER BY MIN(elo_points) DESC;
