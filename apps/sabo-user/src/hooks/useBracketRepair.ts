import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repairDoubleEliminationBracket } from '../services/tournamentService';
import { toast } from 'sonner';

interface RepairBracketParams {
  tournamentId: string;
}

interface RepairResult {
  success?: boolean;
  error?: string;
  fixed_advancements?: number;
  created_matches?: number;
  repair_summary?: string;
  tournament_id?: string;
  tournament_name?: string;
}

export const useBracketRepair = () => {
  const queryClient = useQueryClient();

  const repairBracket = useMutation({
    mutationFn: async ({ tournamentId }: RepairBracketParams) => {
      return await repairDoubleEliminationBracket(tournamentId) as RepairResult;
    },
    onSuccess: data => {
      console.log('✅ Bracket repair completed:', data);

      if (data?.error) {
        toast.error(`Repair failed: ${data.error}`);
        return;
      }

      // Invalidate tournament queries to refresh bracket
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-bracket'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });

      // Force refresh of all tournament data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['tournament-matches'] });
      }, 1000);

      const {
        fixed_advancements = 0,
        created_matches = 0,
        repair_summary,
      } = data;

      if (fixed_advancements > 0 || created_matches > 0) {
        toast.success(`🔧 Bracket repaired: ${repair_summary}`);
      } else {
        toast.info('🔧 Bracket checked - no repairs needed');
      }
    },
    onError: error => {
      console.error('❌ Bracket repair failed:', error);
      toast.error('Failed to repair bracket: ' + (error as Error).message);
    },
  });

  return {
    repairBracket: repairBracket.mutate,
    isRepairing: repairBracket.isPending,
    repairError: repairBracket.error,
  };
};
