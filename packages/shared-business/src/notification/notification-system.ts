// =====================================================
// 🔔 NOTIFICATION SYSTEM BUSINESS LOGIC
// =====================================================

/**
 * Centralized notification business logic extracted from:
 * - challengeNotificationService.ts
 * - challengeNotificationEventHandler.ts  
 * - UnifiedNotificationBell.tsx
 * - unified-notification-system Edge Function
 * - useChallengeNotifications hook
 * 
 * Provides unified notification management for:
 * - Creating notifications (single/bulk)
 * - Real-time notification delivery
 * - Notification state management
 * - Cross-platform notification consistency
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== NOTIFICATION TYPES =====

export type NotificationCategory = 'general' | 'challenge' | 'tournament' | 'club' | 'match' | 'system' | 'milestone';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationIcon = 
  | 'bell' | 'trophy' | 'sword' | 'clock' | 'gift' | 'star' | 'shield'
  | 'target' | 'zap' | 'heart' | 'message-circle' | 'users' | 'calendar'
  | 'check-circle' | 'alert-circle' | 'x-circle' | 'info' | 'trending-up'
  | 'award' | 'crown' | 'flame' | 'lightning' | 'sparkles';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  icon: NotificationIcon;
  action_text?: string;
  action_url?: string;
  challenge_id?: string;
  tournament_id?: string;
  club_id?: string;
  match_id?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  auto_popup?: boolean;
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  icon?: NotificationIcon;
  action_text?: string;
  action_url?: string;
  challenge_id?: string;
  tournament_id?: string;
  club_id?: string;
  match_id?: string;
  metadata?: Record<string, any>;
  auto_popup?: boolean;
  scheduled_for?: Date;
  expires_at?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_category: Record<NotificationCategory, number>;
  by_priority: Record<NotificationPriority, number>;
  recent_activity: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

export interface NotificationFilters {
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  is_read?: boolean;
  date_from?: Date;
  date_to?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

// ===== NOTIFICATION TEMPLATES =====

interface NotificationTemplate {
  title: string;
  message: string;
  icon: NotificationIcon;
  priority: NotificationPriority;
  actionText?: string;
  actionUrl?: string;
  category: NotificationCategory;
}

export const NotificationTemplates = {
  // Challenge Notifications
  CHALLENGE_CREATED: (data: { opponentName: string; betPoints: number }): NotificationTemplate => ({
    title: '🏆 Thách đấu được tạo thành công',
    message: `Bạn đã tạo thách đấu với ${data.opponentName} (${data.betPoints} điểm)`,
    icon: 'trophy',
    priority: 'medium',
    actionText: 'Xem thách đấu',
    category: 'challenge'
  }),

  CHALLENGE_RECEIVED: (data: { challengerName: string; betPoints: number }): NotificationTemplate => ({
    title: '⚔️ Nhận được thách đấu mới',
    message: `${data.challengerName} thách đấu bạn (${data.betPoints} điểm)`,
    icon: 'sword',
    priority: 'high',
    actionText: 'Phản hồi',
    category: 'challenge'
  }),

  CHALLENGE_ACCEPTED: (data: { opponentName: string }): NotificationTemplate => ({
    title: '✅ Thách đấu được chấp nhận',
    message: `${data.opponentName} đã chấp nhận thách đấu của bạn`,
    icon: 'check-circle',
    priority: 'high',
    actionText: 'Bắt đầu',
    category: 'challenge'
  }),

  CHALLENGE_DECLINED: (data: { opponentName: string }): NotificationTemplate => ({
    title: '❌ Thách đấu bị từ chối',
    message: `${data.opponentName} đã từ chối thách đấu của bạn`,
    icon: 'x-circle',
    priority: 'medium',
    category: 'challenge'
  }),

  // Tournament Notifications
  TOURNAMENT_REGISTRATION_OPEN: (data: { tournamentName: string }): NotificationTemplate => ({
    title: '🎯 Giải đấu mở đăng ký',
    message: `Giải đấu "${data.tournamentName}" đã mở đăng ký`,
    icon: 'target',
    priority: 'medium',
    actionText: 'Đăng ký',
    category: 'tournament'
  }),

  TOURNAMENT_MATCH_READY: (data: { tournamentName: string; opponentName: string }): NotificationTemplate => ({
    title: '⏰ Trận đấu sắp bắt đầu',
    message: `Trận đấu với ${data.opponentName} trong "${data.tournamentName}" sắp bắt đầu`,
    icon: 'clock',
    priority: 'high',
    actionText: 'Chuẩn bị',
    category: 'tournament'
  }),

  // Club Notifications
  CLUB_INVITATION: (data: { clubName: string; inviterName: string }): NotificationTemplate => ({
    title: '🏢 Lời mời tham gia CLB',
    message: `${data.inviterName} mời bạn tham gia "${data.clubName}"`,
    icon: 'users',
    priority: 'medium',
    actionText: 'Xem lời mời',
    category: 'club'
  }),

  CLUB_MEMBER_JOINED: (data: { memberName: string; clubName: string }): NotificationTemplate => ({
    title: '👥 Thành viên mới',
    message: `${data.memberName} đã tham gia "${data.clubName}"`,
    icon: 'users',
    priority: 'low',
    category: 'club'
  }),

  // System Notifications
  SYSTEM_MAINTENANCE: (data: { startTime: string; duration: string }): NotificationTemplate => ({
    title: '⚙️ Bảo trì hệ thống',
    message: `Hệ thống sẽ bảo trì từ ${data.startTime} trong ${data.duration}`,
    icon: 'info',
    priority: 'urgent',
    category: 'system'
  }),

  RANK_UPDATED: (data: { newRank: string; oldRank: string }): NotificationTemplate => ({
    title: '⭐ Thứ hạng được cập nhật',
    message: `Thứ hạng của bạn đã thay đổi từ ${data.oldRank} thành ${data.newRank}`,
    icon: 'star',
    priority: 'medium',
    actionText: 'Xem hạng',
    category: 'milestone'
  })
};

// ===== NOTIFICATION SERVICE =====

export class NotificationService {
  private supabase: SupabaseClient;
  private realtimeSubscription: any = null;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // ===== CORE NOTIFICATION OPERATIONS =====

  /**
   * Create a single notification
   */
  async createNotification(data: CreateNotificationData): Promise<Notification | null> {
    try {
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          category: data.category || 'general',
          priority: data.priority || 'medium',
          icon: data.icon || 'bell',
          action_text: data.action_text,
          action_url: data.action_url,
          challenge_id: data.challenge_id,
          tournament_id: data.tournament_id,
          club_id: data.club_id,
          match_id: data.match_id,
          metadata: data.metadata || {},
          auto_popup: data.auto_popup || false,
          scheduled_for: data.scheduled_for?.toISOString(),
          expires_at: data.expires_at?.toISOString(),
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        return null;
      }

      return notification as Notification;
    } catch (error) {
      console.error('❌ Exception creating notification:', error);
      return null;
    }
  }

  /**
   * Create multiple notifications using Edge Function
   */
  async createBulkNotifications(notifications: CreateNotificationData[]): Promise<boolean> {
    try {
      const { error } = await this.supabase.functions.invoke('unified-notification-system', {
        body: {
          action: 'bulk_create',
          notifications: notifications.map(n => ({
            user_id: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            category: n.category || 'general',
            priority: n.priority || 'medium',
            icon: n.icon || 'bell',
            action_text: n.action_text,
            action_url: n.action_url,
            challenge_id: n.challenge_id,
            tournament_id: n.tournament_id,
            club_id: n.club_id,
            match_id: n.match_id,
            metadata: n.metadata || {},
            auto_popup: n.auto_popup || false,
            scheduled_for: n.scheduled_for?.toISOString(),
            expires_at: n.expires_at?.toISOString()
          }))
        }
      });

      return !error;
    } catch (error) {
      console.error('❌ Error creating bulk notifications:', error);
      return false;
    }
  }

  /**
   * Create notification using template
   */
  async createNotificationFromTemplate(
    templateKey: keyof typeof NotificationTemplates,
    templateData: any,
    userId: string,
    additionalData?: Partial<CreateNotificationData>
  ): Promise<Notification | null> {
    const template = NotificationTemplates[templateKey](templateData);
    
    return this.createNotification({
      user_id: userId,
      type: templateKey,
      title: template.title,
      message: template.message,
      category: template.category,
      priority: template.priority,
      icon: template.icon,
      action_text: template.actionText,
      action_url: template.actionUrl,
      ...additionalData
    });
  }

  // ===== NOTIFICATION QUERIES =====

  /**
   * Get user notifications with filtering and pagination
   */
  async getUserNotifications(
    userId: string,
    filters?: NotificationFilters,
    pagination?: PaginationOptions
  ): Promise<{ notifications: Notification[], total: number }> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters?.category) {
        query = query.in('category', filters.category);
      }
      if (filters?.priority) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from.toISOString());
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to.toISOString());
      }

      // Apply pagination
      if (pagination?.limit) {
        query = query.limit(pagination.limit);
      }
      if (pagination?.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 10) - 1);
      }

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        return { notifications: [], total: 0 };
      }

      return {
        notifications: data as Notification[] || [],
        total: count || 0
      };
    } catch (error) {
      console.error('❌ Exception fetching notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Exception getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification statistics for user
   */
  async getUserNotificationStats(userId: string): Promise<NotificationStats | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('category, priority, is_read, created_at')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error getting notification stats:', error);
        return null;
      }

      const notifications = data || [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        by_category: {
          general: 0,
          challenge: 0,
          tournament: 0,
          club: 0,
          match: 0,
          system: 0,
          milestone: 0
        },
        by_priority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0
        },
        recent_activity: {
          today: 0,
          this_week: 0,
          this_month: 0
        }
      };

      notifications.forEach(notification => {
        // Count by category
        stats.by_category[notification.category as NotificationCategory]++;
        
        // Count by priority
        stats.by_priority[notification.priority as NotificationPriority]++;
        
        // Count recent activity
        const createdAt = new Date(notification.created_at);
        if (createdAt >= today) {
          stats.recent_activity.today++;
        }
        if (createdAt >= thisWeek) {
          stats.recent_activity.this_week++;
        }
        if (createdAt >= thisMonth) {
          stats.recent_activity.this_month++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Exception getting notification stats:', error);
      return null;
    }
  }

  // ===== NOTIFICATION ACTIONS =====

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.functions.invoke('unified-notification-system', {
        body: {
          action: 'mark_read',
          notification_ids: [notificationId],
          user_id: userId
        }
      });

      return !error;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.functions.invoke('unified-notification-system', {
        body: {
          action: 'mark_all_read',
          user_id: userId
        }
      });

      return !error;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.functions.invoke('unified-notification-system', {
        body: {
          action: 'delete',
          notification_ids: [notificationId],
          user_id: userId
        }
      });

      return !error;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteNotifications(notificationIds: string[], userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.functions.invoke('unified-notification-system', {
        body: {
          action: 'delete',
          notification_ids: notificationIds,
          user_id: userId
        }
      });

      return !error;
    } catch (error) {
      console.error('❌ Error deleting notifications:', error);
      return false;
    }
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====

  /**
   * Subscribe to real-time notifications for user
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
    onUpdate: (notification: Notification) => void
  ): () => void {
    const channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onUpdate(payload.new as Notification);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Send real-time notification to user (for immediate feedback)
   */
  async sendRealTimeNotification(userId: string, notification: Notification): Promise<void> {
    try {
      await this.supabase.channel(`notifications:${userId}`).send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      });
    } catch (error) {
      console.error('❌ Error sending real-time notification:', error);
    }
  }

  // ===== BULK OPERATIONS =====

  /**
   * Notify all club members
   */
  async notifyClubMembers(
    clubId: string,
    notificationData: Omit<CreateNotificationData, 'user_id' | 'club_id'>
  ): Promise<boolean> {
    try {
      // Get club member IDs
      const { data: members, error: membersError } = await this.supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', clubId)
        .eq('status', 'active');

      if (membersError || !members?.length) {
        console.error('❌ Error fetching club members:', membersError);
        return false;
      }

      // Create notifications for all members
      const notifications = members.map(member => ({
        ...notificationData,
        user_id: member.user_id,
        club_id: clubId
      }));

      return this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('❌ Error notifying club members:', error);
      return false;
    }
  }

  /**
   * Notify all tournament participants
   */
  async notifyTournamentParticipants(
    tournamentId: string,
    notificationData: Omit<CreateNotificationData, 'user_id' | 'tournament_id'>
  ): Promise<boolean> {
    try {
      // Get tournament participant IDs
      const { data: participants, error: participantsError } = await this.supabase
        .from('tournament_registrations')
        .select('user_id')
        .eq('tournament_id', tournamentId)
        .eq('status', 'confirmed');

      if (participantsError || !participants?.length) {
        console.error('❌ Error fetching tournament participants:', participantsError);
        return false;
      }

      // Create notifications for all participants
      const notifications = participants.map(participant => ({
        ...notificationData,
        user_id: participant.user_id,
        tournament_id: tournamentId
      }));

      return this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('❌ Error notifying tournament participants:', error);
      return false;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get notification icon emoji mapping
   */
  getNotificationIconEmoji(icon: NotificationIcon): string {
    const iconMap: Record<NotificationIcon, string> = {
      'bell': '🔔',
      'trophy': '🏆', 
      'sword': '⚔️',
      'clock': '⏰',
      'gift': '🎁',
      'star': '⭐',
      'shield': '🛡️',
      'target': '🎯',
      'zap': '⚡',
      'heart': '❤️',
      'message-circle': '💬',
      'users': '👥',
      'calendar': '📅',
      'check-circle': '✅',
      'alert-circle': '⚠️',
      'x-circle': '❌',
      'info': 'ℹ️',
      'trending-up': '📈',
      'award': '🥇',
      'crown': '👑',
      'flame': '🔥',
      'lightning': '⚡',
      'sparkles': '✨'
    };

    return iconMap[icon] || '🔔';
  }

  /**
   * Get priority color class for UI
   */
  getPriorityColor(priority: NotificationPriority): string {
    const colorMap: Record<NotificationPriority, string> = {
      'low': 'text-gray-500',
      'medium': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    };

    return colorMap[priority] || 'text-gray-500';
  }

  /**
   * Format notification time for display
   */
  formatNotificationTime(createdAt: string, locale: string = 'vi'): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return locale === 'vi' ? 'Vừa xong' : 'Just now';
    } else if (diffInMinutes < 60) {
      return locale === 'vi' ? `${diffInMinutes} phút trước` : `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return locale === 'vi' ? `${hours} giờ trước` : `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return locale === 'vi' ? `${days} ngày trước` : `${days}d ago`;
    }
  }

  /**
   * Cleanup expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('❌ Error cleaning up expired notifications:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('❌ Exception cleaning up expired notifications:', error);
      return 0;
    }
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Validate notification data
 */
export function validateNotificationData(data: CreateNotificationData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.user_id || data.user_id.trim() === '') {
    errors.push('User ID is required');
  }

  if (!data.type || data.type.trim() === '') {
    errors.push('Type is required');
  }

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!data.message || data.message.trim() === '') {
    errors.push('Message is required');
  }

  if (data.title && data.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (data.message && data.message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create factory function for NotificationService
 */
export function createNotificationService(supabase: SupabaseClient): NotificationService {
  return new NotificationService(supabase);
}

export default NotificationService;
