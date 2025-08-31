/**
 * Achievement Progress & Rewards - Business Logic
 * Phase 2 Expansion Component
 * 
 * Extracted from:
 * - Milestone event triggers and progress tracking
 * - Achievement badge and reward systems
 * - Progress calculation and validation logic
 * - Streak tracking and milestone achievements
 * 
 * Handles:
 * - Achievement progress tracking
 * - Badge and reward calculations
 * - Progress validation and updates
 * - Achievement unlocking logic
 * - Celebration and notification triggers
 */

import { Milestone, PlayerMilestone, MilestoneCompletionResult } from './milestone-system';

// Achievement Progress Types
export interface AchievementProgress {
  achievement_id: string;
  user_id: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: Date;
  last_updated: Date;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlock_condition: string;
  spa_reward: number;
}

export interface AchievementTrigger {
  event_type: string;
  milestone_type: string;
  increment_value: number;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
}

export interface ProgressTrackingEvent {
  user_id: string;
  event_type: 'match_complete' | 'tournament_join' | 'tournament_win' | 'challenge_complete' | 'daily_login' | 'streak_milestone';
  event_data: {
    match_won?: boolean;
    is_perfect?: boolean;
    tournament_id?: string;
    challenge_id?: string;
    streak_count?: number;
    achievement_unlocked?: string;
  };
  timestamp: Date;
}

/**
 * Achievement Progress Service
 * Manages achievement tracking, progress updates, and rewards
 */
export class AchievementProgressService {

  // Achievement Progress Tracking

  /**
   * Track progress for achievement event
   */
  async trackAchievementProgress(
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<MilestoneCompletionResult[]> {
    const results: MilestoneCompletionResult[] = [];
    
    // Get applicable achievement triggers for this event
    const triggers = await this.getTriggersForEvent(eventType);
    
    for (const trigger of triggers) {
      const result = await this.processAchievementTrigger(userId, trigger, eventData);
      if (result.milestone_completed) {
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * Process individual achievement trigger
   */
  async processAchievementTrigger(
    userId: string,
    trigger: AchievementTrigger,
    eventData: Record<string, any>
  ): Promise<MilestoneCompletionResult> {
    // Validate trigger conditions
    if (!this.validateTriggerConditions(trigger, eventData)) {
      return {
        success: false,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
        error: 'Trigger conditions not met',
      };
    }

    // Update milestone progress
    const result = await this.updateMilestoneProgress(
      userId,
      trigger.milestone_type,
      trigger.increment_value
    );

    return result;
  }

  /**
   * Get achievement triggers for event type
   */
  async getTriggersForEvent(eventType: string): Promise<AchievementTrigger[]> {
    // Business logic mapping of events to achievement triggers
    const triggerMap: Record<string, AchievementTrigger[]> = {
      'match_complete': [
        {
          event_type: 'match_complete',
          milestone_type: 'match_count',
          increment_value: 1,
        },
      ],
      'match_won': [
        {
          event_type: 'match_won',
          milestone_type: 'match_win',
          increment_value: 1,
        },
      ],
      'perfect_match': [
        {
          event_type: 'perfect_match',
          milestone_type: 'perfect_match',
          increment_value: 1,
        },
      ],
      'tournament_join': [
        {
          event_type: 'tournament_join',
          milestone_type: 'tournament_participation',
          increment_value: 1,
        },
      ],
      'tournament_win': [
        {
          event_type: 'tournament_win',
          milestone_type: 'tournament_win',
          increment_value: 1,
        },
      ],
      'challenge_complete': [
        {
          event_type: 'challenge_complete',
          milestone_type: 'challenge_completion',
          increment_value: 1,
        },
      ],
      'daily_login': [
        {
          event_type: 'daily_login',
          milestone_type: 'daily_checkin',
          increment_value: 1,
        },
      ],
      'win_streak': [
        {
          event_type: 'win_streak',
          milestone_type: 'win_streak',
          increment_value: 1,
        },
      ],
    };

    return triggerMap[eventType] || [];
  }

  /**
   * Validate trigger conditions
   */
  private validateTriggerConditions(
    trigger: AchievementTrigger,
    eventData: Record<string, any>
  ): boolean {
    // Business logic for validating achievement trigger conditions
    switch (trigger.event_type) {
      case 'match_complete':
        return true; // Always valid for match completion
      
      case 'match_won':
        return eventData.match_won === true;
      
      case 'perfect_match':
        return eventData.is_perfect === true;
      
      case 'tournament_join':
        return !!eventData.tournament_id;
      
      case 'tournament_win':
        return !!eventData.tournament_id && eventData.match_won === true;
      
      case 'challenge_complete':
        return !!eventData.challenge_id;
      
      case 'daily_login':
        return true; // Always valid for login
      
      case 'win_streak':
        return !!eventData.streak_count && eventData.streak_count > 0;
      
      default:
        return false;
    }
  }

  // Achievement Event Handlers

  /**
   * Handle match completion achievement events
   */
  async handleMatchCompletion(
    userId: string,
    matchWon: boolean,
    isPerfect: boolean,
    tournamentId?: string,
    challengeId?: string
  ): Promise<MilestoneCompletionResult[]> {
    const results: MilestoneCompletionResult[] = [];
    
    // Track match completion
    const matchResult = await this.trackAchievementProgress(userId, 'match_complete', {
      match_won: matchWon,
      is_perfect: isPerfect,
      tournament_id: tournamentId,
      challenge_id: challengeId,
    });
    results.push(...matchResult);

    // Track match win if applicable
    if (matchWon) {
      const winResult = await this.trackAchievementProgress(userId, 'match_won', {
        match_won: true,
        tournament_id: tournamentId,
        challenge_id: challengeId,
      });
      results.push(...winResult);
    }

    // Track perfect match if applicable
    if (isPerfect) {
      const perfectResult = await this.trackAchievementProgress(userId, 'perfect_match', {
        is_perfect: true,
        tournament_id: tournamentId,
        challenge_id: challengeId,
      });
      results.push(...perfectResult);
    }

    return results;
  }

  /**
   * Handle tournament participation achievement events
   */
  async handleTournamentJoin(
    userId: string,
    tournamentId: string
  ): Promise<MilestoneCompletionResult[]> {
    return await this.trackAchievementProgress(userId, 'tournament_join', {
      tournament_id: tournamentId,
    });
  }

  /**
   * Handle tournament victory achievement events
   */
  async handleTournamentWin(
    userId: string,
    tournamentId: string
  ): Promise<MilestoneCompletionResult[]> {
    return await this.trackAchievementProgress(userId, 'tournament_win', {
      tournament_id: tournamentId,
      match_won: true,
    });
  }

  /**
   * Handle challenge completion achievement events
   */
  async handleChallengeCompletion(
    userId: string,
    challengeId: string
  ): Promise<MilestoneCompletionResult[]> {
    return await this.trackAchievementProgress(userId, 'challenge_complete', {
      challenge_id: challengeId,
    });
  }

  /**
   * Handle daily login achievement events
   */
  async handleDailyLogin(userId: string): Promise<MilestoneCompletionResult[]> {
    return await this.trackAchievementProgress(userId, 'daily_login', {});
  }

  /**
   * Handle win streak achievement events
   */
  async handleWinStreak(
    userId: string,
    streakCount: number
  ): Promise<MilestoneCompletionResult[]> {
    return await this.trackAchievementProgress(userId, 'win_streak', {
      streak_count: streakCount,
    });
  }

  // Achievement Badges and Rewards

  /**
   * Get available achievement badges
   */
  async getAchievementBadges(): Promise<AchievementBadge[]> {
    // Business logic for available achievement badges
    return [
      {
        id: 'first_win',
        name: 'First Victory',
        description: 'Win your first match',
        icon: '🏆',
        color: '#FFD700',
        rarity: 'common',
        unlock_condition: 'Win 1 match',
        spa_reward: 100,
      },
      {
        id: 'win_streak_5',
        name: 'Hot Streak',
        description: 'Win 5 matches in a row',
        icon: '🔥',
        color: '#FF6B6B',
        rarity: 'uncommon',
        unlock_condition: 'Win 5 consecutive matches',
        spa_reward: 300,
      },
      {
        id: 'tournament_champion',
        name: 'Tournament Champion',
        description: 'Win a tournament',
        icon: '👑',
        color: '#9C88FF',
        rarity: 'rare',
        unlock_condition: 'Win any tournament',
        spa_reward: 1000,
      },
      {
        id: 'perfect_player',
        name: 'Perfect Player',
        description: 'Achieve 10 perfect games',
        icon: '⭐',
        color: '#4ECDC4',
        rarity: 'epic',
        unlock_condition: 'Win 10 perfect games',
        spa_reward: 1500,
      },
      {
        id: 'dedication_master',
        name: 'Dedication Master',
        description: 'Login for 30 consecutive days',
        icon: '💎',
        color: '#FF6B9D',
        rarity: 'legendary',
        unlock_condition: 'Login streak of 30 days',
        spa_reward: 2500,
      },
    ];
  }

  /**
   * Get user's unlocked badges
   */
  async getUserBadges(userId: string): Promise<AchievementBadge[]> {
    const playerMilestones = await this.getPlayerMilestones(userId);
    const allBadges = await this.getAchievementBadges();
    
    // Filter badges based on completed milestones
    return allBadges.filter(badge => {
      return playerMilestones.some(milestone => 
        milestone.is_completed && this.badgeMatchesMilestone(badge, milestone)
      );
    });
  }

  /**
   * Calculate achievement progress percentage
   */
  calculateProgressPercentage(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  /**
   * Get achievement progress summary
   */
  async getAchievementProgressSummary(userId: string): Promise<{
    total_achievements: number;
    unlocked_achievements: number;
    total_spa_earned: number;
    completion_rate: number;
    recent_unlocks: number;
  }> {
    const allBadges = await this.getAchievementBadges();
    const userBadges = await this.getUserBadges(userId);
    
    const totalSpaEarned = userBadges.reduce((sum, badge) => sum + badge.spa_reward, 0);
    
    // Calculate recent unlocks (last 7 days)
    const playerMilestones = await this.getPlayerMilestones(userId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUnlocks = playerMilestones.filter(milestone =>
      milestone.completed_at && new Date(milestone.completed_at) >= sevenDaysAgo
    ).length;

    return {
      total_achievements: allBadges.length,
      unlocked_achievements: userBadges.length,
      total_spa_earned: totalSpaEarned,
      completion_rate: allBadges.length > 0 ? (userBadges.length / allBadges.length) * 100 : 0,
      recent_unlocks: recentUnlocks,
    };
  }

  // Private Helper Methods

  private async updateMilestoneProgress(
    userId: string,
    milestoneType: string,
    increment: number
  ): Promise<MilestoneCompletionResult> {
    // This would delegate to the milestone system service
    // Implementation represents business logic interface
    return {
      success: true,
      milestone_completed: false,
      spa_awarded: 0,
      requires_ranking: false,
      notification_created: false,
    };
  }

  private async getPlayerMilestones(userId: string): Promise<PlayerMilestone[]> {
    // Implementation would fetch from milestone system
    return [];
  }

  private badgeMatchesMilestone(badge: AchievementBadge, milestone: PlayerMilestone): boolean {
    // Business logic for matching badges to milestones
    const badgeToMilestoneMap: Record<string, string> = {
      'first_win': 'match_win',
      'win_streak_5': 'win_streak',
      'tournament_champion': 'tournament_win',
      'perfect_player': 'perfect_match',
      'dedication_master': 'daily_checkin',
    };

    const expectedMilestoneType = badgeToMilestoneMap[badge.id];
    return milestone.milestone?.milestone_type === expectedMilestoneType;
  }
}

/**
 * Centralized Achievement Progress Service Instance
 */
export const achievementProgressService = new AchievementProgressService();
