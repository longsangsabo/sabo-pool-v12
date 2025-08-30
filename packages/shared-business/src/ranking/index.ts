// Consolidated Ranking Module Exports
import { ELORatingService } from './ELORatingService';
import { SPAPointsService } from './SPAPointsService';
import { RankTierService } from './RankTierService';

export { ELORatingService } from './ELORatingService';
export { SPAPointsService } from './SPAPointsService';
export { RankTierService } from './RankTierService';

// Re-export all types
export * from './ranking-types';

// Ranking Module Configuration
export const RankingConfig = {
  DEFAULT_STARTING_RATING: 1000,
  MINIMUM_RATING: 800,
  MAXIMUM_RATING: 3000,
  PROVISIONAL_GAMES: 10,
  RATING_DECAY_THRESHOLD_DAYS: 90,
  RATING_DECAY_AMOUNT: 50,
  SPA_POINTS_DECAY_SEASON: 0.1, // 10% decay each season
};

// Ranking Service Factory
export class RankingServiceFactory {
  private static eloService: ELORatingService;
  private static spaPointsService: SPAPointsService;
  private static rankTierService: RankTierService;

  static getELOService(): ELORatingService {
    if (!this.eloService) {
      this.eloService = new ELORatingService();
    }
    return this.eloService;
  }

  static getSPAPointsService(): SPAPointsService {
    if (!this.spaPointsService) {
      this.spaPointsService = new SPAPointsService();
    }
    return this.spaPointsService;
  }

  static getRankTierService(): RankTierService {
    if (!this.rankTierService) {
      this.rankTierService = new RankTierService();
    }
    return this.rankTierService;
  }

  static getAllServices() {
    return {
      elo: this.getELOService(),
      spaPoints: this.getSPAPointsService(),
      rankTier: this.getRankTierService(),
    };
  }
}
