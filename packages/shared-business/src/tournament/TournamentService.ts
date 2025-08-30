import { SupabaseClient } from '@supabase/supabase-js';
import { TournamentBusinessLogic } from './TournamentBusinessLogic';
import { TournamentAPIService } from './TournamentAPIService';
import { ServiceCacheManager, CacheInvalidationManager } from '../performance/ServiceCache';
import { 
  TournamentData, 
  TournamentFormData, 
  DE16TournamentData,
  TournamentServiceResult,
  TournamentCreationResult,
  PrizeBreakdown,
  TournamentRegistration
} from './tournament-types';

/**
 * SABO Pool Arena - Unified Tournament Service
 * 
 * This service combines business logic and API operations for tournaments.
 * It replaces the scattered tournament logic from multiple contexts:
 * - UnifiedTournamentContext.tsx
 * - TournamentContext.tsx  
 * - TournamentStateContext.tsx
 * - SimpleTournamentContext.tsx
 * - TournamentGlobalContext.tsx
 * 
 * Benefits:
 * - Single source of truth for tournament operations
 * - Consistent error handling and validation
 * - Reusable across different components
 * - Easier testing and maintenance
 * - Type-safe operations
 */
export class TournamentService {
  private businessLogic: TournamentBusinessLogic;
  private apiService: TournamentAPIService;

  constructor(supabaseClient: SupabaseClient) {
    this.businessLogic = new TournamentBusinessLogic();
    this.apiService = new TournamentAPIService(supabaseClient);
  }

  /**
   * Create a new tournament with full validation and business logic
   * Replaces: UnifiedTournamentContext.createTournament & TournamentContext.createTournament
   * Enhanced with cache invalidation for optimal performance
   */
  async createTournament(
    data: TournamentFormData, 
    userId: string,
    options?: {
      clubId?: string;
      autoInitializeBracket?: boolean;
    }
  ): Promise<TournamentServiceResult<TournamentCreationResult>> {
    try {
      // Business validation
      const validationErrors = this.businessLogic.validateTournament(data);
      if (Object.keys(validationErrors).length > 0) {
        return {
          success: false,
          error: `Validation failed: ${Object.values(validationErrors).join(', ')}`,
        };
      }

      // Build tournament data with business rules
      const tournamentData: TournamentData = {
        name: data.name,
        description: data.description || '',
        tournament_type: 'single_elimination', // Default, can be overridden
        game_format: '9_ball',
        max_participants: data.max_participants,
        current_participants: 0,
        entry_fee: data.entry_fee,
        prize_pool: this.businessLogic.calculatePrizePool(data.entry_fee, data.max_participants),
        tournament_start: data.tournament_start,
        tournament_end: data.tournament_end,
        registration_start: data.registration_start,
        registration_end: data.registration_end,
        venue_address: data.venue_address || '',
        rules: '',
        contact_info: '',
        tier_level: 1,
        status: 'upcoming',
        created_by: userId,
        club_id: options?.clubId,
        has_third_place_match: true,
        requires_approval: false,
        is_public: true,
        allow_all_ranks: true,
        eligible_ranks: [],
      };

      // Create in database
      const createResult = await this.apiService.createTournament(tournamentData);
      if (!createResult.success || !createResult.data) {
        return createResult;
      }

      // Calculate and save prizes
      const prizeBreakdown = this.businessLogic.calculatePrizeDistribution(
        tournamentData.prize_pool,
        tournamentData.max_participants
      );

      const prizes = [
        {
          position: 1,
          cashPrize: prizeBreakdown.first_prize,
          eloPoints: 100,
          spaPoints: 1000,
          items: ['Cúp vô địch', 'Huy chương vàng'],
          isVisible: true,
        },
        {
          position: 2,
          cashPrize: prizeBreakdown.second_prize,
          eloPoints: 70,
          spaPoints: 700,
          items: ['Huy chương bạc'],
          isVisible: true,
        },
        {
          position: 3,
          cashPrize: prizeBreakdown.third_prize,
          eloPoints: 50,
          spaPoints: 500,
          items: ['Huy chương đồng'],
          isVisible: true,
        },
      ];

      await this.apiService.saveTournamentPrizes(createResult.data.tournament.id!, prizes);

      // Invalidate relevant caches
      CacheInvalidationManager.invalidateTournamentData(
        createResult.data.tournament.id!,
        userId
      );

      return {
        success: true,
        data: {
          ...createResult.data,
          bracket_initialized: false, // Will be handled when tournament starts
        },
        message: 'Tournament created successfully',
      };
    } catch (error: any) {
      console.error('❌ Error in createTournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to create tournament',
      };
    }
  }

  /**
   * Create DE16 tournament with specialized logic
   * New method to handle SABO's DE16 system specifically
   */
  async createDE16Tournament(
    data: TournamentFormData, 
    userId: string,
    options?: { clubId?: string }
  ): Promise<TournamentServiceResult<TournamentCreationResult>> {
    try {
      // Use business logic to create DE16 tournament
      const de16Data = this.businessLogic.createDE16Tournament(data, userId);
      if (options?.clubId) {
        de16Data.club_id = options.clubId;
      }

      // Create in database
      const createResult = await this.apiService.createTournament(de16Data);
      if (!createResult.success || !createResult.data) {
        return createResult;
      }

      // Generate specialized DE16 prizes
      const prizeBreakdown = this.businessLogic.calculatePrizeDistribution(
        de16Data.prize_pool,
        16
      );

      const de16Prizes = [
        {
          position: 1,
          cashPrize: prizeBreakdown.first_prize,
          eloPoints: 150, // Higher for DE16
          spaPoints: 1500,
          items: ['Cúp vô địch DE16', 'Huy chương vàng'],
          isVisible: true,
        },
        {
          position: 2,
          cashPrize: prizeBreakdown.second_prize,
          eloPoints: 100,
          spaPoints: 1000,
          items: ['Huy chương bạc DE16'],
          isVisible: true,
        },
        {
          position: 3,
          cashPrize: prizeBreakdown.third_prize,
          eloPoints: 75,
          spaPoints: 750,
          items: ['Huy chương đồng DE16'],
          isVisible: true,
        },
      ];

      await this.apiService.saveTournamentPrizes(createResult.data.tournament.id!, de16Prizes);

      return {
        success: true,
        data: {
          ...createResult.data,
          bracket_initialized: false,
        },
        message: 'DE16 tournament created successfully',
      };
    } catch (error: any) {
      console.error('❌ Error in createDE16Tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to create DE16 tournament',
      };
    }
  }

  /**
   * Register user for tournament with validation
   * Replaces: UnifiedTournamentContext.registerForTournament
   */
  async registerForTournament(
    tournamentId: string, 
    userId: string,
    options?: { notes?: string }
  ): Promise<TournamentServiceResult<TournamentRegistration>> {
    try {
      // Get tournament details
      const tournamentResult = await this.apiService.getTournamentById(tournamentId);
      if (!tournamentResult.success || !tournamentResult.data) {
        return {
          success: false,
          error: 'Tournament not found',
        };
      }

      // Get existing registrations
      const registrationsResult = await this.apiService.getUserRegistrations(userId);
      const existingRegistrations = registrationsResult.data || [];

      // Validate registration
      const validationResult = this.businessLogic.validateRegistration(
        tournamentResult.data,
        userId,
        existingRegistrations
      );

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // Register user
      return await this.apiService.registerForTournament(tournamentId, userId, options);
    } catch (error: any) {
      console.error('❌ Error in registerForTournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to register for tournament',
      };
    }
  }

  /**
   * Cancel tournament registration
   * Replaces: UnifiedTournamentContext.cancelRegistration
   */
  async cancelRegistration(tournamentId: string, userId: string): Promise<TournamentServiceResult<boolean>> {
    return await this.apiService.cancelRegistration(tournamentId, userId);
  }

  /**
   * Get tournaments with filtering options and caching
   * Replaces: UnifiedTournamentContext.fetchTournaments
   * Enhanced with intelligent caching for improved performance
   */
  async getTournaments(options?: {
    clubId?: string;
    status?: string;
    createdBy?: string;
    limit?: number;
  }): Promise<TournamentServiceResult<TournamentData[]>> {
    const cacheKey = ServiceCacheManager.generateKey(
      'tournament:list',
      options?.clubId || 'all',
      options?.status || 'all',
      options?.createdBy || 'all',
      String(options?.limit || 50)
    );

    return await ServiceCacheManager.tournamentCache.getOrSet(
      cacheKey,
      () => this.apiService.fetchTournaments(options),
      10 * 60 * 1000 // 10 minutes cache for tournament lists
    );
  }

  /**
   * Get tournament by ID with caching
   * Replaces: TournamentContext.loadTournament
   * Enhanced with intelligent caching for frequently accessed tournaments
   */
  async getTournamentById(id: string): Promise<TournamentServiceResult<TournamentData>> {
    const cacheKey = ServiceCacheManager.generateKey('tournament', id);

    return await ServiceCacheManager.tournamentCache.getOrSet(
      cacheKey,
      () => this.apiService.getTournamentById(id),
      15 * 60 * 1000 // 15 minutes cache for individual tournaments
    );
  }

  /**
   * Update tournament with cache invalidation
   * Replaces: TournamentContext.updateExistingTournament
   * Enhanced with intelligent cache management
   */
  async updateTournament(
    id: string, 
    updateData: Partial<TournamentData>
  ): Promise<TournamentServiceResult<TournamentData>> {
    // Validate updates
    const validationErrors = this.businessLogic.validateTournament(updateData);
    if (Object.keys(validationErrors).length > 0) {
      return {
        success: false,
        error: `Validation failed: ${Object.values(validationErrors).join(', ')}`,
      };
    }

    const result = await this.apiService.updateTournament(id, updateData);
    
    // Invalidate caches on successful update
    if (result.success) {
      CacheInvalidationManager.invalidateTournamentData(id, updateData.created_by);
    }

    return result;
  }

  /**
   * Get user's tournament registrations with caching
   * Enhanced with smart caching for frequent user data access
   */
  async getUserRegistrations(userId: string): Promise<TournamentServiceResult<string[]>> {
    const cacheKey = ServiceCacheManager.generateKey('tournament:user', userId);

    return await ServiceCacheManager.tournamentCache.getOrSet(
      cacheKey,
      () => this.apiService.getUserRegistrations(userId),
      5 * 60 * 1000 // 5 minutes cache for user registrations
    );
  }

  /**
   * Check if user is registered for tournament
   * Replaces: UnifiedTournamentContext.isRegistered
   */
  async isUserRegistered(tournamentId: string, userId: string): Promise<boolean> {
    const registrationsResult = await this.apiService.getUserRegistrations(userId);
    if (!registrationsResult.success || !registrationsResult.data) {
      return false;
    }
    return registrationsResult.data.includes(tournamentId);
  }

  /**
   * Get tournament registrations
   * New method for admin/organizer use
   */
  async getTournamentRegistrations(tournamentId: string): Promise<TournamentServiceResult<TournamentRegistration[]>> {
    return await this.apiService.getTournamentRegistrations(tournamentId);
  }

  /**
   * Initialize tournament bracket (for double elimination)
   * Replaces: useTournamentUtils.createQuickTournament SABO initialization
   */
  async initializeTournamentBracket(tournamentId: string, playerIds: string[]): Promise<TournamentServiceResult<boolean>> {
    try {
      // Get tournament to check type
      const tournamentResult = await this.apiService.getTournamentById(tournamentId);
      if (!tournamentResult.success || !tournamentResult.data) {
        return {
          success: false,
          error: 'Tournament not found',
        };
      }

      const tournament = tournamentResult.data;

      // Initialize based on tournament type
      if (tournament.tournament_type === 'double_elimination') {
        return await this.apiService.initializeSABOTournament(tournamentId, playerIds);
      }

      // For other tournament types, implement as needed
      return {
        success: true,
        data: true,
        message: 'Bracket initialized successfully',
      };
    } catch (error: any) {
      console.error('❌ Error initializing tournament bracket:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize tournament bracket',
      };
    }
  }

  /**
   * Get latest tournament for auto-fill
   * Replaces: TournamentContext.loadLatestTournament
   */
  async getLatestTournamentByUser(userId: string): Promise<TournamentServiceResult<Partial<TournamentData>>> {
    return await this.apiService.getLatestTournamentByUser(userId);
  }

  /**
   * Calculate prize distribution
   * Utility method exposed for UI components
   */
  calculatePrizeDistribution(totalPrize: number, participants: number): PrizeBreakdown {
    return this.businessLogic.calculatePrizeDistribution(totalPrize, participants);
  }

  /**
   * Validate tournament data
   * Utility method exposed for UI components  
   */
  validateTournament(tournament: Partial<TournamentData>) {
    return this.businessLogic.validateTournament(tournament);
  }

  /**
   * Get next tournament status based on dates
   * Utility method for status progression
   */
  getNextTournamentStatus(
    currentStatus: string,
    registrationEnd: string,
    tournamentStart: string,
    tournamentEnd: string
  ): string {
    return this.businessLogic.getNextTournamentStatus(
      currentStatus,
      registrationEnd,
      tournamentStart,
      tournamentEnd
    );
  }
}
