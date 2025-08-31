import { useEffect } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getMatches } from "../services/matchService";
import { getTournament } from "../services/tournamentService";
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useRankUpdates = () => {
 const { user } = useAuth();

 useEffect(() => {
  if (!user) return;

  console.log('🎯 Setting up rank update notifications for user:', user.id);

  // Listen for rank_approved notifications
//   const notificationChannel = supabase
   .channel('rank-notifications')
   .on(
    'postgres_changes',
    {
     event: 'INSERT',
     schema: 'public',
     table: 'notifications',
     filter: `user_id=eq.${user.id}`,
    },
    payload => {
     const notification = payload.new;

     if (
      notification.type === 'rank_approved' ||
      notification.type === 'rank_result'
     ) {
      console.log('🏆 Rank notification received:', notification);

      const metadata = notification.metadata || {};
      const rank = metadata.rank || 'Unknown';
      const spaReward = metadata.spa_reward || 0;
      const clubName = metadata.club_name || 'CLB';

      // Show success toast with rank update info
      if (
       notification.type === 'rank_result' &&
       notification.message?.includes('phê duyệt')
      ) {
       toast({
        title: '🎉 Hạng đã được xác thực!',
        description: `Chúc mừng! Hạng ${rank} của bạn đã được xác thực tại ${clubName}. +${spaReward} SPA Points!`,
        duration: 5000,
       });

       // Dispatch custom event for other components to react
       if (typeof window !== 'undefined') {
        window.dispatchEvent(
         new CustomEvent('rankApproved', {
          detail: {
           rank,
           spaReward,
           userId: user.id,
           clubName,
           notification,
          },
         })
        );
       }
      }
     }
    }
   )
   .subscribe(status => {
    console.log('🔔 Rank notification subscription status:', status);
   });

  return () => {
   console.log('🔕 Cleaning up rank notification subscription');
   // removeChannel(notificationChannel);
  };
 }, [user]);
};
