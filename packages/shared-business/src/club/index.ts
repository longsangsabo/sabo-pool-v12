/**
 * CLUB BUSINESS LOGIC - INDEX
 * Consolidated club management business logic for mobile development
 */

// Export all club business logic modules
export * from './club-management';
export * from './club-verification';

// Re-export main service classes for convenience
export { ClubManagementService } from './club-management';
export { ClubVerificationService } from './club-verification';

// Export commonly used types
export type {
  Club,
  ClubMember,
  ClubStats,
  ClubSettings,
  MembershipData,
} from './club-management';

export type {
  ClubVerificationRequest,
  VerificationDocument,
  VerificationProgress,
  VerificationCriteria,
} from './club-verification';
