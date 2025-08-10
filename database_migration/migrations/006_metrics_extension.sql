-- MIGRATION_METADATA
-- id: 006_metrics_extension
-- created: 2025-08-10
-- author: system
-- description: Add duration_ms metric to migration_operation_log and enhance log_migration to support explicit started_at.
-- safe_retries: true
-- requires: 004_master_migration
-- rollback: Revert function & drop column duration_ms (manual if needed)
-- /MIGRATION_METADATA
SET search_path TO public;

ALTER TABLE migration_operation_log
    ADD COLUMN IF NOT EXISTS duration_ms BIGINT;

-- Replace log_migration with duration support (keeps backward compatibility for existing calls)
CREATE OR REPLACE FUNCTION log_migration(op TEXT, p_phase TEXT, p_detail TEXT, p_rows BIGINT, p_success BOOLEAN, p_error TEXT, p_started_at TIMESTAMPTZ DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_start TIMESTAMPTZ := COALESCE(p_started_at, clock_timestamp());
    v_finish TIMESTAMPTZ := clock_timestamp();
    v_duration BIGINT := (EXTRACT(EPOCH FROM (v_finish - v_start))*1000)::BIGINT;
BEGIN
    INSERT INTO migration_operation_log(operation, phase, detail, rows_affected, success, error_message, started_at, finished_at, duration_ms)
    VALUES (op, p_phase, p_detail, p_rows, p_success, p_error, v_start, v_finish, v_duration);
    RAISE LOG '[MIGRATION][% ms] % | % | % | rows=% | success=%', v_duration, op, p_phase, p_detail, COALESCE(p_rows,0), p_success;
END;$$;

-- End of 006_metrics_extension.sql
