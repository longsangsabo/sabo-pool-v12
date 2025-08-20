import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// DEPRECATED: Use tournament_prizes table instead of tournament_prize_tiers
// This hook is maintained for backward compatibility but should not be used
export interface TournamentPrizeTier {
  id: string;
  tournament_id: string;
  position: number;
  position_name: string;
  cash_amount: number;
  elo_points: number;
  spa_points: number;
  is_visible: boolean;
  physical_items: string[];
}

export const useTournamentPrizeTiers = (tournamentId?: string) => {
  const [prizeTiers, setPrizeTiers] = useState<TournamentPrizeTier[]>([]);
  const [loading, setLoading] = useState(false); // Set to false to avoid loading
  const [error, setError] = useState<string | null>('DEPRECATED: Use tournament_prizes table instead');

  const fetchPrizeTiers = async () => {
    if (!tournamentId) {
      setPrizeTiers([]);
      setLoading(false);
      return;
    }

    // DEPRECATED: Return empty data and warning
    console.warn('⚠️ useTournamentPrizeTiers is DEPRECATED. Use tournament_prizes table instead.');
    setError('DEPRECATED: tournament_prize_tiers table does not exist. Use tournament_prizes table instead.');
    setPrizeTiers([]);
    setLoading(false);
    return;
  };

  useEffect(() => {
    fetchPrizeTiers();
  }, [tournamentId]);

  return {
    prizeTiers,
    loading,
    error,
    refetch: fetchPrizeTiers,
  };
};
