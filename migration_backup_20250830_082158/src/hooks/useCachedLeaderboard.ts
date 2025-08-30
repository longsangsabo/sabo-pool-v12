import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  current_rank: string;
  elo_points: number;
  spa_points: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_percentage: number;
  win_streak: number;
  ranking_position: number;
  last_updated: string;
}

interface LeaderboardCache {
  data: LeaderboardEntry[];
  lastRefresh: Date;
  isStale: boolean;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const STALE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

export const useCachedLeaderboard = (limit = 50, rankFilter?: string) => {
  const [cache, setCache] = useState<LeaderboardCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (forceRefresh = false) => {
      try {
        // Check if cache is still valid
        if (
          !forceRefresh &&
          cache &&
          Date.now() - cache.lastRefresh.getTime() < CACHE_DURATION
        ) {
          setLoading(false);
          return cache.data;
        }

        setLoading(true);
        setError(null);

        // Try to get from materialized view first (fastest)
        let query = supabase
          .from('mv_leaderboard_stats')
          .select('*')
          .order('ranking_position', { ascending: true })
          .limit(limit);

        if (rankFilter) {
          query = query.eq('current_rank', rankFilter);
        }

        const { data: mvData, error: mvError } = await query;

        let leaderboardData: LeaderboardEntry[] = [];

        if (mvError || !mvData || mvData.length === 0) {
          // Fallback to live data from player_rankings
          console.warn(
            'Materialized view unavailable, using live data:',
            mvError
          );

          let fallbackQuery = supabase
            .from('player_rankings')
            .select(
              `
            *,
            profiles!inner(display_name, avatar_url)
          `
            )
            .order('elo_points', { ascending: false })
            .limit(limit);

          if (rankFilter) {
            fallbackQuery = fallbackQuery.eq('current_rank', rankFilter);
          }

          const { data: liveData, error: liveError } = await fallbackQuery;

          if (liveError) throw liveError;

          // Transform live data to match leaderboard format
          leaderboardData = (liveData || []).map(
            (item: any, index: number) => ({
              id: item.id,
              user_id: item.user_id,
              display_name: item.profiles?.display_name || 'Unknown Player',
              avatar_url: item.profiles?.avatar_url,
              current_rank: item.current_rank || 'Rookie',
              elo_points: item.elo_points || 1000,
              spa_points: item.spa_points || 0,
              total_matches: item.total_matches || 0,
              wins: item.wins || 0,
              losses: item.losses || 0,
              win_percentage:
                item.total_matches > 0
                  ? Math.round((item.wins / item.total_matches) * 100)
                  : 0,
              win_streak: item.win_streak || 0,
              ranking_position: index + 1,
              last_updated: new Date().toISOString(),
            })
          );
        } else {
          leaderboardData = mvData as LeaderboardEntry[];
        }

        // Update cache
        const newCache: LeaderboardCache = {
          data: leaderboardData,
          lastRefresh: new Date(),
          isStale: false,
        };

        setCache(newCache);
        return leaderboardData;
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [cache, limit, rankFilter]
  );

  // Auto-refresh leaderboard data
  useEffect(() => {
    fetchLeaderboard();

    // Set up periodic refresh
    const interval = setInterval(() => {
      if (cache && Date.now() - cache.lastRefresh.getTime() >= CACHE_DURATION) {
        fetchLeaderboard(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Mark cache as stale after threshold
  useEffect(() => {
    if (!cache) return;

    const staleTimeout = setTimeout(() => {
      setCache(prev => (prev ? { ...prev, isStale: true } : null));
    }, STALE_THRESHOLD);

    return () => clearTimeout(staleTimeout);
  }, [cache?.lastRefresh]);

  const refreshCache = useCallback(() => {
    return fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  return {
    data: cache?.data || [],
    loading,
    error,
    isStale: cache?.isStale || false,
    lastRefresh: cache?.lastRefresh || null,
    refreshCache,
  };
};

export default useCachedLeaderboard;
