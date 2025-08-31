/**
 * WEBSOCKET SERVICE
 * 
 * Mobile-Ready Real-time Communication Service
 * Handles WebSocket connections, real-time updates, and offline resilience
 * 
 * Core Features:
 * - Real-time tournament updates
 * - Live match scoring
 * - Chat and messaging
 * - Mobile-optimized reconnection
 * - Offline message queuing
 */

// Types
export interface WebSocketMessage {
  id: string;
  type: 'tournament_update' | 'match_update' | 'chat_message' | 'notification' | 'system';
  channel: string;
  payload: any;
  timestamp: number;
  sender_id?: string;
  requires_ack?: boolean;
}

export interface WebSocketSubscription {
  id: string;
  channel: string;
  callback: (message: WebSocketMessage) => void;
  filter?: (message: WebSocketMessage) => boolean;
}

export interface ConnectionConfig {
  url: string;
  protocols?: string[];
  reconnect_enabled: boolean;
  reconnect_interval: number;
  max_reconnect_attempts: number;
  heartbeat_interval: number;
  message_timeout: number;
  queue_size_limit: number;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed';
  connected_at?: Date;
  last_heartbeat?: Date;
  reconnect_attempts: number;
  message_queue_size: number;
  latency?: number;
}

/**
 * WEBSOCKET SERVICE
 * 
 * Handles all real-time communication:
 * - Tournament live updates
 * - Match scoring in real-time
 * - Chat and messaging
 * - System notifications
 * - Mobile-optimized connection management
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private config: ConnectionConfig;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private pendingAcks: Map<string, { message: WebSocketMessage; timeout: NodeJS.Timeout }> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.connectionState = {
      status: 'disconnected',
      reconnect_attempts: 0,
      message_queue_size: 0
    };
    this.setupMobileOptimizations();
  }

  // ===== CONNECTION MANAGEMENT =====

  /**
   * Connect to WebSocket server
   * Mobile-optimized connection with retry logic
   */
  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.updateConnectionState({ status: 'connecting' });
      
      this.socket = new WebSocket(this.config.url, this.config.protocols);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      // Set connection timeout
      setTimeout(() => {
        if (this.socket?.readyState === WebSocket.CONNECTING) {
          this.socket.close();
          this.handleConnectionTimeout();
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      this.updateConnectionState({ status: 'failed' });
      throw new Error(`WebSocket connection failed: ${error.message}`);
    }
  }

  /**
   * Disconnect from WebSocket server
   * Mobile-safe disconnection
   */
  disconnect(): void {
    this.config.reconnect_enabled = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }

    this.updateConnectionState({ status: 'disconnected' });
  }

  /**
   * Get current connection state
   * Mobile-friendly status monitoring
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // ===== MESSAGE HANDLING =====

  /**
   * Send message via WebSocket
   * Mobile-optimized with queuing and retry
   */
  async sendMessage(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now()
    };

    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(fullMessage));
        
        // Handle acknowledgment if required
        if (fullMessage.requires_ack) {
          await this.waitForAcknowledgment(fullMessage);
        }
      } catch (error) {
        // Add to queue if send fails
        this.queueMessage(fullMessage);
        throw new Error(`Failed to send message: ${error.message}`);
      }
    } else {
      // Queue message for later sending
      this.queueMessage(fullMessage);
    }
  }

  /**
   * Subscribe to channel updates
   * Mobile-optimized subscription management
   */
  subscribe(
    channel: string, 
    callback: (message: WebSocketMessage) => void,
    filter?: (message: WebSocketMessage) => boolean
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      channel,
      callback,
      filter
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription message if connected
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'system',
        channel: 'subscriptions',
        payload: {
          action: 'subscribe',
          channel: channel
        }
      });
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from channel
   * Mobile-safe unsubscription
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      this.subscriptions.delete(subscriptionId);

      // Send unsubscription message if connected
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'system',
          channel: 'subscriptions',
          payload: {
            action: 'unsubscribe',
            channel: subscription.channel
          }
        });
      }
    }
  }

  // ===== REAL-TIME FEATURES =====

  /**
   * Join tournament channel
   * Mobile-optimized tournament updates
   */
  joinTournament(tournamentId: string, callback: (update: any) => void): string {
    return this.subscribe(
      `tournament:${tournamentId}`,
      (message) => {
        if (message.type === 'tournament_update') {
          callback(message.payload);
        }
      }
    );
  }

  /**
   * Join match channel
   * Mobile-optimized live match updates
   */
  joinMatch(matchId: string, callback: (update: any) => void): string {
    return this.subscribe(
      `match:${matchId}`,
      (message) => {
        if (message.type === 'match_update') {
          callback(message.payload);
        }
      }
    );
  }

  /**
   * Send match score update
   * Mobile-optimized scoring
   */
  async updateMatchScore(matchId: string, scoreUpdate: any): Promise<void> {
    await this.sendMessage({
      type: 'match_update',
      channel: `match:${matchId}`,
      payload: {
        action: 'score_update',
        ...scoreUpdate
      },
      requires_ack: true
    });
  }

  /**
   * Join chat channel
   * Mobile-optimized chat functionality
   */
  joinChat(chatId: string, callback: (message: any) => void): string {
    return this.subscribe(
      `chat:${chatId}`,
      (message) => {
        if (message.type === 'chat_message') {
          callback(message.payload);
        }
      }
    );
  }

  /**
   * Send chat message
   * Mobile-optimized messaging
   */
  async sendChatMessage(chatId: string, messageText: string, metadata?: any): Promise<void> {
    await this.sendMessage({
      type: 'chat_message',
      channel: `chat:${chatId}`,
      payload: {
        text: messageText,
        metadata,
        timestamp: Date.now()
      }
    });
  }

  // ===== EVENT LISTENERS =====

  /**
   * Add event listener
   * Mobile-friendly event handling
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   * Mobile-safe event cleanup
   */
  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // ===== OFFLINE SUPPORT =====

  /**
   * Process queued messages
   * Mobile-optimized queue processing
   */
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      try {
        await this.sendMessage(message);
      } catch (error) {
        // Re-queue failed messages (with limit)
        if (this.messageQueue.length < this.config.queue_size_limit) {
          this.messageQueue.push(message);
        }
      }
    }

    this.updateConnectionState({ 
      message_queue_size: this.messageQueue.length 
    });
  }

  /**
   * Queue message for later sending
   * Mobile-optimized message queuing
   */
  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.config.queue_size_limit) {
      // Remove oldest message to make room
      this.messageQueue.shift();
    }

    this.messageQueue.push(message);
    this.updateConnectionState({ 
      message_queue_size: this.messageQueue.length 
    });
  }

  // ===== PRIVATE HELPER METHODS =====

  private handleOpen(): void {
    this.updateConnectionState({
      status: 'connected',
      connected_at: new Date(),
      reconnect_attempts: 0
    });

    this.startHeartbeat();
    this.processMessageQueue();
    this.resubscribeChannels();
    this.emit('connected');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Update latency if heartbeat response
      if (message.type === 'system' && message.payload?.pong) {
        this.updateLatency(message.timestamp);
        return;
      }

      // Handle acknowledgments
      if (message.type === 'system' && message.payload?.ack) {
        this.handleAcknowledgment(message.payload.ack);
        return;
      }

      // Route message to subscribers
      this.routeMessage(message);
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.updateConnectionState({ status: 'disconnected' });
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Attempt reconnection if enabled
    if (this.config.reconnect_enabled && event.code !== 1000) {
      this.attemptReconnection();
    }

    this.emit('disconnected', { code: event.code, reason: event.reason });
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private handleConnectionTimeout(): void {
    this.updateConnectionState({ status: 'failed' });
    this.emit('timeout');
  }

  private attemptReconnection(): void {
    if (this.connectionState.reconnect_attempts >= this.config.max_reconnect_attempts) {
      this.updateConnectionState({ status: 'failed' });
      this.emit('reconnect_failed');
      return;
    }

    this.updateConnectionState({ 
      status: 'reconnecting',
      reconnect_attempts: this.connectionState.reconnect_attempts + 1
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        this.attemptReconnection();
      });
    }, this.config.reconnect_interval * this.connectionState.reconnect_attempts);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'system',
          channel: 'heartbeat',
          payload: { ping: Date.now() }
        });
      }
    }, this.config.heartbeat_interval);
  }

  private routeMessage(message: WebSocketMessage): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.channel === message.channel || 
          subscription.channel === '*' || 
          message.channel.startsWith(subscription.channel.replace('*', ''))) {
        
        if (!subscription.filter || subscription.filter(message)) {
          try {
            subscription.callback(message);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        }
      }
    });
  }

  private resubscribeChannels(): void {
    const channels = new Set<string>();
    this.subscriptions.forEach(sub => channels.add(sub.channel));
    
    channels.forEach(channel => {
      this.sendMessage({
        type: 'system',
        channel: 'subscriptions',
        payload: {
          action: 'subscribe',
          channel: channel
        }
      });
    });
  }

  private async waitForAcknowledgment(message: WebSocketMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAcks.delete(message.id);
        reject(new Error('Message acknowledgment timeout'));
      }, this.config.message_timeout);

      this.pendingAcks.set(message.id, { message, timeout });
    });
  }

  private handleAcknowledgment(messageId: string): void {
    const pending = this.pendingAcks.get(messageId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingAcks.delete(messageId);
    }
  }

  private updateLatency(pongTimestamp: number): void {
    const latency = Date.now() - pongTimestamp;
    this.updateConnectionState({ 
      latency,
      last_heartbeat: new Date()
    });
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.emit('state_change', this.connectionState);
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  private generateMessageId(): string {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateSubscriptionId(): string {
    return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private setupMobileOptimizations(): void {
    // Mobile-specific optimizations
    
    // Handle app state changes (iOS/Android)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // App went to background - reduce heartbeat frequency
          if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => {
              if (this.socket?.readyState === WebSocket.OPEN) {
                this.sendMessage({
                  type: 'system',
                  channel: 'heartbeat',
                  payload: { ping: Date.now() }
                });
              }
            }, this.config.heartbeat_interval * 3); // 3x slower
          }
        } else {
          // App came to foreground - restore normal heartbeat
          this.startHeartbeat();
        }
      });
    }

    // Handle network connectivity changes
    if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
      window.addEventListener('online', () => {
        if (this.connectionState.status === 'disconnected') {
          this.connect();
        }
      });

      window.addEventListener('offline', () => {
        this.updateConnectionState({ status: 'disconnected' });
      });
    }
  }
}

// Export for mobile app consumption
export default WebSocketService;
