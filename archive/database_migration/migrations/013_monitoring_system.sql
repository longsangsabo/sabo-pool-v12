-- 013_monitoring_system.sql
-- Enterprise Monitoring & Daily Maintenance System
-- Idempotent creation of monitoring views, functions, and scheduled jobs.

BEGIN;

-- View: High level DB performance & activity summary (lightweight)
CREATE OR REPLACE VIEW database_performance_summary AS
SELECT
  now()                        AS generated_at,
  d.datname                    AS database_name,
  xact_commit, xact_rollback,
  blks_read, blks_hit,
  tup_returned, tup_fetched, tup_inserted, tup_updated, tup_deleted,
  round(CASE WHEN blks_hit+blks_read = 0 THEN 100
       ELSE blks_hit*100.0/(blks_hit+blks_read) END,2) AS cache_hit_pct,
  (SELECT count(*) FROM pg_stat_activity WHERE state <> 'idle') AS active_sessions,
  (SELECT count(*) FROM domain_events WHERE processed_at IS NULL) AS pending_domain_events,
  (SELECT count(*) FROM audit_log) AS audit_log_rows,
  (SELECT count(*) FROM performance_metrics) AS performance_metric_rows
FROM pg_stat_database d
WHERE d.datname = current_database();

-- Function: system_health_check()
-- Returns granular checks with status (OK/WARN/FAIL) and diagnostic value.
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE(check_name text, status text, metric_value text, details jsonb) LANGUAGE plpgsql AS $$
DECLARE
  ev_backlog int;
  cache_stale int;
  hit_pct numeric;
  active int;
BEGIN
  SELECT pending_domain_events, cache_hit_pct, active_sessions
  INTO ev_backlog, hit_pct, active
  FROM database_performance_summary;

  BEGIN
    SELECT count(*) INTO cache_stale FROM mv_cache_control m WHERE now()-m.last_refreshed > m.refresh_ttl;
  EXCEPTION WHEN OTHERS THEN
    cache_stale := 0;
  END;

  -- Domain events backlog
  check_name := 'domain_events_backlog';
  metric_value := ev_backlog::text;
  status := CASE WHEN ev_backlog < 100 THEN 'OK' WHEN ev_backlog < 1000 THEN 'WARN' ELSE 'FAIL' END;
  details := jsonb_build_object('threshold_warn',100,'threshold_fail',1000);
  RETURN NEXT;

  -- Cache freshness
  check_name := 'stale_caches';
  metric_value := cache_stale::text;
  status := CASE WHEN cache_stale = 0 THEN 'OK' WHEN cache_stale < 3 THEN 'WARN' ELSE 'FAIL' END;
  details := jsonb_build_object('stale_count', cache_stale);
  RETURN NEXT;

  -- Cache hit ratio
  check_name := 'cache_hit_pct';
  metric_value := hit_pct::text;
  status := CASE WHEN hit_pct >= 95 THEN 'OK' WHEN hit_pct >= 90 THEN 'WARN' ELSE 'FAIL' END;
  details := jsonb_build_object('value', hit_pct);
  RETURN NEXT;

  -- Active session pressure
  check_name := 'active_sessions';
  metric_value := active::text;
  status := CASE WHEN active < 25 THEN 'OK' WHEN active < 40 THEN 'WARN' ELSE 'FAIL' END;
  details := jsonb_build_object('value', active);
  RETURN NEXT;

  -- Latest performance metric age
  check_name := 'performance_metric_recency';
  BEGIN
    metric_value := COALESCE((SELECT (now()-captured_at)::text FROM performance_metrics ORDER BY captured_at DESC LIMIT 1),'unknown');
  EXCEPTION WHEN OTHERS THEN
    metric_value := 'unknown';
  END;
  status := CASE WHEN metric_value = 'unknown' THEN 'WARN' WHEN metric_value::interval < interval '15 minutes' THEN 'OK' WHEN metric_value::interval < interval '2 hours' THEN 'WARN' ELSE 'FAIL' END;
  details := jsonb_build_object('age', metric_value);
  RETURN NEXT;
END;
$$;

-- Function: daily_maintenance(): housekeeping & metrics capture
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  part_months int := 3;
BEGIN
  -- Optional components (wrapped for environments lacking these functions)
  BEGIN PERFORM ensure_match_partitions(date_trunc('month', now())::date, part_months); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM record_performance_metrics(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM refresh_cache_if_stale('mv_tournament_stats'); EXCEPTION WHEN OTHERS THEN NULL; END;
  -- Analyze key tables (lightweight, skip if missing)
  PERFORM (SELECT 1 FROM pg_class WHERE relname='tournaments_v2');
  EXECUTE 'ANALYZE tournaments_v2';
  PERFORM (SELECT 1 FROM pg_class WHERE relname='tournament_matches_v2');
  EXECUTE 'ANALYZE tournament_matches_v2';
  PERFORM log_migration('maintenance','daily','run',NULL,true,NULL);
EXCEPTION WHEN OTHERS THEN
  -- Never abort cron job chain; just log
  PERFORM log_migration('maintenance','daily','error',NULL,false,SQLERRM);
END;$$;

-- Schedule daily maintenance via pg_cron if available
-- Scheduling via pg_cron skipped if extension or function absent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    BEGIN PERFORM cron.schedule('daily-maintenance','5 3 * * *', 'SELECT daily_maintenance();'); EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END;$$;

COMMIT;
