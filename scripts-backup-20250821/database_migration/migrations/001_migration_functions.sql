-- ============================================================================
-- 1. Profiles Migration
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_profiles_data(p_batch_size INT DEFAULT 1000, p_dry_run BOOLEAN DEFAULT TRUE)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_rows BIGINT := 0;
    v_batch BIGINT;
    v_cursor TIMESTAMPTZ;
    v_prev_cursor TIMESTAMPTZ;
BEGIN
    PERFORM ensure_table_exists('profiles_optimized');
    IF NOT table_exists('profiles') THEN
    PERFORM log_migration('migrate_profiles_data','profiles','source_missing', 0, TRUE, NULL);
    RETURN 0;
    END IF;
    SELECT last_cursor::timestamptz INTO v_prev_cursor FROM migration_batch_progress WHERE migration_key='profiles';

    LOOP
    WITH src AS (
            SELECT p.* FROM profiles p
            WHERE v_prev_cursor IS NULL OR p.updated_at > v_prev_cursor
            ORDER BY p.updated_at
            LIMIT p_batch_size
    ), ins AS (
            INSERT INTO profiles_optimized (user_id, full_name, display_name, nickname, email, phone, avatar_url, bio, city, district,
                current_rank, elo_points, spa_points, skill_level, active_role, is_admin, is_demo_user,
                ban_status, ban_reason, banned_at, banned_by, member_since, completion_percentage, created_at, updated_at)
            SELECT s.user_id, s.full_name, s.display_name, s.nickname, s.email, s.phone, s.avatar_url, s.bio, s.city, s.district,
                   s.current_rank, s.elo_points, COALESCE(s.spa_points,0), s.skill_level, s.active_role, s.is_admin, s.is_demo_user,
                   s.ban_status, s.ban_reason, s.banned_at, s.banned_by, s.member_since, s.completion_percentage, s.created_at, s.updated_at
            FROM src s
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                display_name = EXCLUDED.display_name,
                nickname = EXCLUDED.nickname,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                avatar_url = EXCLUDED.avatar_url,
                bio = EXCLUDED.bio,
                city = EXCLUDED.city,
                district = EXCLUDED.district,
                current_rank = EXCLUDED.current_rank,
                elo_points = EXCLUDED.elo_points,
                spa_points = EXCLUDED.spa_points,
                skill_level = EXCLUDED.skill_level,
                active_role = EXCLUDED.active_role,
                is_admin = EXCLUDED.is_admin,
                is_demo_user = EXCLUDED.is_demo_user,
                ban_status = EXCLUDED.ban_status,
                ban_reason = EXCLUDED.ban_reason,
                banned_at = EXCLUDED.banned_at,
                banned_by = EXCLUDED.banned_by,
                completion_percentage = EXCLUDED.completion_percentage,
                updated_at = GREATEST(EXCLUDED.updated_at, profiles_optimized.updated_at)
            RETURNING updated_at
    )
    SELECT count(*), max(updated_at) INTO v_batch, v_cursor FROM ins;
    EXIT WHEN v_batch = 0; -- nothing more to process
    v_rows := v_rows + v_batch;
    PERFORM update_batch_progress('profiles', v_cursor::text, v_batch);
    PERFORM log_migration('migrate_profiles_data','profiles','batch', v_batch, TRUE, NULL);
    IF p_dry_run THEN
            RAISE NOTICE 'Dry run batch processed % (total %)', v_batch, v_rows;
    END IF;
    v_prev_cursor := v_cursor;
    EXIT WHEN v_batch < p_batch_size; -- last partial batch
    END LOOP;

    IF p_dry_run THEN
    RAISE NOTICE 'Profiles migration dry-run complete. Rows processed=%', v_rows;
    ELSE
    RAISE NOTICE 'Profiles migration complete. Rows upserted=%', v_rows;
    END IF;
    RETURN v_rows;
EXCEPTION WHEN OTHERS THEN
    PERFORM log_migration('migrate_profiles_data','profiles','error', v_rows, FALSE, SQLERRM);
    RAISE;
END;$$;
-- MIGRATION_METADATA
-- id: 001_migration_functions
-- created: 2025-08-10
-- author: system
-- description: Core data migration functions (profiles, tournaments, participants, matches, wallet, clubs) with logging & batching.
-- safe_retries: true
-- requires: none
-- rollback: rollback_migration() in this file
-- notes: Run with execute_safe_migration(dry_run => true) first.
-- /MIGRATION_METADATA
SET search_path TO public;

-- ============================================================================
-- Logging & Utility Objects
-- ============================================================================
CREATE TABLE IF NOT EXISTS migration_operation_log (
    id              BIGSERIAL PRIMARY KEY,
    operation       TEXT NOT NULL,
    phase           TEXT,
    detail          TEXT,
    rows_affected   BIGINT,
    success         BOOLEAN DEFAULT TRUE,
    error_message   TEXT,
    started_at      TIMESTAMPTZ DEFAULT now(),
    finished_at     TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION log_migration(op TEXT, p_phase TEXT, p_detail TEXT, p_rows BIGINT, p_success BOOLEAN, p_error TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO migration_operation_log(operation, phase, detail, rows_affected, success, error_message, finished_at)
    VALUES (op, p_phase, p_detail, p_rows, p_success, p_error, now());
    RAISE LOG '[MIGRATION] % | % | % | rows=% | success=%', op, p_phase, p_detail, COALESCE(p_rows,0), p_success;
END;$$;

-- Progress table to support resumable batching
CREATE TABLE IF NOT EXISTS migration_batch_progress (
    migration_key TEXT PRIMARY KEY,
    last_cursor   TEXT,
    processed_rows BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_batch_progress(p_key TEXT, p_cursor TEXT, p_increment BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO migration_batch_progress(migration_key, last_cursor, processed_rows)
    VALUES (p_key, p_cursor, p_increment)
    ON CONFLICT (migration_key) DO UPDATE
      SET last_cursor = EXCLUDED.last_cursor,
          processed_rows = migration_batch_progress.processed_rows + p_increment,
          updated_at = now();
END;$$;

-- Helper: ensure target table exists (idempotent guard) - adapt if needed
CREATE OR REPLACE FUNCTION ensure_table_exists(p_table TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE v_exists BOOLEAN; BEGIN
 SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=p_table) INTO v_exists;
 IF NOT v_exists THEN
     RAISE EXCEPTION 'Target table % missing. Apply optimized schema first.', p_table;
 END IF; RETURN v_exists; END; $$;

-- Lightweight helper to test for (possibly legacy) table existence without raising
CREATE OR REPLACE FUNCTION table_exists(p_table TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=p_table);
$$;

-- Safe generic counter that does not error if table missing
CREATE OR REPLACE FUNCTION get_table_count(p_table TEXT)
RETURNS BIGINT LANGUAGE plpgsql STABLE AS $$
DECLARE v BIGINT:=0; BEGIN
    IF table_exists(p_table) THEN
        EXECUTE format('SELECT count(*) FROM %I', p_table) INTO v;
    END IF;
    RETURN v;
END;$$;

-- Helper: ensure optional legacy tournament columns exist (for heterogeneous environments / test harness)
CREATE OR REPLACE FUNCTION ensure_legacy_tournament_columns()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF NOT table_exists('tournaments') THEN RETURN; END IF;
    -- Add columns only if they do not already exist (no-op in production if already present)
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_participants INT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tournament_type TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS game_format TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS entry_fee NUMERIC'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS has_third_place_match BOOLEAN'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS allow_all_ranks BOOLEAN'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS eligible_ranks JSONB'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS min_rank_requirement TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_rank_requirement TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS first_prize TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS second_prize TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS third_prize TEXT'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS spa_points_config JSONB'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS elo_points_config JSONB'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS physical_prizes JSONB'; EXCEPTION WHEN OTHERS THEN NULL; END;
END;$$;

-- ============================================================================
-- 1. Profiles Migration
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_profiles_data(p_batch_size INT DEFAULT 1000, p_dry_run BOOLEAN DEFAULT TRUE)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_rows BIGINT := 0;
    v_batch BIGINT;
    v_cursor TIMESTAMPTZ;
BEGIN
    PERFORM ensure_table_exists('profiles_optimized');
    IF NOT table_exists('profiles') THEN
        PERFORM log_migration('migrate_profiles_data','profiles','source_missing', 0, TRUE, NULL);
        RETURN 0;
    END IF;

    LOOP
        WITH src AS (
            SELECT p.*
            FROM profiles p
            WHERE (SELECT last_cursor FROM migration_batch_progress WHERE migration_key='profiles') IS NULL
               OR p.updated_at > (SELECT last_cursor::timestamptz FROM migration_batch_progress WHERE migration_key='profiles')
            ORDER BY p.updated_at
            LIMIT p_batch_size
        ), ins AS (
            INSERT INTO profiles_optimized (user_id, full_name, display_name, nickname, email, phone, avatar_url, bio, city, district,
                current_rank, elo_points, spa_points, skill_level, active_role, is_admin, is_demo_user,
                ban_status, ban_reason, banned_at, banned_by, member_since, completion_percentage, created_at, updated_at)
            SELECT s.user_id, s.full_name, s.display_name, s.nickname, s.email, s.phone, s.avatar_url, s.bio, s.city, s.district,
                   s.current_rank, s.elo_points, COALESCE(s.spa_points,0), s.skill_level, s.active_role, s.is_admin, s.is_demo_user,
                   s.ban_status, s.ban_reason, s.banned_at, s.banned_by, s.member_since, s.completion_percentage, s.created_at, s.updated_at
            FROM src s
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                display_name = EXCLUDED.display_name,
                nickname = EXCLUDED.nickname,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                avatar_url = EXCLUDED.avatar_url,
                bio = EXCLUDED.bio,
                city = EXCLUDED.city,
                district = EXCLUDED.district,
                current_rank = EXCLUDED.current_rank,
                elo_points = EXCLUDED.elo_points,
                spa_points = EXCLUDED.spa_points,
                skill_level = EXCLUDED.skill_level,
                active_role = EXCLUDED.active_role,
                is_admin = EXCLUDED.is_admin,
                is_demo_user = EXCLUDED.is_demo_user,
                ban_status = EXCLUDED.ban_status,
                ban_reason = EXCLUDED.ban_reason,
                banned_at = EXCLUDED.banned_at,
                banned_by = EXCLUDED.banned_by,
                completion_percentage = EXCLUDED.completion_percentage,
                updated_at = GREATEST(EXCLUDED.updated_at, profiles_optimized.updated_at)
            RETURNING updated_at
        )
        SELECT count(*), max(updated_at) INTO v_batch, v_cursor FROM ins;
        EXIT WHEN v_batch = 0;
        v_rows := v_rows + v_batch;
        PERFORM update_batch_progress('profiles', COALESCE(v_cursor, now())::text, v_batch);
        PERFORM log_migration('migrate_profiles_data','profiles','batch', v_batch, TRUE, NULL);
        IF p_dry_run THEN RAISE NOTICE 'Dry run batch processed % (cumulative %)', v_batch, v_rows; END IF;
        EXIT WHEN v_batch < p_batch_size;
    END LOOP;
    RETURN v_rows; EXCEPTION WHEN OTHERS THEN
        PERFORM log_migration('migrate_profiles_data','profiles','error', v_rows,FALSE,SQLERRM); RAISE; END; $$;

-- ============================================================================
-- 2. Tournaments Migration (separate restored function)
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_tournaments_data(p_batch_size INT DEFAULT 1000, p_dry_run BOOLEAN DEFAULT TRUE)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_rows BIGINT := 0;
    v_batch BIGINT;
    v_cursor TIMESTAMPTZ;
BEGIN
    PERFORM ensure_table_exists('tournaments_v2');
    IF NOT table_exists('tournaments') THEN
        PERFORM log_migration('migrate_tournaments_data','tournaments','source_missing', 0, TRUE, NULL);
        RETURN 0;
    END IF;
    PERFORM ensure_legacy_tournament_columns();

    LOOP
        WITH src AS (
            SELECT t.* FROM tournaments t
            WHERE (SELECT last_cursor FROM migration_batch_progress WHERE migration_key='tournaments') IS NULL
               OR t.updated_at > (SELECT last_cursor::timestamptz FROM migration_batch_progress WHERE migration_key='tournaments')
            ORDER BY t.updated_at
            LIMIT p_batch_size
        ), ins AS (
            INSERT INTO tournaments_v2 (id, name, description, club_id, venue_address, config, prize_config, status, current_phase,
                registration_start, registration_end, tournament_start, tournament_end, completed_at, current_participants,
                management_status, bracket_progression, created_by, is_visible, is_draft, rules, contact_info, created_at, updated_at)
            SELECT t.id, t.name, t.description, t.club_id, t.venue_address,
                   jsonb_build_object(
                        'max_participants', t.max_participants,
                        'tournament_type', t.tournament_type,
                        'game_format', t.game_format,
                        'entry_fee', t.entry_fee,
                        'has_third_place_match', t.has_third_place_match,
                        'allow_all_ranks', COALESCE(t.allow_all_ranks,true),
                        'eligible_ranks', COALESCE(t.eligible_ranks,'[]'::jsonb),
                        'min_rank_requirement', t.min_rank_requirement,
                        'max_rank_requirement', t.max_rank_requirement
                   ),
                   jsonb_build_object(
                        'first_prize', t.first_prize,
                        'second_prize', t.second_prize,
                        'third_prize', t.third_prize,
                        'spa_points_config', COALESCE(t.spa_points_config,'{}'::jsonb),
                        'elo_points_config', COALESCE(t.elo_points_config,'{}'::jsonb),
                        'physical_prizes', COALESCE(t.physical_prizes,'[]'::jsonb)
                   ),
                   t.status, t.current_phase, t.registration_start, t.registration_end, t.tournament_start, t.tournament_end, t.completed_at,
                   t.current_participants, t.management_status,
                   jsonb_build_object('final_ready', false, 'semifinal_ready', false, 'tournament_complete', false),
                   t.created_by, t.is_visible, t.is_draft, t.rules, t.contact_info, t.created_at, t.updated_at
            FROM src t
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                club_id = EXCLUDED.club_id,
                venue_address = EXCLUDED.venue_address,
                config = EXCLUDED.config,
                prize_config = EXCLUDED.prize_config,
                status = EXCLUDED.status,
                current_phase = EXCLUDED.current_phase,
                updated_at = GREATEST(EXCLUDED.updated_at, tournaments_v2.updated_at)
            RETURNING updated_at
        )
        SELECT count(*), max(updated_at) INTO v_batch, v_cursor FROM ins;
        EXIT WHEN v_batch = 0;
        v_rows := v_rows + v_batch;
        PERFORM update_batch_progress('tournaments', COALESCE(v_cursor, now())::text, v_batch);
        PERFORM log_migration('migrate_tournaments_data','tournaments','batch', v_batch, TRUE, NULL);
        IF p_dry_run THEN RAISE NOTICE 'Dry run batch processed tournaments % (cumulative %)', v_batch, v_rows; END IF;
        EXIT WHEN v_batch < p_batch_size;
    END LOOP;
    RETURN v_rows; EXCEPTION WHEN OTHERS THEN
        PERFORM log_migration('migrate_tournaments_data','tournaments','error', v_rows,FALSE,SQLERRM); RAISE; END; $$;

-- ============================================================================
-- 3. Tournament Participants Consolidation
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_tournament_participants(p_batch_size INT DEFAULT 1000)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_rows BIGINT:=0; BEGIN
    PERFORM ensure_table_exists('tournament_participants');
    IF NOT table_exists('tournament_registrations') THEN
        PERFORM log_migration('migrate_tournament_participants','tournaments','source_missing', 0, TRUE, NULL);
        RETURN 0;
    END IF;
    -- Ensure supporting unique index exists for ON CONFLICT clause (idempotent)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uq_tournament_participants_tournament_user'
    ) THEN
        BEGIN
            EXECUTE 'CREATE UNIQUE INDEX uq_tournament_participants_tournament_user ON tournament_participants(tournament_id, user_id)';
        EXCEPTION WHEN OTHERS THEN NULL; -- ignore if created concurrently
        END;
    END IF;
    INSERT INTO tournament_participants (id, tournament_id, user_id, registration_date, registration_status, status,
        seed_position, bracket_position, current_bracket, elimination_round, entry_fee, payment_status, payment_method,
        final_position, matches_played, matches_won, matches_lost, win_percentage, spa_points_earned, elo_points_earned,
        prize_amount, physical_rewards, notes, created_at, updated_at)
    SELECT COALESCE(r.id, gen_random_uuid()), r.tournament_id, r.user_id, r.created_at, r.status, 'active',
           r.seed_position, r.bracket_position, 'winners', NULL, r.entry_fee, r.payment_status, r.payment_method,
           res.final_position, res.matches_played, res.matches_won, res.matches_lost, res.win_percentage,
           res.spa_points_earned, res.elo_points_earned, res.prize_amount, '{}'::text[], NULL, r.created_at, r.updated_at
    FROM tournament_registrations r
    LEFT JOIN tournament_results res ON res.registration_id = r.id
    ON CONFLICT (tournament_id, user_id) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    PERFORM log_migration('migrate_tournament_participants','tournaments','bulk', v_rows, TRUE, NULL);
    RETURN v_rows; EXCEPTION WHEN OTHERS THEN
        PERFORM log_migration('migrate_tournament_participants','tournaments','error', v_rows,FALSE,SQLERRM); RAISE; END; $$;

-- ============================================================================
-- 4. Tournament Matches Migration
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_tournament_matches()
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_rows BIGINT:=0; BEGIN
    PERFORM ensure_table_exists('tournament_matches_v2');
    IF NOT table_exists('tournament_matches') THEN
        PERFORM log_migration('migrate_tournament_matches','tournaments','source_missing', 0, TRUE, NULL);
        RETURN 0;
    END IF;
    INSERT INTO tournament_matches_v2 (id, tournament_id, round_number, match_number, match_stage, round_position,
        player1_id, player2_id, winner_id, score_player1, score_player2, status, scheduled_time, actual_start_time,
        actual_end_time, score_status, score_input_by, score_submitted_at, referee_id, notes, created_at, updated_at)
    SELECT m.id, m.tournament_id, m.round_number, m.match_number, m.stage, m.round_position,
           m.player1_id, m.player2_id, m.winner_id, m.score_p1, m.score_p2, m.status,
           m.scheduled_time, m.actual_start_time, m.actual_end_time,
           m.score_status, m.score_input_by, m.score_submitted_at, m.referee_id, m.notes, m.created_at, m.updated_at
    FROM tournament_matches m
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    PERFORM log_migration('migrate_tournament_matches','tournaments','bulk', v_rows, TRUE, NULL);
    RETURN v_rows; EXCEPTION WHEN OTHERS THEN
        PERFORM log_migration('migrate_tournament_matches','tournaments','error', v_rows,FALSE,SQLERRM); RAISE; END; $$;

-- ============================================================================
-- 5. Wallet & Transactions Consolidation
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_wallet_transactions()
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_rows BIGINT:=0; BEGIN
    PERFORM ensure_table_exists('user_wallets');
    PERFORM ensure_table_exists('wallet_transactions_v2');
    IF NOT table_exists('wallets') THEN
        PERFORM log_migration('migrate_wallet_transactions','wallet','source_missing_wallets', 0, TRUE, NULL);
        RETURN 0;
    END IF;
    -- If transaction source tables absent, skip gracefully
    IF NOT table_exists('spa_point_transactions') THEN
        PERFORM log_migration('migrate_wallet_transactions','wallet','skip_no_spa_point_tx', 0, TRUE, NULL);
    END IF;
    IF NOT table_exists('cash_transactions') THEN
        PERFORM log_migration('migrate_wallet_transactions','wallet','skip_no_cash_tx', 0, TRUE, NULL);
    END IF;

    -- Consolidate wallet balances
    INSERT INTO user_wallets (user_id, spa_points, cash_balance, total_earned_points, total_spent_points,
        total_earned_cash, total_spent_cash, status, created_at, updated_at)
    SELECT w.user_id, COALESCE(sp.points,0), w.cash_balance,
           w.total_earned_points, w.total_spent_points, w.total_earned_cash, w.total_spent_cash,
           w.status, w.created_at, w.updated_at
    FROM wallets w
    LEFT JOIN spa_points sp ON sp.user_id = w.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        spa_points = EXCLUDED.spa_points,
        cash_balance = EXCLUDED.cash_balance,
        total_earned_points = EXCLUDED.total_earned_points,
        total_spent_points = EXCLUDED.total_spent_points,
        total_earned_cash = EXCLUDED.total_earned_cash,
        total_spent_cash = EXCLUDED.total_spent_cash,
        updated_at = now();
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    PERFORM log_migration('migrate_wallet_balances','wallet','bulk', v_rows, TRUE, NULL);

    -- Consolidate transactions into wallet_transactions_v2 schema.
    -- Target table columns: (id, user_id, transaction_type, amount, currency, source_type, source_id,
    --                        spa_points_change, elo_points_change, wallet_balance_after, metadata, created_at, updated_at)
    -- We don't currently derive spa/elo point deltas from legacy rows, so default them to 0.
    WITH unified AS (
        SELECT t.id, t.user_id,
               'spa_earn'::text AS transaction_type,
               t.points::numeric AS amount,
               'SPA'::text AS currency,
               t.source_type, t.source_id,
               COALESCE(t.description, t.source_type) AS details,
               '{}'::jsonb AS base_metadata,
               t.balance_before::numeric AS balance_before,
               t.balance_after::numeric AS balance_after,
               'completed'::text AS status,
               t.created_at
        FROM spa_point_transactions t WHERE table_exists('spa_point_transactions')
        UNION ALL
        SELECT c.id, c.user_id,
               CASE WHEN c.amount > 0 THEN 'cash_earn' ELSE 'cash_spend' END AS transaction_type,
               abs(c.amount)::numeric AS amount,
               'USD'::text AS currency,
               c.source_type, c.source_id,
               COALESCE(c.notes, c.source_type) AS details,
               '{}'::jsonb AS base_metadata,
               c.balance_before::numeric AS balance_before,
               c.balance_after::numeric AS balance_after,
               c.status,
               c.created_at
        FROM cash_transactions c WHERE table_exists('cash_transactions')
    )
    INSERT INTO wallet_transactions_v2 (id, user_id, transaction_type, amount, currency, source_type, source_id,
        spa_points_change, elo_points_change, wallet_balance_after, metadata, created_at, updated_at)
    SELECT u.id, u.user_id, u.transaction_type, u.amount, u.currency, u.source_type, u.source_id,
           0 AS spa_points_change,
           0 AS elo_points_change,
           u.balance_after AS wallet_balance_after,
           (u.base_metadata || jsonb_build_object(
               'details', u.details,
               'balance_before', u.balance_before,
               'status', u.status
           )) AS metadata,
           u.created_at AS created_at,
           u.created_at AS updated_at
    FROM unified u
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    PERFORM log_migration('migrate_wallet_transactions','wallet','bulk', v_rows, TRUE, NULL);
    RETURN v_rows; EXCEPTION WHEN OTHERS THEN
        PERFORM log_migration('migrate_wallet_transactions','wallet','error', v_rows,FALSE,SQLERRM); RAISE; END; $$;

-- ============================================================================
-- 6. Club Data Consolidation
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_club_data()
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_rows BIGINT:=0; BEGIN
    PERFORM ensure_table_exists('clubs_v2');
    PERFORM ensure_table_exists('club_memberships');
    IF NOT table_exists('clubs') THEN
        PERFORM log_migration('migrate_club_data','clubs','source_missing', 0, TRUE, NULL); RETURN 0; END IF;

    INSERT INTO clubs_v2 (id, owner_id, name, club_code, description, address, district, city, phone, email,
        website, facebook_url, config, logo_url, photos, verification_status, is_active, is_sabo_owned,
        priority_score, available_tables, reviewed_by, review_date, approval_date, reviewer_notes, rejection_reason,
        monthly_fee, setup_fee, deposit_amount, payment_status, created_at, updated_at)
    SELECT c.id, c.owner_id, c.name, c.code, c.description, c.address, c.district, c.city, c.phone, c.email,
           c.website, c.facebook_url,
           jsonb_build_object(
               'table_count', c.table_count,
               'table_types', COALESCE(c.table_types,'[]'::jsonb),
               'basic_hourly_rate', c.basic_rate,
               'peak_hour_rate', c.peak_rate,
               'weekend_rate', c.weekend_rate,
               'member_discount_rate', c.member_discount,
               'opening_hours', COALESCE(c.opening_hours,'{}'::jsonb),
               'facilities', COALESCE(c.facilities,'[]'::jsonb),
               'services', COALESCE(c.services,'[]'::jsonb),
               'amenities', COALESCE(c.amenities,'{}'::jsonb)
           ),
           c.logo_url, COALESCE(c.photos,'{}'::text[]), c.verification_status, c.is_active, c.is_sabo_owned,
           c.priority_score, c.available_tables, c.reviewed_by, c.review_date, c.approval_date, c.reviewer_notes, c.rejection_reason,
           c.monthly_fee, c.setup_fee, c.deposit_amount, c.payment_status, c.created_at, c.updated_at
    FROM clubs c
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    PERFORM log_migration('migrate_clubs','clubs','bulk', v_rows, TRUE, NULL);

    INSERT INTO club_memberships (id, club_id, user_id, role, membership_type, membership_number, status, joined_at,
        expiry_date, total_visits, last_visit, total_hours_played, created_at, updated_at)
    SELECT m.id, m.club_id, m.user_id, m.role, m.membership_type, m.membership_number, m.status, m.joined_at,
           m.expiry_date, m.total_visits, m.last_visit, m.total_hours_played, m.created_at, m.updated_at
    FROM club_members m
    ON CONFLICT (club_id, user_id) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    PERFORM log_migration('migrate_club_memberships','clubs','bulk', v_rows, TRUE, NULL);
    RETURN v_rows; EXCEPTION WHEN OTHERS THEN
        PERFORM log_migration('migrate_club_data','clubs','error', v_rows,FALSE,SQLERRM); RAISE; END; $$;

-- ============================================================================
-- 7. Integrity Validation & Rollback Stub
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_migration_integrity()
RETURNS TABLE(section TEXT, source_count BIGINT, target_count BIGINT, status TEXT) LANGUAGE plpgsql AS $$
DECLARE s BIGINT; t BIGINT; missing BOOLEAN; BEGIN
    -- Profiles
    s := get_table_count('profiles'); t := get_table_count('profiles_optimized'); missing := NOT table_exists('profiles');
    RETURN QUERY SELECT 'profiles', s, t, CASE WHEN missing THEN 'OK' WHEN s=t THEN 'OK' ELSE 'MISMATCH' END;
    -- Tournaments
    s := get_table_count('tournaments'); t := get_table_count('tournaments_v2'); missing := NOT table_exists('tournaments');
    RETURN QUERY SELECT 'tournaments', s, t, CASE WHEN missing THEN 'OK' WHEN s=t THEN 'OK' ELSE 'MISMATCH' END;
    -- Participants
    s := get_table_count('tournament_registrations'); t := get_table_count('tournament_participants'); missing := NOT table_exists('tournament_registrations');
    RETURN QUERY SELECT 'participants', s, t, CASE WHEN missing THEN 'OK' WHEN s<=t THEN 'OK' ELSE 'MISMATCH' END;
    -- Matches
    s := get_table_count('tournament_matches'); t := get_table_count('tournament_matches_v2'); missing := NOT table_exists('tournament_matches');
    RETURN QUERY SELECT 'matches', s, t, CASE WHEN missing THEN 'OK' WHEN s=t THEN 'OK' ELSE 'MISMATCH' END;
    -- Wallets
    s := get_table_count('wallets'); t := get_table_count('user_wallets'); missing := NOT table_exists('wallets');
    RETURN QUERY SELECT 'wallets', s, t, CASE WHEN missing THEN 'OK' WHEN s=t THEN 'OK' ELSE 'MISMATCH' END;
    -- Clubs
    s := get_table_count('clubs'); t := get_table_count('clubs_v2'); missing := NOT table_exists('clubs');
    RETURN QUERY SELECT 'clubs', s, t, CASE WHEN missing THEN 'OK' WHEN s=t THEN 'OK' ELSE 'MISMATCH' END;
END;$$;

-- Emergency rollback (copy back or abort if old tables dropped)
CREATE OR REPLACE FUNCTION rollback_migration()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    RAISE NOTICE 'Rollback starting - ensure legacy tables still exist.';
    -- Example: profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='profiles') THEN
       DELETE FROM profiles;
       INSERT INTO profiles (user_id, full_name, display_name, nickname, email, phone, avatar_url, bio, city, district,
            current_rank, elo_points, spa_points, skill_level, active_role, is_admin, is_demo_user, ban_status, ban_reason,
            banned_at, banned_by, member_since, completion_percentage, created_at, updated_at)
       SELECT user_id, full_name, display_name, nickname, email, phone, avatar_url, bio, city, district,
              current_rank, elo_points, spa_points, skill_level, active_role, is_admin, is_demo_user, ban_status, ban_reason,
              banned_at, banned_by, member_since, completion_percentage, created_at, updated_at
       FROM profiles_optimized;
    END IF;
    PERFORM log_migration('rollback_migration','rollback','completed', NULL, TRUE, NULL);
END;$$;

-- End of 001_migration_functions.sql
