/**
 * Milestone & Achievement System - Business Logic
 * Phase 2 Expansion Component
 * 
 * Consolidated from:
 * - apps/sabo-user/src/services/milestoneService.ts (350+ lines)
 * - MilestonePage, MilestoneDetailPage, MilestoneProgress components
 * - useMilestones hook and milestone events
 * - Database milestone functions and triggers
 * 
 * Handles:
 * - Milestone progress tracking and awards
 * - Achievement system business logic
 * - Progress calculation and validation
 * - Notification creation for completions
 * - Daily/weekly/monthly milestone cycles
 * - Streak tracking and bonuses
 * - SPA reward integration
 */

// Core Milestone Types
export interface Milestone {
  id: string;
  name: string;
  description: string;
  category: 'progress' | 'achievement' | 'social' | 'repeatable';
  milestone_type: string;
  requirement_value: number;
  spa_reward: number;
  badge_name?: string;
  badge_icon?: string;
  badge_color: string;
  is_repeatable: boolean;
  daily_limit?: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface PlayerMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  times_completed: number;
  last_daily_completion?: string;
  last_progress_update?: string;
  milestone?: Milestone;
}

export interface MilestoneStats {
  total_milestones: number;
  completed_milestones: number;
  total_spa_earned: number;
  completion_rate: number;
  recent_completions: number;
  active_streaks: number;
}

export interface MilestoneProgressUpdate {
  milestone_id: string;
  milestone_type: string;
  progress_increment: number;
  current_value?: number;
  reference_id?: string;
  reference_type?: string;
}

export interface MilestoneCompletionResult {
  success: boolean;
  milestone_completed: boolean;
  spa_awarded: number;
  requires_ranking: boolean;
  notification_created: boolean;
  error?: string;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  daily_checkin: boolean;
  matches_played: number;
  matches_won: number;
  tournaments_joined: number;
  challenges_completed: number;
  spa_earned: number;
  created_at: Date;
  updated_at: Date;
}

export interface LoginStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_login_date: string;
  weekly_logins: number;
  week_start_date: string;
  milestone_30_claimed: boolean;
  milestone_60_claimed: boolean;
  milestone_90_claimed: boolean;
}

/**
 * Core Milestone System Service
 * Manages milestone progress, achievements, and rewards
 */
export class MilestoneSystemService {

  // Milestone Data Management

  /**
   * Get milestones by category
   */
  async getMilestonesByCategory(category: Milestone['category']): Promise<Milestone[]> {
    // Implementation would fetch from milestones table
    // Business logic structure for milestone categorization
    const milestones: Milestone[] = [];
    
    // Filter by category and sort by order
    return milestones
      .filter(m => m.category === category && m.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Get all active milestones
   */
  async getActiveMilestones(): Promise<Milestone[]> {
    // Implementation would fetch from milestones table
    return [];
  }

  /**
   * Get milestone by type
   */
  async getMilestoneByType(milestoneType: string): Promise<Milestone | null> {
    // Implementation would fetch from milestones table
    return null;
  }

  // Player Progress Management

  /**
   * Get player milestone progress
   */
  async getPlayerMilestoneProgress(playerId: string): Promise<PlayerMilestone[]> {
    // Implementation would fetch from player_milestones with milestone details
    return [];
  }

  /**
   * Initialize milestones for new player
   */
  async initializePlayerMilestones(playerId: string): Promise<void> {
    const activeMilestones = await this.getActiveMilestones();
    
    for (const milestone of activeMilestones) {
      // Check if milestone already exists for this user
      const existingProgress = await this.getPlayerMilestoneForType(playerId, milestone.milestone_type);
      
      if (!existingProgress) {
        // Create initial progress record
        const initialProgress: Partial<PlayerMilestone> = {
          user_id: playerId,
          milestone_id: milestone.id,
          current_progress: 0,
          is_completed: false,
          times_completed: 0,
        };
        
        // Implementation would insert into player_milestones table
      }
    }
  }

  /**
   * Get specific player milestone for milestone type
   */
  async getPlayerMilestoneForType(playerId: string, milestoneType: string): Promise<PlayerMilestone | null> {
    // Implementation would fetch from player_milestones joined with milestones
    return null;
  }

  // Progress Tracking and Updates

  /**
   * Update player progress for milestone type
   */
  async updatePlayerProgress(
    playerId: string,
    milestoneType: string,
    increment: number
  ): Promise<MilestoneCompletionResult> {
    if (increment <= 0) {
      return {
        success: false,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
        error: 'Invalid increment value',
      };
    }

    // Get milestone definition
    const milestone = await this.getMilestoneByType(milestoneType);
    if (!milestone || !milestone.is_active) {
      return {
        success: false,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
        error: 'Milestone not found or inactive',
      };
    }

    // Get or create player progress
    let playerMilestone = await this.getPlayerMilestoneForType(playerId, milestoneType);
    if (!playerMilestone) {
      await this.createPlayerMilestone(playerId, milestone.id);
      playerMilestone = await this.getPlayerMilestoneForType(playerId, milestoneType);
    }

    if (!playerMilestone) {
      return {
        success: false,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
        error: 'Failed to create player milestone',
      };
    }

    // Update progress
    const newProgress = playerMilestone.current_progress + increment;
    let isCompleted = playerMilestone.is_completed;
    let timesCompleted = playerMilestone.times_completed;
    let spaAwarded = 0;
    let requiresRanking = false;
    let notificationCreated = false;

    // Check for completion
    if (!isCompleted && newProgress >= milestone.requirement_value) {
      isCompleted = true;
      timesCompleted = (timesCompleted || 0) + 1;
      
      // Handle SPA reward
      if (milestone.spa_reward > 0) {
        const spaResult = await this.awardMilestoneSPA(
          playerId,
          milestone.spa_reward,
          milestone.milestone_type,
          milestone.id
        );
        
        spaAwarded = spaResult.success ? milestone.spa_reward : 0;
        requiresRanking = spaResult.requires_ranking;
        
        // Create completion notification
        notificationCreated = await this.createMilestoneNotification(
          playerId,
          milestone,
          spaResult
        );
      } else {
        // Create notification for milestone without SPA reward
        notificationCreated = await this.createBasicMilestoneNotification(
          playerId,
          milestone
        );
      }
    }

    // Update player milestone record
    const updatedMilestone: Partial<PlayerMilestone> = {
      current_progress: newProgress,
      is_completed: isCompleted,
      times_completed: timesCompleted,
      last_progress_update: new Date().toISOString(),
    };

    if (isCompleted && !playerMilestone.completed_at) {
      updatedMilestone.completed_at = new Date().toISOString();
    }

    // Implementation would update database
    
    return {
      success: true,
      milestone_completed: isCompleted && !playerMilestone.is_completed,
      spa_awarded: spaAwarded,
      requires_ranking: requiresRanking,
      notification_created: notificationCreated,
    };
  }

  /**
   * Check and award milestone based on current value
   */
  async checkAndAwardMilestone(
    playerId: string,
    milestoneType: string,
    currentValue: number
  ): Promise<MilestoneCompletionResult> {
    const milestone = await this.getMilestoneByType(milestoneType);
    if (!milestone || !milestone.is_active) {
      return {
        success: false,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
        error: 'Milestone not found or inactive',
      };
    }

    // Get or create player progress
    let playerMilestone = await this.getPlayerMilestoneForType(playerId, milestoneType);
    if (!playerMilestone) {
      await this.createPlayerMilestone(playerId, milestone.id);
      playerMilestone = await this.getPlayerMilestoneForType(playerId, milestoneType);
    }

    if (!playerMilestone) {
      return {
        success: false,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
        error: 'Failed to create player milestone',
      };
    }

    // Check if already completed or value insufficient
    if (playerMilestone.is_completed) {
      return {
        success: true,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
      };
    }

    if (currentValue < milestone.requirement_value) {
      return {
        success: true,
        milestone_completed: false,
        spa_awarded: 0,
        requires_ranking: false,
        notification_created: false,
      };
    }

    // Complete the milestone
    const updatedMilestone: Partial<PlayerMilestone> = {
      current_progress: milestone.requirement_value,
      is_completed: true,
      completed_at: new Date().toISOString(),
      times_completed: (playerMilestone.times_completed || 0) + 1,
    };

    let spaAwarded = 0;
    let requiresRanking = false;
    let notificationCreated = false;

    // Handle SPA reward
    if (milestone.spa_reward > 0) {
      const spaResult = await this.awardMilestoneSPA(
        playerId,
        milestone.spa_reward,
        milestone.milestone_type,
        milestone.id
      );
      
      spaAwarded = spaResult.success ? milestone.spa_reward : 0;
      requiresRanking = spaResult.requires_ranking;
      
      // Create completion notification
      notificationCreated = await this.createMilestoneNotification(
        playerId,
        milestone,
        spaResult
      );
    }

    // Implementation would update database
    
    return {
      success: true,
      milestone_completed: true,
      spa_awarded: spaAwarded,
      requires_ranking: requiresRanking,
      notification_created: notificationCreated,
    };
  }

  // Daily Progress and Streaks

  /**
   * Process daily check-in
   */
  async processDailyCheckin(playerId: string): Promise<{ success: boolean; rewards: number }> {
    const today = new Date().toISOString().slice(0, 10);
    
    // Check if already checked in today
    const dailyProgress = await this.getPlayerDailyProgress(playerId, today);
    if (dailyProgress?.daily_checkin) {
      return { success: false, rewards: 0 };
    }

    // Create or update daily progress
    if (!dailyProgress) {
      await this.createDailyProgress(playerId, today, { daily_checkin: true });
    } else {
      await this.updateDailyProgress(playerId, today, { daily_checkin: true });
    }

    // Update login streak
    await this.updateLoginStreak(playerId);
    
    // Update milestone progress
    await this.updatePlayerProgress(playerId, 'daily_checkin', 1);
    await this.updatePlayerProgress(playerId, 'weekly_checkin', 1);
    
    return { success: true, rewards: 0 };
  }

  /**
   * Get player daily progress for specific date
   */
  async getPlayerDailyProgress(playerId: string, date: string): Promise<DailyProgress | null> {
    // Implementation would fetch from player_daily_progress table
    return null;
  }

  /**
   * Create daily progress record
   */
  async createDailyProgress(
    playerId: string,
    date: string,
    progress: Partial<DailyProgress>
  ): Promise<void> {
    const dailyProgress: Partial<DailyProgress> = {
      user_id: playerId,
      date: date,
      daily_checkin: false,
      matches_played: 0,
      matches_won: 0,
      tournaments_joined: 0,
      challenges_completed: 0,
      spa_earned: 0,
      ...progress,
    };
    
    // Implementation would insert into player_daily_progress table
  }

  /**
   * Update daily progress record
   */
  async updateDailyProgress(
    playerId: string,
    date: string,
    progress: Partial<DailyProgress>
  ): Promise<void> {
    // Implementation would update player_daily_progress table
  }

  /**
   * Update login streak
   */
  async updateLoginStreak(playerId: string): Promise<void> {
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10);
    
    // Get current streak
    const streak = await this.getPlayerLoginStreak(playerId);
    
    if (!streak) {
      // Create initial streak
      const initialStreak: Partial<LoginStreak> = {
        user_id: playerId,
        current_streak: 1,
        longest_streak: 1,
        last_login_date: todayDate,
        weekly_logins: 1,
        week_start_date: todayDate,
        milestone_30_claimed: false,
        milestone_60_claimed: false,
        milestone_90_claimed: false,
      };
      
      // Implementation would insert into player_login_streaks table
      await this.checkAndAwardMilestone(playerId, 'login_streak', 1);
      return;
    }

    // Calculate streak continuation
    const lastDate = streak.last_login_date ? new Date(streak.last_login_date) : null;
    const diffDays = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / 86400000) : null;
    
    let currentStreak = streak.current_streak || 0;
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays && diffDays > 1) {
      currentStreak = 1; // Reset streak if gap
    }

    const longestStreak = Math.max(currentStreak, streak.longest_streak || 0);
    const weeklyLogins = (streak.weekly_logins || 0) + (diffDays === 0 ? 0 : 1);

    // Update streak record
    const updatedStreak: Partial<LoginStreak> = {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_login_date: todayDate,
      weekly_logins: weeklyLogins,
    };

    // Implementation would update database
    
    // Check for streak milestones
    await this.checkAndAwardMilestone(playerId, 'login_streak', currentStreak);
  }

  /**
   * Get player login streak
   */
  async getPlayerLoginStreak(playerId: string): Promise<LoginStreak | null> {
    // Implementation would fetch from player_login_streaks table
    return null;
  }

  // Statistics and Analytics

  /**
   * Calculate milestone statistics for player
   */
  async calculateMilestoneStats(playerId: string): Promise<MilestoneStats> {
    const playerMilestones = await this.getPlayerMilestoneProgress(playerId);
    
    const totalMilestones = playerMilestones.length;
    const completedMilestones = playerMilestones.filter(m => m.is_completed).length;
    const totalSpaEarned = playerMilestones
      .filter(m => m.is_completed && m.milestone?.spa_reward)
      .reduce((sum, m) => sum + (m.milestone?.spa_reward || 0) * m.times_completed, 0);
    
    // Calculate recent completions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCompletions = playerMilestones.filter(m => 
      m.completed_at && new Date(m.completed_at) >= sevenDaysAgo
    ).length;

    return {
      total_milestones: totalMilestones,
      completed_milestones: completedMilestones,
      total_spa_earned: totalSpaEarned,
      completion_rate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
      recent_completions: recentCompletions,
      active_streaks: 0, // Would calculate from streak data
    };
  }

  // Private Helper Methods

  private async createPlayerMilestone(playerId: string, milestoneId: string): Promise<void> {
    const playerMilestone: Partial<PlayerMilestone> = {
      user_id: playerId,
      milestone_id: milestoneId,
      current_progress: 0,
      is_completed: false,
      times_completed: 0,
    };
    
    // Implementation would insert into player_milestones table
  }

  private async awardMilestoneSPA(
    playerId: string,
    amount: number,
    milestoneType: string,
    milestoneId: string
  ): Promise<{ success: boolean; requires_ranking: boolean }> {
    // Implementation would integrate with SPA system
    // This represents the business logic interface
    return { success: true, requires_ranking: false };
  }

  private async createMilestoneNotification(
    playerId: string,
    milestone: Milestone,
    spaResult: { success: boolean; requires_ranking: boolean }
  ): Promise<boolean> {
    // Implementation would create notification based on SPA result
    return true;
  }

  private async createBasicMilestoneNotification(
    playerId: string,
    milestone: Milestone
  ): Promise<boolean> {
    // Implementation would create basic milestone completion notification
    return true;
  }
}

/**
 * Centralized Milestone System Service Instance
 */
export const milestoneSystemService = new MilestoneSystemService();
