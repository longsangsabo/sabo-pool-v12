import { useState, useEffect } from 'react';
// Removed supabase import - migrated to services

interface TournamentCompletionStatus {
  isCompleted: boolean;
  hasResults: boolean;
  resultCount: number;
  loading: boolean;
  error: string | undefined;
}

export const useTournamentCompletion = (tournamentId: string): TournamentCompletionStatus => {
  const [status, setStatus] = useState<TournamentCompletionStatus>({
    isCompleted: false,
    hasResults: false,
    resultCount: 0,
    loading: true,
    error: null
  });

  const checkCompletionStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      // Check tournament status
//       const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('status, completed_at')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) {
        throw tournamentError;
      }

      // Check if tournament_results exist
//       const { data: results, error: resultsError, count } = await supabase
        .from('tournament_results')
        .select('*', { count: 'exact' })
        .eq('tournament_id', tournamentId);

      if (resultsError) {
        throw resultsError;
      }

      setStatus({
        isCompleted: tournament?.status === 'completed',
        hasResults: (count || 0) > 0,
        resultCount: count || 0,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error checking tournament completion:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    if (tournamentId) {
      checkCompletionStatus();
    }
  }, [tournamentId]);

  return status;
};

export default useTournamentCompletion;
