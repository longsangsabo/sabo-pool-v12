import {
  ELOConfig,
  ELOMatch,
  ELOResult,
  ELOChange,
  SABORank,
  RankTier,
  PlayerRating,
  RankProgression,
  RankingServiceResult,
} from './ranking-types';
import { ServiceCacheManager, CacheInvalidationManager } from '../performance/ServiceCache';

/**
 * SABO Pool Arena - ELO Rating Service
 * 
 * Consolidated ELO calculation logic extracted from:
 * - apps/sabo-user/src/utils/eloCalculator.ts
 * - apps/sabo-user/src/utils/rankUtils.ts
 * - Database SQL functions from migrations
 * - Challenge system ELO logic
 * 
 * This service handles all ELO-related calculations with SABO's specific rules:
 * - K-factor system from 1000 (K rank) to 2100+ (E+ rank)
 * - Fixed point awards by tournament position
 * - Real-time rank tier updates
 * - Database integration for ELO processing
 */
export class ELORatingService {
  private readonly defaultConfig: ELOConfig = {
    k_factor: 32,
    rating_floor: 800,
    rating_ceiling: 3000,
    volatility_adjustment: true,
    streak_bonus: true,
    tournament_bonus: true,
    upset_bonus: true,
    quality_match_bonus: true,
  };

  private readonly rankTiers: RankTier[] = [
    { rank: 'K', minRating: 800, maxRating: 999, color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Beginner', kFactor: 40 },
    { rank: 'K+', minRating: 1000, maxRating: 1199, color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Beginner+', kFactor: 40 },
    { rank: 'I', minRating: 1200, maxRating: 1399, color: 'bg-green-100 text-green-800 border-green-200', description: 'Intermediate', kFactor: 35 },
    { rank: 'I+', minRating: 1400, maxRating: 1599, color: 'bg-green-100 text-green-800 border-green-200', description: 'Intermediate+', kFactor: 35 },
    { rank: 'H', minRating: 1600, maxRating: 1799, color: 'bg-blue-100 text-blue-800 border-blue-200', description: 'Advanced', kFactor: 32 },
    { rank: 'H+', minRating: 1800, maxRating: 1999, color: 'bg-blue-100 text-blue-800 border-blue-200', description: 'Advanced+', kFactor: 32 },
    { rank: 'G', minRating: 2000, maxRating: 2199, color: 'bg-orange-100 text-orange-800 border-orange-200', description: 'Expert', kFactor: 28 },
    { rank: 'G+', minRating: 2200, maxRating: 2399, color: 'bg-orange-100 text-orange-800 border-orange-200', description: 'Expert+', kFactor: 28 },
    { rank: 'F', minRating: 2400, maxRating: 2599, color: 'bg-red-100 text-red-800 border-red-200', description: 'Master', kFactor: 24 },
    { rank: 'F+', minRating: 2600, maxRating: 2799, color: 'bg-red-100 text-red-800 border-red-200', description: 'Master+', kFactor: 24 },
    { rank: 'E', minRating: 2800, maxRating: 2999, color: 'bg-purple-100 text-purple-800 border-purple-200', description: 'Grandmaster', kFactor: 20 },
    { rank: 'E+', minRating: 3000, maxRating: 9999, color: 'bg-purple-100 text-purple-800 border-purple-200', description: 'Grandmaster+', kFactor: 16 },
  ];

  /**
   * Calculate ELO change for a match
   * Consolidated from multiple implementations
   */
  calculateELOChange(
    winnerELO: number,
    loserELO: number,
    kFactor?: number
  ): { winnerChange: number; loserChange: number; expectedScore: number } {
    const expectedScore = this.getExpectedScore(winnerELO, loserELO);
    const actualScore = 1; // Winner always gets 1

    const finalKFactor = kFactor || this.getKFactorByRating(winnerELO);
    const ratingChange = Math.round(finalKFactor * (actualScore - expectedScore));

    return {
      winnerChange: ratingChange,
      loserChange: -ratingChange,
      expectedScore,
    };
  }

  /**
   * Advanced ELO calculation with SABO-specific features
   * Extracted and enhanced from eloCalculator.ts
   */
  calculateAdvancedELO(
    config: ELOConfig,
    match: ELOMatch,
    winner: 1 | 2
  ): ELOResult {
    const { k_factor } = config;

    // Calculate expected scores
    const ratingDiff = match.player2_rating - match.player1_rating;
    const expectedScore1 = 1 / (1 + Math.pow(10, ratingDiff / 400));
    const expectedScore2 = 1 - expectedScore1;

    // Determine actual scores
    const actualScore1 = winner === 1 ? 1 : 0;
    const actualScore2 = winner === 2 ? 1 : 0;

    // Calculate adaptive K-factors based on SABO system
    let kFactor1 = this.getKFactorByRating(match.player1_rating);
    let kFactor2 = this.getKFactorByRating(match.player2_rating);

    // Apply SABO-specific modifiers
    if (config.volatility_adjustment) {
      kFactor1 *= 1 + match.player1_volatility * 0.1;
      kFactor2 *= 1 + match.player2_volatility * 0.1;
    }

    if (config.streak_bonus) {
      // Increase K-factor for players on losing streaks (faster recovery)
      if (match.player1_streak < -3) kFactor1 *= 1.2;
      if (match.player2_streak < -3) kFactor2 *= 1.2;
    }

    if (config.upset_bonus) {
      // Bonus for major upsets (>200 rating difference)
      const ratingGap = Math.abs(match.player1_rating - match.player2_rating);
      if (ratingGap > 200) {
        const lowerRatedPlayer = match.player1_rating < match.player2_rating ? 1 : 2;
        if (winner === lowerRatedPlayer) {
          if (winner === 1) kFactor1 *= 1.5;
          else kFactor2 *= 1.5;
        }
      }
    }

    // Calculate rating changes
    const ratingChange1 = Math.round(kFactor1 * (actualScore1 - expectedScore1));
    const ratingChange2 = Math.round(kFactor2 * (actualScore2 - expectedScore2));

    return {
      player1_rating_change: ratingChange1,
      player2_rating_change: ratingChange2,
      expected_score_1: expectedScore1,
      expected_score_2: expectedScore2,
      k_factor_1: kFactor1,
      k_factor_2: kFactor2,
    };
  }

  /**
   * Get K-factor based on SABO rating system with caching
   * Enhanced from original getKFactor function with performance optimization
   */
  getKFactorByRating(rating: number): number {
    const cacheKey = ServiceCacheManager.generateKey('kfactor', Math.floor(rating / 100) * 100);
    
    const cached = ServiceCacheManager.eloCache.get(cacheKey);
    if (cached !== undefined) {
      return cached as number;
    }
    
    const tier = this.getRankTierByRating(rating);
    ServiceCacheManager.eloCache.set(cacheKey, tier.kFactor, 60 * 60 * 1000); // 1 hour cache
    return tier.kFactor;
  }

  /**
   * Get expected win probability between two players
   * Standard ELO expected score calculation
   */
  getExpectedScore(rating1: number, rating2: number): number {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  }

  /**
   * Get SABO rank from rating
   * Enhanced from getRankFromRating function
   */
  getRankFromRating(rating: number): SABORank {
    const tier = this.getRankTierByRating(rating);
    return tier.rank;
  }

  /**
   * Get rank tier information
   */
  getRankTierByRating(rating: number): RankTier {
    return this.rankTiers.find(tier => 
      rating >= tier.minRating && rating <= tier.maxRating
    ) || this.rankTiers[0]; // Default to lowest rank
  }

  /**
   * Get rank color for UI
   * Extracted from getRankColor function
   */
  getRankColor(rank: SABORank): string {
    const tier = this.rankTiers.find(t => t.rank === rank);
    return tier?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Calculate rating volatility
   * Measures consistency of recent performance
   */
  calculateVolatility(recentResults: number[], timeframe: number = 10): number {
    if (recentResults.length < 2) return 0;

    const recent = recentResults.slice(-timeframe);
    const mean = recent.reduce((sum, result) => sum + result, 0) / recent.length;
    const variance = recent.reduce((sum, result) => sum + Math.pow(result - mean, 2), 0) / recent.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate recent form percentage
   * Based on win/loss ratio in recent games
   */
  calculateRecentForm(recentResults: boolean[]): number {
    if (recentResults.length === 0) return 0;
    const wins = recentResults.filter(result => result).length;
    return (wins / recentResults.length) * 100;
  }

  /**
   * Calculate consistency score
   * Lower rating variance = higher consistency
   */
  calculateConsistencyScore(ratingHistory: number[]): number {
    if (ratingHistory.length < 2) return 100;

    const mean = ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length;
    const variance = ratingHistory.reduce((sum, rating) => sum + Math.pow(rating - mean, 2), 0) / ratingHistory.length;
    const standardDeviation = Math.sqrt(variance);

    // Normalize to 0-100 scale (100 = perfect consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
    return Math.round(consistencyScore);
  }

  /**
   * Calculate ELO efficiency
   * Rating gained per match played
   */
  calculateEloEfficiency(ratingGained: number, matchesPlayed: number): number {
    if (matchesPlayed === 0) return 0;
    return ratingGained / matchesPlayed;
  }

  /**
   * Predict match outcome probabilities
   */
  predictMatchResult(
    player1Rating: number,
    player2Rating: number
  ): { player1WinProbability: number; player2WinProbability: number } {
    const player1WinProbability = this.getExpectedScore(player1Rating, player2Rating);
    const player2WinProbability = 1 - player1WinProbability;

    return {
      player1WinProbability,
      player2WinProbability,
    };
  }

  /**
   * Get rank progression information
   */
  getRankProgression(currentRating: number): RankProgression {
    const currentTier = this.getRankTierByRating(currentRating);
    const currentRankIndex = this.rankTiers.findIndex(tier => tier.rank === currentTier.rank);
    
    const nextTier = currentRankIndex < this.rankTiers.length - 1 
      ? this.rankTiers[currentRankIndex + 1] 
      : null;

    if (!nextTier) {
      return {
        current_rank: currentTier.rank,
        current_rating: currentRating,
        next_rank: null,
        points_to_next: 0,
        progress_percentage: 100,
      };
    }

    const pointsToNext = nextTier.minRating - currentRating;
    const tierRange = currentTier.maxRating - currentTier.minRating;
    const currentProgress = currentRating - currentTier.minRating;
    const progressPercentage = Math.max(0, Math.min(100, (currentProgress / tierRange) * 100));

    return {
      current_rank: currentTier.rank,
      current_rating: currentRating,
      next_rank: nextTier.rank,
      points_to_next: Math.max(0, pointsToNext),
      progress_percentage: Math.round(progressPercentage),
    };
  }

  /**
   * Tournament ELO calculation for SABO fixed point system
   * Based on final tournament position
   */
  calculateTournamentELO(
    finalPosition: number,
    totalParticipants: number,
    averageOpponentRating: number,
    playerRating: number
  ): number {
    // SABO Pool Arena tournament ELO awards (fixed points by position)
    const positionPoints: { [key: number]: number } = {
      1: 150,  // Champion
      2: 100,  // Runner-up
      3: 75,   // Third place
      4: 50,   // Fourth place
    };

    // Base points for top 4, scaled points for others
    let basePoints = positionPoints[finalPosition];
    
    if (!basePoints) {
      // Calculate points for positions 5 and below
      const topHalf = finalPosition <= Math.ceil(totalParticipants / 2);
      basePoints = topHalf ? 25 : 10;
    }

    // Apply modifiers based on tournament strength
    const expectedFinish = this.calculateExpectedTournamentFinish(
      playerRating,
      averageOpponentRating,
      totalParticipants
    );

    const performanceBonus = expectedFinish > finalPosition ? 
      Math.round((expectedFinish - finalPosition) * 5) : 0;

    return basePoints + performanceBonus;
  }

  /**
   * Calculate expected tournament finish based on rating
   */
  private calculateExpectedTournamentFinish(
    playerRating: number,
    averageRating: number,
    totalParticipants: number
  ): number {
    const ratingDifference = playerRating - averageRating;
    const strengthFactor = ratingDifference / 200; // Every 200 rating points = 1 strength level
    
    // Calculate expected finish position
    const expectedPercentile = 0.5 + (strengthFactor * 0.3); // Max 80th percentile advantage
    const expectedFinish = Math.round((1 - expectedPercentile) * totalParticipants);
    
    return Math.max(1, Math.min(totalParticipants, expectedFinish));
  }

  /**
   * Validate rating bounds
   */
  validateRating(rating: number): number {
    return Math.max(
      this.defaultConfig.rating_floor,
      Math.min(this.defaultConfig.rating_ceiling, rating)
    );
  }

  /**
   * Get all rank tiers
   */
  getAllRankTiers(): RankTier[] {
    return [...this.rankTiers];
  }

  /**
   * Get rank tier by rank code
   */
  getRankTierByCode(rank: SABORank): RankTier | undefined {
    return this.rankTiers.find(tier => tier.rank === rank);
  }
}
