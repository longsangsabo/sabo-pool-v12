import { useEffect, useState } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useAutoPopupNotifications = () => {
 const { user } = useAuth();
 const [currentPopup, setCurrentPopup] = useState<any>(null);
 const queryClient = useQueryClient();

 // Fetch pending popup notifications
 const { data: pendingPopups, refetch } = useQuery({
  queryKey: ['pending-popup-notifications', user?.id],
  queryFn: async () => {
   if (!user?.id) return [];

   // TODO: Replace with service call - const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .getByUserId(user.id)
    .eq('auto_popup', true)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

   if (error) throw error;
   return data || [];
  },
  enabled: !!user?.id,
  refetchInterval: 30000, // Check every 30 seconds
 });

 // Set the first pending popup when available
 useEffect(() => {
  if (pendingPopups && pendingPopups.length > 0 && !currentPopup) {
   setCurrentPopup(pendingPopups[0]);
  }
 }, [pendingPopups, currentPopup]);

 // Listen for real-time notification updates
 useEffect(() => {
  if (!user?.id) return;

//   const channel = supabase
   .channel(`notifications-${user.id}`)
   .on(
    'postgres_changes',
    {
     event: 'INSERT',
     schema: 'public',
     table: 'notifications',
     filter: `user_id=eq.${user.id}`,
    },
    payload => {
     // Check if the new notification should auto-popup
     if (payload.new.auto_popup && !payload.new.is_read) {
      setCurrentPopup(payload.new);
     }
    }
   )
   .on(
    'postgres_changes',
    {
     event: 'UPDATE',
     schema: 'public',
     table: 'notifications',
     filter: `user_id=eq.${user.id}`,
    },
    payload => {
     // If current popup was marked as read, remove it
     if (
      currentPopup &&
      payload.new.id === currentPopup.id &&
      payload.new.is_read
     ) {
      setCurrentPopup(null);
     }
     // Refetch to get updated list
     refetch();
    }
   )
   .subscribe();

  return () => {
   // removeChannel(channel);
  };
 }, [user?.id, currentPopup, refetch]);

 const closeCurrentPopup = () => {
  setCurrentPopup(null);
  // Check if there are more pending popups
  refetch();
 };

 const markNotificationAsRead = async (notificationId: string) => {
  try {
//    await supabase
    .from('notifications')
    .update({ is_read: true, auto_popup: false })
    .eq('id', notificationId);

   queryClient.invalidateQueries({ queryKey: ['notifications'] });
   queryClient.invalidateQueries({
    queryKey: ['pending-popup-notifications'],
   });
  } catch (error) {
   console.error('Error marking notification as read:', error);
  }
 };

 return {
  currentPopup,
  closeCurrentPopup,
  markNotificationAsRead,
  pendingPopupsCount: pendingPopups?.length || 0,
 };
};
