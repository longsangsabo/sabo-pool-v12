import { SABORank, RankTier } from './ranking-types';

/**
 * SABO Pool Arena - Rank Tier Service
 * 
 * Consolidated rank tier management logic extracted from:
 * - Rank display components
 * - Tournament qualification checks
 * - Matchmaking tier restrictions
 * - Rank progression calculations
 * - Achievement and badge systems
 * 
 * This service handles all rank tier operations:
 * - Rank tier definitions and metadata
 * - Qualification requirements
 * - Tier-based restrictions and permissions
 * - Rank progression tracking
 * - Visual styling and UI elements
 */
export class RankTierService {
  private readonly rankTiers: RankTier[] = [
    { 
      rank: 'K', 
      minRating: 800, 
      maxRating: 999, 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      description: 'Beginner', 
      kFactor: 40,
      tier: 'bronze',
      division: 1,
      qualifiesForTournaments: ['casual', 'beginner'],
      canCreateChallenges: true,
      maxChallengesPerDay: 5,
      unlockFeatures: ['basic_cues', 'practice_mode']
    },
    { 
      rank: 'K+', 
      minRating: 1000, 
      maxRating: 1199, 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      description: 'Beginner+', 
      kFactor: 40,
      tier: 'bronze',
      division: 2,
      qualifiesForTournaments: ['casual', 'beginner', 'open'],
      canCreateChallenges: true,
      maxChallengesPerDay: 6,
      unlockFeatures: ['basic_cues', 'practice_mode', 'daily_challenges']
    },
    { 
      rank: 'I', 
      minRating: 1200, 
      maxRating: 1399, 
      color: 'bg-green-100 text-green-800 border-green-200', 
      description: 'Intermediate', 
      kFactor: 35,
      tier: 'silver',
      division: 1,
      qualifiesForTournaments: ['casual', 'beginner', 'open', 'intermediate'],
      canCreateChallenges: true,
      maxChallengesPerDay: 7,
      unlockFeatures: ['basic_cues', 'practice_mode', 'daily_challenges', 'intermediate_cues']
    },
    { 
      rank: 'I+', 
      minRating: 1400, 
      maxRating: 1599, 
      color: 'bg-green-100 text-green-800 border-green-200', 
      description: 'Intermediate+', 
      kFactor: 35,
      tier: 'silver',
      division: 2,
      qualifiesForTournaments: ['casual', 'beginner', 'open', 'intermediate'],
      canCreateChallenges: true,
      maxChallengesPerDay: 8,
      unlockFeatures: ['basic_cues', 'practice_mode', 'daily_challenges', 'intermediate_cues', 'weekly_tournaments']
    },
    { 
      rank: 'H', 
      minRating: 1600, 
      maxRating: 1799, 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      description: 'Advanced', 
      kFactor: 32,
      tier: 'gold',
      division: 1,
      qualifiesForTournaments: ['casual', 'open', 'intermediate', 'advanced'],
      canCreateChallenges: true,
      maxChallengesPerDay: 10,
      unlockFeatures: ['basic_cues', 'practice_mode', 'daily_challenges', 'intermediate_cues', 'weekly_tournaments', 'advanced_cues']
    },
    { 
      rank: 'H+', 
      minRating: 1800, 
      maxRating: 1999, 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      description: 'Advanced+', 
      kFactor: 32,
      tier: 'gold',
      division: 2,
      qualifiesForTournaments: ['casual', 'open', 'intermediate', 'advanced'],
      canCreateChallenges: true,
      maxChallengesPerDay: 12,
      unlockFeatures: ['basic_cues', 'practice_mode', 'daily_challenges', 'intermediate_cues', 'weekly_tournaments', 'advanced_cues', 'custom_tables']
    },
    { 
      rank: 'G', 
      minRating: 2000, 
      maxRating: 2199, 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      description: 'Expert', 
      kFactor: 28,
      tier: 'platinum',
      division: 1,
      qualifiesForTournaments: ['open', 'intermediate', 'advanced', 'expert'],
      canCreateChallenges: true,
      maxChallengesPerDay: 15,
      unlockFeatures: ['all_cues', 'all_tables', 'expert_mode', 'tournament_creation']
    },
    { 
      rank: 'G+', 
      minRating: 2200, 
      maxRating: 2399, 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      description: 'Expert+', 
      kFactor: 28,
      tier: 'platinum',
      division: 2,
      qualifiesForTournaments: ['open', 'intermediate', 'advanced', 'expert'],
      canCreateChallenges: true,
      maxChallengesPerDay: 18,
      unlockFeatures: ['all_cues', 'all_tables', 'expert_mode', 'tournament_creation', 'mentorship_program']
    },
    { 
      rank: 'F', 
      minRating: 2400, 
      maxRating: 2599, 
      color: 'bg-red-100 text-red-800 border-red-200', 
      description: 'Master', 
      kFactor: 24,
      tier: 'diamond',
      division: 1,
      qualifiesForTournaments: ['advanced', 'expert', 'master', 'elite'],
      canCreateChallenges: true,
      maxChallengesPerDay: 20,
      unlockFeatures: ['all_cues', 'all_tables', 'expert_mode', 'tournament_creation', 'mentorship_program', 'master_cues']
    },
    { 
      rank: 'F+', 
      minRating: 2600, 
      maxRating: 2799, 
      color: 'bg-red-100 text-red-800 border-red-200', 
      description: 'Master+', 
      kFactor: 24,
      tier: 'diamond',
      division: 2,
      qualifiesForTournaments: ['advanced', 'expert', 'master', 'elite'],
      canCreateChallenges: true,
      maxChallengesPerDay: 25,
      unlockFeatures: ['all_cues', 'all_tables', 'expert_mode', 'tournament_creation', 'mentorship_program', 'master_cues', 'exclusive_events']
    },
    { 
      rank: 'E', 
      minRating: 2800, 
      maxRating: 2999, 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      description: 'Grandmaster', 
      kFactor: 20,
      tier: 'master',
      division: 1,
      qualifiesForTournaments: ['expert', 'master', 'elite', 'grandmaster'],
      canCreateChallenges: true,
      maxChallengesPerDay: 30,
      unlockFeatures: ['all_cues', 'all_tables', 'expert_mode', 'tournament_creation', 'mentorship_program', 'master_cues', 'exclusive_events', 'grandmaster_cues']
    },
    { 
      rank: 'E+', 
      minRating: 3000, 
      maxRating: 9999, 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      description: 'Grandmaster+', 
      kFactor: 16,
      tier: 'master',
      division: 2,
      qualifiesForTournaments: ['expert', 'master', 'elite', 'grandmaster'],
      canCreateChallenges: true,
      maxChallengesPerDay: 50,
      unlockFeatures: ['all_cues', 'all_tables', 'expert_mode', 'tournament_creation', 'mentorship_program', 'master_cues', 'exclusive_events', 'grandmaster_cues', 'legendary_status']
    },
  ];

  private readonly tierMetadata = {
    bronze: {
      name: 'Bronze',
      color: '#CD7F32',
      icon: 'bronze-medal',
      description: 'Learning the fundamentals of SABO Pool',
      benefits: ['Basic training resources', 'Beginner tournaments', 'Practice mode access']
    },
    silver: {
      name: 'Silver',
      color: '#C0C0C0',
      icon: 'silver-medal',
      description: 'Developing intermediate skills and strategy',
      benefits: ['Intermediate tutorials', 'Weekly tournaments', 'Advanced practice modes']
    },
    gold: {
      name: 'Gold',
      color: '#FFD700',
      icon: 'gold-medal',
      description: 'Advanced players with strong technical skills',
      benefits: ['Advanced tournaments', 'Custom game modes', 'Coaching opportunities']
    },
    platinum: {
      name: 'Platinum',
      color: '#E5E4E2',
      icon: 'platinum-medal',
      description: 'Expert-level players with exceptional skill',
      benefits: ['Expert tournaments', 'Tournament hosting', 'Mentorship opportunities']
    },
    diamond: {
      name: 'Diamond',
      color: '#B9F2FF',
      icon: 'diamond',
      description: 'Master-level players competing at the highest level',
      benefits: ['Master tournaments', 'Exclusive events', 'Premium features']
    },
    master: {
      name: 'Master',
      color: '#9932CC',
      icon: 'crown',
      description: 'Grandmaster players representing the pinnacle of skill',
      benefits: ['Grandmaster tournaments', 'Legendary status', 'Ultimate prestige']
    }
  };

  /**
   * Get rank tier by rating
   */
  getRankTierByRating(rating: number): RankTier {
    return this.rankTiers.find(tier => 
      rating >= tier.minRating && rating <= tier.maxRating
    ) || this.rankTiers[0]; // Default to lowest rank
  }

  /**
   * Get rank tier by rank code
   */
  getRankTierByCode(rank: SABORank): RankTier | undefined {
    return this.rankTiers.find(tier => tier.rank === rank);
  }

  /**
   * Get all rank tiers
   */
  getAllRankTiers(): RankTier[] {
    return [...this.rankTiers];
  }

  /**
   * Get rank tiers by tier level (bronze, silver, etc.)
   */
  getRankTiersByTier(tier: string): RankTier[] {
    return this.rankTiers.filter(rankTier => rankTier.tier === tier);
  }

  /**
   * Check if player qualifies for tournament type
   */
  qualifiesForTournament(rating: number, tournamentType: string): boolean {
    const tier = this.getRankTierByRating(rating);
    return tier.qualifiesForTournaments?.includes(tournamentType) || false;
  }

  /**
   * Check if player can create challenges
   */
  canCreateChallenges(rating: number): boolean {
    const tier = this.getRankTierByRating(rating);
    return tier.canCreateChallenges || false;
  }

  /**
   * Get maximum challenges per day for player
   */
  getMaxChallengesPerDay(rating: number): number {
    const tier = this.getRankTierByRating(rating);
    return tier.maxChallengesPerDay || 5;
  }

  /**
   * Get unlocked features for player
   */
  getUnlockedFeatures(rating: number): string[] {
    const tier = this.getRankTierByRating(rating);
    return tier.unlockFeatures || [];
  }

  /**
   * Check if feature is unlocked for player
   */
  isFeatureUnlocked(rating: number, feature: string): boolean {
    const unlockedFeatures = this.getUnlockedFeatures(rating);
    return unlockedFeatures.includes(feature);
  }

  /**
   * Get rank color for UI display
   */
  getRankColor(rank: SABORank): string {
    const tier = this.getRankTierByCode(rank);
    return tier?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Get tier metadata
   */
  getTierMetadata(tier: string) {
    return this.tierMetadata[tier as keyof typeof this.tierMetadata];
  }

  /**
   * Calculate rank progression
   */
  calculateRankProgression(currentRating: number): {
    current_rank: SABORank;
    current_rating: number;
    next_rank: SABORank | null;
    points_to_next: number;
    progress_percentage: number;
    tier_info: any;
  } {
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
        tier_info: this.getTierMetadata(currentTier.tier || 'bronze'),
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
      tier_info: this.getTierMetadata(currentTier.tier || 'bronze'),
    };
  }

  /**
   * Get matchmaking tier restrictions
   */
  getMatchmakingTiers(playerRating: number, allowCrossTier: boolean = true): RankTier[] {
    const playerTier = this.getRankTierByRating(playerRating);
    const playerTierIndex = this.rankTiers.findIndex(tier => tier.rank === playerTier.rank);

    if (!allowCrossTier) {
      // Only same tier
      return [playerTier];
    }

    // Allow ±1 tier for matchmaking
    const minTierIndex = Math.max(0, playerTierIndex - 1);
    const maxTierIndex = Math.min(this.rankTiers.length - 1, playerTierIndex + 1);

    return this.rankTiers.slice(minTierIndex, maxTierIndex + 1);
  }

  /**
   * Calculate skill gap between two players
   */
  calculateSkillGap(rating1: number, rating2: number): {
    gap: number;
    tier_difference: number;
    is_major_upset_potential: boolean;
    matchup_quality: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const gap = Math.abs(rating1 - rating2);
    const tier1 = this.getRankTierByRating(rating1);
    const tier2 = this.getRankTierByRating(rating2);
    
    const tier1Index = this.rankTiers.findIndex(t => t.rank === tier1.rank);
    const tier2Index = this.rankTiers.findIndex(t => t.rank === tier2.rank);
    const tierDifference = Math.abs(tier1Index - tier2Index);

    const isMajorUpsetPotential = gap > 300;

    let matchupQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (gap <= 50) matchupQuality = 'excellent';
    else if (gap <= 150) matchupQuality = 'good';
    else if (gap <= 300) matchupQuality = 'fair';
    else matchupQuality = 'poor';

    return {
      gap,
      tier_difference: tierDifference,
      is_major_upset_potential: isMajorUpsetPotential,
      matchup_quality: matchupQuality,
    };
  }

  /**
   * Get tournament eligibility requirements
   */
  getTournamentEligibility(tournamentType: string): {
    min_rating: number;
    max_rating: number | null;
    required_tier: string;
    description: string;
  } {
    const eligibilityRules = {
      beginner: {
        min_rating: 800,
        max_rating: 1399,
        required_tier: 'bronze or silver',
        description: 'For new players learning the game'
      },
      intermediate: {
        min_rating: 1200,
        max_rating: 1999,
        required_tier: 'silver or gold',
        description: 'For players with solid fundamentals'
      },
      advanced: {
        min_rating: 1600,
        max_rating: 2599,
        required_tier: 'gold or platinum',
        description: 'For skilled competitive players'
      },
      expert: {
        min_rating: 2000,
        max_rating: 2799,
        required_tier: 'platinum or diamond',
        description: 'For expert-level competitors'
      },
      master: {
        min_rating: 2400,
        max_rating: null,
        required_tier: 'diamond or master',
        description: 'For master and grandmaster players'
      },
      elite: {
        min_rating: 2600,
        max_rating: null,
        required_tier: 'diamond or master',
        description: 'Elite competition for top players'
      },
      grandmaster: {
        min_rating: 2800,
        max_rating: null,
        required_tier: 'master',
        description: 'Grandmaster-only events'
      },
      open: {
        min_rating: 800,
        max_rating: null,
        required_tier: 'any',
        description: 'Open to all skill levels'
      },
      casual: {
        min_rating: 800,
        max_rating: null,
        required_tier: 'any',
        description: 'Casual play for all players'
      }
    };

    return eligibilityRules[tournamentType as keyof typeof eligibilityRules] || eligibilityRules.open;
  }

  /**
   * Get rank achievement milestones
   */
  getRankAchievements(rank: SABORank): {
    achievement_name: string;
    description: string;
    rewards: string[];
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  } {
    const achievements = {
      'K': {
        achievement_name: 'First Steps',
        description: 'Reached K rank - Welcome to SABO Pool!',
        rewards: ['50 SPA Points', 'Basic Cue Unlock'],
        rarity: 'common' as const
      },
      'K+': {
        achievement_name: 'Building Momentum',
        description: 'Reached K+ rank - You\'re improving!',
        rewards: ['100 SPA Points', 'Daily Challenge Access'],
        rarity: 'common' as const
      },
      'I': {
        achievement_name: 'Intermediate Player',
        description: 'Reached I rank - Solid fundamentals!',
        rewards: ['200 SPA Points', 'Intermediate Cue Unlock'],
        rarity: 'uncommon' as const
      },
      'I+': {
        achievement_name: 'Rising Star',
        description: 'Reached I+ rank - Tournament ready!',
        rewards: ['300 SPA Points', 'Weekly Tournament Access'],
        rarity: 'uncommon' as const
      },
      'H': {
        achievement_name: 'Advanced Player',
        description: 'Reached H rank - Impressive skill!',
        rewards: ['500 SPA Points', 'Advanced Cue Unlock'],
        rarity: 'rare' as const
      },
      'H+': {
        achievement_name: 'Gold Standard',
        description: 'Reached H+ rank - Gold tier achieved!',
        rewards: ['700 SPA Points', 'Custom Table Access'],
        rarity: 'rare' as const
      },
      'G': {
        achievement_name: 'Expert Level',
        description: 'Reached G rank - You\'re an expert!',
        rewards: ['1000 SPA Points', 'Tournament Creation'],
        rarity: 'epic' as const
      },
      'G+': {
        achievement_name: 'Platinum Elite',
        description: 'Reached G+ rank - Platinum mastery!',
        rewards: ['1500 SPA Points', 'Mentorship Program'],
        rarity: 'epic' as const
      },
      'F': {
        achievement_name: 'Master Player',
        description: 'Reached F rank - Master level achieved!',
        rewards: ['2000 SPA Points', 'Master Cue Collection'],
        rarity: 'legendary' as const
      },
      'F+': {
        achievement_name: 'Diamond Master',
        description: 'Reached F+ rank - Diamond excellence!',
        rewards: ['3000 SPA Points', 'Exclusive Events Access'],
        rarity: 'legendary' as const
      },
      'E': {
        achievement_name: 'Grandmaster',
        description: 'Reached E rank - Grandmaster status!',
        rewards: ['5000 SPA Points', 'Grandmaster Cue Collection'],
        rarity: 'legendary' as const
      },
      'E+': {
        achievement_name: 'Legendary Player',
        description: 'Reached E+ rank - Legendary achievement!',
        rewards: ['10000 SPA Points', 'Legendary Status', 'Hall of Fame'],
        rarity: 'legendary' as const
      }
    };

    return achievements[rank] || achievements['K'];
  }

  /**
   * Validate rank tier data integrity
   */
  validateRankTiers(): boolean {
    // Check that all rating ranges are contiguous and non-overlapping
    for (let i = 0; i < this.rankTiers.length - 1; i++) {
      const current = this.rankTiers[i];
      const next = this.rankTiers[i + 1];
      
      if (current.maxRating + 1 !== next.minRating) {
        console.error(`Gap or overlap detected between ${current.rank} and ${next.rank}`);
        return false;
      }
    }

    // Check that all required properties exist
    for (const tier of this.rankTiers) {
      if (!tier.rank || !tier.minRating || !tier.maxRating || !tier.color || !tier.description) {
        console.error(`Missing required properties for rank ${tier.rank}`);
        return false;
      }
    }

    return true;
  }
}
