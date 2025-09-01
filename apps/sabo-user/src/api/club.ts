/**
 * Club API Service
 * HTTP API layer for exposing club management business logic to Flutter app
 */

import { ClubManagementService } from '@sabo-pool/shared-business/club';
import { ClubVerificationService } from '@sabo-pool/shared-business/club';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  errors?: string[];
}

export interface ClubQuery {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  verified?: boolean;
}

export interface ClubCreateData {
  name: string;
  description: string;
  location: string;
  category: string;
  contact_info: any;
  operating_hours: any;
}

/**
 * Club HTTP API Service
 * Exposes club management business logic via HTTP endpoints
 */
export class ClubHTTPService {
  private clubService: ClubManagementService;
  private verificationService: ClubVerificationService;

  constructor() {
    this.clubService = new ClubManagementService();
    this.verificationService = new ClubVerificationService();
  }

  /**
   * Get all clubs with filtering
   */
  async getClubs(query: ClubQuery = {}): Promise<APIResponse> {
    try {
      const { page = 1, limit = 10, category, location, verified } = query;
      
      const result = await this.clubService.getClubs({
        page: Number(page),
        limit: Number(limit),
        category,
        location,
        verified
      });

      return {
        success: true,
        data: result,
        message: 'Clubs retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve clubs'
      };
    }
  }

  /**
   * Get club by ID
   */
  async getClubById(clubId: string): Promise<APIResponse> {
    try {
      const club = await this.clubService.getClubById(clubId);
      
      if (!club) {
        return {
          success: false,
          message: 'Club not found'
        };
      }

      return {
        success: true,
        data: club,
        message: 'Club retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve club'
      };
    }
  }

  /**
   * Create new club
   */
  async createClub(clubData: ClubCreateData, ownerId: string): Promise<APIResponse> {
    try {
      // Validate club data
      const validation = await this.clubService.validateClubCreation(clubData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Club validation failed'
        };
      }

      const club = await this.clubService.createClub({ ...clubData, owner_id: ownerId });

      return {
        success: true,
        data: club,
        message: 'Club created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create club'
      };
    }
  }

  /**
   * Update club
   */
  async updateClub(clubId: string, updateData: Partial<ClubCreateData>): Promise<APIResponse> {
    try {
      const club = await this.clubService.updateClub(clubId, updateData);

      return {
        success: true,
        data: club,
        message: 'Club updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update club'
      };
    }
  }

  /**
   * Join club
   */
  async joinClub(clubId: string, userId: string): Promise<APIResponse> {
    try {
      // Validate membership eligibility
      const validation = await this.clubService.validateMembership(clubId, userId);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Membership validation failed'
        };
      }

      const result = await this.clubService.joinClub(clubId, userId);

      return {
        success: true,
        data: result,
        message: 'Joined club successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to join club'
      };
    }
  }

  /**
   * Leave club
   */
  async leaveClub(clubId: string, userId: string): Promise<APIResponse> {
    try {
      const result = await this.clubService.leaveClub(clubId, userId);

      return {
        success: true,
        data: result,
        message: 'Left club successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to leave club'
      };
    }
  }

  /**
   * Get club members
   */
  async getClubMembers(clubId: string, page: number = 1, limit: number = 10): Promise<APIResponse> {
    try {
      const members = await this.clubService.getClubMembers(clubId, { page, limit });

      return {
        success: true,
        data: members,
        message: 'Club members retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve club members'
      };
    }
  }

  /**
   * Get club tournaments
   */
  async getClubTournaments(clubId: string, page: number = 1, limit: number = 10): Promise<APIResponse> {
    try {
      const tournaments = await this.clubService.getClubTournaments(clubId, { page, limit });

      return {
        success: true,
        data: tournaments,
        message: 'Club tournaments retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve club tournaments'
      };
    }
  }

  /**
   * Request club verification
   */
  async requestVerification(clubId: string, documents: any[]): Promise<APIResponse> {
    try {
      const result = await this.verificationService.requestVerification(clubId, documents);

      return {
        success: true,
        data: result,
        message: 'Verification request submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to submit verification request'
      };
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(clubId: string): Promise<APIResponse> {
    try {
      const status = await this.verificationService.getVerificationStatus(clubId);

      return {
        success: true,
        data: status,
        message: 'Verification status retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve verification status'
      };
    }
  }
}

// Export singleton instance
export const clubAPI = new ClubHTTPService();
