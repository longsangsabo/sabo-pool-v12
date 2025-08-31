/**
 * 📂 CHALLENGE SYSTEM - INDEX
 * Exports all challenge-related business logic functions and types
 */

export * from './challenge-system';

// Re-export main interfaces for convenience
export type {
  Challenge,
  ChallengeUserProfile,
  CreateChallengeData,
  ChallengeStats,
  ChallengeFilters,
} from './challenge-system';

export { ChallengeService } from './challenge-system';

// Export constants
export { RACE_TO_TABLE, HANDICAP_TABLE } from './challenge-system';
