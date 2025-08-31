/**
 * SABO Pool Arena - ELO Calculation Service
 * Phase 4: Priority 2 - ELO Calculation Logic Consolidation
 * 
 * Consolidated ELO rating calculation logic extracted from:
 * - Basic and advanced ELO algorithms
 * - Rating prediction and match outcome analysis
 * - Ranking progression and promotion calculations
 * - Performance metrics and statistical analysis
 * - Volatility calculations and consistency scoring
 * 
 * This service handles all ELO-related calculations:
 * - Match-based ELO rating updates
 * - Advanced ELO with volatility and bonuses
 * - Rating prediction and win probability
 * - Ranking system integration
 * - Performance analysis and statistics
 */

export interface ELOConfig {
  k_factor: number;
  rating_floor: number;
  rating_ceiling: number;
  volatility_adjustment: boolean;
  streak_bonus: boolean;
  tournament_bonus: boolean;
  upset_bonus: boolean;
  quality_match_bonus: boolean;
}

export interface ELOMatch {
  player1_rating: number;
  player2_rating: number;
  player1_matches: number;
  player2_matches: number;
  player1_streak: number;
  player2_streak: number;
  player1_volatility: number;
  player2_volatility: number;
}

export interface ELOResult {
  player1_rating_change: number;
  player2_rating_change: number;
  expected_score_1: number;
  expected_score_2: number;
  k_factor_1: number;
  k_factor_2: number;
  final_rating_1: number;
  final_rating_2: number;
}

export interface BasicELOResult {
  newRating1: number;
  newRating2: number;
  ratingChange: number;
  expectedScore1: number;
  expectedScore2: number;
}

export interface MatchPrediction {
  player1WinProbability: number;
  player2WinProbability: number;
  ratingDifference: number;
  expectedOutcome: 'player1_favored' | 'player2_favored' | 'even_match';
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface PlayerRatingStats {
  id: string;
  user_id: string;
  username: string;
  current_rating: number;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  matches_played: number;
  win_rate: number;
  current_streak: number;
  best_streak: number;
  elo_rating: number;
  rank: string;
  recent_form?: number;
  consistency_score?: number;
  rating_volatility?: number;
  highest_rating?: number;
  lowest_rating?: number;
  average_opponent_rating?: number;
}

export interface RankProgression {
  current_rank: string;
  current_rating: number;
  next_rank: string | null;
  required_rating: number | null;
  rating_needed: number | null;
  promotion_eligible: boolean;
  rank_stability: 'stable' | 'rising' | 'falling';
}

export type MatchResult = 'win' | 'loss' | 'draw';
export type RankCode = 'K' | 'K+' | 'I' | 'I+' | 'H' | 'H+' | 'G' | 'G+' | 'F' | 'F+' | 'E' | 'E+';

/**
 * ELO Calculation Service
 * Handles all ELO rating calculations and related analytics
 */
export class ELOCalculationService {
  /**
   * Default ELO configuration for SABO Pool Arena
   */
  public static readonly DEFAULT_CONFIG: ELOConfig = {
    k_factor: 32,
    rating_floor: 800,
    rating_ceiling: 3000,
    volatility_adjustment: true,
    streak_bonus: true,
    tournament_bonus: true,
    upset_bonus: true,
    quality_match_bonus: true,
  };

  /**
   * Rank to rating mapping for SABO Pool Arena
   */
  public static readonly RANK_RATINGS: Record<RankCode, number> = {
    K: 800,
    'K+': 1000,
    I: 1200,
    'I+': 1400,
    H: 1600,
    'H+': 1800,
    G: 2000,
    'G+': 2200,
    F: 2400,
    'F+': 2600,
    E: 2800,
    'E+': 3000,
  };

  /**
   * Calculate basic ELO rating change for a match
   * 
   * @param player1Rating - Player 1's current rating
   * @param player2Rating - Player 2's current rating
   * @param player1Won - Whether player 1 won the match
   * @param kFactor - K-factor for rating volatility (default: 32)
   * @returns Basic ELO calculation result
   */
  static calculateBasicELO(
    player1Rating: number,
    player2Rating: number,
    player1Won: boolean,
    kFactor: number = 32
  ): BasicELOResult {
    const expectedScore1 = this.getExpectedScore(player1Rating, player2Rating);
    const expectedScore2 = 1 - expectedScore1;
    const actualScore1 = player1Won ? 1 : 0;

    const ratingChange = Math.round(kFactor * (actualScore1 - expectedScore1));

    return {
      newRating1: Math.max(this.DEFAULT_CONFIG.rating_floor, 
                  Math.min(this.DEFAULT_CONFIG.rating_ceiling, player1Rating + ratingChange)),
      newRating2: Math.max(this.DEFAULT_CONFIG.rating_floor,
                  Math.min(this.DEFAULT_CONFIG.rating_ceiling, player2Rating - ratingChange)),
      ratingChange: Math.abs(ratingChange),
      expectedScore1,
      expectedScore2,
    };
  }

  /**
   * Calculate ELO rating for single player based on match result
   * 
   * @param rating - Player's current rating
   * @param opponentRating - Opponent's rating
   * @param result - Match result ('win', 'loss', 'draw')
   * @param kFactor - K-factor for rating volatility
   * @returns New rating for the player
   */
  static calculatePlayerELO(
    rating: number,
    opponentRating: number,
    result: MatchResult,
    kFactor: number = 32
  ): number {
    const expectedScore = this.getExpectedScore(rating, opponentRating);
    let actualScore: number;

    switch (result) {
      case 'win':
        actualScore = 1;
        break;
      case 'loss':
        actualScore = 0;
        break;
      case 'draw':
        actualScore = 0.5;
        break;
    }

    const ratingChange = Math.round(kFactor * (actualScore - expectedScore));
    const newRating = rating + ratingChange;
    
    return Math.max(this.DEFAULT_CONFIG.rating_floor, 
           Math.min(this.DEFAULT_CONFIG.rating_ceiling, newRating));
  }

  /**
   * Calculate advanced ELO with bonuses and modifiers
   * 
   * @param config - ELO configuration options
   * @param match - Match details including player stats
   * @param winner - Which player won (1 or 2)
   * @returns Advanced ELO calculation result
   */
  static calculateAdvancedELO(
    config: ELOConfig,
    match: ELOMatch,
    winner: 1 | 2
  ): ELOResult {
    // Calculate expected scores
    const ratingDiff = match.player2_rating - match.player1_rating;
    const expectedScore1 = 1 / (1 + Math.pow(10, ratingDiff / 400));
    const expectedScore2 = 1 - expectedScore1;

    // Determine actual scores
    const actualScore1 = winner === 1 ? 1 : 0;
    const actualScore2 = winner === 2 ? 1 : 0;

    // Calculate base K-factors
    let kFactor1 = this.getKFactor(match.player1_rating, match.player1_matches);
    let kFactor2 = this.getKFactor(match.player2_rating, match.player2_matches);

    // Apply configuration-based modifiers
    if (config.volatility_adjustment) {
      kFactor1 *= 1 + match.player1_volatility * 0.1;
      kFactor2 *= 1 + match.player2_volatility * 0.1;
    }

    if (config.streak_bonus) {
      // Bonus for breaking opponent's streak
      if (winner === 1 && match.player2_streak > 3) {
        kFactor1 *= 1.2; // 20% bonus for streak breaking
      } else if (winner === 2 && match.player1_streak > 3) {
        kFactor2 *= 1.2;
      }
    }

    if (config.upset_bonus) {
      // Bonus for upset victories (lower rated player wins)
      const ratingGap = Math.abs(ratingDiff);
      if (ratingGap > 200) {
        if (winner === 1 && match.player1_rating < match.player2_rating) {
          kFactor1 *= 1.5; // 50% bonus for major upset
        } else if (winner === 2 && match.player2_rating < match.player1_rating) {
          kFactor2 *= 1.5;
        }
      }
    }

    // Calculate rating changes
    const ratingChange1 = Math.round(kFactor1 * (actualScore1 - expectedScore1));
    const ratingChange2 = Math.round(kFactor2 * (actualScore2 - expectedScore2));

    // Apply rating bounds
    const finalRating1 = Math.max(config.rating_floor, 
                         Math.min(config.rating_ceiling, match.player1_rating + ratingChange1));
    const finalRating2 = Math.max(config.rating_floor,
                         Math.min(config.rating_ceiling, match.player2_rating + ratingChange2));

    return {
      player1_rating_change: ratingChange1,
      player2_rating_change: ratingChange2,
      expected_score_1: expectedScore1,
      expected_score_2: expectedScore2,
      k_factor_1: kFactor1,
      k_factor_2: kFactor2,
      final_rating_1: finalRating1,
      final_rating_2: finalRating2,
    };
  }

  /**
   * Get expected score (win probability) for player 1
   * 
   * @param rating1 - Player 1's rating
   * @param rating2 - Player 2's rating
   * @returns Expected score for player 1 (0-1)
   */
  static getExpectedScore(rating1: number, rating2: number): number {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  }

  /**
   * Calculate win probability for both players
   * 
   * @param rating1 - Player 1's rating
   * @param rating2 - Player 2's rating
   * @returns Win probabilities and match prediction
   */
  static predictMatchResult(rating1: number, rating2: number): MatchPrediction {
    const player1WinProbability = this.getExpectedScore(rating1, rating2);
    const player2WinProbability = 1 - player1WinProbability;
    const ratingDifference = Math.abs(rating1 - rating2);

    let expectedOutcome: 'player1_favored' | 'player2_favored' | 'even_match';
    let confidenceLevel: 'low' | 'medium' | 'high';

    if (Math.abs(player1WinProbability - 0.5) < 0.1) {
      expectedOutcome = 'even_match';
      confidenceLevel = 'low';
    } else if (player1WinProbability > 0.5) {
      expectedOutcome = 'player1_favored';
      confidenceLevel = ratingDifference > 200 ? 'high' : 'medium';
    } else {
      expectedOutcome = 'player2_favored';
      confidenceLevel = ratingDifference > 200 ? 'high' : 'medium';
    }

    return {
      player1WinProbability,
      player2WinProbability,
      ratingDifference,
      expectedOutcome,
      confidenceLevel,
    };
  }

  /**
   * Get K-factor based on rating and experience
   * 
   * @param rating - Player's current rating
   * @param matchesPlayed - Number of matches played
   * @returns Appropriate K-factor
   */
  static getKFactor(rating: number, matchesPlayed: number): number {
    // New players (< 30 matches) get higher K-factor
    if (matchesPlayed < 30) return 40;

    // High-rated players get lower K-factor for stability
    if (rating >= 2400) return 16;
    if (rating >= 2100) return 24;

    // Standard K-factor for most players
    return 32;
  }

  /**
   * Get rank from rating
   * 
   * @param rating - Player's rating
   * @returns Corresponding rank code
   */
  static getRankFromRating(rating: number): RankCode {
    if (rating >= 3000) return 'E+';
    if (rating >= 2800) return 'E';
    if (rating >= 2600) return 'F+';
    if (rating >= 2400) return 'F';
    if (rating >= 2200) return 'G+';
    if (rating >= 2000) return 'G';
    if (rating >= 1800) return 'H+';
    if (rating >= 1600) return 'H';
    if (rating >= 1400) return 'I+';
    if (rating >= 1200) return 'I';
    if (rating >= 1000) return 'K+';
    return 'K';
  }

  /**
   * Get rating from rank
   * 
   * @param rank - Rank code
   * @returns Minimum rating for that rank
   */
  static getRatingFromRank(rank: RankCode): number {
    return this.RANK_RATINGS[rank] || 800;
  }

  /**
   * Calculate rating volatility based on recent results
   * 
   * @param recentResults - Array of recent rating changes
   * @param timeframe - Number of recent games to consider (default: 10)
   * @returns Volatility score (0-1)
   */
  static calculateRatingVolatility(
    recentResults: number[],
    timeframe: number = 10
  ): number {
    if (recentResults.length < 2) return 0;

    const recent = recentResults.slice(-timeframe);
    const mean = recent.reduce((sum, result) => sum + result, 0) / recent.length;
    const variance =
      recent.reduce((sum, result) => sum + Math.pow(result - mean, 2), 0) /
      recent.length;

    return Math.sqrt(variance) / 100; // Normalize to 0-1 scale
  }

  /**
   * Calculate consistency score based on rating history
   * 
   * @param ratingHistory - Array of historical ratings
   * @returns Consistency score (0-100)
   */
  static calculateConsistencyScore(ratingHistory: number[]): number {
    if (ratingHistory.length < 2) return 100;

    const mean =
      ratingHistory.reduce((sum, rating) => sum + rating, 0) /
      ratingHistory.length;
    const variance =
      ratingHistory.reduce((sum, rating) => sum + Math.pow(rating - mean, 2), 0) /
      ratingHistory.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Normalize to 0-100 scale
    const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
    return Math.round(consistencyScore);
  }

  /**
   * Calculate recent form percentage
   * 
   * @param recentResults - Array of recent match results (true = win, false = loss)
   * @returns Recent form percentage (0-100)
   */
  static calculateRecentForm(recentResults: boolean[]): number {
    if (recentResults.length === 0) return 0;
    const wins = recentResults.filter(result => result).length;
    return Math.round((wins / recentResults.length) * 100);
  }

  /**
   * Calculate ELO efficiency (rating gained per match)
   * 
   * @param ratingGained - Total rating gained/lost
   * @param matchesPlayed - Number of matches played
   * @returns ELO efficiency score
   */
  static calculateELOEfficiency(
    ratingGained: number,
    matchesPlayed: number
  ): number {
    if (matchesPlayed === 0) return 0;
    return Math.round((ratingGained / matchesPlayed) * 100) / 100;
  }

  /**
   * Check promotion eligibility based on rating and rank
   * 
   * @param currentRating - Player's current rating
   * @param currentRank - Player's current rank
   * @returns Promotion eligibility information
   */
  static checkPromotionEligibility(
    currentRating: number,
    currentRank: RankCode
  ): RankProgression {
    const nextRank = this.getNextRank(currentRank);
    const requiredRating = nextRank ? this.getRatingFromRank(nextRank) : null;
    const ratingNeeded = requiredRating ? Math.max(0, requiredRating - currentRating) : null;
    const promotionEligible = requiredRating ? currentRating >= requiredRating : false;

    // Determine rank stability
    const currentMinRating = this.getRatingFromRank(currentRank);
    const ratingBuffer = currentRating - currentMinRating;
    let rankStability: 'stable' | 'rising' | 'falling';

    if (promotionEligible) {
      rankStability = 'rising';
    } else if (ratingBuffer < 50) {
      rankStability = 'falling';
    } else {
      rankStability = 'stable';
    }

    return {
      current_rank: currentRank,
      current_rating: currentRating,
      next_rank: nextRank,
      required_rating: requiredRating,
      rating_needed: ratingNeeded,
      promotion_eligible: promotionEligible,
      rank_stability: rankStability,
    };
  }

  /**
   * Get the next rank above current rank
   * 
   * @param currentRank - Current rank code
   * @returns Next rank or null if at highest rank
   */
  static getNextRank(currentRank: RankCode): RankCode | null {
    const rankOrder: RankCode[] = [
      'K', 'K+', 'I', 'I+', 'H', 'H+', 'G', 'G+', 'F', 'F+', 'E', 'E+'
    ];
    const currentIndex = rankOrder.indexOf(currentRank);

    if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
      return null; // Invalid rank or already at highest
    }

    return rankOrder[currentIndex + 1];
  }

  /**
   * Get rank progression path
   * 
   * @param currentRank - Current rank code
   * @returns Array of ranks leading to master level
   */
  static getRankProgression(currentRank: RankCode): RankCode[] {
    const ranks: RankCode[] = [
      'K', 'K+', 'I', 'I+', 'H', 'H+', 'G', 'G+', 'F', 'F+', 'E', 'E+'
    ];
    const currentIndex = ranks.indexOf(currentRank);
    return ranks.slice(currentIndex + 1);
  }

  /**
   * Generate comprehensive player rating analysis
   * 
   * @param playerStats - Player's rating statistics
   * @returns Comprehensive rating analysis
   */
  static analyzePlayerRating(playerStats: PlayerRatingStats): {
    progression: RankProgression;
    volatility: number;
    consistency: number;
    form: number;
    efficiency: number;
    analysis: string[];
    recommendations: string[];
  } {
    const progression = this.checkPromotionEligibility(
      playerStats.current_rating,
      playerStats.rank as RankCode
    );

    const volatility = playerStats.rating_volatility || 0;
    const consistency = playerStats.consistency_score || 0;
    const form = playerStats.recent_form || 0;
    const efficiency = this.calculateELOEfficiency(
      playerStats.current_rating - 1000, // Assuming 1000 starting rating
      playerStats.total_games
    );

    const analysis: string[] = [];
    const recommendations: string[] = [];

    // Performance analysis
    if (playerStats.win_rate > 70) {
      analysis.push('Excellent win rate - consistent performance');
    } else if (playerStats.win_rate > 50) {
      analysis.push('Good win rate - steady improvement');
    } else {
      analysis.push('Below average win rate - room for improvement');
      recommendations.push('Focus on fundamental techniques and strategy');
    }

    // Rating progression analysis
    if (progression.promotion_eligible) {
      analysis.push('Ready for rank promotion');
      recommendations.push('Continue current performance to secure promotion');
    } else if (progression.rating_needed && progression.rating_needed < 100) {
      analysis.push('Close to next rank');
      recommendations.push('Small rating improvement needed for promotion');
    }

    // Consistency analysis
    if (consistency > 80) {
      analysis.push('Very consistent performance');
    } else if (consistency < 50) {
      analysis.push('Inconsistent performance - high rating volatility');
      recommendations.push('Work on maintaining consistent play level');
    }

    return {
      progression,
      volatility,
      consistency,
      form,
      efficiency,
      analysis,
      recommendations,
    };
  }

  /**
   * Validate ELO calculation inputs
   * 
   * @param rating1 - Player 1's rating
   * @param rating2 - Player 2's rating
   * @returns True if inputs are valid
   */
  static validateELOInputs(rating1: number, rating2: number): boolean {
    return (
      typeof rating1 === 'number' &&
      typeof rating2 === 'number' &&
      rating1 >= this.DEFAULT_CONFIG.rating_floor &&
      rating1 <= this.DEFAULT_CONFIG.rating_ceiling &&
      rating2 >= this.DEFAULT_CONFIG.rating_floor &&
      rating2 <= this.DEFAULT_CONFIG.rating_ceiling &&
      !isNaN(rating1) &&
      !isNaN(rating2)
    );
  }
}

// Export service instance and types
export const eloCalculationService = new ELOCalculationService();

// Export constants for convenience
export const DEFAULT_ELO_CONFIG = ELOCalculationService.DEFAULT_CONFIG;
export const RANK_RATINGS = ELOCalculationService.RANK_RATINGS;
