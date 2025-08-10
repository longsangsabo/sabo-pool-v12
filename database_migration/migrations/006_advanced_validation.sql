-- MIGRATION_METADATA
-- id: 006_advanced_validation
-- created: 2025-08-10
-- author: system
-- description: Advanced migration validation (integrity v2, performance benchmarking, data sampling) + metrics logging.
-- safe_retries: true
-- requires: 005_cleanup_procedures
-- rollback: Drop functions defined here (manual) + remove added column duration_ms if needed.
-- /MIGRATION_METADATA
SET search_path TO public;

-- Ensure duration_ms column & enhanced log_migration exist (idempotent)
ALTER TABLE migration_operation_log ADD COLUMN IF NOT EXISTS duration_ms BIGINT;

-- Remove previous 7-arg variant (if present) to avoid ambiguity with legacy 6-arg calls
DO $$ BEGIN
    EXECUTE 'DROP FUNCTION IF EXISTS log_migration(TEXT, TEXT, TEXT, BIGINT, BOOLEAN, TEXT, TIMESTAMPTZ)';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Unified logging function (6 args) with automatic duration computation
CREATE OR REPLACE FUNCTION log_migration(op TEXT, p_phase TEXT, p_detail TEXT, p_rows BIGINT, p_success BOOLEAN, p_error TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_start TIMESTAMPTZ := clock_timestamp();
    v_finish TIMESTAMPTZ;
    v_duration BIGINT;
BEGIN
    v_finish := clock_timestamp();
    v_duration := (EXTRACT(EPOCH FROM (v_finish - v_start))*1000)::BIGINT;
    INSERT INTO migration_operation_log(operation, phase, detail, rows_affected, success, error_message, started_at, finished_at, duration_ms)
    VALUES (op, p_phase, p_detail, p_rows, p_success, p_error, v_start, v_finish, v_duration);
    RAISE LOG '[MIGRATION][% ms] % | % | % | rows=% | success=%', v_duration, op, p_phase, p_detail, COALESCE(p_rows,0), p_success;
END;$$;

-- ============================================================================
-- Helper Utilities
-- ============================================================================
CREATE OR REPLACE FUNCTION json_key_check(p_json JSONB, variadic p_keys TEXT[])
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
    SELECT bool_and(p_json ? k) FROM unnest(p_keys) k;
$$;

CREATE OR REPLACE FUNCTION row_checksum(VARIADIC parts TEXT[])
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
    SELECT md5(array_to_string(parts,'|'));
$$;

-- ============================================================================
-- 1. Advanced Integrity Validation
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_migration_integrity_v2()
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    result JSONB := '[]'::jsonb;
    v_auth_users BIGINT; v_profiles BIGINT; v_profiles_opt BIGINT;
    v_wallet_legacy NUMERIC; v_wallet_new NUMERIC;
    v_tx_points_legacy NUMERIC; v_tx_points_new NUMERIC;
    v_tournaments_legacy BIGINT; v_tournaments_new BIGINT;
    v_participants_old BIGINT; v_participants_new BIGINT;
    v_matches_old BIGINT; v_matches_new BIGINT;
    v_club_members_old BIGINT; v_club_members_new BIGINT;
    v_fk_orphans BIGINT; v_config_missing BIGINT;
BEGIN
    BEGIN EXECUTE 'SELECT count(*) FROM auth.users' INTO v_auth_users; EXCEPTION WHEN UNDEFINED_TABLE THEN v_auth_users:=0; WHEN OTHERS THEN v_auth_users:=0; END;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
        SELECT count(*) INTO v_profiles FROM profiles;
    ELSE
        v_profiles := 0;
    END IF;
    SELECT count(*) INTO v_profiles_opt FROM profiles_optimized;

    result := result || jsonb_build_array(jsonb_build_object(
        'category','users','check','auth_vs_profiles','source',v_auth_users,'profiles',v_profiles,'status', CASE WHEN v_auth_users = v_profiles THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_auth_users = v_profiles THEN 'OK' ELSE 'FAIL' END,
        'details', jsonb_build_object('optimized_profiles', v_profiles_opt)
    ));

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tournaments') THEN
        SELECT count(*) INTO v_tournaments_legacy FROM tournaments; ELSE v_tournaments_legacy:=0; END IF;
    SELECT count(*) INTO v_tournaments_new FROM tournaments_v2;
    result := result || jsonb_build_array(jsonb_build_object('category','tournaments','check','count_match','legacy',v_tournaments_legacy,'new',v_tournaments_new,
        'status', CASE WHEN v_tournaments_legacy = v_tournaments_new THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_tournaments_legacy = v_tournaments_new THEN 'OK' ELSE 'FAIL' END));

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tournament_registrations') THEN
        SELECT count(*) INTO v_participants_old FROM tournament_registrations; ELSE v_participants_old:=0; END IF;
    SELECT count(*) INTO v_participants_new FROM tournament_participants;
    result := result || jsonb_build_array(jsonb_build_object('category','tournaments','check','participants_not_less','old',v_participants_old,'new',v_participants_new,
        'status', CASE WHEN v_participants_new >= v_participants_old THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_participants_new >= v_participants_old THEN 'OK' ELSE 'FAIL' END));

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tournament_matches') THEN
        SELECT count(*) INTO v_matches_old FROM tournament_matches; ELSE v_matches_old:=0; END IF;
    SELECT count(*) INTO v_matches_new FROM tournament_matches_v2;
    result := result || jsonb_build_array(jsonb_build_object('category','tournaments','check','matches_equal','old',v_matches_old,'new',v_matches_new,
        'status', CASE WHEN v_matches_old = v_matches_new THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_matches_old = v_matches_new THEN 'OK' ELSE 'FAIL' END));

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='profiles') THEN
        SELECT sum(spa_points)::numeric INTO v_wallet_legacy FROM profiles; ELSE v_wallet_legacy:=0; END IF;
    SELECT sum(spa_points)::numeric INTO v_wallet_new FROM user_wallets;
    result := result || jsonb_build_array(jsonb_build_object('category','wallet','check','total_spa_points','legacy',v_wallet_legacy,'new',v_wallet_new,
        'status', CASE WHEN COALESCE(v_wallet_legacy,0)=COALESCE(v_wallet_new,0) THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN COALESCE(v_wallet_legacy,0)=COALESCE(v_wallet_new,0) THEN 'OK' ELSE 'FAIL' END));

    SELECT sum(CASE WHEN transaction_type LIKE 'spa_%' THEN amount ELSE 0 END) INTO v_tx_points_new FROM wallet_transactions_v2;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='spa_point_transactions') THEN
        SELECT sum(points)::numeric INTO v_tx_points_legacy FROM spa_point_transactions;
    END IF;
    result := result || jsonb_build_array(jsonb_build_object('category','wallet','check','transaction_points_total','legacy',v_tx_points_legacy,'new',v_tx_points_new,
        'status', CASE WHEN COALESCE(v_tx_points_legacy,0)=COALESCE(v_tx_points_new,0) THEN 'OK' ELSE 'WARN' END,
        'severity', CASE WHEN COALESCE(v_tx_points_legacy,0)=COALESCE(v_tx_points_new,0) THEN 'OK' ELSE 'WARN' END));

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='club_members') THEN
        SELECT count(*) INTO v_club_members_old FROM club_members; ELSE v_club_members_old:=0; END IF;
    SELECT count(*) INTO v_club_members_new FROM club_memberships;
    result := result || jsonb_build_array(jsonb_build_object('category','clubs','check','membership_not_less','old',v_club_members_old,'new',v_club_members_new,
        'status', CASE WHEN v_club_members_new >= v_club_members_old THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_club_members_new >= v_club_members_old THEN 'OK' ELSE 'FAIL' END));

    SELECT count(*) INTO v_config_missing FROM tournaments_v2 t
      WHERE NOT (t.config ? 'max_participants' AND t.config ? 'tournament_type' AND t.config ? 'game_format');
    result := result || jsonb_build_array(jsonb_build_object('category','json','check','tournament_config_keys','missing_count',v_config_missing,
        'status', CASE WHEN v_config_missing=0 THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_config_missing=0 THEN 'OK' ELSE 'FAIL' END));

    SELECT count(*) INTO v_fk_orphans FROM tournament_participants tp
        LEFT JOIN tournaments_v2 t ON t.id=tp.tournament_id
        LEFT JOIN profiles_optimized p ON p.user_id=tp.user_id
        WHERE t.id IS NULL OR p.user_id IS NULL;
    result := result || jsonb_build_array(jsonb_build_object('category','fk','check','participant_orphans','count',v_fk_orphans,
        'status', CASE WHEN v_fk_orphans=0 THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN v_fk_orphans=0 THEN 'OK' ELSE 'FAIL' END));

    result := result || jsonb_build_array(jsonb_build_object('category','constraints','check','not_valid_constraints','count', (
        SELECT count(*) FROM pg_constraint WHERE convalidated = false
    ), 'status', CASE WHEN (SELECT count(*) FROM pg_constraint WHERE convalidated=false)=0 THEN 'OK' ELSE 'FAIL' END,
        'severity', CASE WHEN (SELECT count(*) FROM pg_constraint WHERE convalidated=false)=0 THEN 'OK' ELSE 'FAIL' END));

    RETURN result;
END;$$;

-- ============================================================================
-- 2. Performance Benchmarking
-- ============================================================================
CREATE OR REPLACE FUNCTION benchmark_migration_performance()
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    q RECORD;
    results JSONB := '[]'::jsonb;
    v_plan JSON;
    v_time NUMERIC;
BEGIN
    FOR q IN SELECT * FROM (
        SELECT 'tournament_list_old' AS label, 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id,name,status FROM tournaments ORDER BY created_at DESC LIMIT 50' AS sql WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tournaments')
        UNION ALL
        SELECT 'tournament_list_new','EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id,name,status FROM tournaments_v2 ORDER BY created_at DESC LIMIT 50'
        UNION ALL
        SELECT 'profile_lookup_old','EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT user_id,email FROM profiles ORDER BY updated_at DESC LIMIT 50' WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='profiles')
        UNION ALL
        SELECT 'profile_lookup_new','EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT user_id,email FROM profiles_optimized ORDER BY updated_at DESC LIMIT 50'
        UNION ALL
        SELECT 'wallet_tx_new','EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT user_id, amount FROM wallet_transactions_v2 ORDER BY created_at DESC LIMIT 50'
    ) t
    LOOP
        BEGIN
            EXECUTE q.sql INTO v_plan;
            v_time := ((v_plan->0->'Plan'->>'Actual Total Time')::numeric);
            results := results || jsonb_build_array(jsonb_build_object('label', q.label, 'total_time_ms', v_time));
        EXCEPTION
            WHEN undefined_table THEN
                -- Skip benchmarks referencing legacy tables that are absent in this environment
                PERFORM log_migration('benchmark','performance',q.label||'_skip_missing_table',NULL,TRUE,NULL);
                CONTINUE;
            WHEN OTHERS THEN
                -- Record failure but continue
                results := results || jsonb_build_array(jsonb_build_object('label', q.label, 'error', SQLERRM));
                PERFORM log_migration('benchmark','performance',q.label||'_error',NULL,FALSE,SQLERRM);
                CONTINUE;
        END;
    END LOOP;
    RETURN results;
END;$$;

-- ============================================================================
-- 3. Data Sampling Validation
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_data_sampling(sample_size INT DEFAULT 1000)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    v_mismatches BIGINT := 0;
    v_processed BIGINT := 0;
    v_result JSONB := jsonb_build_object('sample_size', sample_size);
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='profiles') OR NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='profiles_optimized') THEN
        RETURN jsonb_build_object('status','SKIP','reason','missing source or target');
    END IF;

    WITH sample AS (
    SELECT user_id FROM profiles ORDER BY random() LIMIT sample_size
    ), old_data AS (
        SELECT s.user_id, row_checksum(p.user_id::text, COALESCE(p.email,'') ) AS cs
        FROM sample s JOIN profiles p ON p.user_id=s.user_id
    ), new_data AS (
        SELECT s.user_id, row_checksum(p.user_id::text, COALESCE(p.email,'') ) AS cs
        FROM sample s JOIN profiles_optimized p ON p.user_id=s.user_id
    )
    SELECT count(*), sum(CASE WHEN o.cs<>n.cs THEN 1 ELSE 0 END)
      INTO v_processed, v_mismatches
    FROM old_data o JOIN new_data n USING (user_id);

    v_result := v_result || jsonb_build_object('processed', v_processed, 'mismatches', v_mismatches,
        'status', CASE WHEN v_mismatches=0 THEN 'OK' ELSE 'FAIL' END);
    RETURN v_result;
END;$$;

-- ============================================================================
-- 4. Extended Combined Report
-- ============================================================================
CREATE OR REPLACE FUNCTION extended_migration_report()
RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
    RETURN generate_migration_report()
        || jsonb_build_object(
            'advanced_integrity_v2', validate_migration_integrity_v2(),
            'performance_benchmarks', benchmark_migration_performance(),
            'data_sampling', validate_data_sampling()
        );
END;$$;

-- End of 006_advanced_validation.sql
