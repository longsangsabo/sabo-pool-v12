// =====================================================
// 🏆 CHALLENGE NOTIFICATION EVENT HANDLERS
// =====================================================

// Removed supabase import - migrated to services
import { challengeNotificationService } from '@/services/challengeNotificationService';
import {
  ChallengeNotificationType,
  CreateNotificationData,
  NotificationMetadata,
  ChallengeCreatedPayload,
  ChallengeStatusChangedPayload,
  MatchResultPayload
} from '@/types/challengeNotification';
import { toast } from 'sonner';

// ===== NOTIFICATION TEMPLATES =====

interface NotificationTemplate {
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionText?: string;
  actionUrl?: string;
}

const createNotificationTemplate = (
  type: ChallengeNotificationType,
  data: any
): NotificationTemplate => {
  const templates: Record<ChallengeNotificationType, (data: any) => NotificationTemplate> = {
    [ChallengeNotificationType.CHALLENGE_CREATED]: (data) => ({
      title: '🏆 Thách đấu được tạo thành công',
      message: `Bạn đã tạo thách đấu với ${data.opponentName || 'đối thủ'}`,
      icon: 'trophy',
      priority: 'medium'
    }),

    [ChallengeNotificationType.CHALLENGE_RECEIVED]: (data) => ({
      title: '⚔️ Có thách đấu mới!',
      message: `${data.challengerName} đã thách đấu bạn`,
      icon: 'sword',
      priority: 'high',
      actionText: 'Xem chi tiết',
      actionUrl: `/challenges/${data.challengeId}`
    }),

    [ChallengeNotificationType.CHALLENGE_ACCEPTED]: (data) => ({
      title: '✅ Thách đấu được chấp nhận',
      message: `${data.opponentName} đã chấp nhận thách đấu của bạn`,
      icon: 'check-circle',
      priority: 'high',
      actionText: 'Xem trận đấu',
      actionUrl: `/challenges/${data.challengeId}`
    }),

    [ChallengeNotificationType.CHALLENGE_DECLINED]: (data) => ({
      title: '❌ Thách đấu bị từ chối',
      message: `${data.opponentName} đã từ chối thách đấu của bạn`,
      icon: 'x-circle',
      priority: 'medium'
    }),

    [ChallengeNotificationType.SCHEDULE_CONFIRMED]: (data) => ({
      title: '📅 Lịch thi đấu đã được xác nhận',
      message: `Trận đấu sẽ diễn ra vào ${data.matchTime}`,
      icon: 'calendar',
      priority: 'high',
      actionText: 'Xem chi tiết',
      actionUrl: `/challenges/${data.challengeId}`
    }),

    [ChallengeNotificationType.MATCH_REMINDER_24H]: (data) => ({
      title: '⏰ Nhắc nhở trận đấu',
      message: `Trận đấu với ${data.opponentName} sẽ bắt đầu trong 24 giờ`,
      icon: 'clock',
      priority: 'medium',
      actionText: 'Chuẩn bị',
      actionUrl: `/challenges/${data.challengeId}/prepare`
    }),

    [ChallengeNotificationType.MATCH_REMINDER_1H]: (data) => ({
      title: '⏰ Sắp đến giờ thi đấu',
      message: `Trận đấu với ${data.opponentName} sẽ bắt đầu trong 1 giờ`,
      icon: 'clock',
      priority: 'high',
      actionText: 'Check-in ngay',
      actionUrl: `/challenges/${data.challengeId}/checkin`
    }),

    [ChallengeNotificationType.MATCH_REMINDER_15M]: (data) => ({
      title: '🚨 Trận đấu sắp bắt đầu',
      message: `Trận đấu với ${data.opponentName} sẽ bắt đầu trong 15 phút!`,
      icon: 'alert-circle',
      priority: 'urgent',
      actionText: 'Vào trận đấu',
      actionUrl: `/challenges/${data.challengeId}/live`
    }),

    [ChallengeNotificationType.CHECK_IN_REQUIRED]: (data) => ({
      title: '📍 Cần check-in',
      message: 'Vui lòng check-in trước khi trận đấu bắt đầu',
      icon: 'target',
      priority: 'high',
      actionText: 'Check-in',
      actionUrl: `/challenges/${data.challengeId}/checkin`
    }),

    [ChallengeNotificationType.OPPONENT_CHECKED_IN]: (data) => ({
      title: '✅ Đối thủ đã check-in',
      message: `${data.opponentName} đã check-in và sẵn sàng thi đấu`,
      icon: 'users',
      priority: 'medium'
    }),

    [ChallengeNotificationType.MATCH_STARTED]: (data) => ({
      title: '🚀 Trận đấu bắt đầu',
      message: `Trận đấu với ${data.opponentName} đã chính thức bắt đầu!`,
      icon: 'zap',
      priority: 'high',
      actionText: 'Vào trận đấu',
      actionUrl: `/challenges/${data.challengeId}/live`
    }),

    [ChallengeNotificationType.SCORE_UPDATED]: (data) => ({
      title: '📊 Cập nhật tỷ số',
      message: `Tỷ số hiện tại: ${data.challengerScore} - ${data.opponentScore}`,
      icon: 'trending-up',
      priority: 'medium'
    }),

    [ChallengeNotificationType.DISPUTE_RAISED]: (data) => ({
      title: '⚠️ Có khiếu nại',
      message: `${data.playerName} đã khiếu nại kết quả trận đấu`,
      icon: 'alert-circle',
      priority: 'high',
      actionText: 'Xem chi tiết',
      actionUrl: `/challenges/${data.challengeId}/dispute`
    }),

    [ChallengeNotificationType.RESULT_SUBMITTED]: (data) => ({
      title: '📝 Kết quả đã được gửi',
      message: `${data.submitterName} đã gửi kết quả: ${data.challengerScore} - ${data.opponentScore}`,
      icon: 'info',
      priority: 'medium',
      actionText: 'Xác nhận',
      actionUrl: `/challenges/${data.challengeId}/confirm`
    }),

    [ChallengeNotificationType.RESULT_CONFIRMED]: (data) => ({
      title: '✅ Kết quả được xác nhận',
      message: data.isWinner ? '🎉 Chúc mừng bạn đã thắng!' : 'Trận đấu đã kết thúc',
      icon: data.isWinner ? 'crown' : 'check-circle',
      priority: 'high'
    }),

    [ChallengeNotificationType.CLUB_REVIEW_PENDING]: (data) => ({
      title: '🏢 Chờ CLB duyệt',
      message: 'CLB đang xem xét và phê duyệt kết quả trận đấu',
      icon: 'shield',
      priority: 'medium'
    }),

    [ChallengeNotificationType.CLUB_APPROVED]: (data) => ({
      title: '🏢 CLB đã phê duyệt',
      message: `CLB ${data.clubName} đã phê duyệt kết quả trận đấu`,
      icon: 'check-circle',
      priority: 'high'
    }),

    [ChallengeNotificationType.SPA_POINTS_AWARDED]: (data) => ({
      title: '🎁 Nhận SPA Points',
      message: `Bạn đã nhận ${data.spaPoints} SPA Points từ trận thắng!`,
      icon: 'gift',
      priority: 'medium',
      actionText: 'Xem ví',
      actionUrl: '/wallet'
    }),

    [ChallengeNotificationType.ELO_UPDATED]: (data) => ({
      title: '📈 ELO Rating cập nhật',
      message: `ELO của bạn ${data.eloChange > 0 ? 'tăng' : 'giảm'} ${Math.abs(data.eloChange)} điểm (${data.newElo})`,
      icon: data.eloChange > 0 ? 'trending-up' : 'trending-down',
      priority: 'medium'
    }),

    [ChallengeNotificationType.ACHIEVEMENT_UNLOCKED]: (data) => ({
      title: '🏆 Mở khóa thành tựu',
      message: `Bạn đã mở khóa thành tựu: ${data.achievementName}`,
      icon: 'award',
      priority: 'high',
      actionText: 'Xem thành tựu',
      actionUrl: '/profile/achievements'
    }),

    [ChallengeNotificationType.REMATCH_REQUESTED]: (data) => ({
      title: '🔄 Yêu cầu tái đấu',
      message: `${data.opponentName} muốn tái đấu với bạn`,
      icon: 'sword',
      priority: 'medium',
      actionText: 'Xem yêu cầu',
      actionUrl: `/challenges/${data.challengeId}/rematch`
    }),

    [ChallengeNotificationType.MATCH_SHARED]: (data) => ({
      title: '📱 Trận đấu được chia sẻ',
      message: `${data.playerName} đã chia sẻ trận đấu lên mạng xã hội`,
      icon: 'heart',
      priority: 'low'
    }),

    [ChallengeNotificationType.REVIEW_RECEIVED]: (data) => ({
      title: '⭐ Nhận đánh giá',
      message: `${data.reviewerName} đã đánh giá ${data.rating} sao cho bạn`,
      icon: 'star',
      priority: 'medium'
    }),

    [ChallengeNotificationType.TIMEOUT_CALLED]: (data) => ({
      title: '⏸️ Timeout được gọi',
      message: `${data.playerName} đã gọi timeout trong trận đấu`,
      icon: 'clock',
      priority: 'medium'
    }),

    [ChallengeNotificationType.RESULT_DISPUTED]: (data) => ({
      title: '⚠️ Kết quả bị khiếu nại',
      message: `${data.disputerName} không đồng ý với kết quả trận đấu`,
      icon: 'alert-circle',
      priority: 'high',
      actionText: 'Xem khiếu nại',
      actionUrl: `/challenges/${data.challengeId}/dispute`
    })
  };

  return templates[type]?.(data) || {
    title: 'Thông báo thách đấu',
    message: 'Có hoạt động mới trong thách đấu của bạn',
    icon: 'bell',
    priority: 'medium'
  };
};

// ===== EVENT HANDLER CLASS =====

export class ChallengeNotificationEventHandler {
  private static instance: ChallengeNotificationEventHandler;

  static getInstance(): ChallengeNotificationEventHandler {
    if (!ChallengeNotificationEventHandler.instance) {
      ChallengeNotificationEventHandler.instance = new ChallengeNotificationEventHandler();
    }
    return ChallengeNotificationEventHandler.instance;
  }

  // ===== CHALLENGE LIFECYCLE EVENTS =====

  /**
   * Handle challenge created event
   */
  async handleChallengeCreated(payload: ChallengeCreatedPayload): Promise<void> {
    console.log('🔔 Handling challenge created:', payload);

    try {
      // Notify challenger
      const challengerTemplate = createNotificationTemplate(
        ChallengeNotificationType.CHALLENGE_CREATED,
        {
          challengeId: payload.challenge.id,
          opponentName: payload.opponent?.name || 'Chờ đối thủ'
        }
      );

      await this.createAndSendNotification({
        type: ChallengeNotificationType.CHALLENGE_CREATED,
        challengeId: payload.challenge.id,
        userId: payload.challenger.id,
        ...challengerTemplate,
        metadata: {
          challengerId: payload.challenger.id,
          challengerName: payload.challenger.name,
          opponentId: payload.opponent?.id,
          opponentName: payload.opponent?.name,
          gameFormat: payload.challenge.gameFormat,
          matchTime: payload.challenge.scheduledTime
        }
      });

      // Notify opponent if exists
      if (payload.opponent) {
        const opponentTemplate = createNotificationTemplate(
          ChallengeNotificationType.CHALLENGE_RECEIVED,
          {
            challengeId: payload.challenge.id,
            challengerName: payload.challenger.name
          }
        );

        await this.createAndSendNotification({
          type: ChallengeNotificationType.CHALLENGE_RECEIVED,
          challengeId: payload.challenge.id,
          userId: payload.opponent.id,
          ...opponentTemplate,
          metadata: {
            challengerId: payload.challenger.id,
            challengerName: payload.challenger.name,
            gameFormat: payload.challenge.gameFormat
          }
        });
      }
    } catch (error) {
      console.error('❌ Error handling challenge created:', error);
    }
  }

  /**
   * Handle challenge status change event
   */
  async handleChallengeStatusChanged(payload: ChallengeStatusChangedPayload): Promise<void> {
    console.log('🔔 Handling challenge status changed:', payload);

    try {
      const { challenge, participants } = payload;

      switch (challenge.status) {
        case 'accepted':
          await this.handleChallengeAccepted(payload);
          break;
        case 'declined':
          await this.handleChallengeDeclined(payload);
          break;
        case 'scheduled':
          await this.handleChallengeScheduled(payload);
          break;
        case 'in_progress':
          await this.handleMatchStarted(payload);
          break;
        case 'completed':
          await this.handleMatchCompleted(payload);
          break;
        default:
          console.log('Unhandled status change:', challenge.status);
      }
    } catch (error) {
      console.error('❌ Error handling challenge status change:', error);
    }
  }

  /**
   * Handle match result submission
   */
  async handleMatchResult(payload: MatchResultPayload): Promise<void> {
    console.log('🔔 Handling match result:', payload);

    try {
      // Get participant names
      const challenger = await this.getProfileName(payload.challenge.challengerId);
      const opponent = await this.getProfileName(payload.challenge.opponentId);
      const submitter = await this.getProfileName(payload.result.submittedBy);

      // Notify the other participant about result submission
      const otherParticipantId = payload.result.submittedBy === payload.challenge.challengerId 
        ? payload.challenge.opponentId 
        : payload.challenge.challengerId;

      const template = createNotificationTemplate(
        ChallengeNotificationType.RESULT_SUBMITTED,
        {
          challengeId: payload.challenge.id,
          submitterName: submitter,
          challengerScore: payload.result.challengerScore,
          opponentScore: payload.result.opponentScore
        }
      );

      await this.createAndSendNotification({
        type: ChallengeNotificationType.RESULT_SUBMITTED,
        challengeId: payload.challenge.id,
        userId: otherParticipantId,
        ...template,
        metadata: {
          challengerId: payload.challenge.challengerId,
          challengerName: challenger,
          opponentId: payload.challenge.opponentId,
          opponentName: opponent,
          challengerScore: payload.result.challengerScore,
          opponentScore: payload.result.opponentScore,
          winnerId: payload.result.winnerId,
          submittedBy: payload.result.submittedBy
        }
      });
    } catch (error) {
      console.error('❌ Error handling match result:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async handleChallengeAccepted(payload: ChallengeStatusChangedPayload): Promise<void> {
    const template = createNotificationTemplate(
      ChallengeNotificationType.CHALLENGE_ACCEPTED,
      {
        challengeId: payload.challenge.id,
        opponentName: payload.participants.opponentName
      }
    );

    await this.createAndSendNotification({
      type: ChallengeNotificationType.CHALLENGE_ACCEPTED,
      challengeId: payload.challenge.id,
      userId: payload.participants.challengerId,
      ...template
    });
  }

  private async handleChallengeDeclined(payload: ChallengeStatusChangedPayload): Promise<void> {
    const template = createNotificationTemplate(
      ChallengeNotificationType.CHALLENGE_DECLINED,
      {
        challengeId: payload.challenge.id,
        opponentName: payload.participants.opponentName
      }
    );

    await this.createAndSendNotification({
      type: ChallengeNotificationType.CHALLENGE_DECLINED,
      challengeId: payload.challenge.id,
      userId: payload.participants.challengerId,
      ...template
    });
  }

  private async handleChallengeScheduled(payload: ChallengeStatusChangedPayload): Promise<void> {
    // Get challenge details to find scheduled time
//     const { data: challenge } = await supabase
      .from('challenges')
      .select('scheduled_time')
      .eq('id', payload.challenge.id)
      .single();

    if (!challenge?.scheduled_time) return;

    const matchTime = new Date(challenge.scheduled_time).toLocaleString('vi-VN');
    const template = createNotificationTemplate(
      ChallengeNotificationType.SCHEDULE_CONFIRMED,
      {
        challengeId: payload.challenge.id,
        matchTime
      }
    );

    // Notify both participants
    for (const userId of [payload.participants.challengerId, payload.participants.opponentId]) {
      await this.createAndSendNotification({
        type: ChallengeNotificationType.SCHEDULE_CONFIRMED,
        challengeId: payload.challenge.id,
        userId,
        ...template
      });
    }

    // Schedule reminder notifications
    await this.scheduleMatchReminders(payload.challenge.id, challenge.scheduled_time, [
      payload.participants.challengerId,
      payload.participants.opponentId
    ]);
  }

  private async handleMatchStarted(payload: ChallengeStatusChangedPayload): Promise<void> {
    const template = createNotificationTemplate(
      ChallengeNotificationType.MATCH_STARTED,
      { challengeId: payload.challenge.id }
    );

    // Notify both participants
    for (const userId of [payload.participants.challengerId, payload.participants.opponentId]) {
      const opponentName = userId === payload.participants.challengerId 
        ? payload.participants.opponentName 
        : payload.participants.challengerName;

      await this.createAndSendNotification({
        type: ChallengeNotificationType.MATCH_STARTED,
        challengeId: payload.challenge.id,
        userId,
        ...template,
        message: template.message.replace('{{opponentName}}', opponentName)
      });
    }
  }

  private async handleMatchCompleted(payload: ChallengeStatusChangedPayload): Promise<void> {
    // This will be handled by handleMatchResult when results are submitted
    console.log('Match completed, waiting for result submission');
  }

  private async scheduleMatchReminders(
    challengeId: string, 
    matchTime: string, 
    participantIds: string[]
  ): Promise<void> {
    const matchDate = new Date(matchTime);
    const now = new Date();

    // Schedule 24h reminder
    const reminder24h = new Date(matchDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      for (const userId of participantIds) {
        const template = createNotificationTemplate(
          ChallengeNotificationType.MATCH_REMINDER_24H,
          { challengeId }
        );

        await challengeNotificationService.scheduleNotification({
          type: ChallengeNotificationType.MATCH_REMINDER_24H,
          challengeId,
          userId,
          scheduledFor: reminder24h,
          ...template
        });
      }
    }

    // Schedule 1h reminder
    const reminder1h = new Date(matchDate.getTime() - 60 * 60 * 1000);
    if (reminder1h > now) {
      for (const userId of participantIds) {
        const template = createNotificationTemplate(
          ChallengeNotificationType.MATCH_REMINDER_1H,
          { challengeId }
        );

        await challengeNotificationService.scheduleNotification({
          type: ChallengeNotificationType.MATCH_REMINDER_1H,
          challengeId,
          userId,
          scheduledFor: reminder1h,
          ...template
        });
      }
    }

    // Schedule 15m reminder
    const reminder15m = new Date(matchDate.getTime() - 15 * 60 * 1000);
    if (reminder15m > now) {
      for (const userId of participantIds) {
        const template = createNotificationTemplate(
          ChallengeNotificationType.MATCH_REMINDER_15M,
          { challengeId }
        );

        await challengeNotificationService.scheduleNotification({
          type: ChallengeNotificationType.MATCH_REMINDER_15M,
          challengeId,
          userId,
          scheduledFor: reminder15m,
          ...template
        });
      }
    }
  }

  private async createAndSendNotification(data: CreateNotificationData): Promise<void> {
    const notification = await challengeNotificationService.createNotification(data);
    if (notification) {
      await challengeNotificationService.sendRealTimeNotification(data.userId, notification);
    }
  }

  private async getProfileName(userId: string): Promise<string> {
    try {
      // TODO: Replace with service call - const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();
      
      return data?.full_name || 'Unknown Player';
    } catch (error) {
      console.error('Error getting profile name:', error);
      return 'Unknown Player';
    }
  }
}

// Export singleton instance
export const challengeNotificationEventHandler = ChallengeNotificationEventHandler.getInstance();
