import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import TournamentAutomationService from '@/services/TournamentAutomationService';

interface AutomationStatus {
  isActive: boolean;
  lastTriggered: Date | null;
  successCount: number;
  errorCount: number;
  currentStatus: 'idle' | 'processing' | 'error';
  tournament_id?: string;
  tournament_name?: string;
  total_matches?: number;
  completed_matches?: number;
  progress_percentage?: number;
  current_round?: number;
  max_rounds?: number;
}

interface AutomationLog {
  id: string;
  automation_type: string;
  tournament_id: string;
  success: boolean;
  metadata: any;
  created_at: string;
  error_message?: string;
}

export const useUnifiedTournamentAutomation = (tournamentId?: string) => {
  const [automationStatus, setAutomationStatus] =
    useState<AutomationStatus | null>(null);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  // Load automation status for specific tournament
  const loadAutomationStatus = useCallback(async (tId: string) => {
    try {
      setLoading(true);
      const response = await TournamentAutomationService.status(tId);

      if (response.success && response.data) {
        const statusData = response.data.automation_status || {};
        setAutomationStatus({
          isActive: statusData.tournament_status !== 'completed',
          lastTriggered: statusData.status_calculated_at
            ? new Date(statusData.status_calculated_at)
            : null,
          successCount: statusData.completed_matches || 0,
          errorCount: 0, // Calculate from logs if needed
          currentStatus:
            statusData.tournament_status === 'ongoing' ? 'processing' : 'idle',
          tournament_id: statusData.tournament_id,
          tournament_name: statusData.tournament_name,
          total_matches: statusData.total_matches,
          completed_matches: statusData.completed_matches,
          progress_percentage: statusData.progress_percentage,
          current_round: statusData.current_round,
          max_rounds: statusData.max_rounds,
        });

        // Set recent logs if available
        if (response.data.recent_logs) {
          setAutomationLogs(response.data.recent_logs);
        }
      }
    } catch (error) {
      console.error('Failed to load automation status:', error);
      toast.error('Không thể tải trạng thái automation');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fix tournament progression using the automation service
  const fixTournamentProgression = useCallback(
    async (tId?: string) => {
      const targetId = tId || tournamentId;
      if (!targetId) {
        toast.error('Không có tournament ID');
        return;
      }

      try {
        setIsFixing(true);
        toast.info('🔧 Đang sửa chữa tournament progression...');

        const response = await TournamentAutomationService.recoverOne(targetId);

        if (response.success) {
          toast.success('✅ Đã sửa chữa tournament thành công');
          // Reload status after fix
          await loadAutomationStatus(targetId);
        } else {
          throw new Error(response.error || 'Không thể sửa chữa tournament');
        }
      } catch (error: any) {
        console.error('Fix tournament error:', error);
        toast.error('❌ Lỗi khi sửa chữa: ' + error.message);
      } finally {
        setIsFixing(false);
      }
    },
    [tournamentId, loadAutomationStatus]
  );

  // Force start tournament
  const forceStartTournament = useCallback(
    async (tId?: string) => {
      const targetId = tId || tournamentId;
      if (!targetId) return;

      try {
        await TournamentAutomationService.forceStart(targetId);
        toast.success('🚀 Đã force start tournament');
        await loadAutomationStatus(targetId);
      } catch (error: any) {
        toast.error('Lỗi force start: ' + error.message);
      }
    },
    [tournamentId, loadAutomationStatus]
  );

  // Health check for all tournaments
  const performHealthCheck = useCallback(async () => {
    try {
      const response = await TournamentAutomationService.healthCheck();
      if (response.success) {
        toast.success('✅ Health check hoàn thành');
        return response.data;
      } else {
        throw new Error(response.error || 'Health check failed');
      }
    } catch (error: any) {
      toast.error('❌ Health check thất bại: ' + error.message);
      throw error;
    }
  }, []);

  // Auto-load status when tournamentId changes
  React.useEffect(() => {
    if (tournamentId) {
      loadAutomationStatus(tournamentId);
    }
  }, [tournamentId, loadAutomationStatus]);

  return {
    automationStatus,
    automationLogs,
    loading,
    isFixing,
    loadAutomationStatus,
    fixTournamentProgression,
    forceStartTournament,
    performHealthCheck,
  };
};

export default useUnifiedTournamentAutomation;
