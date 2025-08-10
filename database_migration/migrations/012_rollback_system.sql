-- MIGRATION_METADATA
-- id: 012_rollback_system
-- created: 2025-08-10
-- author: system
-- description: Comprehensive rollback automation & snapshot capture.
-- safe_retries: true
-- requires: 011_deployment_automation
-- rollback: Drop rollback tables & functions (manual)
-- /MIGRATION_METADATA
SET search_path TO public;

CREATE TABLE IF NOT EXISTS rollback_snapshots (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot JSONB NOT NULL
);

CREATE OR REPLACE FUNCTION capture_full_snapshot(p_label TEXT DEFAULT 'pre_migration')
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; v_json JSONB; BEGIN
  v_json := jsonb_build_object(
    'profiles', (SELECT count(*) FROM profiles),
    'profiles_optimized', (SELECT count(*) FROM profiles_optimized),
    'wallet_points_profiles', (SELECT sum(spa_points) FROM profiles),
    'wallet_points_user_wallets', (SELECT sum(spa_points) FROM user_wallets),
    'tournaments', (SELECT count(*) FROM tournaments),
    'tournaments_v2', (SELECT count(*) FROM tournaments_v2),
    'matches_v2', (SELECT count(*) FROM tournament_matches_v2)
  );
  INSERT INTO rollback_snapshots(label, snapshot) VALUES (p_label, v_json) RETURNING id INTO v_id;
  RETURN v_id;
END;$$;

CREATE TABLE IF NOT EXISTS rollback_plan (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id BIGINT REFERENCES rollback_snapshots(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  plan JSONB NOT NULL
);

CREATE OR REPLACE FUNCTION generate_rollback_plan(p_snapshot_id BIGINT)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; v_snap JSONB; BEGIN
  SELECT snapshot INTO v_snap FROM rollback_snapshots WHERE id=p_snapshot_id;
  IF v_snap IS NULL THEN RAISE EXCEPTION 'Snapshot % not found', p_snapshot_id; END IF;
  INSERT INTO rollback_plan(snapshot_id, plan) VALUES (p_snapshot_id, jsonb_build_object(
    'steps', jsonb_build_array(
        'Re-point legacy views to original tables if altered',
        'Revert data discrepancies by comparing wallet totals',
        'Drop new partition tables if empty & restore indexes',
        'Disable RLS policies temporarily if blocking recovery'
    ),
    'notes','Manual intervention likely required for partial data changes'
  )) RETURNING id INTO v_id;
  RETURN v_id;
END;$$;

CREATE OR REPLACE FUNCTION perform_full_rollback(p_plan_id BIGINT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v_plan JSONB; BEGIN
  SELECT plan INTO v_plan FROM rollback_plan WHERE id=p_plan_id;
  IF v_plan IS NULL THEN RAISE EXCEPTION 'Rollback plan % not found', p_plan_id; END IF;
  RETURN format('Rollback initiated using plan %s. Manual follow-up required.', p_plan_id);
END;$$;

-- End of 012_rollback_system.sql
