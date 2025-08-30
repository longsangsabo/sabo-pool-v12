// =====================================================
// 🏆 CHALLENGE NOTIFICATION SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import {
  ChallengeNotification,
  ChallengeNotificationType,
  CreateNotificationData,
  ScheduleNotificationData,
  NotificationFilters,
  PaginationOptions,
  NotificationStats,
  NotificationBatch,
  DatabaseNotification,
  NotificationTemplate,
  NotificationMetadata,
  RealtimeNotificationPayload
} from '@/types/challengeNotification';
import { toast } from 'sonner';

export class ChallengeNotificationService {
  private static instance: ChallengeNotificationService;
  private realtimeSubscription: any = null;

  static getInstance(): ChallengeNotificationService {
    if (!ChallengeNotificationService.instance) {
      ChallengeNotificationService.instance = new ChallengeNotificationService();
    }
    return ChallengeNotificationService.instance;
  }

  // ===== CORE NOTIFICATION METHODS =====

  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<ChallengeNotification | null> {
    try {
      console.log('🔔 Creating notification:', data);

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          type: data.type,
          challenge_id: data.challengeId,
          user_id: data.userId,
          title: data.title,
          message: data.message,
          icon: data.icon || 'bell',
          priority: data.priority || 'medium',
          action_text: data.actionText,
          action_url: data.actionUrl,
          metadata: data.metadata || {},
          scheduled_for: data.scheduledFor?.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        return null;
      }

      console.log('✅ Notification created successfully:', notification.id);
      return this.transformDatabaseNotification(notification);
    } catch (error) {
      console.error('❌ Exception creating notification:', error);
      return null;
    }
  }

  /**
   * Schedule a future notification
   */
  async scheduleNotification(data: ScheduleNotificationData): Promise<ChallengeNotification | null> {
    return this.createNotification(data);
  }

  /**
   * Send real-time notification to user
   */
  async sendRealTimeNotification(userId: string, notification: ChallengeNotification): Promise<void> {
    try {
      // Send through Supabase realtime
      await supabase.channel(`notifications:${userId}`).send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      });

      // Show toast if it's for current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === userId) {
        const iconMap = {
          'trophy': '🏆',
          'sword': '⚔️',
          'clock': '⏰',
          'gift': '🎁',
          'bell': '🔔',
          'star': '⭐',
          'fire': '🔥'
        };

        toast(notification.title, {
          description: notification.message,
          duration: 5000,
          action: notification.actionText && notification.actionUrl ? {
            label: notification.actionText,
            onClick: () => window.location.href = notification.actionUrl!
          } : undefined
        });
      }
    } catch (error) {
      console.error('❌ Error sending real-time notification:', error);
    }
  }

  /**
   * Send batch notifications to multiple users
   */
  async sendBatchNotifications(batch: NotificationBatch): Promise<void> {
    try {
      console.log(`🔔 Sending batch notifications to ${batch.userIds.length} users`);

      const notifications = batch.userIds.map(userId => ({
        type: batch.template.title, // This should be mapped to proper type
        challenge_id: batch.challengeId,
        user_id: userId,
        title: batch.template.title,
        message: batch.template.message,
        icon: batch.template.icon,
        priority: batch.template.priority,
        action_text: batch.template.actionText,
        action_url: batch.template.actionUrl,
        metadata: batch.metadata || {},
        scheduled_for: batch.scheduledFor?.toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('❌ Error sending batch notifications:', error);
        return;
      }

      console.log('✅ Batch notifications sent successfully');

      // Send real-time notifications
      for (const userId of batch.userIds) {
        const notification: ChallengeNotification = {
          id: '', // Will be filled by real notification
          type: ChallengeNotificationType.CHALLENGE_CREATED, // This should be properly mapped
          challengeId: batch.challengeId,
          userId,
          title: batch.template.title,
          message: batch.template.message,
          icon: batch.template.icon,
          priority: batch.template.priority,
          actionText: batch.template.actionText,
          actionUrl: batch.template.actionUrl,
          isRead: false,
          isSent: true,
          metadata: batch.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await this.sendRealTimeNotification(userId, notification);
      }
    } catch (error) {
      console.error('❌ Exception sending batch notifications:', error);
    }
  }

  // ===== NOTIFICATION QUERIES =====

  /**
   * Get user notifications with filtering and pagination
   */
  async getUserNotifications(
    userId: string, 
    filters?: NotificationFilters, 
    options?: PaginationOptions
  ): Promise<{ notifications: ChallengeNotification[], total: number }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      if (filters?.priority) {
        if (Array.isArray(filters.priority)) {
          query = query.in('priority', filters.priority);
        } else {
          query = query.eq('priority', filters.priority);
        }
      }
      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        } else {
          query = query.eq('type', filters.type);
        }
      }
      if (filters?.challengeId) {
        query = query.eq('challenge_id', filters.challengeId);
      }

      // Apply pagination and ordering
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const orderBy = options?.orderBy || 'created_at';
      const orderDirection = options?.orderDirection || 'desc';

      query = query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        return { notifications: [], total: 0 };
      }

      const notifications = data?.map(this.transformDatabaseNotification) || [];
      return { notifications, total: count || 0 };
    } catch (error) {
      console.error('❌ Exception fetching notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread notifications count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
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
      // Get total count
      const { count: totalCount, error: totalError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (totalError) throw totalError;

      // Get unread count
      const { count: unreadCount, error: unreadError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (unreadError) throw unreadError;

      // Get urgent count
      const { count: urgentCount, error: urgentError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('priority', 'urgent');

      if (urgentError) throw urgentError;

      // Get high priority count
      const { count: highPriorityCount, error: highError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('priority', 'high');

      if (highError) throw highError;

      // Get latest notification
      const { data: latestNotif, error: latestError } = await supabase
        .from('notifications')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        userId: userId,
        totalNotifications: totalCount || 0,
        unreadCount: unreadCount || 0,
        urgentCount: urgentCount || 0,
        highPriorityCount: highPriorityCount || 0,
        lastNotificationAt: latestNotif?.created_at ? new Date(latestNotif.created_at) : null
      };
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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception deleting notification:', error);
      return false;
    }
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====

  /**
   * Subscribe to real-time notifications for user
   */
  subscribeToUserNotifications(
    userId: string, 
    callback: (notification: ChallengeNotification) => void
  ): () => void {
    console.log('🔔 Subscribing to notifications for user:', userId);

    this.realtimeSubscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimeNotificationPayload) => {
          if (payload.new) {
            const notification = this.transformDatabaseNotification(payload.new);
            callback(notification);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      console.log('🔔 Unsubscribing from notifications');
      if (this.realtimeSubscription) {
        supabase.removeChannel(this.realtimeSubscription);
        this.realtimeSubscription = null;
      }
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Transform database notification to typed notification
   */
  private transformDatabaseNotification(dbNotification: DatabaseNotification): ChallengeNotification {
    return {
      id: dbNotification.id,
      type: dbNotification.type as ChallengeNotificationType,
      challengeId: dbNotification.challenge_id,
      userId: dbNotification.user_id,
      title: dbNotification.title,
      message: dbNotification.message,
      actionText: dbNotification.action_text || undefined,
      actionUrl: dbNotification.action_url || undefined,
      icon: dbNotification.icon,
      priority: dbNotification.priority as any,
      isRead: dbNotification.is_read,
      isSent: dbNotification.is_sent,
      scheduledFor: dbNotification.scheduled_for ? new Date(dbNotification.scheduled_for) : undefined,
      sentAt: dbNotification.sent_at ? new Date(dbNotification.sent_at) : undefined,
      metadata: dbNotification.metadata || {},
      createdAt: new Date(dbNotification.created_at),
      updatedAt: new Date(dbNotification.updated_at)
    };
  }

  /**
   * Get notification template from database
   */
  async getNotificationTemplate(
    templateType: string, 
    challengeData: Record<string, any> = {}
  ): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase.rpc('get_notification_template', {
        template_type: templateType,
        challenge_data: challengeData
      });

      if (error) {
        console.error('❌ Error getting notification template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Exception getting notification template:', error);
      return null;
    }
  }
}

// Export singleton instance
export const challengeNotificationService = ChallengeNotificationService.getInstance();
