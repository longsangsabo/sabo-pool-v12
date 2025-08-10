-- 015_business_intelligence.sql
-- Business Intelligence: KPIs, ROI metrics, success dashboards
BEGIN;

-- KPI base table (aggregated daily metrics)
CREATE TABLE IF NOT EXISTS kpi_daily (
  day date PRIMARY KEY,
  new_users int DEFAULT 0,
  active_users int DEFAULT 0,
  matches_played int DEFAULT 0,
  tournaments_created int DEFAULT 0,
  avg_match_duration_seconds numeric,
  retention_d1 numeric,
  retention_d7 numeric,
  revenue_cents bigint DEFAULT 0,
  cost_cents bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Function to upsert KPI daily (idempotent for a given day)
CREATE OR REPLACE FUNCTION upsert_kpi_daily(p_day date)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  rev bigint:=0; cost bigint:=0; matches int:=0; tourn int:=0; avg_dur numeric; new_u int:=0; active_u int:=0; d1 numeric; d7 numeric;
BEGIN
  -- Placeholder business logic - adapt to real tables
  SELECT count(*) INTO new_u FROM profiles WHERE created_at::date = p_day;
  BEGIN
    EXECUTE 'SELECT count(*) FROM profiles WHERE last_sign_in_at::date = $1' INTO active_u USING p_day;
  EXCEPTION WHEN OTHERS THEN
    active_u := 0; -- column absent in this environment
  END;
  SELECT count(*) INTO matches FROM tournament_matches_v2 WHERE created_at::date = p_day;
  SELECT count(*) INTO tourn FROM tournaments_v2 WHERE created_at::date = p_day;
  BEGIN
    EXECUTE 'SELECT avg(extract(epoch FROM (actual_end_time - actual_start_time))) FROM tournament_matches_v2 WHERE actual_end_time IS NOT NULL AND actual_start_time IS NOT NULL AND actual_start_time::date = $1' INTO avg_dur USING p_day;
  EXCEPTION WHEN OTHERS THEN avg_dur := NULL; END;
  -- Simplified retention metrics (placeholder logic)
  BEGIN
    EXECUTE 'SELECT CASE WHEN count(*)=0 THEN NULL ELSE round(sum(CASE WHEN last_sign_in_at::date = $1 + 1 THEN 1 ELSE 0 END)*100.0/count(*),2) END FROM profiles WHERE created_at::date = $1' INTO d1 USING p_day;
    EXECUTE 'SELECT CASE WHEN count(*)=0 THEN NULL ELSE round(sum(CASE WHEN last_sign_in_at::date = $1 + 7 THEN 1 ELSE 0 END)*100.0/count(*),2) END FROM profiles WHERE created_at::date = $1' INTO d7 USING p_day;
  EXCEPTION WHEN OTHERS THEN d1 := NULL; d7 := NULL; END;
  -- Revenue & cost (placeholder: implement real logic or external ingestion)
  -- Fallback: derive revenue/cost from amount if amount_cents missing
  BEGIN
    EXECUTE 'SELECT COALESCE(sum(amount_cents),0) FROM wallet_transactions_v2 WHERE created_at::date = $1 AND amount_cents>0' INTO rev USING p_day;
    EXECUTE 'SELECT COALESCE(sum(-amount_cents),0) FROM wallet_transactions_v2 WHERE created_at::date = $1 AND amount_cents<0' INTO cost USING p_day;
  EXCEPTION WHEN OTHERS THEN
    SELECT COALESCE(sum(CASE WHEN amount>0 THEN amount*100 ELSE 0 END)::bigint,0) INTO rev FROM wallet_transactions_v2 WHERE created_at::date = p_day;
    SELECT COALESCE(sum(CASE WHEN amount<0 THEN -amount*100 ELSE 0 END)::bigint,0) INTO cost FROM wallet_transactions_v2 WHERE created_at::date = p_day;
  END;

  INSERT INTO kpi_daily(day,new_users,active_users,matches_played,tournaments_created,avg_match_duration_seconds,retention_d1,retention_d7,revenue_cents,cost_cents)
  VALUES(p_day,new_u,active_u,matches,tourn,avg_dur,d1,d7,rev,cost)
  ON CONFLICT (day) DO UPDATE SET
    new_users=EXCLUDED.new_users,
    active_users=EXCLUDED.active_users,
    matches_played=EXCLUDED.matches_played,
    tournaments_created=EXCLUDED.tournaments_created,
    avg_match_duration_seconds=EXCLUDED.avg_match_duration_seconds,
    retention_d1=EXCLUDED.retention_d1,
    retention_d7=EXCLUDED.retention_d7,
    revenue_cents=EXCLUDED.revenue_cents,
    cost_cents=EXCLUDED.cost_cents;
END;$$;

-- Function: backfill KPIs for a date range
CREATE OR REPLACE FUNCTION backfill_kpis(p_start date, p_end date)
RETURNS int LANGUAGE plpgsql AS $$
DECLARE d date; count int:=0; BEGIN
  d := p_start; WHILE d <= p_end LOOP
    PERFORM upsert_kpi_daily(d); count := count + 1; d := d + 1; END LOOP; RETURN count; END;$$;

-- View: KPI enriched with derived metrics
CREATE OR REPLACE VIEW kpi_daily_enriched AS
SELECT *,
  CASE WHEN cost_cents=0 THEN NULL ELSE round((revenue_cents-cost_cents)*100.0/cost_cents,2) END AS roi_pct,
  CASE WHEN active_users=0 THEN NULL ELSE round(matches_played*1.0/active_users,2) END AS matches_per_active_user,
  CASE WHEN new_users=0 OR revenue_cents=0 THEN NULL ELSE round(revenue_cents*1.0/new_users/100,2) END AS arpu_new_user_usd
FROM kpi_daily;

-- View: Rolling 7 / 30 day KPIs
CREATE OR REPLACE VIEW kpi_rollups AS
WITH agg AS (
  SELECT
    max(day) AS ref_day,
    sum(matches_played) FILTER (WHERE day >= current_date-6) AS matches_7d,
    sum(matches_played) FILTER (WHERE day >= current_date-29) AS matches_30d,
    sum(revenue_cents) FILTER (WHERE day >= current_date-6) AS revenue_7d,
    sum(revenue_cents) FILTER (WHERE day >= current_date-29) AS revenue_30d,
    avg(retention_d1) FILTER (WHERE day >= current_date-6) AS d1_retention_7d_avg,
    avg(retention_d7) FILTER (WHERE day >= current_date-29) AS d7_retention_30d_avg
  FROM kpi_daily
)
SELECT * FROM agg;

-- Function: business_metrics_snapshot
CREATE OR REPLACE FUNCTION business_metrics_snapshot()
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE js jsonb; BEGIN
  js := jsonb_build_object(
    'latest_day', (SELECT max(day) FROM kpi_daily),
    'today', (SELECT row_to_json(t) FROM (SELECT * FROM kpi_daily_enriched WHERE day = current_date) t),
    'rollups', (SELECT row_to_json(r) FROM kpi_rollups r),
    'recent_7d', (SELECT json_agg(t ORDER BY day DESC) FROM (SELECT * FROM kpi_daily_enriched ORDER BY day DESC LIMIT 7) t)
  );
  RETURN js;
END;$$;

-- Function: daily BI update (include in maintenance cron if needed)
CREATE OR REPLACE FUNCTION daily_business_metrics()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM upsert_kpi_daily(current_date - 1); -- finalize yesterday
  PERFORM log_migration('bi','daily_metrics','run',NULL,true,NULL);
END;$$;

-- Optionally schedule BI update
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    PERFORM cron.schedule('daily-bi','10 2 * * *', 'SELECT daily_business_metrics();');
  END IF;
END;$$;

COMMIT;
