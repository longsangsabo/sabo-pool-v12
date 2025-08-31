// Edge Function: milestone-event
// Generic event processor to update milestone progress based on emitted events
// Expected payload: { user_id?: string, player_id?: string, event_type: string, value?: number, metadata?: any }
// Notes:
//  - Schema columns (player_milestones): player_id, milestone_id, current_progress, is_completed, times_completed, last_daily_completion
//  - For non-repeatable milestones we mark complete once and award spa_reward once.
//  - For repeatable milestones with daily_limit = 1 we only award once per day (using last_daily_completion date gate).
//  - For other repeatables (daily_limit null) we allow unlimited completions; we carry leftover progress past requirement_value.
//  - This remains a stateless processor; true idempotency (deduping identical events) would require an events table (future).

// deno-lint-ignore-file no-explicit-any
// @ts-ignore Deno edge runtime provides these modules
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore esm.sh resolution in Deno deploy
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

// @ts-ignore Deno env available at runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore service role key for internal operations
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

interface EventPayload { user_id?: string; player_id?: string; event_type: string; value?: number; metadata?: any }

function todayDateString() {
  return new Date().toISOString().slice(0,10);
}

async function processEvent(evt: EventPayload) {
  const player_id = evt.player_id || evt.user_id; // accept either field
  if (!player_id) throw new Error('missing player_id');

  // Fetch relevant milestones for this event_type
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('milestone_type', evt.event_type)
    .eq('is_active', true);
  if (error) throw error;
  if (!milestones?.length) return { updated: 0 };

  let updated = 0;
  for (const m of milestones) {
    const increment = evt.value ?? 1;
    // Fetch existing row
    const { data: existing, error: fetchErr } = await supabase
      .from('player_milestones')
      .select('*')
      .eq('player_id', player_id)
      .eq('milestone_id', m.id)
      .single();
    if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116 = row not found
      console.error('fetchErr', fetchErr);
      throw fetchErr;
    }

    // Non-repeatable logic
    if (!m.is_repeatable) {
      if (existing && existing.is_completed) {
        continue; // already done
      }
      const newProgress = Math.min((existing?.current_progress || 0) + increment, m.requirement_value);
      const justCompleted = newProgress >= m.requirement_value;
      if (!existing) {
        const { error: insErr } = await supabase.from('player_milestones').insert({
          player_id,
          milestone_id: m.id,
          current_progress: newProgress,
          is_completed: justCompleted,
          completed_at: justCompleted ? new Date().toISOString() : null,
          times_completed: justCompleted ? 1 : 0
        });
        if (insErr) throw insErr;
      } else {
        const { error: updErr } = await supabase.from('player_milestones').update({
          current_progress: newProgress,
          is_completed: justCompleted,
          completed_at: justCompleted ? new Date().toISOString() : existing.completed_at,
          times_completed: justCompleted ? 1 : existing.times_completed
        }).eq('id', existing.id);
        if (updErr) throw updErr;
      }
      if (justCompleted && m.spa_reward) {
        try {
          await supabase.rpc('award_spa_points', { p_user_id: player_id, p_points: m.spa_reward, p_reason: `milestone:${m.id}` });
          await supabase.from('milestone_awards').insert({
            player_id,
            milestone_id: m.id,
            event_type: evt.event_type,
            spa_points_awarded: m.spa_reward,
            occurrence: 1,
            reason: `milestone:${m.id}`,
            status: 'success'
          });
        } catch (e) {
          await supabase.from('milestone_awards').insert({
            player_id,
            milestone_id: m.id,
            event_type: evt.event_type,
            spa_points_awarded: 0,
            occurrence: 1,
            reason: `milestone:${m.id}`,
            status: 'error',
            error_message: String(e)
          });
        }
      }
      updated++;
      continue;
    }

    // Repeatable logic
    const dailyGate = m.daily_limit === 1; // current schema supports only 1 per day via last_daily_completion date
    const today = todayDateString();
    if (dailyGate && existing?.last_daily_completion === today) {
      // Already awarded today; still track progress if below requirement
      if (existing && existing.current_progress < m.requirement_value) {
        const newProgress = Math.min(existing.current_progress + increment, m.requirement_value);
        if (newProgress !== existing.current_progress) {
          await supabase.from('player_milestones').update({ current_progress: newProgress }).eq('id', existing.id);
          updated++;
        }
      }
      continue;
    }

    let current = existing?.current_progress || 0;
    current += increment;
    let awardCount = 0;
    // For repeatables without multi-completion tracking per event we allow only one completion at a time
    if (current >= m.requirement_value) {
      awardCount = 1;
      current = current - m.requirement_value; // carry leftover progress
    }

    if (!existing) {
      const { error: insErr } = await supabase.from('player_milestones').insert({
        player_id,
        milestone_id: m.id,
        current_progress: current,
        is_completed: false, // repeatables considered ongoing; we track times_completed
        times_completed: awardCount,
        last_daily_completion: awardCount && dailyGate ? today : null
      });
      if (insErr) throw insErr;
    } else if (awardCount || current !== existing.current_progress) {
      const { error: updErr } = await supabase.from('player_milestones').update({
        current_progress: current,
        times_completed: existing.times_completed + awardCount,
        last_daily_completion: awardCount && dailyGate ? today : existing.last_daily_completion
      }).eq('id', existing.id);
      if (updErr) throw updErr;
    }
    if (awardCount && m.spa_reward) {
      const totalPoints = m.spa_reward * awardCount;
      try {
        await supabase.rpc('award_spa_points', { p_user_id: player_id, p_points: totalPoints, p_reason: `milestone:${m.id}` });
        await supabase.from('milestone_awards').insert({
          player_id,
          milestone_id: m.id,
          event_type: evt.event_type,
          spa_points_awarded: totalPoints,
          occurrence: awardCount,
          reason: `milestone:${m.id}`,
          status: 'success'
        });
      } catch (e) {
        await supabase.from('milestone_awards').insert({
          player_id,
          milestone_id: m.id,
          event_type: evt.event_type,
          spa_points_awarded: 0,
          occurrence: awardCount,
          reason: `milestone:${m.id}`,
          status: 'error',
          error_message: String(e)
        });
      }
    }
    if (awardCount || increment) updated++;
  }
  return { updated };
}

serve(async (req) => {
  try {
    const body: EventPayload = await req.json();
    if (!body.event_type) return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 });
    const result = await processEvent(body);
    return new Response(JSON.stringify({ success: true, ...result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('milestone-event error', e);
    return new Response(JSON.stringify({ error: 'server_error', details: String(e) }), { status: 500 });
  }
});
