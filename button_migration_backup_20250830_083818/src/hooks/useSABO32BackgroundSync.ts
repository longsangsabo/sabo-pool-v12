// =============================================
// SABO-32 BACKGROUND SYNC HOOK
// Silent background sync without affecting UI position
// =============================================

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSABO32BackgroundSync = (
  tournamentId: string, 
  onDataUpdate: (matches: any[]) => void,
  syncInterval: number = 5000 // 5 seconds
) => {
  
  const fetchLatestData = useCallback(async () => {
    try {
      const { data: matchesData, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;

      const matches = matchesData || [];

      // Fetch player profiles for all unique player IDs
      const playerIds = new Set<string>();
      matches.forEach((match: any) => {
        if (match.player1_id) playerIds.add(match.player1_id);
        if (match.player2_id) playerIds.add(match.player2_id);
      });

      let playerProfiles: any = {};
      if (playerIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, display_name, avatar_url')
          .in('user_id', Array.from(playerIds));

        if (!profilesError && profilesData) {
          profilesData.forEach((profile: any) => {
            playerProfiles[profile.user_id] = profile;
          });
        }
      }

      // Merge player profiles with matches
      const matchesWithProfiles = matches.map((match: any) => ({
        ...match,
        player1_profile: match.player1_id ? playerProfiles[match.player1_id] : null,
        player2_profile: match.player2_id ? playerProfiles[match.player2_id] : null,
      }));

      // Call update callback with new data
      onDataUpdate(matchesWithProfiles);
      
    } catch (err) {
      console.error('Background sync error:', err);
      // Fail silently for background sync
    }
  }, [tournamentId, onDataUpdate]);

  useEffect(() => {
    // Set up background sync interval
    const interval = setInterval(fetchLatestData, syncInterval);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchLatestData, syncInterval]);

  return {
    syncNow: fetchLatestData
  };
};
