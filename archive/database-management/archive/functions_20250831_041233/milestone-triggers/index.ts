// Edge Function: milestone-triggers
// Accepts an array of events and forwards them to milestone-event for processing.
// Payload: { events: [{ player_id?: string, user_id?: string, event_type: string, value?: number }] }
// deno-lint-ignore-file no-explicit-any
// @ts-ignore Deno provided fetch + modules
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// @ts-ignore Deno env runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore service role key
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const { events } = await req.json();
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ error: 'empty_events' }), { status: 400 });
    }
    const endpoint = new URL('/functions/v1/milestone-event', SUPABASE_URL).toString();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` };
    const results: any[] = [];
    for (const evt of events) {
      if (!evt || !evt.event_type || !(evt.player_id || evt.user_id)) {
        results.push({ ok: false, error: 'invalid_event' });
        continue;
      }
      try {
        const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(evt) });
        const json = await res.json();
        results.push({ ok: res.ok, ...json });
      } catch (e) {
        results.push({ ok: false, error: String(e) });
      }
    }
    return new Response(JSON.stringify({ forwarded: results.length, results }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'server_error', details: String(e) }), { status: 500 });
  }
});
