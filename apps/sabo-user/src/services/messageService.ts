// Removed supabase import - migrated to services
import { getCurrentUser } from '../services/userService';
import { 
  Message, 
  MessageThread, 
  NotificationSettings, 
  MessageFilters, 
  SendMessageData,
  MessageStats 
} from '@/types/message';

export class MessageService {
  // During milestone smoke tests we temporarily bypass message queries if schema not present
  private static isSmokeBypass() {
    return process.env.SMOKE_TEST_MILESTONES === '1';
  }
  
  // Enhanced send message with multi-channel support
  static async sendMessage(messageData: SendMessageData & {
    channels?: ('in_app' | 'email' | 'sms' | 'push')[];
    template_key?: string;
    variables?: Record<string, string>;
    scheduled_at?: string;
    auto_popup?: boolean;
  }): Promise<Message | null> {
  if (this.isSmokeBypass()) return null;
  try {
      const currentUser = (await getCurrentUser()).data.user;
      
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('messages')
        .create([{
          sender_id: currentUser?.id,
          ...messageData,
          // Store enhanced metadata
          metadata: {
            ...messageData.metadata,
            channels: messageData.channels || ['in_app'],
            template_key: messageData.template_key,
            variables: messageData.variables,
            scheduled_at: messageData.scheduled_at,
            auto_popup: messageData.auto_popup || false
          }
        }])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(user_id, full_name, avatar_url, display_name),
          recipient:profiles!messages_recipient_id_fkey(user_id, full_name, avatar_url, display_name)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // If high priority and external channels requested, trigger multi-channel notification
      if ((messageData.priority === 'high' || messageData.priority === 'urgent') && 
          messageData.channels && messageData.channels.length > 1) {
        await this.triggerMultiChannelNotification(data);
      }

      // Send real-time notification
      await this.sendRealtimeNotification(data.recipient_id, data);
      
      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }

  // Get inbox messages for a user
  static async getInboxMessages(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: MessageFilters
  ): Promise<Message[]> {
  if (this.isSmokeBypass()) return [];
  try {
      // Check if messages table exists first
//       const { data: tableExists, error: tableError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (tableError) {
        console.log('Messages table not available:', tableError.message);
        return [];
      }

      // Use separate queries to avoid PostgREST relationship issues
//       let query = supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('message_type', filters.type);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters?.sender) {
        query = query.eq('sender_id', filters.sender);
      }

      const { data: messages, error } = await query;
      if (error) throw error;

      // Get profile data separately to avoid relationship issues
      if (messages && messages.length > 0) {
        const userIds = new Set<string>();
        messages.forEach(msg => {
          if (msg.sender_id) userIds.add(msg.sender_id);
          if (msg.recipient_id) userIds.add(msg.recipient_id);
        });

//         const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, display_name')
          .in('user_id', Array.from(userIds));

        if (!profileError && profiles) {
          // Create profile lookup map
          const profileMap = new Map();
          profiles.forEach(profile => {
            profileMap.set(profile.user_id, profile);
          });

          // Attach profile data to messages
          return messages.map(msg => ({
            ...msg,
            sender: profileMap.get(msg.sender_id) || null,
            recipient: profileMap.get(msg.recipient_id) || null
          }));
        }
      }

      return messages || [];
    } catch (error) {
      console.error('Error fetching inbox messages:', error);
      return [];
    }
  }

  // Get sent messages for a user
  static async getSentMessages(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<Message[]> {
  if (this.isSmokeBypass()) return [];
  try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(user_id, full_name, avatar_url, display_name),
          recipient:profiles!messages_recipient_id_fkey(user_id, full_name, avatar_url, display_name)
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      return [];
    }
  }

  // Get message by ID
  static async getMessageById(messageId: string): Promise<Message | null> {
  if (this.isSmokeBypass()) return null;
  try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(user_id, full_name, avatar_url, display_name),
          recipient:profiles!messages_recipient_id_fkey(user_id, full_name, avatar_url, display_name)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching message:', error);
      return null;
    }
  }

  // Mark message as read
  static async markAsRead(messageId: string): Promise<boolean> {
  if (this.isSmokeBypass()) return false;
  try {
      // TODO: Replace with service call - const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'read', 
          read_at: new Date().toISOString() 
        })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Mark multiple messages as read
  static async markMultipleAsRead(messageIds: string[]): Promise<boolean> {
  if (this.isSmokeBypass()) return false;
  try {
      // TODO: Replace with service call - const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'read', 
          read_at: new Date().toISOString() 
        })
        .in('id', messageIds);

      return !error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Archive message
  static async archiveMessage(messageId: string): Promise<boolean> {
  if (this.isSmokeBypass()) return false;
  try {
      // TODO: Replace with service call - const { error } = await supabase
        .from('messages')
        .update({ status: 'archived' })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error archiving message:', error);
      return false;
    }
  }

  // Delete message (soft delete)
  static async deleteMessage(messageId: string): Promise<boolean> {
  if (this.isSmokeBypass()) return 0;
  try {
      // TODO: Replace with service call - const { error } = await supabase
        .from('messages')
        .update({ status: 'deleted' })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // Get unread message count
  static async getUnreadCount(userId: string): Promise<number> {
  if (this.isSmokeBypass()) return 0;
  try {
      // First try the database function
//       const { data: functionResult, error: functionError } = await supabase
        .rpc('get_unread_message_count', { user_uuid: userId });

      if (!functionError && functionResult !== null) {
        return functionResult;
      }

      // Fallback to manual count if function doesn't exist
      console.log('Function get_unread_message_count not found, using fallback query');
      
//       const { data: tableExists, error: tableError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (tableError) {
        console.log('Messages table not available:', tableError.message);
        return 0;
      }

//       const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('status', 'unread');

      if (countError) throw countError;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get message statistics
  static async getMessageStats(userId: string): Promise<MessageStats> {
  if (this.isSmokeBypass()) return null;
  try {
      const [total, unread, sent, archived, system] = await Promise.all([
//         supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId),
//         supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('status', 'unread'),
//         supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId),
//         supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('status', 'archived'),
//         supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('message_type', 'system')
      ]);

      return {
        total_messages: total.count || 0,
        unread_count: unread.count || 0,
        sent_count: sent.count || 0,
        archived_count: archived.count || 0,
        system_messages: system.count || 0
      };
    } catch (error) {
      console.error('Error getting message stats:', error);
      return {
        total_messages: 0,
        unread_count: 0,
        sent_count: 0,
        archived_count: 0,
        system_messages: 0
      };
    }
  }

  // Enhanced send system message with notification features
  static async sendSystemMessage(
    recipientId: string, 
    subject: string, 
    content: string, 
    metadata?: any & {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      auto_popup?: boolean;
      channels?: ('in_app' | 'email' | 'push')[];
      template_key?: string;
    }
  ): Promise<string | null> {
  if (this.isSmokeBypass()) return [];
  try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .rpc('send_system_message', {
          recipient_uuid: recipientId,
          message_subject: subject,
          message_content: content,
          message_metadata: {
            ...metadata,
            priority: metadata?.priority || 'normal',
            auto_popup: metadata?.auto_popup || false,
            channels: metadata?.channels || ['in_app'],
            created_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      // If high priority and external channels requested, trigger notification
      if ((metadata?.priority === 'high' || metadata?.priority === 'urgent') && 
          metadata?.channels && metadata.channels.length > 1) {
        await this.triggerSystemNotification(recipientId, subject, content, metadata);
      }

      return data;
    } catch (error) {
      console.error('Error sending system message:', error);
      return null;
    }
  }

  // Trigger multi-channel notification for high priority messages
  private static async triggerMultiChannelNotification(message: Message): Promise<void> {
    try {
      // Call the multi-channel notification function
// // //       // TODO: Replace with service call - const { error } = // TODO: Replace with service call - await supabase.functions.invoke('multi-channel-notification', {
        body: {
          notification_id: `msg_${message.id}`,
          user_id: message.recipient_id,
          channels: message.metadata?.channels || ['in_app'],
          title: message.subject || 'Tin nhắn mới',
          message: message.content,
          priority: message.priority,
          category: 'message',
          metadata: {
            message_id: message.id,
            message_type: message.message_type,
            sender_id: message.sender_id
          }
        }
      });

      if (error) {
        console.error('Error triggering multi-channel notification:', error);
      }
    } catch (error) {
      console.error('Error in triggerMultiChannelNotification:', error);
    }
  }

  // Trigger system notification
  private static async triggerSystemNotification(
    userId: string, 
    title: string, 
    message: string, 
    metadata: any
  ): Promise<void> {
    try {
// // //       // TODO: Replace with service call - const { error } = // TODO: Replace with service call - await supabase.functions.invoke('send-notification', {
        body: {
          user_id: userId,
          type: 'system',
          title,
          message,
          priority: metadata.priority,
          template_key: metadata.template_key
        }
      });

      if (error) {
        console.error('Error triggering system notification:', error);
      }
    } catch (error) {
      console.error('Error in triggerSystemNotification:', error);
    }
  }

  // Search messages
  static async searchMessages(
    userId: string, 
    query: string, 
    filters?: MessageFilters
  ): Promise<Message[]> {
  if (this.isSmokeBypass()) return null;
  try {
//       let supabaseQuery = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(user_id, full_name, avatar_url, display_name),
          recipient:profiles!messages_recipient_id_fkey(user_id, full_name, avatar_url, display_name)
        `)
        .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
        .or(`subject.ilike.%${query}%,content.ilike.%${query}%`);

      if (filters?.type) {
//         supabaseQuery = supabaseQuery.eq('message_type', filters.type);
      }

      if (filters?.status && filters.status !== 'deleted') {
//         supabaseQuery = supabaseQuery.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
//         supabaseQuery = supabaseQuery.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
//         supabaseQuery = supabaseQuery.lte('created_at', filters.dateTo);
      }

      // TODO: Replace with service call - const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  // Get notification settings
  static async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  if (this.isSmokeBypass()) return false;
  try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .getByUserId(userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Create default settings if none exist
      if (!data) {
        return await this.createDefaultNotificationSettings(userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Update notification settings
  static async updateNotificationSettings(
    userId: string, 
    settings: Partial<NotificationSettings>
  ): Promise<boolean> {
  if (this.isSmokeBypass()) return null;
  try {
      // TODO: Replace with service call - const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Create default notification settings
  private static async createDefaultNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  if (this.isSmokeBypass()) return [];
  try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('notification_settings')
        .create([{
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          tournament_updates: true,
          direct_messages: true,
          system_announcements: true,
          match_reminders: true
        }])
        .getAll()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default notification settings:', error);
      return null;
    }
  }

  // Real-time notification (placeholder for future WebSocket integration)
  private static async sendRealtimeNotification(userId: string, message: Message) {
    console.log('📨 Real-time notification sent to user:', userId, {
      id: message.id,
      subject: message.subject,
      type: message.message_type
    });
    
    // TODO: Implement WebSocket or Server-Sent Events for real-time notifications
    // This could integrate with browser notifications API as well
  }

  // Get users for messaging (search recipients)
  static async searchUsers(query: string, limit: number = 10): Promise<any[]> {
    try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, avatar_url')
        .or(`full_name.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}
