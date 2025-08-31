import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDailyLimits, updateDailyLimits } from '../services/challengeService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DailyLimitStats {
 date: string;
 challengeCount: number;
 matchCount: number;
 limitReached: boolean;
 timeUntilReset: string;
}

export const useDailyLimits = () => {
 const { user } = useAuth();
 const queryClient = useQueryClient();

 // Fetch daily challenge stats
 const { data: dailyStats, isLoading } = useQuery({
  queryKey: ['daily-limits', user?.id],
  queryFn: async () => {
   if (!user?.id) return null;

   const today = new Date().toISOString().split('T')[0];

   const { data, error } = await getDailyLimits(user.id);

   if (error) {
    throw new Error(error);
   }

   // Calculate time until midnight
   const now = new Date();
   const midnight = new Date();
   midnight.setHours(24, 0, 0, 0);
   const timeUntilReset = midnight.getTime() - now.getTime();
   const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
   const minutes = Math.floor(
    (timeUntilReset % (1000 * 60 * 60)) / (1000 * 60)
   );

   const challengeCount = data?.challenge_count || 0;
   const limitReached = challengeCount >= 2;

   return {
    date: today,
    challengeCount,
    matchCount: 0, // Will be enhanced later
    limitReached,
    timeUntilReset: `${hours}h ${minutes}m`,
   } as DailyLimitStats;
  },
  enabled: !!user?.id,
  refetchInterval: 60000, // Refresh every minute
 });

 // Check if user can create challenges
 const canCreateChallenge = () => {
  if (!dailyStats) return true;
  return !dailyStats.limitReached;
 };

 // Get remaining challenges
 const getRemainingChallenges = () => {
  if (!dailyStats) return 2;
  return Math.max(0, 2 - dailyStats.challengeCount);
 };

 // Update daily stats when challenge is created
 const updateDailyStats = useMutation({
  mutationFn: async () => {
   if (!user?.id) throw new Error('User not authenticated');

   const today = new Date().toISOString().split('T')[0];

   const { error } = await updateDailyLimits(user.id, {
     challenge_count: 1,
   });

   if (error) throw new Error(error);
  },
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['daily-limits'] });
   toast.success('Daily challenge stats updated');
  },
  onError: error => {
   console.error('Error updating daily stats:', error);
   toast.error('Failed to update daily stats');
  },
 });

 return {
  dailyStats,
  isLoading,
  canCreateChallenge,
  getRemainingChallenges,
  updateDailyStats: updateDailyStats.mutateAsync,
  isUpdating: updateDailyStats.isPending,
 };
};
