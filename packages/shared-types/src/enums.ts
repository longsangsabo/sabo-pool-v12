// SABO Pool V12 - Database Enum Types
// Auto-generated from database schema

export const UserRoles = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  CLUB_OWNER: 'club_owner',
  MODERATOR: 'moderator'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export const ChallengeStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type ChallengeStatusType = typeof ChallengeStatus[keyof typeof ChallengeStatus];

export const TournamentStatus = {
  UPCOMING: 'upcoming',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TournamentStatusType = typeof TournamentStatus[keyof typeof TournamentStatus];

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export const WalletTransactionType = {
  CREDIT: 'credit',
  DEBIT: 'debit'
} as const;

export type WalletTransactionTypeEnum = typeof WalletTransactionType[keyof typeof WalletTransactionType];

export const NotificationType = {
  CHALLENGE_RECEIVED: 'challenge_received',
  CHALLENGE_ACCEPTED: 'challenge_accepted',
  CHALLENGE_DECLINED: 'challenge_declined',
  TOURNAMENT_REGISTRATION: 'tournament_registration',
  MATCH_SCHEDULED: 'match_scheduled',
  MATCH_RESULT: 'match_result',
  RANK_UPDATED: 'rank_updated',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  ADMIN_MESSAGE: 'admin_message'
} as const;

export type NotificationTypeEnum = typeof NotificationType[keyof typeof NotificationType];

export const SkillLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  PROFESSIONAL: 'professional'
} as const;

export type SkillLevelType = typeof SkillLevel[keyof typeof SkillLevel];

export const BanStatus = {
  ACTIVE: 'active',
  BANNED: 'banned',
  SUSPENDED: 'suspended'
} as const;

export type BanStatusType = typeof BanStatus[keyof typeof BanStatus];
