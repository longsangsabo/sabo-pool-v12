/**
 * Tournament API Service
 * HTTP API layer for exposing shared business logic to Flutter app
 */

import { TournamentService } from '../../../../packages/shared-business/src/tournament/TournamentService';
import { TournamentBusinessLogic } from '../../../../packages/shared-business/src/tournament/TournamentBusinessLogic';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  errors?: string[];
}

export interface TournamentQuery {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Tournament HTTP API Service
 * Exposes tournament business logic via HTTP endpoints
 */
export class TournamentHTTPService {
  private tournamentService: TournamentService;
  private tournamentLogic: TournamentBusinessLogic;

  constructor() {
    this.tournamentService = new TournamentService();
    this.tournamentLogic = new TournamentBusinessLogic();
  }

  /**
   * Get all tournaments with pagination
   */
  async getTournaments(query: TournamentQuery = {}): Promise<APIResponse> {
    try {
      const { page = 1, limit = 10, status } = query;
      
      const result = await this.tournamentService.getTournaments({
        page: Number(page),
        limit: Number(limit),
        status: status as string
      });

      return {
        success: true,
        data: result,
        message: 'Tournaments retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve tournaments'
      };
    }
  }

  /**
   * Get tournament by ID
   */
  async getTournamentById(id: string): Promise<APIResponse> {
    try {
      const tournament = await this.tournamentService.getTournamentById(id);
      
      if (!tournament) {
        return {
          success: false,
          message: 'Tournament not found'
        };
      }

      return {
        success: true,
        data: tournament,
        message: 'Tournament retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve tournament'
      };
    }
  }

  /**
   * Create new tournament
   */
  async createTournament(tournamentData: any): Promise<APIResponse> {
    try {
      // Validate tournament data using business logic
      const validation = await this.tournamentLogic.validateTournamentCreation(tournamentData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Tournament validation failed'
        };
      }

      const tournament = await this.tournamentService.createTournament(tournamentData);

      return {
        success: true,
        data: tournament,
        message: 'Tournament created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create tournament'
      };
    }
  }

  /**
   * Update tournament
   */
  async updateTournament(id: string, updateData: any): Promise<APIResponse> {
    try {
      const tournament = await this.tournamentService.updateTournament(id, updateData);

      return {
        success: true,
        data: tournament,
        message: 'Tournament updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update tournament'
      };
    }
  }

  /**
   * Register player to tournament
   */
  async registerPlayer(tournamentId: string, userId: string): Promise<APIResponse> {
    try {
      // Use business logic for registration validation
      const validation = await this.tournamentLogic.validatePlayerRegistration(tournamentId, userId);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Registration validation failed'
        };
      }

      const result = await this.tournamentService.registerPlayer(tournamentId, userId);

      return {
        success: true,
        data: result,
        message: 'Player registered successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to register player'
      };
    }
  }

  /**
   * Get tournament bracket
   */
  async getTournamentBracket(tournamentId: string): Promise<APIResponse> {
    try {
      const bracket = await this.tournamentLogic.generateBracket(tournamentId);

      return {
        success: true,
        data: bracket,
        message: 'Tournament bracket retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve tournament bracket'
      };
    }
  }

  /**
   * Start tournament
   */
  async startTournament(tournamentId: string): Promise<APIResponse> {
    try {
      const result = await this.tournamentLogic.startTournament(tournamentId);

      return {
        success: true,
        data: result,
        message: 'Tournament started successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to start tournament'
      };
    }
  }
}

// Export singleton instance
export const tournamentAPI = new TournamentHTTPService();
