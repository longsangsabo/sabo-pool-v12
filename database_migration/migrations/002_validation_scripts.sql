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
BEGIN
    RETURN QUERY
    SELECT 'profile_row_match',
           CASE WHEN (SELECT count(*) FROM profiles) = (SELECT count(*) FROM profiles_optimized) THEN 'OK' ELSE 'FAIL' END,
           'source='||(SELECT count(*) FROM profiles)||' target='||(SELECT count(*) FROM profiles_optimized)
    UNION ALL
    SELECT 'missing_emails', CASE WHEN (SELECT count(*) FROM profiles_optimized WHERE email IS NULL) = 0 THEN 'OK' ELSE 'WARN' END,
           (SELECT count(*)::text FROM profiles_optimized WHERE email IS NULL)
    UNION ALL
    SELECT 'rank_distribution', 'INFO', json_build_object('legacy', (SELECT json_agg(current_rank) FROM (SELECT current_rank, count(*) FROM profiles GROUP BY 1) q),
                                                          'optimized',(SELECT json_agg(current_rank) FROM (SELECT current_rank, count(*) FROM profiles_optimized GROUP BY 1) q))::text;
END;$$;

CREATE OR REPLACE FUNCTION validate_tournament_data_integrity()
RETURNS TABLE(test TEXT, result TEXT, details TEXT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 'tournament_count', CASE WHEN (SELECT count(*) FROM tournaments) = (SELECT count(*) FROM tournaments_v2) THEN 'OK' ELSE 'FAIL' END,
           ''
    UNION ALL
    SELECT 'participant_count_not_less', CASE WHEN (SELECT count(*) FROM tournament_participants) >= (SELECT count(*) FROM tournament_registrations) THEN 'OK' ELSE 'FAIL' END, ''
    UNION ALL
    SELECT 'match_count_match', CASE WHEN (SELECT count(*) FROM tournament_matches) = (SELECT count(*) FROM tournament_matches_v2) THEN 'OK' ELSE 'FAIL' END, '';
END;$$;

CREATE OR REPLACE FUNCTION validate_wallet_balance_accuracy()
RETURNS TABLE(test TEXT, result TEXT, details TEXT) LANGUAGE plpgsql AS $$
DECLARE v_legacy NUMERIC; v_new NUMERIC; BEGIN
    SELECT sum(spa_points) INTO v_new FROM user_wallets;
    SELECT sum(spa_points) INTO v_legacy FROM profiles; -- assuming legacy spa_points stored here
    RETURN QUERY
    SELECT 'total_spa_points_compare', CASE WHEN COALESCE(v_legacy,0)=COALESCE(v_new,0) THEN 'OK' ELSE 'FAIL' END,
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
