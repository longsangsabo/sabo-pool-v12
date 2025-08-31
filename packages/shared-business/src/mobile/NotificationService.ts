/**
 * COMPREHENSIVE NOTIFICATION SERVICE
 * 
 * Mobile-Ready Push Notification Management
 * Handles in-app, push, SMS, and email notifications
 * 
 * Core Features:
 * - Push notifications (FCM/APNS)
 * - In-app notifications
 * - Email notifications
 * - SMS notifications
 * - Mobile-optimized delivery
 * - Offline queuing
 */

// Types
export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'low' | 'default' | 'high' | 'urgent';
  sound: boolean;
  vibration: boolean;
  led_color?: string;
  badge: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'tournament' | 'challenge' | 'ranking' | 'payment' | 'system' | 'social';
  channel_id: string;
  title: string;
  body: string;
  data?: any;
  image_url?: string;
  action_url?: string;
  actions?: NotificationAction[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
  clicked_at?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'expired' | 'failed';
}

export interface NotificationAction {
  id: string;
  title: string;
  action: string;
  icon?: string;
  input?: boolean;
}

export interface PushToken {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_id: string;
  app_version: string;
  is_active: boolean;
  created_at: string;
  last_used: string;
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  channels: {
    tournament_updates: boolean;
    challenge_requests: boolean;
    ranking_changes: boolean;
    payment_confirmations: boolean;
    social_interactions: boolean;
    system_announcements: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    timezone: string;
  };
  frequency: 'realtime' | 'batched_hourly' | 'batched_daily';
}

export interface NotificationStats {
  total_sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  delivery_rate: number;
  read_rate: number;
  click_rate: number;
}

/**
 * COMPREHENSIVE NOTIFICATION SERVICE
 * 
 * Handles all notification operations:
 * - Send push notifications
 * - Manage notification preferences
 * - Handle notification actions
 * - Track notification analytics
 * - Mobile-optimized delivery
 */
export class NotificationService {
  private apiClient: any;
  private pushService: any; // FCM/APNS service
  private emailService: any;
  private smsService: any;
  private cache: Map<string, any> = new Map();
  private offlineQueue: Notification[] = [];

  constructor(
    apiClient: any, 
    pushService: any, 
    emailService?: any, 
    smsService?: any
  ) {
    this.apiClient = apiClient;
    this.pushService = pushService;
    this.emailService = emailService;
    this.smsService = smsService;
    this.initializeChannels();
  }

  // ===== NOTIFICATION SENDING =====

  /**
   * Send notification to user
   * Mobile-optimized with multi-channel delivery
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at' | 'status'>): Promise<Notification> {
    try {
      // Create notification record
      const notificationRecord = await this.createNotification({
        ...notification,
        id: this.generateNotificationId(),
        created_at: new Date().toISOString(),
        status: 'pending'
      });

      // Get user preferences
      const preferences = await this.getUserPreferences(notification.user_id);
      
      // Check if user wants this type of notification
      if (!this.shouldSendNotification(notification, preferences)) {
        await this.updateNotificationStatus(notificationRecord.id, 'expired');
        return notificationRecord;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        await this.scheduleForLater(notificationRecord);
        return notificationRecord;
      }

      // Send via enabled channels
      const deliveryPromises: Promise<any>[] = [];

      if (preferences.push_enabled) {
        deliveryPromises.push(this.sendPushNotification(notificationRecord));
      }

      if (preferences.email_enabled && this.emailService) {
        deliveryPromises.push(this.sendEmailNotification(notificationRecord));
      }

      if (preferences.sms_enabled && this.smsService) {
        deliveryPromises.push(this.sendSMSNotification(notificationRecord));
      }

      // Wait for all deliveries
      const results = await Promise.allSettled(deliveryPromises);
      
      // Update status based on results
      const hasSuccess = results.some(result => result.status === 'fulfilled');
      await this.updateNotificationStatus(
        notificationRecord.id, 
        hasSuccess ? 'sent' : 'failed'
      );

      return notificationRecord;
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Send push notification
   * Mobile-native push delivery
   */
  async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Get user's push tokens
      const tokens = await this.getUserPushTokens(notification.user_id);
      
      if (tokens.length === 0) {
        throw new Error('No push tokens found for user');
      }

      // Build push payload
      const payload = {
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.image_url
        },
        data: {
          notification_id: notification.id,
          type: notification.type,
          action_url: notification.action_url,
          ...(notification.data || {})
        },
        android: {
          notification: {
            channel_id: notification.channel_id,
            priority: this.mapPriorityToAndroid(notification.priority),
            default_sound: true,
            default_vibrate_timings: true
          }
        },
        apns: {
          payload: {
            aps: {
              badge: await this.getUserUnreadCount(notification.user_id),
              sound: 'default',
              category: notification.type
            }
          }
        }
      };

      // Send to all user's devices
      const sendPromises = tokens.map(token => 
        this.pushService.send({
          ...payload,
          token: token.token
        })
      );

      await Promise.allSettled(sendPromises);
    } catch (error) {
      throw new Error(`Push notification failed: ${error.message}`);
    }
  }

  /**
   * Send bulk notifications
   * Mobile-optimized batch sending
   */
  async sendBulkNotifications(notifications: Omit<Notification, 'id' | 'created_at' | 'status'>[]): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process in batches for mobile efficiency
    const batchSize = 50;
    const batches = this.chunkArray(notifications, batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (notification) => {
        try {
          await this.sendNotification(notification);
          sent++;
        } catch (error) {
          failed++;
          errors.push(`User ${notification.user_id}: ${error.message}`);
        }
      });

      await Promise.allSettled(batchPromises);
    }

    return { sent, failed, errors };
  }

  // ===== NOTIFICATION MANAGEMENT =====

  /**
   * Get user notifications
   * Mobile-optimized with pagination
   */
  async getUserNotifications(
    userId: string,
    options?: {
      unread_only?: boolean;
      type?: Notification['type'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ notifications: Notification[]; total: number; unread_count: number }> {
    try {
      let query = this.apiClient
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.unread_only) {
        query = query.is('read_at', null);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      // Get unread count separately
      const { count: unreadCount } = await this.apiClient
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null);

      return {
        notifications: data || [],
        total: count || 0,
        unread_count: unreadCount || 0
      };
    } catch (error) {
      throw new Error(`Failed to get user notifications: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   * Mobile-optimized read tracking
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.apiClient
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update badge count
      await this.updateBadgeCount(userId);
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read
   * Mobile-friendly bulk read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await this.apiClient
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('user_id', userId)
        .is('read_at', null)
        .select('id');

      if (error) throw error;

      const count = data?.length || 0;

      // Update badge count
      await this.updateBadgeCount(userId);

      return count;
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  /**
   * Delete notification
   * Mobile-safe deletion
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.apiClient
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  // ===== PUSH TOKEN MANAGEMENT =====

  /**
   * Register push token
   * Mobile device token registration
   */
  async registerPushToken(
    userId: string, 
    token: string, 
    platform: 'ios' | 'android' | 'web',
    deviceId: string,
    appVersion: string
  ): Promise<void> {
    try {
      // Deactivate old tokens for this device
      await this.apiClient
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      // Register new token
      const { error } = await this.apiClient
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token,
          platform,
          device_id: deviceId,
          app_version: appVersion,
          is_active: true,
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to register push token: ${error.message}`);
    }
  }

  /**
   * Unregister push token
   * Mobile token cleanup
   */
  async unregisterPushToken(userId: string, deviceId: string): Promise<void> {
    try {
      const { error } = await this.apiClient
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to unregister push token: ${error.message}`);
    }
  }

  // ===== PREFERENCES MANAGEMENT =====

  /**
   * Get user notification preferences
   * Mobile-optimized preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const cacheKey = `preferences_${userId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const { data, error } = await this.apiClient
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const preferences = data || this.getDefaultPreferences(userId);
      
      // Cache for 5 minutes
      this.cache.set(cacheKey, preferences);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

      return preferences;
    } catch (error) {
      throw new Error(`Failed to get user preferences: ${error.message}`);
    }
  }

  /**
   * Update user notification preferences
   * Mobile-friendly preference updates
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      const updatedPreferences = { ...currentPreferences, ...preferences };

      const { data, error } = await this.apiClient
        .from('notification_preferences')
        .upsert(updatedPreferences)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.cache.delete(`preferences_${userId}`);

      return data;
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  // ===== ANALYTICS & TRACKING =====

  /**
   * Track notification interaction
   * Mobile analytics tracking
   */
  async trackInteraction(
    notificationId: string, 
    action: 'delivered' | 'clicked' | 'dismissed',
    metadata?: any
  ): Promise<void> {
    try {
      const updates: any = {
        status: action === 'clicked' ? 'read' : 'delivered'
      };

      if (action === 'clicked') {
        updates.clicked_at = new Date().toISOString();
      }

      const { error } = await this.apiClient
        .from('notifications')
        .update(updates)
        .eq('id', notificationId);

      if (error) throw error;

      // Track analytics
      await this.trackAnalytics(notificationId, action, metadata);
    } catch (error) {
      throw new Error(`Failed to track interaction: ${error.message}`);
    }
  }

  /**
   * Get notification analytics
   * Mobile-friendly analytics
   */
  async getNotificationStats(
    userId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<NotificationStats> {
    try {
      let query = this.apiClient
        .from('notifications')
        .select('status');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total_sent: data.length,
        delivered: data.filter(n => ['delivered', 'read'].includes(n.status)).length,
        read: data.filter(n => n.status === 'read').length,
        clicked: data.filter(n => n.clicked_at).length,
        failed: data.filter(n => n.status === 'failed').length,
        delivery_rate: 0,
        read_rate: 0,
        click_rate: 0
      };

      stats.delivery_rate = stats.total_sent > 0 ? stats.delivered / stats.total_sent : 0;
      stats.read_rate = stats.delivered > 0 ? stats.read / stats.delivered : 0;
      stats.click_rate = stats.read > 0 ? stats.clicked / stats.read : 0;

      return stats;
    } catch (error) {
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }

  // ===== SCHEDULED NOTIFICATIONS =====

  /**
   * Schedule notification
   * Mobile-optimized scheduling
   */
  async scheduleNotification(
    notification: Omit<Notification, 'id' | 'created_at' | 'status'>,
    scheduledFor: string
  ): Promise<Notification> {
    try {
      const scheduledNotification = await this.createNotification({
        ...notification,
        id: this.generateNotificationId(),
        scheduled_for: scheduledFor,
        created_at: new Date().toISOString(),
        status: 'pending'
      });

      // Add to scheduling queue
      await this.addToScheduleQueue(scheduledNotification);

      return scheduledNotification;
    } catch (error) {
      throw new Error(`Failed to schedule notification: ${error.message}`);
    }
  }

  /**
   * Cancel scheduled notification
   * Mobile-safe cancellation
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await this.apiClient
        .from('notifications')
        .update({ status: 'expired' })
        .eq('id', notificationId)
        .eq('status', 'pending');

      if (error) throw error;

      // Remove from schedule queue
      await this.removeFromScheduleQueue(notificationId);
    } catch (error) {
      throw new Error(`Failed to cancel scheduled notification: ${error.message}`);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private initializeChannels(): void {
    // Initialize default notification channels
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'tournaments',
        name: 'Tournament Updates',
        description: 'Notifications about tournament registration, matches, and results',
        importance: 'high',
        sound: true,
        vibration: true,
        badge: true
      },
      {
        id: 'challenges',
        name: 'Challenge Requests',
        description: 'Notifications about challenge invitations and responses',
        importance: 'default',
        sound: true,
        vibration: true,
        badge: true
      },
      {
        id: 'rankings',
        name: 'Ranking Changes',
        description: 'Notifications about rank updates and achievements',
        importance: 'default',
        sound: false,
        vibration: false,
        badge: true
      },
      {
        id: 'payments',
        name: 'Payment Confirmations',
        description: 'Notifications about payment processing and confirmations',
        importance: 'high',
        sound: true,
        vibration: true,
        badge: true
      },
      {
        id: 'social',
        name: 'Social Interactions',
        description: 'Notifications about friend requests, messages, and social activities',
        importance: 'default',
        sound: true,
        vibration: false,
        badge: true
      },
      {
        id: 'system',
        name: 'System Announcements',
        description: 'Important system updates and maintenance notifications',
        importance: 'urgent',
        sound: true,
        vibration: true,
        badge: true
      }
    ];

    // Register channels with the system
    defaultChannels.forEach(channel => {
      this.registerNotificationChannel(channel);
    });
  }

  private registerNotificationChannel(channel: NotificationChannel): void {
    // Implementation would register channel with the mobile platform
    console.log('Registered notification channel:', channel.id);
  }

  private async createNotification(notification: Notification): Promise<Notification> {
    const { data, error } = await this.apiClient
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateNotificationStatus(notificationId: string, status: Notification['status']): Promise<void> {
    await this.apiClient
      .from('notifications')
      .update({ status })
      .eq('id', notificationId);
  }

  private shouldSendNotification(notification: Notification, preferences: NotificationPreferences): boolean {
    const channelMap = {
      'tournament': preferences.channels.tournament_updates,
      'challenge': preferences.channels.challenge_requests,
      'ranking': preferences.channels.ranking_changes,
      'payment': preferences.channels.payment_confirmations,
      'social': preferences.channels.social_interactions,
      'system': preferences.channels.system_announcements
    };

    return channelMap[notification.type] ?? true;
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours.enabled) return false;

    const now = new Date();
    const userTimeZone = preferences.quiet_hours.timezone;
    
    // Implementation would check if current time is within quiet hours
    // For now, return false
    return false;
  }

  private async scheduleForLater(notification: Notification): Promise<void> {
    // Implementation would schedule notification for after quiet hours
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    if (!this.emailService) return;
    
    // Implementation would send email notification
    await this.emailService.send({
      to: notification.user_id,
      subject: notification.title,
      body: notification.body
    });
  }

  private async sendSMSNotification(notification: Notification): Promise<void> {
    if (!this.smsService) return;
    
    // Implementation would send SMS notification
    await this.smsService.send({
      to: notification.user_id,
      message: `${notification.title}: ${notification.body}`
    });
  }

  private async getUserPushTokens(userId: string): Promise<PushToken[]> {
    const { data, error } = await this.apiClient
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  private async getUserUnreadCount(userId: string): Promise<number> {
    const { count } = await this.apiClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    return count || 0;
  }

  private mapPriorityToAndroid(priority: Notification['priority']): string {
    const map = {
      'low': 'min',
      'normal': 'default',
      'high': 'high',
      'critical': 'max'
    };
    return map[priority] || 'default';
  }

  private async updateBadgeCount(userId: string): Promise<void> {
    const unreadCount = await this.getUserUnreadCount(userId);
    const tokens = await this.getUserPushTokens(userId);

    // Update badge count on all user devices
    const updatePromises = tokens.map(token => 
      this.pushService.send({
        token: token.token,
        data: {
          badge_count: unreadCount.toString()
        }
      })
    );

    await Promise.allSettled(updatePromises);
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      user_id: userId,
      push_enabled: true,
      email_enabled: true,
      sms_enabled: false,
      channels: {
        tournament_updates: true,
        challenge_requests: true,
        ranking_changes: true,
        payment_confirmations: true,
        social_interactions: true,
        system_announcements: true
      },
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'Asia/Ho_Chi_Minh'
      },
      frequency: 'realtime'
    };
  }

  private generateNotificationId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async trackAnalytics(notificationId: string, action: string, metadata?: any): Promise<void> {
    // Implementation would track analytics
  }

  private async addToScheduleQueue(notification: Notification): Promise<void> {
    // Implementation would add to scheduling queue
  }

  private async removeFromScheduleQueue(notificationId: string): Promise<void> {
    // Implementation would remove from scheduling queue
  }
}

// Export for mobile app consumption
export default NotificationService;
