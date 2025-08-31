-- MIGRATION_METADATA
-- id: 010_performance_monitoring
-- created: 2025-08-10
-- author: system
-- description: Performance baseline tracking, materialized view caching with TTL, extended benchmarking helpers.
-- safe_retries: true
-- requires: 009_security_audit_system
-- rollback: Drop performance tables, materialized views, functions
-- /MIGRATION_METADATA
SET search_path TO public;

CREATE TABLE IF NOT EXISTS performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  total_time_ms NUMERIC NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_label_time ON performance_metrics(label, captured_at DESC);

CREATE OR REPLACE FUNCTION record_performance_metrics()
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE r JSONB; inserted INT:=0; BEGIN
  FOR r IN SELECT jsonb_array_elements(benchmark_migration_performance()) val LOOP
     INSERT INTO performance_metrics(label,total_time_ms) VALUES (r->>'label',(r->>'total_time_ms')::numeric);
     inserted := inserted + 1;
  END LOOP;
  RETURN inserted;
END;$$;

CREATE OR REPLACE FUNCTION compare_latest_baselines(p_recent INT DEFAULT 2)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE result JSONB := '[]'::jsonb; rec RECORD; BEGIN
  FOR rec IN
    SELECT label,
      ARRAY_AGG(total_time_ms ORDER BY captured_at DESC) times
    FROM performance_metrics GROUP BY label
  LOOP
    IF array_length(rec.times,1) >= 2 THEN
      result := result || jsonb_build_array(jsonb_build_object(
        'label', rec.label,
        'latest', rec.times[1],
        'previous', rec.times[2],
        'delta_ms', rec.times[1]-rec.times[2],
        'delta_pct', CASE WHEN rec.times[2] > 0 THEN ((rec.times[1]-rec.times[2])/rec.times[2])*100 ELSE NULL END
      ));
    END IF;
  END LOOP;
  RETURN result;
END;$$;

CREATE TABLE IF NOT EXISTS mv_cache_control (
  view_name TEXT PRIMARY KEY,
  ttl_seconds INT NOT NULL DEFAULT 300,
  last_refresh TIMESTAMPTZ
);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_tournament_stats AS
SELECT t.id, t.name, t.status, t.current_participants,
       (t.config->>'max_participants')::INT AS max_participants,
       t.created_at
FROM tournaments_v2 t;

INSERT INTO mv_cache_control(view_name, ttl_seconds, last_refresh)
VALUES ('mv_tournament_stats', 300, now())
ON CONFLICT (view_name) DO NOTHING;

CREATE OR REPLACE FUNCTION refresh_cache_if_stale(p_view TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE v_row mv_cache_control%ROWTYPE; refreshed BOOLEAN:=false; BEGIN
  SELECT * INTO v_row FROM mv_cache_control WHERE view_name = p_view;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_row.last_refresh IS NULL OR (clock_timestamp() - v_row.last_refresh) > make_interval(secs=>v_row.ttl_seconds) THEN
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', p_view);
    UPDATE mv_cache_control SET last_refresh = now() WHERE view_name = p_view;
    refreshed := true;
  END IF;
  RETURN refreshed;
END;$$;

CREATE OR REPLACE FUNCTION performance_report_extension()
RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
  RETURN jsonb_build_object(
    'recent_performance_metrics', (SELECT json_agg(row_to_json(p)) FROM (
        SELECT label, total_time_ms, captured_at FROM performance_metrics ORDER BY captured_at DESC LIMIT 20
    ) p),
    'baseline_comparison', compare_latest_baselines()
  );
END;$$;

-- End of 010_performance_monitoring.sql
