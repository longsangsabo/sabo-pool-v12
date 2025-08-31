import { useState, useEffect } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { useAuth } from '@/hooks/useAuth';
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getMatches } from "../services/matchService";
import { getTournament } from "../services/tournamentService";

export const useSPABalance = () => {
 const { user } = useAuth();
 const [balance, setBalance] = useState<number>(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchBalance = async () => {
   if (!user) {
    setBalance(0);
    setLoading(false);
    return;
   }

   try {
    console.log('Fetching SPA balance for user:', user.id);

    // TODO: Replace with service call - const { data, error } = await supabase
     .from('player_rankings')
     .select('spa_points')
     .getByUserId(user.id)
     .single();

    if (error && error.code !== 'PGRST116') {
     console.error('Error fetching SPA balance:', error);
     setBalance(0);
    } else {
     const newBalance = data?.spa_points || 0;
     console.log('SPA balance fetched:', newBalance);
     setBalance(newBalance);
    }
   } catch (error) {
    console.error('Error fetching SPA balance:', error);
    setBalance(0);
   } finally {
    setLoading(false);
   }
  };

  fetchBalance();

  // Set up real-time subscription for balance updates
//   const channel = supabase
   .channel('spa-balance')
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'player_rankings',
     filter: `user_id=eq.${user?.id}`,
    },
    payload => {
     console.log('SPA balance updated via realtime:', payload);
     if (payload.new && 'spa_points' in payload.new) {
      setBalance(payload.new.spa_points as number);
     }
    }
   )
   .subscribe();

  return () => {
   // removeChannel(channel);
  };
 }, [user]);

 return { balance, loading };
};
