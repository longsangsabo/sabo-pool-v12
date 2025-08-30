import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PlayerRankingData {
  ranking_position: number | null;
  total_players: number;
  percentile: number | null;
}

export const usePlayerRanking = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<PlayerRankingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get player ranking from materialized view
        const { data: playerData, error: playerError } = await supabase
          .from('mv_leaderboard_stats')
          .select('ranking_position')
          .eq('user_id', user.id)
          .maybeSingle();

        if (playerError) throw playerError;

        // Get total number of ranked players
        const { count: totalPlayers, error: countError } = await supabase
          .from('mv_leaderboard_stats')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        if (!cancelled) {
          const position = playerData?.ranking_position || null;
          const total = totalPlayers || 0;
          const percentile = position && total > 0 
            ? Math.round(((total - position + 1) / total) * 100)
            : null;

          setRanking({
            ranking_position: position,
            total_players: total,
            percentile
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('Error loading player ranking:', e);
          setError(e.message || 'Load ranking failed');
          // Fallback to unranked state
          setRanking({
            ranking_position: null,
            total_players: 0,
            percentile: null
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { ranking, loading, error };
};
