-- MIGRATION_METADATA
-- id: 004_master_migration
-- created: 2025-08-10
-- author: system
-- description: Safe execution wrapper orchestrating full migration with dry-run option and logging.
-- safe_retries: true
-- requires: 003_backward_compatibility
-- rollback: rollback_migration()
-- /MIGRATION_METADATA
SET search_path TO public;

CREATE OR REPLACE FUNCTION execute_safe_migration(p_dry_run BOOLEAN DEFAULT TRUE)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    v_report JSONB;
BEGIN
    PERFORM log_migration('execute_safe_migration','start', CASE WHEN p_dry_run THEN 'dry_run' ELSE 'live' END, NULL, TRUE, NULL);
    IF p_dry_run THEN
        PERFORM migrate_profiles_data(1000, TRUE);
        PERFORM migrate_tournaments_data(500, TRUE);
        PERFORM migrate_tournament_participants();
        PERFORM migrate_tournament_matches();
        PERFORM migrate_wallet_transactions();
        PERFORM migrate_club_data();
    ELSE
        PERFORM migrate_profiles_data(1000, FALSE);
        PERFORM migrate_tournaments_data(500, FALSE);
        PERFORM migrate_tournament_participants();
        PERFORM migrate_tournament_matches();
        PERFORM migrate_wallet_transactions();
        PERFORM migrate_club_data();
    END IF;
    SELECT generate_migration_report() INTO v_report;
    PERFORM log_migration('execute_safe_migration','complete','report_generated', NULL, TRUE, NULL);
    RETURN v_report;
EXCEPTION WHEN OTHERS THEN
    PERFORM log_migration('execute_safe_migration','error', 'abort', NULL, FALSE, SQLERRM);
    RAISE;
END;$$;

-- End of 004_master_migration.sql
