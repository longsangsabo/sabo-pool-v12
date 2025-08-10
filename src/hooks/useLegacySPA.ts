import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

interface LegacyClaimResult {
  success: boolean;
  spa_points: number;
  message: string;
  player_name: string;
}

interface LegacySuggestion {
  id: string;
  full_name: string;
  nick_name: string;
  spa_points: number;
  facebook_url: string;
  similarity_score: number;
}

interface LeaderboardEntry {
  user_type: 'registered' | 'legacy';
  user_id: string | null;
  full_name: string;
  nick_name: string;
  spa_points: number;
  elo_points: number;
  verified_rank: string | null;
  avatar_url: string | null;
  facebook_url: string | null;
  is_registered: boolean;
  can_claim: boolean | null;
}

interface LegacyStats {
  total_players: number;
  claimed_players: number;
  unclaimed_players: number;
  total_spa_points: number;
  claimed_spa_points: number;
  unclaimed_spa_points: number;
}

export const useLegacySPA = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has already claimed legacy points
  const checkExistingClaim = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .eq('claimed_by', user.id)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError;
      }

      return data;
    } catch {
      setError('Không thể kiểm tra claim hiện tại');
      return null;
    }
  }, [user]);

  // Get legacy claim suggestions based on user profile
  const getSuggestions = useCallback(
    async (fullName?: string, nickName?: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase.rpc(
          'get_legacy_claim_suggestions',
          {
            p_full_name: fullName || null,
            p_nick_name: nickName || null,
          }
        );

        if (supabaseError) throw supabaseError;

        return data as LegacySuggestion[];
      } catch {
        setError('Không thể tải gợi ý claim');
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Claim legacy SPA points
  const claimLegacyPoints = useCallback(
    async (identifier: string, verificationMethod = 'manual') => {
      if (!user) {
        setError('Vui lòng đăng nhập để nhận điểm');
        return null;
      }

      setClaimLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase.rpc(
          'claim_legacy_spa_points',
          {
            p_user_id: user.id,
            p_identifier: identifier,
            p_verification_method: verificationMethod,
          }
        );

        if (supabaseError) throw supabaseError;

        const result = data?.[0] as LegacyClaimResult;

        if (result?.success) {
          return result;
        } else {
          setError(result?.message || 'Không thể nhận điểm SPA');
          return null;
        }
      } catch {
        setError('Có lỗi xảy ra khi nhận điểm');
        return null;
      } finally {
        setClaimLoading(false);
      }
    },
    [user]
  );

  // Get combined leaderboard (legacy + registered users)
  const getLeaderboard = useCallback(async (limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('public_spa_leaderboard')
        .select('*')
        .order('spa_points', { ascending: false })
        .limit(limit);

      if (supabaseError) throw supabaseError;

      return data as LeaderboardEntry[];
    } catch {
      setError('Không thể tải bảng xếp hạng');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get legacy system statistics
  const getLegacyStats = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase.rpc(
        'get_legacy_spa_stats'
      );

      if (supabaseError) throw supabaseError;

      return data?.[0] as LegacyStats;
    } catch {
      setError('Không thể tải thống kê');
      return null;
    }
  }, []);

  // Search legacy players
  const searchLegacyPlayers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,nick_name.ilike.%${searchTerm}%`)
        .eq('claimed', false)
        .order('spa_points', { ascending: false })
        .limit(20);

      if (supabaseError) throw supabaseError;

      return data;
    } catch {
      setError('Không thể tìm kiếm');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    claimLoading,
    error,
    checkExistingClaim,
    getSuggestions,
    claimLegacyPoints,
    getLeaderboard,
    getLegacyStats,
    searchLegacyPlayers,
  };
};
