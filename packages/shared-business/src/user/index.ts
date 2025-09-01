/**
 * USER BUSINESS LOGIC - INDEX
 * Consolidated user management business logic for mobile development
 */

// Export the main UserService
export { UserService } from './UserService';

// Export all user business logic modules
export * from './user-profile';
export * from './user-auth';
export * from './user-settings';

// Re-export main service classes for convenience
export { UserProfileService } from './user-profile';
export { UserAuthService } from './user-auth';
export { UserSettingsManager } from './user-settings';

// Export commonly used types
export type {
  UserProfile,
  UserProfileStats,
  ProfileUpdateData,
  ProfileValidationResult,
} from './user-profile';

export type {
  AuthUser,
  AuthSession,
  SignUpData,
  SignInData,
  AuthResult,
} from './user-auth';

export type {
  UserSettings,
  NotificationSettings,
  PrivacySettings,
} from './user-settings';
