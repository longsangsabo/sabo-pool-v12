import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface LegacyPlayer {
  id: string;
  full_name: string;
  nick_name: string;
  spa_points: number;
  facebook_url?: string;
  similarity_score?: number;
}

interface ExistingClaim {
  has_claim: boolean;
  spa_points: number;
  player_name: string;
  claimed_at: string;
}

interface ClaimResult {
  success: boolean;
  spa_points: number;
  message: string;
  player_name: string;
}

export const useLegacySPA = () => {
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkExistingClaim = async (
    userId: string
  ): Promise<ExistingClaim | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legacy_spa_points')
        .select('spa_points, full_name, claimed_at')
        .eq('claimed_by', userId)
        .eq('claimed', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existing claim found
          return null;
        }
        throw error;
      }

      return {
        has_claim: true,
        spa_points: data.spa_points,
        player_name: data.full_name,
        claimed_at: data.claimed_at,
      };
    } catch {
      // Error checking existing claim
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchLegacyPlayers = async (
    query: string
  ): Promise<LegacyPlayer[]> => {
    if (!query || query.length < 2) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legacy_spa_points')
        .select('id, full_name, nick_name, spa_points, facebook_url')
        .or(`full_name.ilike.%${query}%,nick_name.ilike.%${query}%`)
        .eq('claimed', false)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch {
      setError('Lỗi tìm kiếm dữ liệu');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (query: string): Promise<LegacyPlayer[]> => {
    return searchLegacyPlayers(query);
  };

  const claimLegacyPoints = async (
    userId: string,
    fullName: string,
    facebookUrl: string
  ): Promise<ClaimResult> => {
    try {
      setClaimLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('claim_legacy_spa_points', {
        p_user_id: userId,
        p_full_name: fullName.trim(),
        p_facebook_url: facebookUrl.trim(),
        p_verification_method: 'facebook',
      });

      if (error) throw error;

      const result = data[0];
      return {
        success: result.success,
        spa_points: result.spa_points,
        message: result.message,
        player_name: result.player_name,
      };
    } catch (err) {
      const errorMessage = String(err).includes('RLS')
        ? 'Lỗi quyền truy cập. Vui lòng liên hệ admin.'
        : 'Lỗi claim: ' + String(err);
      
      setError(errorMessage);
      return {
        success: false,
        spa_points: 0,
        message: errorMessage,
        player_name: '',
      };
    } finally {
      setClaimLoading(false);
    }
  };

  return {
    loading,
    claimLoading,
    error,
    checkExistingClaim,
    getSuggestions,
    claimLegacyPoints,
    searchLegacyPlayers,
  };
};
