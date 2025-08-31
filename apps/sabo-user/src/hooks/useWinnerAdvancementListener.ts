import { useEffect } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
// Removed supabase import - migrated to services
import { advanceWinner } from '@/utils/bracketAdvancement';

export const useWinnerAdvancementListener = (tournamentId?: string) => {
  useEffect(() => {
    if (!tournamentId) return;

    console.log(
      '🎯 Setting up winner advancement listener for tournament:',
      tournamentId
    );

    const handleWinnerAdvancement = async (payload: any) => {
      try {
        const data = JSON.parse(payload);
        if (data.tournament_id === tournamentId) {
          console.log('🚀 Auto-advancing winner for match:', data.match_id);
          await advanceWinner(data.match_id);
        }
      } catch (err) {
        console.error(
          '❌ Error handling winner advancement notification:',
          err
        );
      }
    };

    // Listen to PostgreSQL notifications
//     const channel = supabase
      .channel('winner-advancement')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        payload => {
          if (
            payload.eventType === 'UPDATE' &&
            payload.new?.winner_id &&
            !payload.old?.winner_id
          ) {
            console.log(
              '🎯 Winner detected, triggering rules-based advancement:',
              payload.new.id
            );
            advanceWinner(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up winner advancement listener');
      // removeChannel(channel);
    };
  }, [tournamentId]);
};
