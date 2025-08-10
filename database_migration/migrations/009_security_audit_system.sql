-- MIGRATION_METADATA
-- id: 009_security_audit_system
-- created: 2025-08-10
-- author: system
-- description: Comprehensive security hardening: RLS policies & audit logging with IP tracking.
-- safe_retries: true
-- requires: 008_advanced_optimizations
-- rollback: Drop audit tables & policies (manual)
-- /MIGRATION_METADATA
SET search_path TO public;

-- 1. Audit log table (generic)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  schema_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL, -- INSERT / UPDATE / DELETE
  row_pk TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID,
  request_ip INET,
  old_data JSONB,
  new_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_time ON audit_log(table_name, changed_at DESC);

-- Helper to record audit
CREATE OR REPLACE FUNCTION record_audit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_user UUID; v_ip INET; BEGIN
  BEGIN v_user := auth.uid(); EXCEPTION WHEN OTHERS THEN v_user := NULL; END;
  v_ip := inet_client_addr();
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(schema_name, table_name, action, row_pk, changed_by, request_ip, old_data)
    VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_OP, to_jsonb(OLD)->> 'id', v_user, v_ip, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(schema_name, table_name, action, row_pk, changed_by, request_ip, old_data, new_data)
    VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_OP, to_jsonb(NEW)->> 'id', v_user, v_ip, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO audit_log(schema_name, table_name, action, row_pk, changed_by, request_ip, new_data)
    VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_OP, to_jsonb(NEW)->> 'id', v_user, v_ip, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;$$;

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT unnest(ARRAY['profiles_optimized','tournaments_v2','user_wallets','wallet_transactions_v2']) AS t LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = r.t||'_audit') THEN
      EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION record_audit();', r.t||'_audit', r.t);
    ELSE
      RAISE NOTICE 'Trigger % already exists, skipping', r.t||'_audit';
    END IF;
  END LOOP;
END $$;

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT unnest(ARRAY['profiles_optimized','user_wallets','wallet_transactions_v2','tournaments_v2','tournament_participants']) AS t LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', r.t);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping RLS enable for % due to error: %', r.t, SQLERRM;
    END;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE v_role TEXT; BEGIN
  BEGIN SELECT current_setting('request.jwt.claim.role', true) INTO v_role; EXCEPTION WHEN OTHERS THEN v_role := NULL; END;
  RETURN v_role = 'service_role';
END;$$;

DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_self_select ON profiles_optimized;
  CREATE POLICY profiles_self_select ON profiles_optimized FOR SELECT USING ( (SELECT coalesce(auth.uid(), NULL)) = user_id OR is_admin());
  DROP POLICY IF EXISTS profiles_self_update ON profiles_optimized;
  CREATE POLICY profiles_self_update ON profiles_optimized FOR UPDATE USING ( (SELECT coalesce(auth.uid(), NULL)) = user_id OR is_admin());
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping profile RLS policies: %', SQLERRM; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS wallet_self_select ON user_wallets;
  CREATE POLICY wallet_self_select ON user_wallets FOR SELECT USING ((SELECT coalesce(auth.uid(), NULL)) = user_id OR is_admin());
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping wallet RLS policy: %', SQLERRM; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS wallet_tx_self_select ON wallet_transactions_v2;
  CREATE POLICY wallet_tx_self_select ON wallet_transactions_v2 FOR SELECT USING ((SELECT coalesce(auth.uid(), NULL)) = user_id OR is_admin());
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping wallet tx RLS policy: %', SQLERRM; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS tournaments_public_select ON tournaments_v2;
  CREATE POLICY tournaments_public_select ON tournaments_v2 FOR SELECT USING (TRUE);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping tournaments public policy: %', SQLERRM; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS participants_self_select ON tournament_participants;
  CREATE POLICY participants_self_select ON tournament_participants FOR SELECT USING ((SELECT coalesce(auth.uid(), NULL)) = user_id OR is_admin());
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping participants RLS policy: %', SQLERRM; END $$;

CREATE OR REPLACE VIEW audit_log_recent AS
SELECT * FROM audit_log ORDER BY changed_at DESC LIMIT 1000;

-- End of 009_security_audit_system.sql
