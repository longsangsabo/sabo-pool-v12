// Edge Function: weekly-reset
// Scheduled job to reset weekly repeatable milestones and (optionally) aggregate stats.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

async function resetWeekly() {
  // Identify weekly-style repeatables (milestone_type starting with 'weekly_')
  const { data: weeklyMilestones, error } = await supabase
    .from('milestones')
    .select('id')
    .ilike('milestone_type', 'weekly_%')
    .eq('is_active', true);
  if (error) throw error;
  if (weeklyMilestones?.length) {
    const ids = weeklyMilestones.map(m => m.id);
    // Reset progress (retain times_completed history)
    const { error: updErr } = await supabase
      .from('player_milestones')
      .update({ current_progress: 0, is_completed: false })
      .in('milestone_id', ids);
    if (updErr) throw updErr;
  }
  return { reset: weeklyMilestones?.length || 0 };
}

serve(async (_req) => {
  try {
    const result = await resetWeekly();
    return new Response(JSON.stringify({ success: true, ...result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'server_error', details: String(e) }), { status: 500 });
  }
});
