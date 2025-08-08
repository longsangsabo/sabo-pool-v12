import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS for web app calls
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { action, params } = await req.json();

    let result: any = null;

    switch (action) {
      case 'recover': {
        // Recover tournaments with automation issues (optionally a single tournament)
        const { data, error } = await supabase.rpc('recover_tournament_automation', {
          p_tournament_id: params?.tournament_id ?? null,
        });
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'status': {
        if (!params?.tournament_id) throw new Error('tournament_id is required');
        const { data, error } = await supabase.rpc('get_tournament_automation_status', {
          p_tournament_id: params.tournament_id,
        });
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'force_start': {
        if (!params?.tournament_id) throw new Error('tournament_id is required');
        const { data, error } = await supabase.rpc('force_start_tournament', {
          p_tournament_id: params.tournament_id,
          p_admin_id: params?.admin_id ?? null,
        });
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'manage_state': {
        if (!params?.tournament_id || !params?.new_status) {
          throw new Error('tournament_id and new_status are required');
        }
        const { data, error } = await supabase.rpc('manage_tournament_state', {
          p_tournament_id: params.tournament_id,
          p_new_status: params.new_status,
          p_admin_id: params?.admin_id ?? null,
        });
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'fix_unadvanced_all': {
        const { data, error } = await supabase.rpc('fix_all_unadvanced_tournaments');
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'check_health': {
        const { data, error } = await supabase.rpc('check_tournament_advancement_health');
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'cleanup_logs': {
        const days = typeof params?.days === 'number' ? params.days : 30;
        const { data, error } = await supabase.rpc('cleanup_old_automation_logs', {
          p_days_to_keep: days,
        });
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'create_sabo_structure': {
        if (!params?.tournament_id) throw new Error('tournament_id is required');
        const { data, error } = await supabase.rpc('create_sabo_tournament_structure', {
          p_tournament_id: params.tournament_id,
        });
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'test_repair_current': {
        const { data, error } = await supabase.rpc('test_repair_current_tournament');
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ ...result, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('tournament-automation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, timestamp: new Date().toISOString() }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
