# Milestone System Configuration & Deployment Guide

This document describes the configuration required to operate the Milestone System automation (edge functions + database triggers + award logging).

## 1. Required PostgreSQL GUC Settings
The trigger helper `public.call_milestone_triggers` reads two custom settings:
- `app.settings.supabase_url` – Base URL of your Supabase project (e.g. `https://xyzcompany.supabase.co`)
- `app.settings.service_role_key` – Service role key used for server-to-server calls to edge functions.

### Set (session for quick test)
```sql
SELECT set_config('app.settings.supabase_url','https://YOUR-PROJECT.supabase.co', false);
SELECT set_config('app.settings.service_role_key','SERVICE_ROLE_KEY', false);
```

### Set (database persistent – requires superuser / parameter group)
In managed Supabase you normally cannot persist arbitrary GUCs; instead you can:
1. Use a `vault` / secret manager in edge functions directly (preferred for production).
2. Or set them at session time inside a scheduled task before calling triggers (less ideal).

If you self-host Postgres, add to `postgresql.conf`:
```
app.settings.supabase_url = 'https://YOUR-PROJECT.supabase.co'
app.settings.service_role_key = 'SERVICE_ROLE_KEY'
```
Reload Postgres afterward.

## 2. Enable `http` Extension
The helper function uses `http_post` from the `http` extension. Enable it once:
```sql
CREATE EXTENSION IF NOT EXISTS http;
```
If extension creation is disallowed in hosted environments, replace the trigger approach with a NOTIFY/LISTEN queue consumed by a worker, or call edge functions from application backend instead.

## 3. Edge Functions Required
Deploy (or confirm) these edge functions:
- `milestone-event` (core processor) – awards progress & logs to `milestone_awards`.
- `milestone-triggers` (batch dispatcher) – accepts `{ events: [...] }`.
- `daily-checkin`
- `weekly-reset`

Ensure each has access to `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.

## 4. Database Objects Summary
| Object | Purpose |
|--------|---------|
| `milestones` | Catalog of milestone definitions |
| `player_milestones` | Per player progress & repeatable counts |
| `milestone_events` | Audit of dispatched trigger events (batch recorded) |
| `milestone_awards` | Log of each SPA point award (success or error) |
| Trigger functions (`tf_*`) | Fire on matches, challenges, tournaments, profiles, rank requests |
| Helper `call_milestone_triggers` | Posts JSON batch to edge function |

## 5. Security & RLS
- `milestone_events` / `milestone_awards` have RLS allowing players to read their own rows; `service_role` manages all.
- Awards insertion is done by edge function using service role key (bypassing standard RLS restrictions).

## 6. Production Deployment Checklist
1. Run all new migrations (milestone schema + events + award logging + triggers).
2. Enable `http` extension: `CREATE EXTENSION IF NOT EXISTS http;`.
3. Provision environment variables for all edge functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. (Optional) Set GUC values if using DB-driven trigger posting; otherwise modify `call_milestone_triggers` to inline constants or remove GUC usage.
5. Deploy edge functions (`supabase functions deploy ...`).
6. Verify triggers installed:
   ```sql
   SELECT tgname, relname FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid WHERE tgname LIKE 'trg_%' AND NOT t.tgisinternal;
   ```
7. Smoke test events (see validation script below).
8. Monitor initial awards: `SELECT * FROM milestone_awards ORDER BY awarded_at DESC LIMIT 20;`
9. Set up logs/alerting if error awards appear (status = 'error').
10. Schedule `weekly-reset` via Supabase cron if repeatable weekly milestones used.

## 7. Configuration Variants
If you cannot use the `http` extension:
- Replace trigger function bodies with inserts into a lightweight queue table (`milestone_queue`) and process with a background worker (edge function scheduled every minute).
- Or dispatch from application layer when domain events occur (less DB coupling).

## 8. Failure Modes & Mitigations
| Scenario | Behavior | Mitigation |
|----------|----------|-----------|
| http extension unavailable | Notices logged, no events dispatched | Use fallback queue or backend dispatch |
| Service role GUC missing | Function early returns | Ensure env or patch helper with constants |
| Edge function downtime | Events skipped; not retried | Add retry worker reading a queue table |
| Duplicate event | Unique (player_id,event_type,dedupe_key) prevents duplicates if dedupe_key provided | Populate dedupe_key for idempotent sources |

## 9. Award Logging Semantics
- Non-repeatable: single award recorded when first completed.
- Repeatable: one row per completion (occurrence reflects completion batch count; currently max 1 per invocation).
- Errors captured with `status='error'` & `error_message` (SPA points not applied).

## 10. Cleanup & Backfill (Optional Later)
For historical data, you can backfill by inserting synthetic events via `milestone-triggers`. Avoid overwhelming the edge function—batch moderately.

---

# Validation Script (Manual End-to-End)
Use the following SQL to validate key flows. Adjust UUIDs as needed.

```sql
-- 0. Preconditions
-- Ensure http extension + GUCs
CREATE EXTENSION IF NOT EXISTS http;
SELECT set_config('app.settings.supabase_url','https://YOUR-PROJECT.supabase.co', false);
SELECT set_config('app.settings.service_role_key','SERVICE_ROLE_KEY', false);

-- 1. Create auth user & profile (simplified; in Supabase use auth API normally)
-- Assume an existing auth.users row; here we mimic with a known UUID
WITH ins_user AS (
  SELECT '11111111-1111-1111-1111-111111111111'::uuid AS uid
)
INSERT INTO public.profiles (user_id, full_name, display_name)
SELECT uid, 'Test User', 'TestUser' FROM ins_user
ON CONFLICT (user_id) DO NOTHING;

-- 2. Check account_creation milestone event dispatched (allow a moment if async)
SELECT * FROM public.milestone_events WHERE player_id = '11111111-1111-1111-1111-111111111111' ORDER BY created_at DESC;

-- 3. Simulate a completed match between the test user and another player
WITH ensure_other AS (
  SELECT '22222222-2222-2222-2222-222222222222'::uuid AS uid
), ensure_profile AS (
  INSERT INTO public.profiles (user_id, full_name, display_name)
  SELECT uid, 'Opponent', 'Opponent' FROM ensure_other
  ON CONFLICT (user_id) DO NOTHING RETURNING user_id
)
INSERT INTO public.matches (player1_id, player2_id, winner_id, player1_score, player2_score, status, completed_at)
VALUES ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',5,3,'completed', now());

-- 4. Verify milestone events for match_count / challenge_win
SELECT * FROM public.milestone_events WHERE player_id = '11111111-1111-1111-1111-111111111111' ORDER BY created_at DESC LIMIT 10;

-- 5. Check progress & awards
SELECT m.name, pm.current_progress, pm.is_completed, pm.times_completed
FROM public.player_milestones pm
JOIN public.milestones m ON m.id = pm.milestone_id
WHERE pm.player_id = '11111111-1111-1111-1111-111111111111'
ORDER BY m.category, m.sort_order;

SELECT * FROM public.milestone_awards WHERE player_id = '11111111-1111-1111-1111-111111111111' ORDER BY awarded_at DESC;

-- 6. Duplicate match (should add another match_count event if threshold not yet met)
UPDATE public.matches SET completed_at = now() WHERE id = (SELECT id FROM public.matches ORDER BY created_at DESC LIMIT 1);
-- (If already completed, this update alone won't fire trigger; insert another completed match instead)
INSERT INTO public.matches (player1_id, player2_id, winner_id, player1_score, player2_score, status, completed_at)
VALUES ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',5,2,'completed', now());

-- Re-check progress and awards
SELECT pm.current_progress, pm.times_completed, m.name
FROM public.player_milestones pm JOIN public.milestones m ON m.id = pm.milestone_id
WHERE pm.player_id = '11111111-1111-1111-1111-111111111111' AND m.milestone_type = 'match_count';

-- 7. Rank request approval simulation
WITH rr AS (
  INSERT INTO public.rank_requests (user_id, requested_rank, current_rank, status)
  VALUES ('11111111-1111-1111-1111-111111111111','SILVER','BRONZE','pending')
  RETURNING id
)
UPDATE public.rank_requests SET status='approved' WHERE id = (SELECT id FROM rr);

SELECT * FROM public.milestone_events WHERE player_id='11111111-1111-1111-1111-111111111111' AND event_type='rank_registration' ORDER BY created_at DESC;
```

## 11. RPC: Recent Milestone Awards (for UI)
Create an RPC to fetch recent awards for the authenticated player:
```sql
CREATE OR REPLACE FUNCTION public.recent_milestone_awards(p_limit INT DEFAULT 20)
RETURNS TABLE(
  milestone_id UUID,
  milestone_name TEXT,
  event_type TEXT,
  spa_points_awarded INT,
  occurrence INT,
  status TEXT,
  awarded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT ma.milestone_id, m.name, ma.event_type, ma.spa_points_awarded, ma.occurrence, ma.status, ma.awarded_at
  FROM public.milestone_awards ma
  LEFT JOIN public.milestones m ON m.id = ma.milestone_id
  WHERE ma.player_id = auth.uid()
  ORDER BY ma.awarded_at DESC
  LIMIT p_limit;
END;$$ LANGUAGE plpgsql SECURITY DEFINER;
```
RLS: since SECURITY DEFINER, ensure owner is a role with minimal rights; optional policy adjustment may be needed.

Add a simple UI component to call this RPC (future enhancement).

---
## 12. Lightweight End-to-End Test Outline
1. Run validation script sections 0–5.
2. Confirm at least one `milestone_awards` row with `status='success'`.
3. Confirm `player_milestones` reflects progression and completion state for low-threshold milestones (e.g., account_creation, first_match).
4. Approve rank request; verify rank_registration event recorded.
5. Inspect logs for any `status='error'` awards; if present, capture `error_message` and remediate (likely missing RPC function or permission).

## 13. Troubleshooting Quick Reference
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No events recorded | GUCs not set / http ext missing | Set configs, enable http |
| Awards not logged but progress updates | Edge function lacks permission to insert milestone_awards | Ensure service role key used |
| Duplicate awards | Trigger fired multiple times / duplicate rows | Add dedupe_key; refine trigger conditions |
| Error status rows | RPC failure (award_spa_points) | Check RPC exists & permissions |

---
End of configuration guide.
