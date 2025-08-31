-- Milestone Events & Triggers Integration (Phase 1 automation)
-- Date: 2025-08-11
-- Creates audit/event tables and database trigger functions to invoke edge function 'milestone-triggers'
-- for core gameplay and user progression events.

-- 1. Audit / Events Tables ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.milestone_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_context JSONB DEFAULT '{}'::jsonb,
  dedupe_key TEXT, -- optional external id to prevent duplicate processing
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, event_type, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_milestone_events_player ON public.milestone_events(player_id);
CREATE INDEX IF NOT EXISTS idx_milestone_events_type ON public.milestone_events(event_type);

-- Track awards (each time points are given / milestone completed)
CREATE TABLE IF NOT EXISTS public.milestone_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  event_type TEXT,
  spa_points_awarded INTEGER DEFAULT 0,
  occurrence INTEGER DEFAULT 1, -- for repeatables counts at time of award
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  awarded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestone_awards_player ON public.milestone_awards(player_id);
CREATE INDEX IF NOT EXISTS idx_milestone_awards_milestone ON public.milestone_awards(milestone_id);

-- (Future) Could add a trigger in milestone-event edge function to insert into milestone_awards via RPC.

-- 2. Helper: HTTP request from Postgres to Edge Function ----------------------
-- Using http extension (ensure enabled). If not enabled, instruct enabling outside migration.
-- We wrap call in a SECURITY DEFINER function so policies don't block.

CREATE OR REPLACE FUNCTION public.call_milestone_triggers(p_events JSONB)
RETURNS void AS $$
DECLARE
  v_url TEXT := current_setting('app.settings.supabase_url', true);
  v_service_key TEXT := current_setting('app.settings.service_role_key', true);
  v_resp JSONB;
BEGIN
  IF v_url IS NULL OR v_service_key IS NULL THEN
    RAISE NOTICE 'Milestone trigger skipped (missing settings)';
    RETURN;
  END IF;
  PERFORM 1 FROM pg_extension WHERE extname = 'http';
  IF NOT FOUND THEN
    RAISE NOTICE 'http extension not available; skipping milestone trigger dispatch';
    RETURN;
  END IF;
  SELECT content::jsonb INTO v_resp FROM http_post(
    v_url || '/functions/v1/milestone-triggers',
    p_events::text,
    ('{"Content-Type":"application/json","Authorization":"Bearer ' || v_service_key || '"}')::jsonb
  );
  INSERT INTO public.milestone_events(player_id, event_type, event_context, dedupe_key)
  SELECT (ev->>'player_id')::uuid, ev->>'event_type', jsonb_build_object('batch', true, 'raw', ev), ev->>'dedupe_key'
  FROM jsonb_array_elements(p_events->'events') AS ev
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'call_milestone_triggers error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger Functions ---------------------------------------------------------

-- Match completion: fires when status moves to 'completed'
CREATE OR REPLACE FUNCTION public.tf_match_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_events JSONB;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    v_events := jsonb_build_object('events', jsonb_build_array(
      jsonb_build_object('player_id', NEW.player1_id, 'event_type', 'match_count', 'value', 1),
      jsonb_build_object('player_id', NEW.player2_id, 'event_type', 'match_count', 'value', 1)
    ));
    IF NEW.winner_id IS NOT NULL THEN
      v_events := jsonb_set(v_events, '{events}', (v_events->'events') || jsonb_build_array(
        jsonb_build_object('player_id', NEW.winner_id, 'event_type', 'challenge_win', 'value', 1)
      ));
    END IF;
    PERFORM public.call_milestone_triggers(v_events);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Challenge completion: when challenges.status becomes 'completed'
CREATE OR REPLACE FUNCTION public.tf_challenge_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_events JSONB;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    v_events := jsonb_build_object('events', jsonb_build_array(
      jsonb_build_object('player_id', NEW.challenger_id, 'event_type', 'challenge_send', 'value', 1)
    ));
    PERFORM public.call_milestone_triggers(v_events);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tournament participation (join): on insert into tournament_participants table (if exists)
CREATE OR REPLACE FUNCTION public.tf_tournament_join()
RETURNS TRIGGER AS $$
DECLARE
  v_events JSONB;
BEGIN
  v_events := jsonb_build_object('events', jsonb_build_array(
    jsonb_build_object('player_id', NEW.player_id, 'event_type', 'tournament_join', 'value', 1)
  ));
  PERFORM public.call_milestone_triggers(v_events);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tournament win: when tournament record status updated to completed and winner_id set
CREATE OR REPLACE FUNCTION public.tf_tournament_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_events JSONB;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.winner_id IS NOT NULL THEN
    v_events := jsonb_build_object('events', jsonb_build_array(
      jsonb_build_object('player_id', NEW.winner_id, 'event_type', 'tournament_win', 'value', 1)
    ));
    PERFORM public.call_milestone_triggers(v_events);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User registration/profile create: fire account_creation milestone
CREATE OR REPLACE FUNCTION public.tf_profile_created()
RETURNS TRIGGER AS $$
DECLARE
  v_events JSONB := jsonb_build_object('events', jsonb_build_array(
    jsonb_build_object('player_id', NEW.user_id, 'event_type', 'account_creation', 'value', 1)
  ));
BEGIN
  PERFORM public.call_milestone_triggers(v_events);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach Triggers -----------------------------------------------------------

DROP TRIGGER IF EXISTS trg_match_completed ON public.matches;
CREATE TRIGGER trg_match_completed
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.tf_match_completed();

DROP TRIGGER IF EXISTS trg_challenge_completed ON public.challenges;
CREATE TRIGGER trg_challenge_completed
AFTER UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.tf_challenge_completed();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournament_participants') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_tournament_join ON public.tournament_participants';
    EXECUTE 'CREATE TRIGGER trg_tournament_join AFTER INSERT ON public.tournament_participants FOR EACH ROW EXECUTE FUNCTION public.tf_tournament_join()';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournaments') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_tournament_completed ON public.tournaments';
    EXECUTE 'CREATE TRIGGER trg_tournament_completed AFTER UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.tf_tournament_completed()';
  END IF;
END$$;

DROP TRIGGER IF EXISTS trg_profile_created ON public.profiles;
CREATE TRIGGER trg_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.tf_profile_created();

-- 5. RLS (read access) --------------------------------------------------------
ALTER TABLE public.milestone_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users read own milestone_events" ON public.milestone_events
FOR SELECT TO authenticated USING (player_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users read own milestone_awards" ON public.milestone_awards
FOR SELECT TO authenticated USING (player_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System manage milestone_events" ON public.milestone_events
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "System manage milestone_awards" ON public.milestone_awards
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Settings Documentation ---------------------------------------------------
-- Set these GUCs (once) so call_milestone_triggers knows where to post.
-- SELECT set_config('app.settings.supabase_url','https://YOUR-PROJECT.supabase.co', true);
-- SELECT set_config('app.settings.service_role_key','SERVICE_ROLE_KEY', true);
-- Or manage via postgresql.conf / parameter group.

DO $$ BEGIN RAISE NOTICE 'Milestone events & triggers migration complete'; END $$;
