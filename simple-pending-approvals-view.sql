-- Alternative simple view without potential column conflicts
-- Use this if the main view still has issues

DROP VIEW IF EXISTS pending_approvals;
CREATE VIEW pending_approvals AS
SELECT 
  c.id,
  c.status,
  c.challenger_id,
  c.opponent_id,
  c.club_id,
  c.challenger_score,
  c.opponent_score,
  c.club_confirmed,
  c.created_at,
  c.scheduled_time,
  c.bet_points,
  cp_challenger.full_name as challenger_full_name,
  cp_opponent.full_name as opponent_full_name,
  club.name as club_name
FROM challenges c
LEFT JOIN profiles cp_challenger ON c.challenger_id = cp_challenger.user_id
LEFT JOIN profiles cp_opponent ON c.opponent_id = cp_opponent.user_id
LEFT JOIN club_profiles club ON c.club_id = club.id
WHERE c.status = 'pending_approval'
  AND c.challenger_score IS NOT NULL 
  AND c.opponent_score IS NOT NULL 
  AND c.club_confirmed = FALSE;
