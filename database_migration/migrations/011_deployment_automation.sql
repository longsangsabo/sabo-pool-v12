-- MIGRATION_METADATA
-- id: 011_deployment_automation
-- created: 2025-08-10
-- author: system
-- description: Blue-green deployment metadata & switch functions.
-- safe_retries: true
-- requires: 010_performance_monitoring
-- rollback: Drop deployment management tables & functions
-- /MIGRATION_METADATA
SET search_path TO public;

CREATE TABLE IF NOT EXISTS deployment_environments (
  env_name TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  notes TEXT
);

INSERT INTO deployment_environments(env_name, status)
VALUES ('blue','active') ON CONFLICT (env_name) DO NOTHING;
INSERT INTO deployment_environments(env_name, status)
VALUES ('green','inactive') ON CONFLICT (env_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS deployment_pointer (
  id INT PRIMARY KEY DEFAULT 1,
  active_env TEXT NOT NULL REFERENCES deployment_environments(env_name)
);
INSERT INTO deployment_pointer(id, active_env) VALUES (1,'blue') ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION switch_active_environment(p_target TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v_current TEXT; v_exists INT; v_report JSONB; BEGIN
  SELECT active_env INTO v_current FROM deployment_pointer WHERE id=1;
  IF p_target = v_current THEN RETURN 'NOOP'; END IF;
  SELECT count(*) INTO v_exists FROM deployment_environments WHERE env_name=p_target;
  IF v_exists = 0 THEN RAISE EXCEPTION 'Environment % not registered', p_target; END IF;
  BEGIN
    SELECT extended_migration_report() INTO v_report;
    IF (SELECT count(*) FROM jsonb_array_elements(v_report->'advanced_integrity_v2') x WHERE x->>'severity'='FAIL') > 0 THEN
       RAISE EXCEPTION 'Validation failed - cannot switch';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Validation error: %', SQLERRM;
  END;
  UPDATE deployment_environments SET status='inactive' WHERE env_name=v_current;
  UPDATE deployment_environments SET status='active', activated_at=now() WHERE env_name=p_target;
  UPDATE deployment_pointer SET active_env=p_target WHERE id=1;
  RETURN format('Switched from %s to %s', v_current, p_target);
END;$$;

CREATE OR REPLACE VIEW deployment_status AS
SELECT d.env_name, d.status, d.activated_at, p.active_env FROM deployment_environments d
JOIN deployment_pointer p ON true;

-- End of 011_deployment_automation.sql
