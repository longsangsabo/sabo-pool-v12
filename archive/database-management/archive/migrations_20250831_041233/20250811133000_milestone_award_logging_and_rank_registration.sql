-- Milestone Award Logging & Rank Registration Trigger
-- Date: 2025-08-11
-- Adds status/error columns to milestone_awards and trigger to fire rank_registration milestone

ALTER TABLE public.milestone_awards
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success' CHECK (status IN ('success','error')),
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Rank registration trigger (user rank approved) -> rank_registration milestone event
CREATE OR REPLACE FUNCTION public.tf_rank_request_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_events JSONB;
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    v_events := jsonb_build_object('events', jsonb_build_array(
      jsonb_build_object('player_id', NEW.user_id, 'event_type', 'rank_registration', 'value', 1)
    ));
    PERFORM public.call_milestone_triggers(v_events);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rank_request_approved ON public.rank_requests;
CREATE TRIGGER trg_rank_request_approved
AFTER UPDATE ON public.rank_requests
FOR EACH ROW
EXECUTE FUNCTION public.tf_rank_request_approved();

DO $$ BEGIN RAISE NOTICE 'Milestone award logging & rank registration trigger migration complete'; END $$;
