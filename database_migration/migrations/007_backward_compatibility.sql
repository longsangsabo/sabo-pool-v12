-- MIGRATION_METADATA
-- id: 007_backward_compatibility_extended
-- created: 2025-08-10
-- author: system
-- description: Additional backward compatibility legacy views for phased cutover (Phase 3).
-- safe_retries: true
-- requires: 006_advanced_validation
-- rollback: drop views
-- /MIGRATION_METADATA
SET search_path TO public;

-- 1. Tournament system compatibility (lean variant for older code paths expecting fewer cols)
CREATE OR REPLACE VIEW tournaments_legacy_min AS
SELECT 
    id,
    name,
    description,
    club_id,
    (config->>'max_participants')::INT AS max_participants,
    (config->>'tournament_type') AS tournament_type,
    status,
    created_at,
    updated_at
FROM tournaments_v2;

-- 2. Profile system compatibility (lean view aliasing to match earlier simplified API)
CREATE OR REPLACE VIEW profiles_legacy_min AS
SELECT 
    user_id,
    full_name,
    display_name,
    email,
    current_rank,
    elo_points,
    spa_points,
    city,
    district,
    is_admin,
    created_at
FROM profiles_optimized;

-- 3. Wallet system compatibility (lean legacy mapping)
CREATE OR REPLACE VIEW wallet_legacy_min AS
SELECT 
    user_id,
    spa_points AS points_balance,
    cash_balance,
    updated_at
FROM user_wallets;

-- 4. Participant legacy compatibility (example mapping old registration table expectations)
CREATE OR REPLACE VIEW tournament_participants_legacy AS
SELECT 
    tp.id,
    tp.tournament_id,
    tp.user_id,
    tp.registration_date AS registered_at,
    tp.seed_position AS seed,
    tp.status
FROM tournament_participants tp;

-- 5. Match legacy compatibility (simplified view aligning with older match accessor)
CREATE OR REPLACE VIEW tournament_matches_legacy AS
SELECT 
    m.id,
    m.tournament_id,
    m.round_number,
    m.match_number,
    m.player1_id,
    m.player2_id,
    m.winner_id,
    m.status,
    m.actual_start_time AS started_at,
    m.actual_end_time AS completed_at,
    m.updated_at
FROM tournament_matches_v2 m;

-- End of 007_backward_compatibility.sql
