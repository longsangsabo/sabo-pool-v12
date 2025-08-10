-- MIGRATION_METADATA
-- id: 002_validation_scripts
-- created: 2025-08-10
-- author: system
-- description: Data validation functions to ensure integrity & consistency post-migration.
-- safe_retries: true
-- requires: 001_migration_functions
-- rollback: drop functions (see cleanup)
-- /MIGRATION_METADATA
SET search_path TO public;

CREATE OR REPLACE FUNCTION validate_user_data_consistency()
RETURNS TABLE(test TEXT, result TEXT, details TEXT) LANGUAGE plpgsql AS $$
DECLARE v_legacy_count BIGINT:=0; v_opt BIGINT:=0; v_missing BOOLEAN; legacy_rank JSONB; opt_rank JSONB; missing_emails BIGINT; BEGIN
    v_missing := NOT table_exists('profiles');
    IF NOT v_missing THEN
        EXECUTE 'SELECT count(*) FROM profiles' INTO v_legacy_count;
        EXECUTE 'SELECT json_agg(current_rank) FROM (SELECT current_rank, count(*) FROM profiles GROUP BY 1) q' INTO legacy_rank;
    END IF;
    SELECT count(*) INTO v_opt FROM profiles_optimized;
    SELECT count(*) INTO missing_emails FROM profiles_optimized WHERE email IS NULL;
    SELECT json_agg(current_rank) INTO opt_rank FROM (SELECT current_rank, count(*) FROM profiles_optimized GROUP BY 1) q;
    RETURN QUERY SELECT 'profile_row_match', CASE WHEN v_missing THEN 'OK' WHEN v_legacy_count = v_opt THEN 'OK' ELSE 'FAIL' END,
                         'source='||v_legacy_count||' target='||v_opt;
    RETURN QUERY SELECT 'missing_emails', CASE WHEN missing_emails=0 THEN 'OK' ELSE 'WARN' END, missing_emails::text;
    RETURN QUERY SELECT 'rank_distribution', CASE WHEN v_missing THEN 'OK' ELSE 'INFO' END,
        json_build_object('legacy', legacy_rank, 'optimized', opt_rank)::text;
END;$$;

CREATE OR REPLACE FUNCTION validate_tournament_data_integrity()
RETURNS TABLE(test TEXT, result TEXT, details TEXT) LANGUAGE plpgsql AS $$
DECLARE missing_legacy BOOLEAN:=NOT table_exists('tournaments'); v_legacy BIGINT:=0; v_new BIGINT:=0; part_old BIGINT:=0; part_new BIGINT:=0; m_old BIGINT:=0; m_new BIGINT:=0; BEGIN
    IF NOT missing_legacy THEN EXECUTE 'SELECT count(*) FROM tournaments' INTO v_legacy; END IF;
    SELECT count(*) INTO v_new FROM tournaments_v2;
    IF table_exists('tournament_registrations') THEN EXECUTE 'SELECT count(*) FROM tournament_registrations' INTO part_old; END IF;
    SELECT count(*) INTO part_new FROM tournament_participants;
    IF table_exists('tournament_matches') THEN EXECUTE 'SELECT count(*) FROM tournament_matches' INTO m_old; END IF;
    SELECT count(*) INTO m_new FROM tournament_matches_v2;
    RETURN QUERY SELECT 'tournament_count', CASE WHEN missing_legacy THEN 'OK' WHEN v_legacy = v_new THEN 'OK' ELSE 'FAIL' END, '';
    RETURN QUERY SELECT 'participant_count_not_less', CASE WHEN missing_legacy OR NOT table_exists('tournament_registrations') THEN 'OK' WHEN part_new >= part_old THEN 'OK' ELSE 'FAIL' END, '';
    RETURN QUERY SELECT 'match_count_match', CASE WHEN missing_legacy OR NOT table_exists('tournament_matches') THEN 'OK' WHEN m_old = m_new THEN 'OK' ELSE 'FAIL' END, '';
END;$$;

CREATE OR REPLACE FUNCTION validate_wallet_balance_accuracy()
RETURNS TABLE(test TEXT, result TEXT, details TEXT) LANGUAGE plpgsql AS $$
DECLARE v_legacy NUMERIC:=0; v_new NUMERIC:=0; missing_legacy BOOLEAN; BEGIN
    SELECT sum(spa_points) INTO v_new FROM user_wallets;
    missing_legacy := NOT table_exists('profiles');
    IF NOT missing_legacy THEN EXECUTE 'SELECT sum(spa_points) FROM profiles' INTO v_legacy; END IF;
    RETURN QUERY
    SELECT 'total_spa_points_compare', CASE WHEN missing_legacy THEN 'SKIP' WHEN COALESCE(v_legacy,0)=COALESCE(v_new,0) THEN 'OK' ELSE 'FAIL' END,
           'legacy='||COALESCE(v_legacy,0)||' new='||COALESCE(v_new,0);
END;$$;

CREATE OR REPLACE FUNCTION validate_foreign_key_relationships()
RETURNS TABLE(test TEXT, result TEXT, details TEXT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 'participant_user_fk', CASE WHEN EXISTS (SELECT 1 FROM tournament_participants tp LEFT JOIN profiles_optimized p ON p.user_id=tp.user_id WHERE p.user_id IS NULL) THEN 'FAIL' ELSE 'OK' END,''
    UNION ALL
    SELECT 'match_tournament_fk', CASE WHEN EXISTS (SELECT 1 FROM tournament_matches_v2 m LEFT JOIN tournaments_v2 t ON t.id=m.tournament_id WHERE t.id IS NULL) THEN 'FAIL' ELSE 'OK' END,''
    UNION ALL
    SELECT 'wallet_user_fk', CASE WHEN EXISTS (SELECT 1 FROM user_wallets w LEFT JOIN profiles_optimized p ON p.user_id=w.user_id WHERE p.user_id IS NULL) THEN 'FAIL' ELSE 'OK' END,'';
END;$$;

CREATE OR REPLACE FUNCTION generate_migration_report()
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    v_profiles JSONB;
    v_tournaments JSONB;
    v_wallet JSONB;
BEGIN
    SELECT jsonb_agg(to_jsonb(t)) INTO v_profiles FROM validate_user_data_consistency() t;
    SELECT jsonb_agg(to_jsonb(t)) INTO v_tournaments FROM validate_tournament_data_integrity() t;
    SELECT jsonb_agg(to_jsonb(t)) INTO v_wallet FROM validate_wallet_balance_accuracy() t;
    RETURN jsonb_build_object(
        'profiles', v_profiles,
        'tournaments', v_tournaments,
        'wallet', v_wallet,
        'foreign_keys', (SELECT jsonb_agg(to_jsonb(t)) FROM validate_foreign_key_relationships() t),
        'integrity_summary', (SELECT jsonb_agg(to_jsonb(t)) FROM validate_migration_integrity() t)
    );
END;$$;

-- End of 002_validation_scripts.sql
