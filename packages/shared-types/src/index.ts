/**
 * @sabo/shared-types
 * Shared TypeScript interfaces and types for SABO Arena
 */

// Core user and authentication types
export * from './user';

// Game-related types (tournaments, challenges, clubs)
export * from './game';

// Common utility types and interfaces
export * from './common';

// Re-export commonly used types for convenience
export type {
  User,
  Session,
  UnifiedProfile,
  PublicProfile,
} from './user';

export type {
  Tournament,
  Challenge,
  Club,
  TournamentType,
  GameFormat,
  TournamentStatus,
  ChallengeStatus,
  ClubStatus,
} from './game';

export type {
  ApiResponse,
  PaginatedResponse,
  Notification,
  NotificationType,
  Theme,
  Language,
  AsyncState,
  LoadingState,
  FormError,
  ValidationResult,
} from './common';
