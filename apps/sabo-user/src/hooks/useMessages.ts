import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageService } from '@/services/messageService';
import { Message, MessageFilters, SendMessageData, MessageStats } from '@/types/message';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMessages = () => {
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
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch inbox messages
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

  // Fetch sent messages
  const fetchSentMessages = useCallback(async (page = 1, append = false) => {
    if (!user?.id) return;
    
    try {
      const data = await MessageService.getSentMessages(user.id, page);
      
      if (append) {
        setSentMessages(prev => [...prev, ...data]);
      } else {
        setSentMessages(data);
      }
    } catch (err) {
      setError('Không thể tải tin đã gửi');
    }
  }, [user?.id]);

  // Fetch archived messages
  const fetchArchivedMessages = useCallback(async (page = 1, append = false) => {
    if (!user?.id) return;
    
    try {
      const data = await MessageService.getInboxMessages(
        user.id, 
        page, 
        20, 
        { status: 'archived' }
      );
      
      if (append) {
        setArchivedMessages(prev => [...prev, ...data]);
      } else {
        setArchivedMessages(data);
      }
    } catch (err) {
      setError('Không thể tải tin đã lưu trữ');
    }
  }, [user?.id]);

  // Fetch deleted messages
  const fetchDeletedMessages = useCallback(async (page = 1, append = false) => {
    if (!user?.id) return;
    
    try {
      const data = await MessageService.getInboxMessages(
        user.id, 
        page, 
        20, 
        { status: 'deleted' }
      );
      
      if (append) {
        setDeletedMessages(prev => [...prev, ...data]);
      } else {
        setDeletedMessages(data);
      }
    } catch (err) {
      setError('Không thể tải thùng rác');
    }
  }, [user?.id]);

  // Send message
  const sendMessage = useCallback(async (messageData: SendMessageData): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const newMessage = await MessageService.sendMessage(messageData);

      if (newMessage) {
        // Add to sent messages list
        setSentMessages(prev => [newMessage, ...prev]);
        
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

  // Archive message
  const archiveMessage = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await MessageService.archiveMessage(messageId);
    
    if (success) {
      // Remove from main messages and add to archived
      const messageToArchive = messages.find(msg => msg.id === messageId);
      if (messageToArchive) {
        const archivedMessage = { ...messageToArchive, status: 'archived' as const };
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setArchivedMessages(prev => [archivedMessage, ...prev]);
        
        if (messageToArchive.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
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
      // Remove from current messages and add to deleted
      const messageToDelete = messages.find(msg => msg.id === messageId);
      if (messageToDelete) {
        const deletedMessage = { ...messageToDelete, status: 'deleted' as const };
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setDeletedMessages(prev => [deletedMessage, ...prev]);
        
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

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('messages')
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
          // Add new message to inbox
          refreshMessages();
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
          // Update message in the list
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, ...payload.new }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshMessages]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchInboxMessages();
      fetchUnreadCount();
      fetchStats();
    }
  }, [user?.id, fetchInboxMessages, fetchUnreadCount, fetchStats]);

  // Memoized filtered messages
  const unreadMessages = useMemo(() => 
    messages.filter(msg => msg.status === 'unread'), 
    [messages]
  );

  const systemMessages = useMemo(() => 
    messages.filter(msg => msg.message_type === 'system'), 
    [messages]
  );

  const directMessages = useMemo(() => 
    messages.filter(msg => msg.message_type === 'direct'), 
    [messages]
  );

  return {
    // Data
    messages,
    sentMessages,
    archivedMessages,
    deletedMessages,
    unreadMessages,
    systemMessages,
    directMessages,
    unreadCount,
    stats,
    
    // State
    isLoading,
    error,
    hasMoreMessages,
    currentPage,
    
    // Actions
    fetchInboxMessages,
    fetchSentMessages,
    fetchArchivedMessages,
    fetchDeletedMessages,
    sendMessage,
    markAsRead,
    markMultipleAsRead,
    archiveMessage,
    deleteMessage,
    searchMessages,
    loadMoreMessages,
    refreshMessages,
    
    // Utils
    clearError: () => setError(null)
  };
};
