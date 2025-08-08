import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PlayerStatsData {
  elo: number;
  spa: number;
  total_matches: number;
  wins: number;
}

export const usePlayerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true); setError(null);
      try {
        const { data, error } = await supabase
          .from('player_rankings')
          .select('elo_points, spa_points, total_matches, wins')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) {
          setStats({
            elo: data?.elo_points || 1000,
            spa: data?.spa_points || 0,
            total_matches: data?.total_matches || 0,
            wins: data?.wins || 0,
          });
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Load stats failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Realtime subscription optional
    const channel = supabase.channel('player-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_rankings', filter: `user_id=eq.${user.id}` }, () => {
        load();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { stats, loading, error };
};
