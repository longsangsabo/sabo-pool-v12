-- 014_maintenance_automation.sql
-- Maintenance automation: checkpoints, rollback to checkpoint, autovacuum heuristics, materialized view refresh helpers
BEGIN;

-- Migration checkpoint system (logical markers)
CREATE OR REPLACE FUNCTION create_migration_checkpoint(checkpoint_name TEXT)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE
  snap_id bigint;
BEGIN
  BEGIN
    INSERT INTO rollback_snapshots(label, snapshot_data)
  VALUES (checkpoint_name || ':' || to_char(now(),'YYYYMMDD_HH24MISS'), jsonb_build_object('note','checkpoint','at',now()))
  RETURNING id INTO snap_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'rollback_snapshots table missing (%). Skipping checkpoint persistence', SQLERRM;
    snap_id := -1;
  END;
  PERFORM log_migration('checkpoint','create',checkpoint_name,NULL,true,NULL);
  RETURN snap_id;
END;$$;

CREATE OR REPLACE FUNCTION rollback_to_checkpoint(checkpoint_name TEXT)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  snap rollback_snapshots;
BEGIN
  BEGIN
    SELECT * INTO snap FROM rollback_snapshots WHERE label LIKE checkpoint_name||':%' ORDER BY created_at DESC LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'rollback_snapshots not available: %', SQLERRM; RETURN;
  END;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkpoint % not found', checkpoint_name;
  END IF;
  BEGIN PERFORM generate_rollback_plan(snap.id); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'generate_rollback_plan missing: %', SQLERRM; END;
  BEGIN PERFORM perform_full_rollback((SELECT id FROM rollback_plan WHERE snapshot_id=snap.id ORDER BY created_at DESC LIMIT 1)); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'perform_full_rollback missing: %', SQLERRM; END;
  PERFORM log_migration('checkpoint','rollback',checkpoint_name,NULL,true,NULL);
END;$$;

-- Helper: refresh all stale caches
CREATE OR REPLACE FUNCTION refresh_all_stale_caches()
RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  r record; count int:=0;
BEGIN
  BEGIN
    FOR r IN SELECT view_name FROM mv_cache_control m WHERE now()-m.last_refreshed > m.refresh_ttl LOOP
      BEGIN PERFORM refresh_cache_if_stale(r.view_name); EXCEPTION WHEN OTHERS THEN NULL; END;
      count := count + 1;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RETURN 0;
  END;
  RETURN count;
END;$$;

-- Schedule periodic cache refresh if pg_cron present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
  PERFORM cron.schedule('cache-refresh','*/10 * * * *', 'SELECT refresh_all_stale_caches();');
  END IF;
END;$$;

-- Light autovacuum tuning: record bloated tables (simple heuristic)
CREATE OR REPLACE VIEW table_vacuum_candidates AS
SELECT relname,
       n_live_tup,
       n_dead_tup,
       round( CASE WHEN n_live_tup=0 THEN 0 ELSE n_dead_tup*100.0/n_live_tup END,2) AS dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000 AND (n_dead_tup*100.0) / GREATEST(n_live_tup,1) > 10
ORDER BY dead_pct DESC;

-- Function: perform targeted vacuum analyze of top N candidates
CREATE OR REPLACE FUNCTION vacuum_top_candidates(limit_n int DEFAULT 5)
RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  r record; done int:=0;
BEGIN
  FOR r IN SELECT relname FROM table_vacuum_candidates LIMIT limit_n LOOP
    EXECUTE format('VACUUM (ANALYZE) %I', r.relname);
    done := done + 1;
  END LOOP;
  PERFORM log_migration('maintenance','vacuum','run',NULL,true,NULL);
  RETURN done;
EXCEPTION WHEN OTHERS THEN
  PERFORM log_migration('maintenance','vacuum','error',NULL,false,SQLERRM);
  RETURN done;
END;$$;

-- Schedule daily vacuum pass
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
  PERFORM cron.schedule('daily-vacuum','30 2 * * *', 'SELECT vacuum_top_candidates();');
  END IF;
END;$$;

COMMIT;
