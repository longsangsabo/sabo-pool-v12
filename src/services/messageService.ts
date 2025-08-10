import { supabase } from '@/integrations/supabase/client';
import { 
  Message, 
  MessageThread, 
  NotificationSettings, 
  MessageFilters, 
  SendMessageData,
  MessageStats 
} from '@/types/message';

export class MessageService {
  
  // Send a new message
  static async sendMessage(messageData: SendMessageData): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          ...messageData
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
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(user_id, full_name, avatar_url, display_name),
          recipient:profiles!messages_recipient_id_fkey(user_id, full_name, avatar_url, display_name)
        `)
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

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
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
    try {
      const { data, error } = await supabase
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
    try {
      const { data, error } = await supabase
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
    try {
      const { error } = await supabase
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
    try {
      const { error } = await supabase
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
    try {
      const { error } = await supabase
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
    try {
      const { error } = await supabase
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
    try {
      const { data, error } = await supabase
        .rpc('get_unread_message_count', { user_uuid: userId });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get message statistics
  static async getMessageStats(userId: string): Promise<MessageStats> {
    try {
      const [total, unread, sent, archived, system] = await Promise.all([
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('status', 'unread'),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('status', 'archived'),
        supabase
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

  // Send system message
  static async sendSystemMessage(
    recipientId: string, 
    subject: string, 
    content: string, 
    metadata?: any
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('send_system_message', {
          recipient_uuid: recipientId,
          message_subject: subject,
          message_content: content,
          message_metadata: metadata || {}
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending system message:', error);
      return null;
    }
  }

  // Search messages
  static async searchMessages(
    userId: string, 
    query: string, 
    filters?: MessageFilters
  ): Promise<Message[]> {
    try {
      let supabaseQuery = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(user_id, full_name, avatar_url, display_name),
          recipient:profiles!messages_recipient_id_fkey(user_id, full_name, avatar_url, display_name)
        `)
        .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
        .or(`subject.ilike.%${query}%,content.ilike.%${query}%`);

      if (filters?.type) {
        supabaseQuery = supabaseQuery.eq('message_type', filters.type);
      }

      if (filters?.status && filters.status !== 'deleted') {
        supabaseQuery = supabaseQuery.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        supabaseQuery = supabaseQuery.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        supabaseQuery = supabaseQuery.lte('created_at', filters.dateTo);
      }

      const { data, error } = await supabaseQuery
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
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
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
    try {
      const { error } = await supabase
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
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .insert([{
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          tournament_updates: true,
          direct_messages: true,
          system_announcements: true,
          match_reminders: true
        }])
        .select()
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
      const { data, error } = await supabase
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
