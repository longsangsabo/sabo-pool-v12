// Message System Types
export interface Message {
  id: string;
  sender_id: string | undefined; // null for system messages
  recipient_id: string;
  thread_id?: string;
  subject?: string;
  content: string;
  message_type: 'direct' | 'system' | 'tournament' | 'announcement';
  status: 'unread' | 'read' | 'archived' | 'deleted';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: {
    tournament_id?: string;
    match_id?: string;
    attachment_urls?: string[];
    [key: string]: any;
  };
  created_at: string;
  read_at?: string;
  updated_at: string;
  
  // Populated fields from joins
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    display_name?: string;
  };
  recipient?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    display_name?: string;
  };
}

export interface MessageThread {
  id: string;
  title?: string;
  is_group: boolean;
  created_by: string;
  last_message_id?: string;
  last_activity: string;
  created_at: string;
  
  // Populated fields
  participants?: ThreadParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ThreadParticipant {
  id: string;
  thread_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  role: 'admin' | 'moderator' | 'member';
  
  // Populated user info
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    display_name?: string;
  };
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  tournament_updates: boolean;
  direct_messages: boolean;
  system_announcements: boolean;
  match_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageFilters {
  type?: 'direct' | 'system' | 'tournament' | 'announcement';
  status?: 'unread' | 'read' | 'archived' | 'deleted';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
}

export interface SendMessageData {
  recipient_id: string;
  subject?: string;
  content: string;
  message_type?: 'direct' | 'tournament' | 'announcement';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  thread_id?: string;
}

export interface MessageStats {
  total_messages: number;
  unread_count: number;
  sent_count: number;
  archived_count: number;
  system_messages: number;
}
