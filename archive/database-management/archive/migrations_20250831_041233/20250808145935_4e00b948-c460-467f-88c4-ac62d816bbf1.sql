-- Enable required extensions for scheduling HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule: Recover automation every 15 minutes
-- This invokes the tournament-automation edge function with the 'recover' action
select
  cron.schedule(
    'automation-recover-every-15m',
    '*/15 * * * *',
    $$
    select net.http_post(
      url := 'https://exlqvlbawytbglioqfbc.supabase.co/functions/v1/tournament-automation',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA"}'::jsonb,
      body := '{"action":"recover"}'::jsonb
    )
    $$
  );

-- Schedule: Cleanup old automation logs daily at 03:00
select
  cron.schedule(
    'automation-cleanup-logs-daily',
    '0 3 * * *',
    $$
    select net.http_post(
      url := 'https://exlqvlbawytbglioqfbc.supabase.co/functions/v1/tournament-automation',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA"}'::jsonb,
      body := '{"action":"cleanup_logs","params":{"days":30}}'::jsonb
    )
    $$
  );

-- Schedule: Health check hourly
select
  cron.schedule(
    'automation-health-check-hourly',
    '0 * * * *',
    $$
    select net.http_post(
      url := 'https://exlqvlbawytbglioqfbc.supabase.co/functions/v1/tournament-automation',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA"}'::jsonb,
      body := '{"action":"check_health"}'::jsonb
    )
    $$
  );