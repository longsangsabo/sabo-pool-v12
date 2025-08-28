/**
 * @sabo/shared-types
 * Comprehensive TypeScript interfaces and types for SABO Arena
 * 
 * Consolidated and optimized type definitions for:
 * - User authentication and profiles
 * - Game mechanics (tournaments, challenges, clubs)
 * - Common utilities and API responses
 */

// ===== CORE EXPORTS =====

// User and authentication types
export * from './user';

// Game-related types (tournaments, challenges, clubs)
export * from './game';

// Common utility types and interfaces
export * from './common';

// ===== CONVENIENCE RE-EXPORTS =====

// User types
export type {
  User,
  Session,
  UserRole,
  AuthState,
  AuthResponse,
  SignInCredentials,
  SignUpCredentials,
  UnifiedProfile,
  PublicProfile,
  PlayerStats,
  SkillLevel,
} from './user';

// Game types
export type {
  Tournament,
  TournamentStatus,
  TournamentType,
  TournamentRegistration,
  TournamentMatch,
  Challenge,
  ChallengeStatus,
  Club,
  ClubStatus,
  GameFormat,
  MatchStatus,
} from './game';

// Common types
export type {
  ApiResponse,
  PaginatedResponse,
  DatabaseRow,
  FilterOptions,
  PaginationOptions,
  Notification,
  NotificationType,
  Theme,
  Language,
  AsyncState,
  LoadingState,
  FormError,
  ValidationResult,
} from './common';
