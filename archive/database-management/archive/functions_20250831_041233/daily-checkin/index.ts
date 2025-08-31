// Edge Function: daily-checkin
// Handles user daily check-in and login streak progression.
// Payload: { user_id?: string, player_id?: string }
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// deno-lint-ignore-file no-explicit-any
// @ts-ignore Deno global available in edge runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

// @ts-ignore Deno env runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore service role key
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function handleCheckIn(player_id: string) {
  const today = new Date();
  const todayDate = today.toISOString().slice(0,10);

  // Upsert daily progress (mark daily_checkin true)
  await supabase.from('player_daily_progress').upsert({
    player_id,
    date: todayDate,
    daily_checkin: true
  }, { onConflict: 'player_id,date' });

  // Fetch and update streak
  const { data: streakRow } = await supabase
    .from('player_login_streaks')
    .select('*')
    .eq('player_id', player_id)
    .single();

  let current_streak = 1;
  let longest_streak = 1;
  let weekly_logins = 1;
  let week_start_date: string | null = null;
  if (streakRow) {
    const last = streakRow.last_login_date ? new Date(streakRow.last_login_date) : null;
    const diffDays = last ? Math.floor((today.getTime() - last.getTime()) / 86400000) : 999;
    if (diffDays === 0) {
      current_streak = streakRow.current_streak; // already checked in today
    } else if (diffDays === 1) {
      current_streak = streakRow.current_streak + 1;
    }
    longest_streak = Math.max(streakRow.longest_streak, current_streak);

    // Weekly tracking (simple week bucket starting Monday based on ISO week)
    const lastWeekStart = streakRow.week_start_date ? new Date(streakRow.week_start_date) : null;
    const currentWeekStart = new Date(today);
    const day = currentWeekStart.getUTCDay(); // 0=Sun
    const diffToMonday = (day + 6) % 7; // days since Monday
    currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - diffToMonday);
    const currentWeekStartStr = currentWeekStart.toISOString().slice(0,10);
    week_start_date = currentWeekStartStr;
    if (!lastWeekStart || lastWeekStart.toISOString().slice(0,10) !== currentWeekStartStr) {
      weekly_logins = 1; // new week
    } else {
      // Only increment if first login today
      if (diffDays !== 0) weekly_logins = streakRow.weekly_logins + 1; else weekly_logins = streakRow.weekly_logins;
    }
  }

  await supabase.from('player_login_streaks').upsert({
    player_id,
    current_streak,
    longest_streak,
    last_login_date: todayDate,
    weekly_logins,
    week_start_date: week_start_date || todayDate
  }, { onConflict: 'player_id' });

  const baseUrl = new URL('/functions/v1/milestone-event', SUPABASE_URL).toString();
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` };
  // Fire and forget events
  const events: any[] = [
    { player_id, event_type: 'daily_login', value: 1 }
  ];
  if (current_streak > 0) events.push({ player_id, event_type: 'login_streak', value: 1 });
  // Weekly login milestone (non-repeatable) increments each week login recorded
  if (weekly_logins > 0 && weekly_logins <= 4) events.push({ player_id, event_type: 'weekly_login', value: 1 });
  await Promise.all(events.map(evt => fetch(baseUrl, { method: 'POST', headers, body: JSON.stringify(evt) }).catch(() => {})));

  return { current_streak, longest_streak, weekly_logins };
}

serve(async (req) => {
  try {
    const { user_id, player_id } = await req.json();
    const pid = player_id || user_id;
    if (!pid) return new Response(JSON.stringify({ error: 'missing_player_id' }), { status: 400 });
    const result = await handleCheckIn(pid);
    return new Response(JSON.stringify({ success: true, ...result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'server_error', details: String(e) }), { status: 500 });
  }
});
