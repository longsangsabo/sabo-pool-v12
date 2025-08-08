import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const perfStart = Date.now();
  let actionName = 'unknown';

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { action, params } = await req.json();
    actionName = action || 'refresh_all';

    let result: any = { success: true, refreshed: [] };

    switch (action) {
      case 'refresh_leaderboard': {
        // Refresh leaderboard materialized view
        const { error } = await supabase.rpc('refresh_mv_leaderboard_stats');
        if (error) throw error;
        result.refreshed.push('mv_leaderboard_stats');
        break;
      }

      case 'refresh_admin_stats': {
        // Refresh admin dashboard stats
        const { error } = await supabase.rpc('refresh_admin_dashboard_stats');
        if (error) throw error;
        result.refreshed.push('admin_dashboard_stats');
        break;
      }

      case 'refresh_ai_usage': {
        // Refresh AI usage stats
        const { error } = await supabase.rpc('refresh_mv_daily_ai_usage');
        if (error) throw error;
        result.refreshed.push('mv_daily_ai_usage');
        break;
      }

      case 'refresh_all':
      default: {
        // Refresh all materialized views
        const views = [
          'refresh_mv_leaderboard_stats',
          'refresh_admin_dashboard_stats', 
          'refresh_mv_daily_ai_usage'
        ];

        for (const viewFunc of views) {
          try {
            const { error } = await supabase.rpc(viewFunc);
            if (error) {
              console.warn(`Failed to refresh ${viewFunc}:`, error);
            } else {
              result.refreshed.push(viewFunc.replace('refresh_', ''));
            }
          } catch (err) {
            console.warn(`Error refreshing ${viewFunc}:`, err);
          }
        }
        break;
      }
    }

    // Log performance
    try {
      await supabase.from('automation_performance_log').insert({
        automation_type: `analytics_refresh_${actionName}`,
        success: true,
        execution_time_ms: Date.now() - perfStart,
        details: result,
      });
    } catch (logErr) {
      console.error('Performance log failed:', logErr);
    }

    return new Response(JSON.stringify({
      ...result,
      timestamp: new Date().toISOString(),
      execution_time_ms: Date.now() - perfStart,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Analytics refresh error:', error);

    // Log failure
    try {
      const supa = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await supa.from('automation_performance_log').insert({
        automation_type: `analytics_refresh_${actionName}`,
        success: false,
        execution_time_ms: Math.max(0, Date.now() - perfStart),
        error_message: error?.message || String(error),
        details: { error: error?.message || 'unknown' },
      });
    } catch (logErr) {
      console.error('Error logging failed:', logErr);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});