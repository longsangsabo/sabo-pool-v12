// SABO Pool Arena - Shared Business Logic Package
// Consolidated business logic services for tournament, ranking, and payment systems

// Tournament Business Logic
export * from './tournament';

// Ranking & ELO System
export * from './ranking';

// Payment System
export * from './payment';

// Performance & Optimization
export * from './performance/ServiceCache';
export { default as ServiceCache, ServiceCacheManager, CacheInvalidationManager } from './performance/ServiceCache';

// Migration & Integration Utilities
export * from './migration/ContextMigrationHelper';
export * from './migration/ServiceIntegrationGuide';
export * from './migration/ValidationHelper';
export { default as ContextMigrationHelper } from './migration/ContextMigrationHelper';
export { default as ServiceIntegrationGuide } from './migration/ServiceIntegrationGuide';
export { default as ValidationHelper } from './migration/ValidationHelper';

// Enhanced Services with Performance Optimizations
export { VNPAYServiceOptimized } from './payment/VNPAYServiceOptimized';

// Business Logic Service Factory
import { TournamentService } from './tournament';
import { ELORatingService, SPAPointsService, RankTierService } from './ranking';
import { VNPAYService, PaymentBusinessLogic } from './payment';
import { VNPAYServiceOptimized } from './payment/VNPAYServiceOptimized';
import { SupabaseClient } from '@supabase/supabase-js';

export class BusinessLogicServiceFactory {
  private static tournamentService: TournamentService;
  private static eloRatingService: ELORatingService;
  private static spaPointsService: SPAPointsService;
  private static rankTierService: RankTierService;
  private static vnpayService: VNPAYService;
  private static vnpayServiceOptimized: VNPAYServiceOptimized;
  private static paymentBusinessLogic: PaymentBusinessLogic;

  // Tournament Services
  static getTournamentService(supabaseClient: SupabaseClient): TournamentService {
    if (!this.tournamentService) {
      this.tournamentService = new TournamentService(supabaseClient);
    }
    return this.tournamentService;
  }

  // Ranking Services
  static getELORatingService(): ELORatingService {
    if (!this.eloRatingService) {
      this.eloRatingService = new ELORatingService();
    }
    return this.eloRatingService;
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

  // Payment Services
  static getVNPAYService(): VNPAYService {
    if (!this.vnpayService) {
      this.vnpayService = new VNPAYService();
    }
    return this.vnpayService;
  }

  static getVNPAYServiceOptimized(): VNPAYServiceOptimized {
    if (!this.vnpayServiceOptimized) {
      this.vnpayServiceOptimized = new VNPAYServiceOptimized();
    }
    return this.vnpayServiceOptimized;
  }

  static getPaymentBusinessLogic(): PaymentBusinessLogic {
    if (!this.paymentBusinessLogic) {
      this.paymentBusinessLogic = new PaymentBusinessLogic();
    }
    return this.paymentBusinessLogic;
  }

  // Get all services with optimized versions
  static getAllServices(supabaseClient: SupabaseClient) {
    return {
      tournament: this.getTournamentService(supabaseClient),
      eloRating: this.getELORatingService(),
      spaPoints: this.getSPAPointsService(),
      rankTier: this.getRankTierService(),
      vnpay: this.getVNPAYService(),
      vnpayOptimized: this.getVNPAYServiceOptimized(),
      paymentLogic: this.getPaymentBusinessLogic(),
    };
  }

  // Get services by category
  static getTournamentServices(supabaseClient: SupabaseClient) {
    return {
      tournament: this.getTournamentService(supabaseClient),
    };
  }

  static getRankingServices() {
    return {
      eloRating: this.getELORatingService(),
      spaPoints: this.getSPAPointsService(),
      rankTier: this.getRankTierService(),
    };
  }

  static getPaymentServices() {
    return {
      vnpay: this.getVNPAYService(),
      vnpayOptimized: this.getVNPAYServiceOptimized(),
      paymentLogic: this.getPaymentBusinessLogic(),
    };
  }
}

// Global Business Logic Configuration
export const BusinessLogicConfig = {
  // Tournament Configuration
  TOURNAMENT: {
    MIN_PARTICIPANTS: 4,
    MAX_PARTICIPANTS: 256,
    REGISTRATION_DEADLINE_HOURS: 24,
    PAYMENT_DEADLINE_HOURS: 2,
    DEFAULT_ENTRY_FEE: 50000, // VND
    SUPPORTED_FORMATS: ['DE8', 'DE16', 'SE8', 'SE16', 'ROUND_ROBIN'],
  },
  
  // ELO System Configuration
  ELO: {
    STARTING_RATING: 1000,
    MIN_RATING: 800,
    MAX_RATING: 3000,
    PROVISIONAL_GAMES: 10,
    DECAY_THRESHOLD_DAYS: 90,
    DECAY_AMOUNT: 50,
  },
  
  // SPA Points Configuration
  SPA_POINTS: {
    BASE_MATCH_POINTS: 10,
    WIN_MULTIPLIER: 1.5,
    TOURNAMENT_MULTIPLIER: 2.0,
    CHALLENGE_MULTIPLIER: 1.25,
    DECAY_PERCENTAGE_SEASON: 0.1,
  },
  
  // Payment Configuration
  PAYMENT: {
    SUPPORTED_CURRENCIES: ['VND', 'USD'],
    MIN_AMOUNT_VND: 10000,
    MAX_AMOUNT_VND: 50000000,
    TRANSACTION_TIMEOUT_MINUTES: 15,
    REFUND_DEADLINE_DAYS: 7,
    PAYMENT_FEE_PERCENTAGE: 2.0,
  },
  
  // Security Configuration
  SECURITY: {
    HASH_ALGORITHM: 'sha512',
    IP_RATE_LIMIT_PER_HOUR: 100,
    MAX_RETRY_ATTEMPTS: 3,
    SESSION_TIMEOUT_MINUTES: 30,
  },
};

// Business Logic Utilities
export class BusinessLogicUtils {
  /**
   * Generate unique transaction ID
   */
  static generateTransactionId(type: 'TOURNAMENT' | 'PAYMENT' | 'CHALLENGE'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${type}_${timestamp}_${random}`;
  }

  /**
   * Calculate percentage change
   */
  static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'VND'): string {
    const locale = currency === 'VND' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
  }

  /**
   * Calculate time difference in human-readable format
   */
  static calculateTimeDifference(date1: Date, date2: Date): {
    days: number;
    hours: number;
    minutes: number;
    totalMinutes: number;
    humanReadable: string;
  } {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    let humanReadable = '';
    if (days > 0) humanReadable += `${days}d `;
    if (hours > 0) humanReadable += `${hours}h `;
    if (minutes > 0) humanReadable += `${minutes}m`;

    return {
      days,
      hours,
      minutes,
      totalMinutes,
      humanReadable: humanReadable.trim() || '0m',
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Vietnamese format)
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sanitize string for database storage
   */
  static sanitizeString(input: string, maxLength: number = 255): string {
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>'"&]/g, ''); // Remove potentially dangerous characters
  }

  /**
   * Calculate match quality score based on rating difference
   */
  static calculateMatchQuality(rating1: number, rating2: number): {
    score: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    description: string;
  } {
    const ratingDiff = Math.abs(rating1 - rating2);
    let score: number;
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    let description: string;

    if (ratingDiff <= 50) {
      score = 100;
      quality = 'excellent';
      description = 'Very evenly matched players';
    } else if (ratingDiff <= 150) {
      score = 85;
      quality = 'good';
      description = 'Well-balanced match';
    } else if (ratingDiff <= 300) {
      score = 65;
      quality = 'fair';
      description = 'Moderate skill difference';
    } else {
      score = 35;
      quality = 'poor';
      description = 'Significant skill gap';
    }

    return { score, quality, description };
  }
}
