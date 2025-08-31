/**
 * SPA Points System & Milestone Achievement System Exports
 * Phase 2 Expansion - Critical Components for User Engagement & Gamification
 * 
 * This index file exports all Phase 2 expansion business logic components:
 * 
 * 🎯 SPA Points System:
 * - Core points calculation and activity tracking
 * - Balance management and transaction handling
 * - Tournament prizes and challenge rewards
 * - Leaderboard generation and rankings
 * 
 * 🏆 Milestone & Achievement System:
 * - Milestone progress tracking and completion
 * - Achievement badge and reward systems
 * - Daily/weekly/monthly progress cycles
 * - Streak tracking and bonus calculations
 * 
 * These systems are critical for:
 * - User engagement and retention
 * - Gamification features in mobile app
 * - Prominent display of points and achievements
 * - Reward mechanics and progression systems
 */

// SPA Points System Exports
export * from './spa/spa-system';
export * from './spa/spa-balance';

// Milestone & Achievement System Exports
export * from './milestone/milestone-system';
export * from './milestone/achievement-progress';

// Re-export main service instances for easy access
export { spaSystemService } from './spa/spa-system';
export { spaBalanceService } from './spa/spa-balance';
export { milestoneSystemService } from './milestone/milestone-system';
export { achievementProgressService } from './milestone/achievement-progress';
