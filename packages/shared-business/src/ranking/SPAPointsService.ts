import {
  SPAPointsConfig,
  SPAActivity,
  SPAPointsTransaction,
  SPAPointsBalance,
  SPALeaderboard,
  SPABadge,
  SPAAchievement,
  SPAReward,
  SPAMultiplier,
  SPABonus,
} from './ranking-types';

/**
 * SABO Pool Arena - SPA Points Service
 * 
 * Consolidated SPA (SABO Pool Arena) points system logic extracted from:
 * - Tournament prize calculations
 * - Challenge system rewards
 * - Daily/weekly activity bonuses
 * - Achievement system integration
 * - Leaderboard point calculations
 * 
 * This service handles all SPA points operations:
 * - Activity-based point awards
 * - Tournament prize calculations
 * - Challenge rewards
 * - Bonus multipliers and special events
 * - Point redemption and balance management
 */
export class SPAPointsService {
  private readonly defaultConfig: SPAPointsConfig = {
    base_points_per_match: 10,
    win_bonus_multiplier: 1.5,
    tournament_base_multiplier: 2.0,
    challenge_bonus_multiplier: 1.25,
    daily_activity_bonus: 50,
    weekly_activity_bonus: 200,
    monthly_activity_bonus: 1000,
    streak_bonus_threshold: 3,
    streak_bonus_multiplier: 1.1,
    upset_bonus_multiplier: 2.0,
    perfect_game_bonus: 100,
    first_win_of_day_bonus: 25,
  };

  private readonly tournamentPrizeStructure = {
    // DE16 Tournament Structure
    DE16: {
      1: 2000,   // Champion
      2: 1200,   // Runner-up
      3: 800,    // Semi-finalist (2 players)
      5: 400,    // Quarter-finalist (4 players)
      9: 200,    // Round of 16 (8 players)
    },
    // DE8 Tournament Structure
    DE8: {
      1: 1000,   // Champion
      2: 600,    // Runner-up
      3: 400,    // Semi-finalist (2 players)
      5: 200,    // Quarter-finalist (4 players)
    },
    // Single Elimination structures
    SE16: {
      1: 1500,
      2: 900,
      3: 600,
      5: 300,
      9: 150,
    },
    SE8: {
      1: 800,
      2: 480,
      3: 320,
      5: 160,
    },
  };

  private readonly challengeRewards = {
    daily_challenge: 100,
    weekly_challenge: 500,
    monthly_challenge: 2000,
    special_event: 1000,
    ranked_match: 50,
    casual_match: 25,
    practice_match: 10,
  };

  private readonly achievementRewards = {
    first_tournament_win: 500,
    first_challenge_completion: 200,
    win_streak_5: 300,
    win_streak_10: 600,
    win_streak_20: 1200,
    perfect_month: 2000,
    tournament_champion: 1000,
    challenge_master: 800,
    consistency_award: 400,
    improvement_award: 600,
  };

  /**
   * Calculate points for match completion
   */
  calculateMatchPoints(
    activity: SPAActivity,
    config?: Partial<SPAPointsConfig>
  ): SPAPointsTransaction {
    const finalConfig = { ...this.defaultConfig, ...config };
    let points = finalConfig.base_points_per_match;
    const bonuses: SPABonus[] = [];

    // Win bonus
    if (activity.result === 'win') {
      const winBonus = Math.round(points * (finalConfig.win_bonus_multiplier - 1));
      points += winBonus;
      bonuses.push({
        type: 'win_bonus',
        amount: winBonus,
        description: 'Match victory bonus',
      });
    }

    // Tournament match multiplier
    if (activity.is_tournament) {
      const tournamentBonus = Math.round(points * (finalConfig.tournament_base_multiplier - 1));
      points += tournamentBonus;
      bonuses.push({
        type: 'tournament_bonus',
        amount: tournamentBonus,
        description: 'Tournament match bonus',
      });
    }

    // Challenge match multiplier
    if (activity.is_challenge) {
      const challengeBonus = Math.round(points * (finalConfig.challenge_bonus_multiplier - 1));
      points += challengeBonus;
      bonuses.push({
        type: 'challenge_bonus',
        amount: challengeBonus,
        description: 'Challenge match bonus',
      });
    }

    // Win streak bonus
    if (activity.current_streak >= finalConfig.streak_bonus_threshold) {
      const streakMultiplier = Math.pow(
        finalConfig.streak_bonus_multiplier,
        Math.floor(activity.current_streak / finalConfig.streak_bonus_threshold)
      );
      const streakBonus = Math.round(points * (streakMultiplier - 1));
      points += streakBonus;
      bonuses.push({
        type: 'streak_bonus',
        amount: streakBonus,
        description: `${activity.current_streak}-game win streak bonus`,
      });
    }

    // Upset bonus (beating higher-rated opponent)
    if (activity.opponent_rating && activity.player_rating) {
      const ratingDiff = activity.opponent_rating - activity.player_rating;
      if (ratingDiff > 100 && activity.result === 'win') {
        const upsetBonus = Math.round(
          (ratingDiff / 100) * finalConfig.base_points_per_match * finalConfig.upset_bonus_multiplier
        );
        points += upsetBonus;
        bonuses.push({
          type: 'upset_bonus',
          amount: upsetBonus,
          description: `Upset victory bonus (+${ratingDiff} rating difference)`,
        });
      }
    }

    // Perfect game bonus
    if (activity.is_perfect_game) {
      points += finalConfig.perfect_game_bonus;
      bonuses.push({
        type: 'perfect_game_bonus',
        amount: finalConfig.perfect_game_bonus,
        description: 'Perfect game bonus',
      });
    }

    // First win of day bonus
    if (activity.is_first_win_of_day) {
      points += finalConfig.first_win_of_day_bonus;
      bonuses.push({
        type: 'daily_first_win_bonus',
        amount: finalConfig.first_win_of_day_bonus,
        description: 'First win of the day bonus',
      });
    }

    return {
      player_id: activity.player_id,
      activity_type: activity.activity_type,
      base_points: finalConfig.base_points_per_match,
      bonus_points: points - finalConfig.base_points_per_match,
      total_points: points,
      bonuses,
      timestamp: new Date(),
      match_id: activity.match_id,
      tournament_id: activity.tournament_id,
      challenge_id: activity.challenge_id,
    };
  }

  /**
   * Calculate tournament prize points
   */
  calculateTournamentPrize(
    tournamentType: keyof typeof this.tournamentPrizeStructure,
    finalPosition: number,
    totalParticipants: number,
    multiplier: SPAMultiplier = { factor: 1.0, type: 'none' }
  ): SPAPointsTransaction | null {
    const prizeStructure = this.tournamentPrizeStructure[tournamentType];
    if (!prizeStructure) return null;

    // Get prize points for position
    let prizePoints = prizeStructure[finalPosition as keyof typeof prizeStructure];
    
    if (!prizePoints) {
      // Calculate points for positions not explicitly defined
      const lastDefinedPosition = Math.max(...Object.keys(prizeStructure).map(Number));
      if (finalPosition > lastDefinedPosition) {
        // Participation points for lower positions
        prizePoints = Math.max(50, Math.round(prizeStructure[1] * 0.05));
      }
    }

    if (!prizePoints) return null;

    // Apply multiplier
    const totalPoints = Math.round(prizePoints * multiplier.factor);
    const bonusPoints = totalPoints - prizePoints;

    const bonuses: SPABonus[] = [];
    if (bonusPoints > 0) {
      bonuses.push({
        type: 'event_multiplier',
        amount: bonusPoints,
        description: `${multiplier.type} multiplier (${multiplier.factor}x)`,
      });
    }

    return {
      player_id: '',  // Will be set by caller
      activity_type: 'tournament_completion',
      base_points: prizePoints,
      bonus_points: bonusPoints,
      total_points: totalPoints,
      bonuses,
      timestamp: new Date(),
      tournament_id: '',  // Will be set by caller
    };
  }

  /**
   * Calculate challenge completion points
   */
  calculateChallengePoints(
    challengeType: keyof typeof this.challengeRewards,
    completionPercentage: number = 100,
    multiplier: SPAMultiplier = { factor: 1.0, type: 'none' }
  ): SPAPointsTransaction {
    const baseReward = this.challengeRewards[challengeType];
    const adjustedReward = Math.round(baseReward * (completionPercentage / 100));
    const totalPoints = Math.round(adjustedReward * multiplier.factor);
    const bonusPoints = totalPoints - adjustedReward;

    const bonuses: SPABonus[] = [];
    if (bonusPoints > 0) {
      bonuses.push({
        type: 'event_multiplier',
        amount: bonusPoints,
        description: `${multiplier.type} multiplier (${multiplier.factor}x)`,
      });
    }

    return {
      player_id: '',  // Will be set by caller
      activity_type: 'challenge_completion',
      base_points: baseReward,
      bonus_points: bonusPoints,
      total_points: totalPoints,
      bonuses,
      timestamp: new Date(),
      challenge_id: '',  // Will be set by caller
    };
  }

  /**
   * Calculate achievement points
   */
  calculateAchievementPoints(
    achievementType: keyof typeof this.achievementRewards
  ): SPAPointsTransaction {
    const points = this.achievementRewards[achievementType];

    return {
      player_id: '',  // Will be set by caller
      activity_type: 'achievement_unlock',
      base_points: points,
      bonus_points: 0,
      total_points: points,
      bonuses: [],
      timestamp: new Date(),
      achievement_id: achievementType,
    };
  }

  /**
   * Calculate daily activity bonus
   */
  calculateDailyActivityBonus(
    matchesPlayed: number,
    tournamentsParticipated: number,
    challengesCompleted: number
  ): SPAPointsTransaction | null {
    // Minimum activity threshold for daily bonus
    if (matchesPlayed < 3) return null;

    let points = this.defaultConfig.daily_activity_bonus;
    const bonuses: SPABonus[] = [];

    // Extra bonus for tournament participation
    if (tournamentsParticipated > 0) {
      const tournamentBonus = tournamentsParticipated * 25;
      points += tournamentBonus;
      bonuses.push({
        type: 'tournament_participation_bonus',
        amount: tournamentBonus,
        description: `Tournament participation bonus (${tournamentsParticipated} tournaments)`,
      });
    }

    // Extra bonus for challenge completion
    if (challengesCompleted > 0) {
      const challengeBonus = challengesCompleted * 15;
      points += challengeBonus;
      bonuses.push({
        type: 'challenge_completion_bonus',
        amount: challengeBonus,
        description: `Challenge completion bonus (${challengesCompleted} challenges)`,
      });
    }

    return {
      player_id: '',  // Will be set by caller
      activity_type: 'daily_activity',
      base_points: this.defaultConfig.daily_activity_bonus,
      bonus_points: points - this.defaultConfig.daily_activity_bonus,
      total_points: points,
      bonuses,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate weekly activity bonus
   */
  calculateWeeklyActivityBonus(
    totalMatches: number,
    totalTournaments: number,
    totalChallenges: number,
    daysActive: number
  ): SPAPointsTransaction | null {
    // Minimum activity threshold: 5 days active with 15+ matches
    if (daysActive < 5 || totalMatches < 15) return null;

    let points = this.defaultConfig.weekly_activity_bonus;
    const bonuses: SPABonus[] = [];

    // Bonus for high activity
    if (totalMatches >= 50) {
      const highActivityBonus = 300;
      points += highActivityBonus;
      bonuses.push({
        type: 'high_activity_bonus',
        amount: highActivityBonus,
        description: 'High activity bonus (50+ matches)',
      });
    }

    // Bonus for tournament participation
    if (totalTournaments >= 3) {
      const tournamentBonus = 150;
      points += tournamentBonus;
      bonuses.push({
        type: 'tournament_dedication_bonus',
        amount: tournamentBonus,
        description: 'Tournament dedication bonus (3+ tournaments)',
      });
    }

    // Perfect week bonus (7 days active)
    if (daysActive === 7) {
      const perfectWeekBonus = 200;
      points += perfectWeekBonus;
      bonuses.push({
        type: 'perfect_week_bonus',
        amount: perfectWeekBonus,
        description: 'Perfect week bonus (7 days active)',
      });
    }

    return {
      player_id: '',  // Will be set by caller
      activity_type: 'weekly_activity',
      base_points: this.defaultConfig.weekly_activity_bonus,
      bonus_points: points - this.defaultConfig.weekly_activity_bonus,
      total_points: points,
      bonuses,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate monthly activity bonus
   */
  calculateMonthlyActivityBonus(
    totalMatches: number,
    totalTournaments: number,
    totalChallenges: number,
    daysActive: number,
    monthDays: number
  ): SPAPointsTransaction | null {
    // Minimum activity threshold: 20 days active with 100+ matches
    if (daysActive < 20 || totalMatches < 100) return null;

    let points = this.defaultConfig.monthly_activity_bonus;
    const bonuses: SPABonus[] = [];

    // High activity bonus
    if (totalMatches >= 200) {
      const highActivityBonus = 500;
      points += highActivityBonus;
      bonuses.push({
        type: 'monthly_high_activity_bonus',
        amount: highActivityBonus,
        description: 'Monthly high activity bonus (200+ matches)',
      });
    }

    // Tournament master bonus
    if (totalTournaments >= 10) {
      const tournamentMasterBonus = 400;
      points += tournamentMasterBonus;
      bonuses.push({
        type: 'tournament_master_bonus',
        amount: tournamentMasterBonus,
        description: 'Tournament master bonus (10+ tournaments)',
      });
    }

    // Perfect month bonus
    if (daysActive === monthDays) {
      const perfectMonthBonus = 1000;
      points += perfectMonthBonus;
      bonuses.push({
        type: 'perfect_month_bonus',
        amount: perfectMonthBonus,
        description: 'Perfect month bonus (every day active)',
      });
    }

    return {
      player_id: '',  // Will be set by caller
      activity_type: 'monthly_activity',
      base_points: this.defaultConfig.monthly_activity_bonus,
      bonus_points: points - this.defaultConfig.monthly_activity_bonus,
      total_points: points,
      bonuses,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate current SPA points balance
   */
  calculateBalance(transactions: SPAPointsTransaction[]): SPAPointsBalance {
    const totalEarned = transactions.reduce((sum, t) => sum + t.total_points, 0);
    const totalSpent = transactions
      .filter(t => t.activity_type === 'redemption')
      .reduce((sum, t) => sum + Math.abs(t.total_points), 0);

    const currentBalance = totalEarned - totalSpent;

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTransactions = transactions.filter(
      t => new Date(t.timestamp) >= sevenDaysAgo
    );
    const recentEarned = recentTransactions.reduce((sum, t) => sum + t.total_points, 0);

    return {
      player_id: transactions[0]?.player_id || '',
      current_balance: currentBalance,
      total_earned: totalEarned,
      total_spent: totalSpent,
      recent_earned: recentEarned,
      last_updated: new Date(),
    };
  }

  /**
   * Generate leaderboard rankings
   */
  generateLeaderboard(
    playerBalances: SPAPointsBalance[],
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time'
  ): SPALeaderboard {
    // Sort by appropriate metric based on timeframe
    const sortedPlayers = [...playerBalances].sort((a, b) => {
      switch (timeframe) {
        case 'daily':
        case 'weekly':
        case 'monthly':
          return b.recent_earned - a.recent_earned;
        case 'all_time':
        default:
          return b.total_earned - a.total_earned;
      }
    });

    return {
      timeframe,
      rankings: sortedPlayers.map((balance, index) => ({
        rank: index + 1,
        player_id: balance.player_id,
        points: timeframe === 'all_time' ? balance.total_earned : balance.recent_earned,
        change_from_previous: 0, // Would need historical data to calculate
      })),
      generated_at: new Date(),
    };
  }

  /**
   * Get available rewards/prizes for redemption
   */
  getAvailableRewards(): SPAReward[] {
    return [
      {
        id: 'premium_cue_1month',
        name: 'Premium Cue (1 Month)',
        description: 'Unlock premium cue designs for 1 month',
        cost: 5000,
        category: 'cosmetic',
        available: true,
      },
      {
        id: 'tournament_entry_fee_waiver',
        name: 'Tournament Entry Fee Waiver',
        description: 'Free entry to next premium tournament',
        cost: 2000,
        category: 'gameplay',
        available: true,
      },
      {
        id: 'custom_table_theme',
        name: 'Custom Table Theme',
        description: 'Unlock custom table themes and felt colors',
        cost: 3000,
        category: 'cosmetic',
        available: true,
      },
      {
        id: 'elo_boost_small',
        name: 'Small ELO Boost',
        description: 'Gain 25 ELO points (usable once per month)',
        cost: 8000,
        category: 'gameplay',
        available: true,
      },
      {
        id: 'challenge_skip',
        name: 'Challenge Skip Token',
        description: 'Skip one daily challenge and still get rewards',
        cost: 1000,
        category: 'convenience',
        available: true,
      },
    ];
  }

  /**
   * Get tournament prize structure
   */
  getTournamentPrizeStructure(): typeof this.tournamentPrizeStructure {
    return { ...this.tournamentPrizeStructure };
  }

  /**
   * Get challenge rewards structure
   */
  getChallengeRewards(): typeof this.challengeRewards {
    return { ...this.challengeRewards };
  }

  /**
   * Get achievement rewards structure
   */
  getAchievementRewards(): typeof this.achievementRewards {
    return { ...this.achievementRewards };
  }

  /**
   * Validate points transaction
   */
  validateTransaction(transaction: SPAPointsTransaction): boolean {
    return (
      transaction.total_points >= 0 &&
      transaction.base_points >= 0 &&
      transaction.bonus_points >= 0 &&
      transaction.total_points === transaction.base_points + transaction.bonus_points &&
      transaction.player_id.length > 0 &&
      transaction.activity_type.length > 0
    );
  }

  /**
   * Calculate special event multiplier
   */
  calculateEventMultiplier(
    eventType: 'double_points' | 'triple_points' | 'happy_hour' | 'weekend_bonus' | 'holiday_special',
    baseMultiplier: number = 1.0
  ): SPAMultiplier {
    const multipliers = {
      double_points: 2.0,
      triple_points: 3.0,
      happy_hour: 1.5,
      weekend_bonus: 1.25,
      holiday_special: 2.5,
    };

    return {
      factor: multipliers[eventType] * baseMultiplier,
      type: eventType,
    };
  }
}
