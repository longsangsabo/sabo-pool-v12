-- MIGRATION_METADATA
-- id: 003_backward_compatibility
-- created: 2025-08-10
-- author: system
-- description: Backward compatibility legacy views mapping old schema to new optimized tables.
-- safe_retries: true
-- requires: 002_validation_scripts
-- rollback: drop views
-- /MIGRATION_METADATA
SET search_path TO public;

-- NOTE: Adjust column lists to exactly match legacy application expectations.
CREATE OR REPLACE VIEW profiles_legacy AS
SELECT p.user_id AS user_id,
       p.full_name,
       p.display_name,
       p.nickname,
       p.email,
       p.phone,
       p.avatar_url,
       p.bio,
       p.city,
       p.district,
       p.current_rank,
       p.elo_points,
       p.spa_points,
       p.skill_level,
       p.active_role,
       p.is_admin,
       p.is_demo_user,
       p.ban_status,
       p.ban_reason,
       p.banned_at,
       p.banned_by,
       p.member_since,
       p.completion_percentage,
       p.created_at,
       p.updated_at
FROM profiles_optimized p;

CREATE OR REPLACE VIEW tournaments_legacy AS
SELECT t.id,
       t.name,
       t.description,
       t.club_id,
       t.status,
       t.current_phase,
       (t.config->>'max_participants')::INT AS max_participants,
       (t.config->>'tournament_type') AS tournament_type,
       (t.config->>'game_format') AS game_format,
       (t.config->>'entry_fee')::NUMERIC AS entry_fee,
       t.registration_start,
       t.registration_end,
       t.tournament_start,
       t.tournament_end,
       t.completed_at,
       t.current_participants,
       t.created_by,
       t.created_at,
       t.updated_at
FROM tournaments_v2 t;

CREATE OR REPLACE VIEW wallet_legacy AS
SELECT w.user_id,
       w.spa_points,
       w.cash_balance,
       w.total_earned_points,
       w.total_spent_points,
       w.total_earned_cash,
       w.total_spent_cash,
       w.status,
       w.created_at,
       w.updated_at
FROM user_wallets w;

-- End of 003_backward_compatibility.sql
