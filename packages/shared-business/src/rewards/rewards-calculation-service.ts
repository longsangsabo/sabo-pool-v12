/**
 * SABO Pool Arena - Rewards Calculation Service
 * Phase 4: Priority 4 - Rewards Calculation Logic Consolidation
 * 
 * Consolidated rewards calculation logic extracted from:
 * - Position-based tournament reward calculations
 * - ELO point distribution by rank and placement
 * - SPA point rewards with rank-based multipliers
 * - Prize pool distribution and special awards
 * - Tournament completion reward structures
 * 
 * This service handles all reward calculation operations:
 * - Tournament position-based rewards (ELO, SPA, cash)
 * - Rank-dependent reward scaling
 * - Prize pool distribution algorithms
 * - Special award calculations
 * - Reward validation and normalization
 */

export interface RewardCalculationResult {
  position: number;
  position_name: string;
  elo_points: number;
  spa_points: number;
  cash_prize: number;
  items: string[];
  special_awards: SpecialAward[];
  total_value: number;
  rank_multiplier: number;
}

export interface TournamentRewards {
  total_prize_pool: number;
  show_prizes: boolean;
  positions: RewardPosition[];
  special_awards: SpecialAward[];
  distribution_breakdown: PrizeDistribution;
  metadata: RewardMetadata;
}

export interface RewardPosition {
  position: number;
  name: string;
  elo_points: number;
  spa_points: number;
  cash_prize: number;
  items: string[];
  is_visible: boolean;
  percentage_of_prize?: number;
}

export interface SpecialAward {
  id: string;
  name: string;
  description?: string;
  cash_prize: number;
  criteria?: string;
  recipients?: number;
  automatic?: boolean;
}

export interface PrizeDistribution {
  champion: number;
  runner_up: number;
  third_place: number;
  fourth_place: number;
  top_8: number;
  participation: number;
  special_awards_total: number;
  organization_fee: number;
}

export interface RewardMetadata {
  tournament_type: string;
  max_participants: number;
  total_matches: number;
  calculation_date: Date;
  rank_system: 'SABO_POOL_ARENA';
  currency: 'VND' | 'USD';
}

export interface RankMultipliers {
  elo_multiplier: number;
  spa_multiplier: number;
  progression_bonus: number;
  consistency_bonus: number;
}

export type TournamentPosition = 
  | 'CHAMPION' 
  | 'RUNNER_UP' 
  | 'THIRD_PLACE' 
  | 'FOURTH_PLACE' 
  | 'TOP_8' 
  | 'TOP_16' 
  | 'PARTICIPATION';

export type RankCode = 'K' | 'K+' | 'I' | 'I+' | 'H' | 'H+' | 'G' | 'G+' | 'F' | 'F+' | 'E' | 'E+';

/**
 * Rewards Calculation Service
 * Handles all tournament reward calculations and distributions
 */
export class RewardsCalculationService {
  /**
   * Base ELO points by tournament position (for rank K)
   */
  public static readonly BASE_ELO_REWARDS: Record<TournamentPosition, number> = {
    CHAMPION: 200,
    RUNNER_UP: 150,
    THIRD_PLACE: 100,
    FOURTH_PLACE: 75,
    TOP_8: 50,
    TOP_16: 30,
    PARTICIPATION: 25,
  };

  /**
   * Base SPA points by tournament position (for rank K)
   */
  public static readonly BASE_SPA_REWARDS: Record<TournamentPosition, number> = {
    CHAMPION: 900,
    RUNNER_UP: 700,
    THIRD_PLACE: 500,
    FOURTH_PLACE: 350,
    TOP_8: 120,
    TOP_16: 80,
    PARTICIPATION: 100,
  };

  /**
   * Rank multipliers for rewards calculation
   */
  public static readonly RANK_MULTIPLIERS: Record<RankCode, RankMultipliers> = {
    K: { elo_multiplier: 1.0, spa_multiplier: 1.0, progression_bonus: 0.0, consistency_bonus: 0.0 },
    'K+': { elo_multiplier: 1.05, spa_multiplier: 1.06, progression_bonus: 0.05, consistency_bonus: 0.02 },
    I: { elo_multiplier: 0.9, spa_multiplier: 1.11, progression_bonus: 0.1, consistency_bonus: 0.05 },
    'I+': { elo_multiplier: 0.95, spa_multiplier: 1.17, progression_bonus: 0.15, consistency_bonus: 0.07 },
    H: { elo_multiplier: 0.8, spa_multiplier: 1.22, progression_bonus: 0.2, consistency_bonus: 0.1 },
    'H+': { elo_multiplier: 0.85, spa_multiplier: 1.28, progression_bonus: 0.25, consistency_bonus: 0.12 },
    G: { elo_multiplier: 0.7, spa_multiplier: 1.33, progression_bonus: 0.3, consistency_bonus: 0.15 },
    'G+': { elo_multiplier: 0.75, spa_multiplier: 1.42, progression_bonus: 0.35, consistency_bonus: 0.17 },
    F: { elo_multiplier: 0.6, spa_multiplier: 1.5, progression_bonus: 0.4, consistency_bonus: 0.2 },
    'F+': { elo_multiplier: 0.65, spa_multiplier: 1.58, progression_bonus: 0.45, consistency_bonus: 0.22 },
    E: { elo_multiplier: 0.5, spa_multiplier: 1.67, progression_bonus: 0.5, consistency_bonus: 0.25 },
    'E+': { elo_multiplier: 0.55, spa_multiplier: 1.78, progression_bonus: 0.55, consistency_bonus: 0.27 },
  };

  /**
   * Standard prize distribution percentages
   */
  public static readonly PRIZE_DISTRIBUTION: Record<string, number> = {
    champion: 0.50,      // 50%
    runner_up: 0.30,     // 30%
    third_place: 0.15,   // 15%
    fourth_place: 0.05,  // 5%
    organization_fee: 0.00, // 0% (absorbed by organizer)
  };

  /**
   * Tournament items by position
   */
  public static readonly TOURNAMENT_ITEMS: Record<TournamentPosition, string[]> = {
    CHAMPION: ['Cúp vô địch', 'Huy chương vàng', 'Giấy chứng nhận'],
    RUNNER_UP: ['Huy chương bạc', 'Giấy chứng nhận'],
    THIRD_PLACE: ['Huy chương đồng', 'Giấy chứng nhận'],
    FOURTH_PLACE: ['Giấy chứng nhận'],
    TOP_8: ['Giấy chứng nhận tham gia'],
    TOP_16: ['Giấy chứng nhận tham gia'],
    PARTICIPATION: ['Giấy chứng nhận tham gia'],
  };

  /**
   * Calculate complete tournament rewards for a player
   * 
   * @param position - Tournament position achieved
   * @param rank - Player's rank code
   * @param maxParticipants - Maximum tournament participants
   * @param prizePool - Total prize pool amount
   * @param tournamentType - Type of tournament
   * @returns Complete reward calculation result
   */
  static calculateTournamentRewards(
    position: TournamentPosition,
    rank: RankCode,
    maxParticipants: number = 16,
    prizePool: number = 0,
    tournamentType: string = 'SABO_16'
  ): RewardCalculationResult {
    const numericPosition = this.getNumericPosition(position, maxParticipants);
    const positionName = this.getPositionName(position);
    
    // Get base rewards
    const baseElo = this.BASE_ELO_REWARDS[position] || 0;
    const baseSpa = this.BASE_SPA_REWARDS[position] || 0;
    
    // Apply rank multipliers
    const multipliers = this.RANK_MULTIPLIERS[rank];
    const eloPoints = Math.round(baseElo * multipliers.elo_multiplier);
    const spaPoints = Math.round(baseSpa * multipliers.spa_multiplier);
    
    // Calculate cash prize
    const cashPrize = this.calculateCashPrize(position, prizePool);
    
    // Get tournament items
    const items = [...this.TOURNAMENT_ITEMS[position]];
    
    // Calculate special awards
    const specialAwards = this.calculateSpecialAwards(position, prizePool, rank);
    
    // Calculate total value (cash + estimated item value)
    const itemValue = items.length * 50000; // Estimate 50K VND per item
    const specialAwardValue = specialAwards.reduce((sum, award) => sum + award.cash_prize, 0);
    const totalValue = cashPrize + itemValue + specialAwardValue;

    return {
      position: numericPosition,
      position_name: positionName,
      elo_points: eloPoints,
      spa_points: spaPoints,
      cash_prize: cashPrize,
      items,
      special_awards: specialAwards,
      total_value: totalValue,
      rank_multiplier: multipliers.spa_multiplier,
    };
  }

  /**
   * Generate complete tournament rewards structure
   * 
   * @param maxParticipants - Maximum tournament participants
   * @param prizePool - Total prize pool amount
   * @param tournamentType - Type of tournament
   * @param organizerRank - Organizer's rank (affects special awards)
   * @returns Complete tournament rewards structure
   */
  static generateTournamentRewards(
    maxParticipants: number,
    prizePool: number = 0,
    tournamentType: string = 'SABO_16',
    organizerRank: RankCode = 'K'
  ): TournamentRewards {
    const positions = this.generateStandardPositions(maxParticipants, prizePool);
    const specialAwards = this.generateSpecialAwards(prizePool, organizerRank);
    const distributionBreakdown = this.calculatePrizeDistribution(prizePool);

    return {
      total_prize_pool: prizePool,
      show_prizes: prizePool > 0,
      positions,
      special_awards: specialAwards,
      distribution_breakdown: distributionBreakdown,
      metadata: {
        tournament_type: tournamentType,
        max_participants: maxParticipants,
        total_matches: this.calculateTotalMatches(tournamentType, maxParticipants),
        calculation_date: new Date(),
        rank_system: 'SABO_POOL_ARENA',
        currency: 'VND',
      },
    };
  }

  /**
   * Calculate ELO points for specific position and rank
   * 
   * @param position - Tournament position
   * @param rank - Player's rank code
   * @returns Calculated ELO points
   */
  static calculateELOPoints(position: TournamentPosition, rank: RankCode): number {
    const baseElo = this.BASE_ELO_REWARDS[position] || 0;
    const multiplier = this.RANK_MULTIPLIERS[rank]?.elo_multiplier || 1.0;
    return Math.round(baseElo * multiplier);
  }

  /**
   * Calculate SPA points for specific position and rank
   * 
   * @param position - Tournament position
   * @param rank - Player's rank code
   * @returns Calculated SPA points
   */
  static calculateSPAPoints(position: TournamentPosition, rank: RankCode): number {
    const baseSpa = this.BASE_SPA_REWARDS[position] || 0;
    const multiplier = this.RANK_MULTIPLIERS[rank]?.spa_multiplier || 1.0;
    return Math.round(baseSpa * multiplier);
  }

  /**
   * Calculate cash prize for specific position
   * 
   * @param position - Tournament position
   * @param totalPrizePool - Total prize pool amount
   * @returns Calculated cash prize
   */
  static calculateCashPrize(position: TournamentPosition, totalPrizePool: number): number {
    if (totalPrizePool <= 0) return 0;

    const distribution = this.PRIZE_DISTRIBUTION;
    
    switch (position) {
      case 'CHAMPION':
        return Math.floor(totalPrizePool * distribution.champion);
      case 'RUNNER_UP':
        return Math.floor(totalPrizePool * distribution.runner_up);
      case 'THIRD_PLACE':
        return Math.floor(totalPrizePool * distribution.third_place);
      case 'FOURTH_PLACE':
        return Math.floor(totalPrizePool * distribution.fourth_place);
      default:
        return 0;
    }
  }

  /**
   * Validate tournament rewards structure
   * 
   * @param rewards - Tournament rewards to validate
   * @returns True if rewards structure is valid
   */
  static validateRewards(rewards: TournamentRewards): boolean {
    if (!rewards || typeof rewards !== 'object') return false;

    // Check required fields
    if (typeof rewards.total_prize_pool !== 'number') return false;
    if (typeof rewards.show_prizes !== 'boolean') return false;
    if (!Array.isArray(rewards.positions)) return false;
    if (!Array.isArray(rewards.special_awards)) return false;

    // Validate positions
    for (const position of rewards.positions) {
      if (!this.validatePosition(position)) return false;
    }

    // Validate special awards
    for (const award of rewards.special_awards) {
      if (!this.validateSpecialAward(award)) return false;
    }

    // Validate prize distribution
    if (rewards.total_prize_pool > 0) {
      const totalDistributed = rewards.positions.reduce((sum, pos) => sum + pos.cash_prize, 0) +
                              rewards.special_awards.reduce((sum, award) => sum + award.cash_prize, 0);
      
      if (totalDistributed > rewards.total_prize_pool * 1.05) { // Allow 5% variance
        return false;
      }
    }

    return true;
  }

  /**
   * Create empty rewards structure
   * 
   * @returns Empty tournament rewards structure
   */
  static createEmptyRewards(): TournamentRewards {
    return {
      total_prize_pool: 0,
      show_prizes: false,
      positions: [],
      special_awards: [],
      distribution_breakdown: {
        champion: 0,
        runner_up: 0,
        third_place: 0,
        fourth_place: 0,
        top_8: 0,
        participation: 0,
        special_awards_total: 0,
        organization_fee: 0,
      },
      metadata: {
        tournament_type: 'UNKNOWN',
        max_participants: 0,
        total_matches: 0,
        calculation_date: new Date(),
        rank_system: 'SABO_POOL_ARENA',
        currency: 'VND',
      },
    };
  }

  /**
   * Private Methods - Internal Calculations
   */

  private static generateStandardPositions(
    maxParticipants: number,
    prizePool: number
  ): RewardPosition[] {
    const positions: RewardPosition[] = [];

    // Champion
    positions.push({
      position: 1,
      name: 'Vô địch',
      elo_points: this.BASE_ELO_REWARDS.CHAMPION,
      spa_points: this.BASE_SPA_REWARDS.CHAMPION,
      cash_prize: this.calculateCashPrize('CHAMPION', prizePool),
      items: [...this.TOURNAMENT_ITEMS.CHAMPION],
      is_visible: true,
      percentage_of_prize: this.PRIZE_DISTRIBUTION.champion * 100,
    });

    // Runner-up
    positions.push({
      position: 2,
      name: 'Á quân',
      elo_points: this.BASE_ELO_REWARDS.RUNNER_UP,
      spa_points: this.BASE_SPA_REWARDS.RUNNER_UP,
      cash_prize: this.calculateCashPrize('RUNNER_UP', prizePool),
      items: [...this.TOURNAMENT_ITEMS.RUNNER_UP],
      is_visible: true,
      percentage_of_prize: this.PRIZE_DISTRIBUTION.runner_up * 100,
    });

    // Third place
    positions.push({
      position: 3,
      name: 'Hạng ba',
      elo_points: this.BASE_ELO_REWARDS.THIRD_PLACE,
      spa_points: this.BASE_SPA_REWARDS.THIRD_PLACE,
      cash_prize: this.calculateCashPrize('THIRD_PLACE', prizePool),
      items: [...this.TOURNAMENT_ITEMS.THIRD_PLACE],
      is_visible: true,
      percentage_of_prize: this.PRIZE_DISTRIBUTION.third_place * 100,
    });

    // Fourth place (for larger tournaments)
    if (maxParticipants >= 8) {
      positions.push({
        position: 4,
        name: 'Hạng tư',
        elo_points: this.BASE_ELO_REWARDS.FOURTH_PLACE,
        spa_points: this.BASE_SPA_REWARDS.FOURTH_PLACE,
        cash_prize: this.calculateCashPrize('FOURTH_PLACE', prizePool),
        items: [...this.TOURNAMENT_ITEMS.FOURTH_PLACE],
        is_visible: true,
        percentage_of_prize: this.PRIZE_DISTRIBUTION.fourth_place * 100,
      });
    }

    // Top 8 (for larger tournaments)
    if (maxParticipants >= 16) {
      positions.push({
        position: 8,
        name: 'Top 8',
        elo_points: this.BASE_ELO_REWARDS.TOP_8,
        spa_points: this.BASE_SPA_REWARDS.TOP_8,
        cash_prize: 0,
        items: [...this.TOURNAMENT_ITEMS.TOP_8],
        is_visible: true,
      });
    }

    // Participation reward
    positions.push({
      position: maxParticipants,
      name: 'Tham gia',
      elo_points: this.BASE_ELO_REWARDS.PARTICIPATION,
      spa_points: this.BASE_SPA_REWARDS.PARTICIPATION,
      cash_prize: 0,
      items: [...this.TOURNAMENT_ITEMS.PARTICIPATION],
      is_visible: true,
    });

    return positions;
  }

  private static generateSpecialAwards(prizePool: number, organizerRank: RankCode): SpecialAward[] {
    const specialAwards: SpecialAward[] = [];

    if (prizePool > 100000) { // Only for significant prize pools
      specialAwards.push({
        id: 'fair_play',
        name: 'Giải Fair Play',
        description: 'Dành cho người chơi có tinh thần thể thao tốt nhất',
        cash_prize: 0, // Recognition award
        criteria: 'Bình chọn của Ban tổ chức',
        recipients: 1,
        automatic: false,
      });

      specialAwards.push({
        id: 'best_newcomer',
        name: 'Tân binh xuất sắc',
        description: 'Dành cho người chơi mới tham gia có thành tích tốt',
        cash_prize: Math.floor(prizePool * 0.02), // 2% of prize pool
        criteria: 'Người chơi tham gia lần đầu đạt Top 8',
        recipients: 1,
        automatic: true,
      });
    }

    return specialAwards;
  }

  private static calculateSpecialAwards(
    position: TournamentPosition,
    prizePool: number,
    rank: RankCode
  ): SpecialAward[] {
    const awards: SpecialAward[] = [];

    // Perfect performance bonus
    if (position === 'CHAMPION' && prizePool > 500000) {
      awards.push({
        id: 'perfect_champion',
        name: 'Vô địch hoàn hảo',
        description: 'Vô địch không thua ván nào',
        cash_prize: Math.floor(prizePool * 0.05), // 5% bonus
        criteria: 'Vô địch mà không thua ván nào',
        recipients: 1,
        automatic: true,
      });
    }

    // Rank achievement bonus
    if (['K', 'K+'].includes(rank) && ['CHAMPION', 'RUNNER_UP'].includes(position)) {
      awards.push({
        id: 'beginner_achievement',
        name: 'Thành tựu người mới',
        description: 'Thành tích xuất sắc cho người chơi hạng thấp',
        cash_prize: Math.floor(prizePool * 0.03), // 3% bonus
        criteria: 'Đạt top 2 với hạng K hoặc K+',
        recipients: 1,
        automatic: true,
      });
    }

    return awards;
  }

  private static calculatePrizeDistribution(prizePool: number): PrizeDistribution {
    if (prizePool <= 0) {
      return {
        champion: 0,
        runner_up: 0,
        third_place: 0,
        fourth_place: 0,
        top_8: 0,
        participation: 0,
        special_awards_total: 0,
        organization_fee: 0,
      };
    }

    const distribution = this.PRIZE_DISTRIBUTION;
    
    return {
      champion: Math.floor(prizePool * distribution.champion),
      runner_up: Math.floor(prizePool * distribution.runner_up),
      third_place: Math.floor(prizePool * distribution.third_place),
      fourth_place: Math.floor(prizePool * distribution.fourth_place),
      top_8: 0,
      participation: 0,
      special_awards_total: Math.floor(prizePool * 0.05), // 5% for special awards
      organization_fee: Math.floor(prizePool * distribution.organization_fee),
    };
  }

  private static getNumericPosition(position: TournamentPosition, maxParticipants: number): number {
    switch (position) {
      case 'CHAMPION': return 1;
      case 'RUNNER_UP': return 2;
      case 'THIRD_PLACE': return 3;
      case 'FOURTH_PLACE': return 4;
      case 'TOP_8': return 8;
      case 'TOP_16': return 16;
      case 'PARTICIPATION': return maxParticipants;
      default: return maxParticipants;
    }
  }

  private static getPositionName(position: TournamentPosition): string {
    const positionNames: Record<TournamentPosition, string> = {
      CHAMPION: 'Vô địch',
      RUNNER_UP: 'Á quân',
      THIRD_PLACE: 'Hạng ba',
      FOURTH_PLACE: 'Hạng tư',
      TOP_8: 'Top 8',
      TOP_16: 'Top 16',
      PARTICIPATION: 'Tham gia',
    };

    return positionNames[position] || position;
  }

  private static calculateTotalMatches(tournamentType: string, maxParticipants: number): number {
    switch (tournamentType) {
      case 'SABO_16': return 27;
      case 'SABO_32': return 62;
      case 'single_elimination': return maxParticipants - 1;
      case 'double_elimination': return (maxParticipants - 1) * 2 - 1;
      case 'round_robin': return (maxParticipants * (maxParticipants - 1)) / 2;
      default: return maxParticipants - 1;
    }
  }

  private static validatePosition(position: RewardPosition): boolean {
    return (
      typeof position.position === 'number' &&
      typeof position.name === 'string' &&
      typeof position.elo_points === 'number' &&
      typeof position.spa_points === 'number' &&
      typeof position.cash_prize === 'number' &&
      Array.isArray(position.items) &&
      typeof position.is_visible === 'boolean'
    );
  }

  private static validateSpecialAward(award: SpecialAward): boolean {
    return (
      typeof award.id === 'string' &&
      typeof award.name === 'string' &&
      typeof award.cash_prize === 'number' &&
      (award.description === undefined || typeof award.description === 'string') &&
      (award.criteria === undefined || typeof award.criteria === 'string')
    );
  }
}

// Export service instance and types
export const rewardsCalculationService = new RewardsCalculationService();

// Export constants for convenience
export const BASE_ELO_REWARDS = RewardsCalculationService.BASE_ELO_REWARDS;
export const BASE_SPA_REWARDS = RewardsCalculationService.BASE_SPA_REWARDS;
export const RANK_MULTIPLIERS = RewardsCalculationService.RANK_MULTIPLIERS;
export const PRIZE_DISTRIBUTION = RewardsCalculationService.PRIZE_DISTRIBUTION;
