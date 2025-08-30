import { milestoneService } from '@/services/milestoneService';

async function updateDailyProgress(playerId: string, field: 'matches_played' | 'matches_won' | 'challenges_completed', increment: number) {
  // Placeholder for future optimized RPC update
  console.debug('daily progress', playerId, field, increment);
}

async function updateWinStreak(_playerId: string) {
  // TODO: Implement win streak tracking
}

async function updateTournamentStreak(_playerId: string) {
  // TODO: Implement tournament streak tracking
}

export const useMilestoneEvents = () => {
  const triggerAccountCreation = async (playerId: string) => {
    await milestoneService.checkAndAwardMilestone(playerId, 'account_creation', 1);
  };

  const triggerRankRegistration = async (playerId: string) => {
    await milestoneService.checkAndAwardMilestone(playerId, 'rank_registration', 1);
  };

  const triggerMatchComplete = async (playerId: string, won: boolean, isPerfect: boolean) => {
    await milestoneService.updatePlayerProgress(playerId, 'match_count', 1);
    await milestoneService.updatePlayerProgress(playerId, 'first_match', 1);
    await updateDailyProgress(playerId, 'matches_played', 1);
    if (won) {
      await updateDailyProgress(playerId, 'matches_won', 1);
      await updateWinStreak(playerId);
    }
    if (isPerfect) {
      await milestoneService.checkAndAwardMilestone(playerId, 'perfect_match', 1);
    }
  };

  const triggerTournamentJoin = async (playerId: string) => {
    await milestoneService.checkAndAwardMilestone(playerId, 'tournament_join', 1);
  };

  const triggerTournamentWin = async (playerId: string) => {
    await milestoneService.updatePlayerProgress(playerId, 'tournament_win', 1);
    await updateTournamentStreak(playerId);
  };

  return { triggerAccountCreation, triggerRankRegistration, triggerMatchComplete, triggerTournamentJoin, triggerTournamentWin };
};
