// =====================================================
// 🏆 CHALLENGE NOTIFICATION SYSTEM TYPES
// =====================================================

export enum ChallengeNotificationType {
  // Creation & Setup
  CHALLENGE_CREATED = 'challenge_created',
  CHALLENGE_RECEIVED = 'challenge_received',
  CHALLENGE_ACCEPTED = 'challenge_accepted',
  CHALLENGE_DECLINED = 'challenge_declined',
  SCHEDULE_CONFIRMED = 'schedule_confirmed',
  
  // Pre-match
  MATCH_REMINDER_24H = 'match_reminder_24h',
  MATCH_REMINDER_1H = 'match_reminder_1h',
  MATCH_REMINDER_15M = 'match_reminder_15m',
  CHECK_IN_REQUIRED = 'check_in_required',
  OPPONENT_CHECKED_IN = 'opponent_checked_in',
  
  // Match
  MATCH_STARTED = 'match_started',
  SCORE_UPDATED = 'score_updated',
  DISPUTE_RAISED = 'dispute_raised',
  TIMEOUT_CALLED = 'timeout_called',
  
  // Post-match
  RESULT_SUBMITTED = 'result_submitted',
  RESULT_DISPUTED = 'result_disputed',
  RESULT_CONFIRMED = 'result_confirmed',
  CLUB_REVIEW_PENDING = 'club_review_pending',
  CLUB_APPROVED = 'club_approved',
  SPA_POINTS_AWARDED = 'spa_points_awarded',
  ELO_UPDATED = 'elo_updated',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  
  // Social
  MATCH_SHARED = 'match_shared',
  REMATCH_REQUESTED = 'rematch_requested',
  REVIEW_RECEIVED = 'review_received'
}

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChallengeNotification {
  id: string;
  type: ChallengeNotificationType;
  challengeId: string;
  userId: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  icon: string;
  priority: NotificationPriority;
  isRead: boolean;
  isSent: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationData {
  type: ChallengeNotificationType;
  challengeId: string;
  userId: string;
  title: string;
  message: string;
  icon?: string;
  priority?: NotificationPriority;
  actionText?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
}

export interface ScheduleNotificationData extends CreateNotificationData {
  scheduledFor: Date;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  icon: string;
  priority: NotificationPriority;
  actionText?: string;
  actionUrl?: string;
}

export interface NotificationMetadata {
  // Challenge participants
  challengerName?: string;
  challengerId?: string;
  opponentName?: string;
  opponentId?: string;
  
  // Club information
  clubName?: string;
  clubId?: string;
  
  // Match details
  matchTime?: Date;
  matchLocation?: string;
  gameFormat?: string;
  
  // Scoring & rewards
  spaPoints?: number;
  eloChange?: number;
  previousElo?: number;
  newElo?: number;
  
  // Results
  challengerScore?: number;
  opponentScore?: number;
  winner?: string;
  
  // Social
  shareCount?: number;
  likeCount?: number;
  commentCount?: number;
  
  // System
  approvedBy?: string;
  approvedAt?: Date;
  disputeReason?: string;
  
  // Additional context
  [key: string]: any;
}

export interface NotificationStats {
  userId: string;
  totalNotifications: number;
  unreadCount: number;
  urgentCount: number;
  highPriorityCount: number;
  lastNotificationAt: Date | null;
}

export interface NotificationFilters {
  isRead?: boolean;
  priority?: NotificationPriority | NotificationPriority[];
  type?: ChallengeNotificationType | ChallengeNotificationType[];
  challengeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: 'created_at' | 'priority' | 'updated_at';
  orderDirection?: 'asc' | 'desc';
}

export interface NotificationBatch {
  userIds: string[];
  template: NotificationTemplate;
  challengeId: string;
  metadata?: NotificationMetadata;
  scheduledFor?: Date;
}

// Database response types
export interface DatabaseNotification {
  id: string;
  type: string;
  challenge_id: string;
  user_id: string;
  title: string;
  message: string;
  action_text: string | undefined;
  action_url: string | undefined;
  icon: string;
  priority: string;
  is_read: boolean;
  is_sent: boolean;
  scheduled_for: string | undefined;
  sent_at: string | undefined;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Utility types
export type NotificationIcon = 
  | 'bell' | 'trophy' | 'sword' | 'clock' | 'gift' | 'star' | 'shield'
  | 'target' | 'zap' | 'heart' | 'message-circle' | 'users' | 'calendar'
  | 'check-circle' | 'alert-circle' | 'x-circle' | 'info' | 'trending-up'
  | 'award' | 'crown' | 'flame' | 'lightning' | 'sparkles';

export type NotificationAction = 'view' | 'accept' | 'decline' | 'join' | 'prepare' | 'share';

// Event payload types for different notification triggers
export interface ChallengeCreatedPayload {
  challenge: {
    id: string;
    challengerId: string;
    opponentId?: string;
    gameFormat: string;
    scheduledTime?: Date;
  };
  challenger: {
    id: string;
    name: string;
  };
  opponent?: {
    id: string;
    name: string;
  };
}

export interface ChallengeStatusChangedPayload {
  challenge: {
    id: string;
    status: string;
    previousStatus: string;
  };
  participants: {
    challengerId: string;
    opponentId: string;
    challengerName: string;
    opponentName: string;
  };
}

export interface MatchResultPayload {
  challenge: {
    id: string;
    challengerId: string;
    opponentId: string;
  };
  result: {
    challengerScore: number;
    opponentScore: number;
    winnerId: string;
    submittedBy: string;
  };
  rewards?: {
    spaPoints: number;
    eloChange: number;
  };
}

// Real-time subscription types
export interface RealtimeNotificationPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: DatabaseNotification | null;
  old: DatabaseNotification | null;
}
