import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FixResult {
  fixed: string[];
}

export const useSABOSemifinalsFix = (tournamentId: string, onRefresh?: () => void) => {
  const queryClient = useQueryClient();

  const fixSemifinalsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔧 Fixing SABO semifinals for tournament:', tournamentId);

      // Cast the function name as any since it's not in types yet
      const { data, error } = await (supabase as any).rpc('fix_sabo_semifinals_now', {
        p_tournament_id: tournamentId,
      });

      if (error) {
        console.error('❌ Error fixing semifinals:', error);
        throw error;
      }

      console.log('✅ Semifinals fix result:', data);
      return data as unknown as FixResult;
    },
    onSuccess: (result) => {
      const fixes = result?.fixed || [];
      if (fixes.length > 0) {
        toast.success(`Đã sửa ${fixes.length} vấn đề bán kết`, {
          description: fixes.join(', '),
          duration: 5000,
        });
      } else {
        toast.info('Không có vấn đề nào cần sửa trong bán kết');
      }

      // Invalidate and refetch tournament data
      queryClient.invalidateQueries({
        queryKey: ['sabo-tournament-matches', tournamentId],
      });

      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: (error) => {
      console.error('❌ Failed to fix semifinals:', error);
      toast.error('Lỗi khi sửa bán kết', {
        description: error.message || 'Không thể thực hiện sửa chữa',
      });
    },
  });

  const fixSemifinals = useCallback(() => {
    fixSemifinalsMutation.mutate();
  }, [fixSemifinalsMutation]);

  return {
    fixSemifinals,
    isFixing: fixSemifinalsMutation.isPending,
    error: fixSemifinalsMutation.error,
  };
};
