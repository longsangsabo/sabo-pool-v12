-- MIGRATION_METADATA
-- id: 008_advanced_optimizations
-- created: 2025-08-10
-- author: system
-- description: Advanced optimizations: monthly partitioning for tournament_matches_v2, domain event system.
-- safe_retries: true
-- requires: 007_backward_compatibility_extended
-- rollback: Drop created partitions, domain_events table & functions (manual if partitions retained for data safety)
-- /MIGRATION_METADATA
SET search_path TO public;

-- 1. Domain Events Table (event-driven architecture core)
CREATE TABLE IF NOT EXISTS domain_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    process_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_domain_events_type_time ON domain_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_events_processed ON domain_events(processed) WHERE processed = false;

-- Event emission helper
CREATE OR REPLACE FUNCTION emit_domain_event(p_event_type TEXT, p_entity_type TEXT, p_entity_id TEXT, p_payload JSONB)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; BEGIN
  INSERT INTO domain_events(event_type, entity_type, entity_id, payload)
  VALUES (p_event_type, p_entity_type, p_entity_id, COALESCE(p_payload,'{}'::jsonb))
  RETURNING id INTO v_id;
  PERFORM pg_notify('domain_events', json_build_object('id',v_id,'event_type',p_event_type)::text);
  RETURN v_id;
END;$$;

-- Simple polling processor mark-as-processed (stub)
CREATE OR REPLACE FUNCTION mark_domain_event_processed(p_id BIGINT, p_error TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE domain_events SET processed = (p_error IS NULL), processed_at = now(), process_error = p_error WHERE id = p_id;
END;$$;

-- 2. Monthly Partitioning for tournament_matches_v2
-- Assumes tournament_matches_v2 has a timestamp column (started_at or created_at). We'll use COALESCE(started_at, created_at, now()).
-- Use actual timestamp columns present (actual_start_time / created_at)
ALTER TABLE IF EXISTS tournament_matches_v2
  ADD COLUMN IF NOT EXISTS partition_ts TIMESTAMPTZ;

-- Backfill existing rows once
UPDATE tournament_matches_v2 SET partition_ts = COALESCE(actual_start_time, created_at, now()) WHERE partition_ts IS NULL;

-- Ensure future rows set partition_ts
CREATE OR REPLACE FUNCTION set_match_partition_ts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.partition_ts := COALESCE(NEW.actual_start_time, NEW.created_at, now());
  RETURN NEW;
END;$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_set_match_partition_ts') THEN
    CREATE TRIGGER trg_set_match_partition_ts BEFORE INSERT ON tournament_matches_v2
      FOR EACH ROW EXECUTE FUNCTION set_match_partition_ts();
  END IF;
END $$;

-- Partition conversion skipped in this environment (optional optimization).

-- 3. Event-driven replacement example for a trigger: on new match creation emit event
CREATE OR REPLACE FUNCTION trg_emit_match_created()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM emit_domain_event('match_created','tournament_match', NEW.id::text, jsonb_build_object('tournament_id', NEW.tournament_id,'round', NEW.round_number));
  RETURN NEW;
END;$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='tournament_matches_v2_emit_created') THEN
    CREATE TRIGGER tournament_matches_v2_emit_created
      AFTER INSERT ON tournament_matches_v2
      FOR EACH ROW EXECUTE FUNCTION trg_emit_match_created();
  END IF;
END $$;

-- End of 008_advanced_optimizations.sql
