import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { MessageService } from '@/services/messageService';
import { Message, MessageFilters, SendMessageData, MessageStats } from '@/types/message';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
// Removed supabase import - migrated to services
import { useChallengeNotifications } from '@/hooks/useChallengeNotifications';

// Enhanced unified message system với notification features
export const useUnifiedMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<Message[]>([]);
  const [deletedMessages, setDeletedMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<MessageStats>({
    total_messages: 0,
    unread_count: 0,
    sent_count: 0,
    archived_count: 0,
    system_messages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // New notification-like features
  const [isConnected, setIsConnected] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Message[]>([]);
  const [urgentMessages, setUrgentMessages] = useState<Message[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // 🔔 CHALLENGE NOTIFICATIONS: Integrate challenge notification system
  const {
    notifications: challengeNotifications,
    unreadCount: challengeUnreadCount,
    loading: challengeLoading,
    markAsRead: markChallengeAsRead,
    markAllAsRead: markAllChallengeAsRead,
  } = useChallengeNotifications();

  // Fetch inbox messages với enhanced filtering
  const fetchInboxMessages = useCallback(async (
    page = 1, 
    filters?: MessageFilters,
    append = false
  ) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await MessageService.getInboxMessages(user.id, page, 20, filters);
      
      if (append) {
        setMessages(prev => [...prev, ...data]);
      } else {
        setMessages(data);
      }
      
      setHasMoreMessages(data.length === 20);
      setCurrentPage(page);
    } catch (err) {
      const errorMsg = 'Không thể tải tin nhắn';
      setError(errorMsg);
      toast({
        title: "Lỗi",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  // Enhanced send message with notification features
  const sendMessage = useCallback(async (messageData: SendMessageData & {
    channels?: ('in_app' | 'email' | 'sms' | 'push')[];
    template_key?: string;
    variables?: Record<string, string>;
    scheduled_at?: string;
    auto_popup?: boolean;
  }): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const newMessage = await MessageService.sendMessage(messageData);

      if (newMessage) {
        // Add to sent messages list
        setSentMessages(prev => [newMessage, ...prev]);
        
        // If high priority, show toast notification
        if (messageData.priority === 'high' || messageData.priority === 'urgent') {
          toast({
            title: messageData.subject || "Tin nhắn quan trọng",
            description: "Đã gửi tin nhắn ưu tiên cao",
          });
        }

        // If urgent, add to recent notifications for dropdown
        if (messageData.priority === 'urgent') {
          setRecentNotifications(prev => [newMessage, ...prev.slice(0, 4)]);
        }
        
        toast({
          title: "Thành công",
          description: "Đã gửi tin nhắn thành công"
        });
        return true;
      }
      return false;
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  // Send system message with notification features
  const sendSystemMessage = useCallback(async (
    recipientId: string,
    subject: string,
    content: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    metadata?: any,
    options?: {
      auto_popup?: boolean;
      channels?: ('in_app' | 'email' | 'push')[];
      template_key?: string;
    }
  ): Promise<boolean> => {
    try {
      const messageId = await MessageService.sendSystemMessage(
        recipientId,
        subject,
        content,
        { ...metadata, priority, ...options }
      );

      if (messageId) {
        // If urgent priority, show real-time toast
        if (priority === 'urgent' && options?.auto_popup) {
          toast({
            title: subject,
            description: content,
            variant: priority === 'urgent' ? 'destructive' : 'default',
          });
        }

        return true;
      }
      return false;
    } catch (err) {
      console.error('Error sending system message:', err);
      return false;
    }
  }, [toast]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await MessageService.markAsRead(messageId);
    
    if (success) {
      const updateMessage = (msg: Message) => 
        msg.id === messageId 
          ? { ...msg, status: 'read' as const, read_at: new Date().toISOString() }
          : msg;

      setMessages(prev => prev.map(updateMessage));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - 1)
      }));
      
      return true;
    }
    return false;
  }, []);

  // Mark multiple messages as read
  const markMultipleAsRead = useCallback(async (messageIds: string[]): Promise<boolean> => {
    const success = await MessageService.markMultipleAsRead(messageIds);
    
    if (success) {
      const updateMessage = (msg: Message) => 
        messageIds.includes(msg.id)
          ? { ...msg, status: 'read' as const, read_at: new Date().toISOString() }
          : msg;

      setMessages(prev => prev.map(updateMessage));
      
      // Count how many were actually unread
      const unreadToMark = messages.filter(msg => 
        messageIds.includes(msg.id) && msg.status === 'unread'
      ).length;
      
      setUnreadCount(prev => Math.max(0, prev - unreadToMark));
      setStats(prev => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - unreadToMark)
      }));
      
      toast({
        title: "Thành công",
        description: `Đã đánh dấu ${messageIds.length} tin nhắn là đã đọc`
      });
      
      return true;
    }
    return false;
  }, [messages, toast]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const count = await MessageService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user?.id]);

  // Fetch message statistics
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const messageStats = await MessageService.getMessageStats(user.id);
      setStats(messageStats);
      setUnreadCount(messageStats.unread_count);
    } catch (err) {
      console.error('Failed to fetch message stats:', err);
    }
  }, [user?.id]);

  // Archive message
  const archiveMessage = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await MessageService.archiveMessage(messageId);
    
    if (success) {
      // Remove from main messages and add to archived
      const messageToArchive = messages.find(msg => msg.id === messageId);
      if (messageToArchive) {
        const archivedMessage = { ...messageToArchive, status: 'archived' as const };
        setArchivedMessages(prev => [archivedMessage, ...prev]);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
      
      toast({
        title: "Thành công",
        description: "Đã lưu trữ tin nhắn"
      });
      
      return true;
    }
    return false;
  }, [messages, toast]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await MessageService.deleteMessage(messageId);
    
    if (success) {
      // Remove from main messages and add to deleted
      const messageToDelete = messages.find(msg => msg.id === messageId);
      if (messageToDelete) {
        const deletedMessage = { ...messageToDelete, status: 'deleted' as const };
        setDeletedMessages(prev => [deletedMessage, ...prev]);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // If it was unread, decrease counter
        if (messageToDelete.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      
      toast({
        title: "Thành công",
        description: "Đã xóa tin nhắn"
      });
      
      return true;
    }
    return false;
  }, [messages, toast]);

  // Subscribe to real-time message updates với connection status
  useEffect(() => {
    if (!user?.id) return;

//     const channel = supabase
      .channel('unified_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          // Add to messages
          setMessages(prev => [newMessage, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // If urgent, add to recent notifications and show toast
          if (newMessage.priority === 'urgent') {
            setRecentNotifications(prev => [newMessage, ...prev.slice(0, 4)]);
            
            toast({
              title: newMessage.subject || "Tin nhắn khẩn cấp",
              description: newMessage.content,
              variant: "destructive",
            });
          } else if (newMessage.priority === 'high') {
            toast({
              title: newMessage.subject || "Tin nhắn mới",
              description: newMessage.content,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, ...payload.new }
                : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('Unified messages subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      // removeChannel(channel);
      setIsConnected(false);
    };
  }, [user?.id, toast]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchInboxMessages();
      fetchUnreadCount();
      fetchStats();
    }
  }, [user?.id, fetchInboxMessages, fetchUnreadCount, fetchStats]);

  // Memoized filtered messages với notification categories
  // 🔔 MERGE: Challenge notifications with messages
  const unreadMessages = useMemo(() => {
    const messageUnread = messages.filter(msg => msg.status === 'unread');
    const challengeUnread = challengeNotifications.filter(notif => !notif.isRead);
    return [...messageUnread, ...challengeUnread];
  }, [messages, challengeNotifications]);

  const systemMessages = useMemo(() => 
    messages.filter(msg => msg.message_type === 'system'), 
    [messages]
  );

  const directMessages = useMemo(() => 
    messages.filter(msg => msg.message_type === 'direct'), 
    [messages]
  );

  const urgentUnreadMessages = useMemo(() => {
    const messageUrgent = messages.filter(msg => msg.status === 'unread' && msg.priority === 'urgent');
    const challengeUrgent = challengeNotifications.filter(notif => !notif.isRead && notif.priority === 'urgent');
    return [...messageUrgent, ...challengeUrgent];
  }, [messages, challengeNotifications]);

  const highPriorityMessages = useMemo(() => {
    const messageHighPri = messages.filter(msg => 
      msg.status === 'unread' && 
      (msg.priority === 'high' || msg.priority === 'urgent')
    );
    const challengeHighPri = challengeNotifications.filter(notif => 
      !notif.isRead && 
      (notif.priority === 'high' || notif.priority === 'urgent')
    );
    return [...messageHighPri, ...challengeHighPri];
  }, [messages, challengeNotifications]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !isLoading) {
      fetchInboxMessages(currentPage + 1, undefined, true);
    }
  }, [hasMoreMessages, isLoading, currentPage, fetchInboxMessages]);

  // Refresh all messages
  const refreshMessages = useCallback(() => {
    if (user?.id) {
      fetchInboxMessages(1);
      fetchUnreadCount();
      fetchStats();
    }
  }, [user?.id, fetchInboxMessages, fetchUnreadCount, fetchStats]);

  // Search messages
  const searchMessages = useCallback(async (
    query: string, 
    filters?: MessageFilters
  ): Promise<Message[]> => {
    if (!user?.id) return [];
    
    try {
      return await MessageService.searchMessages(user.id, query, filters);
    } catch (err) {
      setError('Không thể tìm kiếm tin nhắn');
      return [];
    }
  }, [user?.id]);

  return {
    // Original message data
    messages,
    sentMessages,
    archivedMessages,
    deletedMessages,
    unreadCount: unreadCount + challengeUnreadCount, // 🔔 MERGE: Combined unread count
    stats,
    
    // Enhanced categorized messages
    unreadMessages,
    systemMessages,
    directMessages,
    urgentUnreadMessages,
    highPriorityMessages,
    recentNotifications: [...recentNotifications, ...challengeNotifications.slice(0, 5)], // 🔔 MERGE: Recent notifications
    
    // State
    isLoading: isLoading || challengeLoading, // 🔔 MERGE: Combined loading state
    error,
    isConnected, // Real-time connection status
    hasMoreMessages,
    currentPage,
    
    // Original actions
    sendMessage, // Enhanced với notification features
    sendSystemMessage, // New enhanced version
    markAsRead,
    markMultipleAsRead,
    archiveMessage,
    deleteMessage,
    
    // Utility actions
    fetchInboxMessages,
    fetchUnreadCount,
    fetchStats,
    refreshMessages,
    loadMoreMessages,
    searchMessages
  };
};
