import { supabase } from '@/integrations/supabase/client';

export type TournamentState = 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';

interface InvokeParams<T> {
  action: string;
  params?: T;
}

async function callFunction<TReq extends Record<string, any>, TRes = any>({
  action,
  params,
}: InvokeParams<TReq>) {
  const { data, error } = await supabase.functions.invoke('tournament-automation', {
    body: { action, params },
  });
  if (error) throw error;
  return data as { success: boolean; data?: TRes; error?: string };
}

export const TournamentAutomationService = {
  healthCheck: () => callFunction<{}>({ action: 'check_health' }),

  recoverAll: () => callFunction<{}>({ action: 'recover' }),

  recoverOne: (tournamentId: string) =>
    callFunction<{ tournament_id: string }>({ action: 'recover', params: { tournament_id: tournamentId } }),

  status: (tournamentId: string) =>
    callFunction<{ tournament_id: string }>({ action: 'status', params: { tournament_id: tournamentId } }),

  forceStart: (tournamentId: string, adminId?: string) =>
    callFunction<{ tournament_id: string; admin_id?: string }>({
      action: 'force_start',
      params: { tournament_id: tournamentId, admin_id: adminId },
    }),

  manageState: (tournamentId: string, newStatus: TournamentState, adminId?: string) =>
    callFunction<{ tournament_id: string; new_status: TournamentState; admin_id?: string}>({
      action: 'manage_state',
      params: { tournament_id: tournamentId, new_status: newStatus, admin_id: adminId },
    }),

  cleanupLogs: (days = 30) => callFunction<{ days: number }>({ action: 'cleanup_logs', params: { days } }),

  createSaboStructure: (tournamentId: string) =>
    callFunction<{ tournament_id: string }>({ action: 'create_sabo_structure', params: { tournament_id: tournamentId } }),

  testRepairCurrent: () => callFunction<{}>({ action: 'test_repair_current' }),
};

export default TournamentAutomationService;
