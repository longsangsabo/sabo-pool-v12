import { useAuth } from '@/hooks/useAuth';
import { spaService } from '@/services/spaService';

/**
 * Hook để tích hợp SPA vào các trang component
 */
export const useSPAIntegration = () => {
  const { user } = useAuth();

  // Function để gọi khi user hoàn thành game
  const onGameComplete = async (won: boolean) => {
    if (!user?.id) return;
    try {
      await spaService.triggerGameComplete(user.id, won);
    } catch {
      // Silently fail
    }
  };

  // Function để gọi khi user tham gia tournament
  const onTournamentJoin = async () => {
    if (!user?.id) return;
    try {
      await spaService.triggerTournamentJoined(user.id);
    } catch {
      // Silently fail
    }
  };

  // Function để gọi khi user đăng ký hạng
  const onRankRegistration = async () => {
    if (!user?.id) return;
    try {
      await spaService.handleRankRegistration(user.id);
    } catch {
      // Silently fail
    }
  };

  // Function để gọi khi có referral thành công
  const onReferralSuccess = async (newUserId: string) => {
    if (!user?.id) return;
    try {
      await spaService.handleReferralSuccess(user.id, newUserId);
    } catch {
      // Silently fail
    }
  };

  // Function để tặng bonus activity
  const awardBonus = async (
    activityType: string,
    referenceData?: Record<string, unknown>
  ) => {
    if (!user?.id) return false;
    try {
      return await spaService.awardBonusActivity(
        user.id,
        activityType,
        referenceData
      );
    } catch {
      return false;
    }
  };

  return {
    onGameComplete,
    onTournamentJoin,
    onRankRegistration,
    onReferralSuccess,
    awardBonus,
  };
};
