-- Create optimized indexes for automation queries (without CONCURRENTLY in transaction)
CREATE INDEX IF NOT EXISTS idx_tournament_matches_automation 
  ON tournament_matches (tournament_id, status, winner_id, round_number);

CREATE INDEX IF NOT EXISTS idx_tournament_automation_log_perf 
  ON tournament_automation_log (tournament_id, automation_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automation_performance_log_type_time 
  ON automation_performance_log (automation_type, created_at DESC);

-- Add performance optimization for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_player_rankings_leaderboard 
  ON player_rankings (elo_points DESC, spa_points DESC, wins DESC);

-- Update existing materialized views with better performance
DROP MATERIALIZED VIEW IF EXISTS mv_leaderboard_stats CASCADE;

CREATE MATERIALIZED VIEW mv_leaderboard_stats AS
SELECT 
  pr.id,
  pr.user_id,
  COALESCE(p.display_name, p.full_name, 'Unknown Player') as display_name,
  p.avatar_url,
  COALESCE(pr.current_rank, 'Rookie') as current_rank,
  COALESCE(pr.elo_points, 1000) as elo_points,
  COALESCE(pr.spa_points, 0) as spa_points,
  COALESCE(pr.total_matches, 0) as total_matches,
  COALESCE(pr.wins, 0) as wins,
  COALESCE(pr.losses, 0) as losses,
  CASE 
    WHEN COALESCE(pr.total_matches, 0) > 0 
    THEN ROUND((COALESCE(pr.wins, 0)::decimal / pr.total_matches) * 100, 1)
    ELSE 0 
  END as win_percentage,
  COALESCE(pr.win_streak, 0) as win_streak,
  ROW_NUMBER() OVER (ORDER BY COALESCE(pr.elo_points, 1000) DESC, COALESCE(pr.spa_points, 0) DESC) as ranking_position,
  GREATEST(pr.updated_at, p.updated_at) as last_updated
FROM player_rankings pr
LEFT JOIN profiles p ON pr.user_id = p.user_id
WHERE pr.elo_points IS NOT NULL
ORDER BY pr.elo_points DESC, pr.spa_points DESC;

-- Create indexes on the materialized view
CREATE UNIQUE INDEX idx_mv_leaderboard_stats_id ON mv_leaderboard_stats (id);
CREATE INDEX idx_mv_leaderboard_stats_ranking ON mv_leaderboard_stats (ranking_position);
CREATE INDEX idx_mv_leaderboard_stats_rank ON mv_leaderboard_stats (current_rank);
CREATE INDEX idx_mv_leaderboard_stats_elo ON mv_leaderboard_stats (elo_points DESC);

-- Create function to refresh leaderboard stats
CREATE OR REPLACE FUNCTION refresh_mv_leaderboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.mv_leaderboard_stats;
END;
$$;

-- Add cron job to refresh analytics materialized views every 15 minutes
select
  cron.schedule(
    'analytics-refresh-every-15m',
    '*/15 * * * *',
    $$
    select net.http_post(
      url := 'https://exlqvlbawytbglioqfbc.supabase.co/functions/v1/analytics-refresh',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA"}'::jsonb,
      body := '{"action":"refresh_all"}'::jsonb
    )
    $$
  );