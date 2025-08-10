import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { spaService } from '@/services/spaService';
import type { SPAMilestone, UserMilestoneProgress, SPATransaction } from '@/services/spaService';

export const useSPA = () => {
  const { user } = useAuth();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [milestones, setMilestones] = useState<SPAMilestone[]>([]);
  const [userProgress, setUserProgress] = useState<UserMilestoneProgress[]>([]);
  const [transactions, setTransactions] = useState<SPATransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSPAData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [points, milestonesData, progressData, transactionsData] = await Promise.all([
        spaService.getCurrentSPAPoints(user.id),
        spaService.getMilestones(),
        spaService.getUserMilestoneProgress(user.id),
        spaService.getUserTransactions(user.id, 20),
      ]);

      setCurrentPoints(points);
      setMilestones(milestonesData);
      setUserProgress(progressData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error refreshing SPA data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshSPAData();
  }, [refreshSPAData]);

  // Function to trigger game completion milestone check
  const triggerGameComplete = useCallback(
    async (won: boolean) => {
      if (!user?.id) return;
      try {
        await spaService.triggerGameComplete(user.id, won);
        await refreshSPAData();
      } catch (error) {
        console.error('Error triggering game complete:', error);
      }
    },
    [user?.id, refreshSPAData]
  );

  // Function to trigger tournament joined milestone check
  const triggerTournamentJoined = useCallback(async () => {
    if (!user?.id) return;
    try {
      await spaService.triggerTournamentJoined(user.id);
      await refreshSPAData();
    } catch (error) {
      console.error('Error triggering tournament joined:', error);
    }
  }, [user?.id, refreshSPAData]);

  // Function to award bonus activity
  const awardBonusActivity = useCallback(
    async (activityType: string, referenceData?: Record<string, unknown>) => {
      if (!user?.id) return false;
      try {
        const success = await spaService.awardBonusActivity(user.id, activityType, referenceData);
        if (success) {
          await refreshSPAData();
        }
        return success;
      } catch (error) {
        console.error('Error awarding bonus activity:', error);
        return false;
      }
    },
    [user?.id, refreshSPAData]
  );

  // Function to handle new user registration
  const handleNewUserRegistration = useCallback(async () => {
    if (!user?.id) return;
    try {
      await spaService.handleNewUserRegistration(user.id);
      await refreshSPAData();
    } catch (error) {
      console.error('Error handling new user registration:', error);
    }
  }, [user?.id, refreshSPAData]);

  // Function to handle rank registration
  const handleRankRegistration = useCallback(async () => {
    if (!user?.id) return;
    try {
      await spaService.handleRankRegistration(user.id);
      await refreshSPAData();
    } catch (error) {
      console.error('Error handling rank registration:', error);
    }
  }, [user?.id, refreshSPAData]);

  // Function to handle referral success
  const handleReferralSuccess = useCallback(
    async (newUserId: string) => {
      if (!user?.id) return;
      try {
        await spaService.handleReferralSuccess(user.id, newUserId);
        await refreshSPAData();
      } catch (error) {
        console.error('Error handling referral success:', error);
      }
    },
    [user?.id, refreshSPAData]
  );

  // Get unclaimed milestones
  const getUnclaimedMilestones = useCallback(async () => {
    if (!user?.id) return [];
    try {
      return await spaService.getUnclaimedMilestones(user.id);
    } catch (error) {
      console.error('Error getting unclaimed milestones:', error);
      return [];
    }
  }, [user?.id]);

  return {
    currentPoints,
    milestones,
    userProgress,
    transactions,
    loading,
    refreshSPAData,
    triggerGameComplete,
    triggerTournamentJoined,
    awardBonusActivity,
    handleNewUserRegistration,
    handleRankRegistration,
    handleReferralSuccess,
    getUnclaimedMilestones,
  };
};
