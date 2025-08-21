-- MIGRATION_METADATA
-- id: 005_cleanup_procedures
-- created: 2025-08-10
-- author: system
-- description: Final cleanup & decommissioning script (drop legacy tables after validation & archive).
-- safe_retries: false
-- requires: 004_master_migration
-- rollback: NONE (ensure backups before running)
-- notes: Only run after report shows FULL OK and backups verified.
-- /MIGRATION_METADATA
SET search_path TO public;

-- Archive & Drop Legacy (example placeholders) - Adjust ordering for FK constraints.
-- Recommended: run each DROP in separate transaction windows with monitoring.

DO $$
DECLARE v_integrity JSONB; v_section JSONB; v_all_ok BOOLEAN:=TRUE; BEGIN
    SELECT generate_migration_report() INTO v_integrity;
    -- Simple gate: ensure no FAIL in integrity_summary
    IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_integrity->'integrity_summary') elem
        WHERE elem->>'status' <> 'OK'
    ) THEN
        RAISE EXCEPTION 'Integrity report not clean. Aborting cleanup.';
    END IF;
    RAISE NOTICE 'Integrity OK - proceeding with archival and cleanup';

    -- Example archival (adjust for real tables)
    CREATE TABLE IF NOT EXISTS legacy_archives (id bigserial primary key, table_name text, archived_at timestamptz default now(), row_count bigint, note text);

    PERFORM log_migration('cleanup','archive','profiles', (SELECT count(*) FROM profiles), TRUE, NULL);
    INSERT INTO legacy_archives(table_name, row_count, note) SELECT 'profiles', count(*), 'pre-drop snapshot size' FROM profiles;
    -- Optionally: CREATE TABLE profiles_legacy_backup AS SELECT * FROM profiles; (commented to avoid duplicate mass storage)

    -- DROP TABLE profiles; -- Uncomment only after application decoupled.
END $$;

-- Add additional controlled drops here when safe.

-- End of 005_cleanup_procedures.sql
