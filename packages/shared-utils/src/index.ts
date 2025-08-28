/**
 * @sabo/shared-utils
 * Shared utility functions for SABO Arena
 */

// Date and time utilities
export * from './date';

// Currency and number formatting
export * from './currency';

// String manipulation utilities
export * from './string';

// Validation utilities
export * from './validation';

// Array and object helpers
export * from './helpers';

// SABO Arena specific utilities
export * from './sabo';

// Re-export commonly used functions for convenience
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
  isValidVietnamesePhone,
  truncateString,
  generateSlug,
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
