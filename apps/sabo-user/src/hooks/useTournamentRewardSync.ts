import { useState } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
// Removed supabase import - migrated to services

export const useTournamentRewardSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncTournamentRewards = async (tournamentId?: string) => {
    setSyncing(true);
    setError(null);

    try {
      console.log(
        '🔄 Syncing tournament rewards...',
        tournamentId ? `for ${tournamentId}` : 'for all tournaments'
      );

// // //       // TODO: Replace with service call - const { data, error } = // TODO: Replace with service call - await supabase.functions.invoke(
        'sync-tournament-rewards',
        {
          body: {
            tournament_id: tournamentId,
            sync_all: !tournamentId,
          },
        }
      );

      if (error) {
        console.error('❌ Sync error:', error);
        throw error;
      }

      console.log('✅ Sync completed:', data);
      return data;
    } catch (err: any) {
      console.error('❌ Sync failed:', err);
      setError(err.message || 'Failed to sync tournament rewards');
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncTournamentRewards,
    syncing,
    error,
  };
};
