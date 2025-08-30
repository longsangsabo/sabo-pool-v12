/**
 * @sabo/shared-utils
 * Shared utility functions for SABO Arena
 */

// Phone utilities
export * from './phone';

// Date and time utilities
export * from './date';

// Currency and number formatting
export * from './currency';

// String manipulation utilities
export * from './string';

// Validation utilities
export * from './validation';

// Ranking system utilities
export * from './ranking';

// Trust score utilities
export * from './trust-score';

// Scroll preservation utilities
export * from './scroll-preservation';

// Club role utilities
export * from './club-role';

// Authentication utilities
export * from './auth';

// Prize and tournament utilities
export * from './prize';

// ELO rank conversion utilities  
export * from './elo-to-sabo-rank';

// Tournament utilities
export * from './tournament';

// Array and object helpers
export * from './helpers';

// SABO Arena specific utilities
// export * from './sabo';

// Re-export commonly used functions for convenience
export {
  formatPhoneToE164,
  maskPhone,
} from './phone';

export {
  formatCurrency,
  formatPrice,
  formatPrizeAmount,
} from './currency';

export {
  formatDate,
  formatTime,
  formatDateTime,
  formatVietnamTime,
  formatRelativeTime,
} from './date';

export {
  getDisplayName,
  isValidEmail,
  truncateString,
  generateSlug,
  sanitizeInput,
  sanitizeHtml,
} from './string';

export {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
} from './validation';

export {
  groupBy,
  sortBy,
  unique,
  pick,
  omit,
  debounce,
  throttle,
} from './helpers';

export {
  calculateRank,
  calculateEloChange,
  formatTournamentStatus,
  calculateTournamentProgress,
  generateBracketSeeding,
  calculateRentalCost,
  isTimeSlotAvailable,
  generateRoundRobinSchedule,
  formatMatchResult,
} from './sabo';
