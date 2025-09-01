/**
 * Profile API Service
 * HTTP API layer for exposing user profile business logic to Flutter app
 */

import { UserProfileService } from '../../../../packages/shared-business/src/user/user-profile';
import { UserAuthService } from '../../../../packages/shared-business/src/user/user-auth';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  errors?: string[];
}

export interface ProfileUpdateData {
  display_name?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  preferred_language?: string;
  timezone?: string;
}

/**
 * Profile HTTP API Service
 * Exposes user profile business logic via HTTP endpoints
 */
export class ProfileHTTPService {
  private profileService: UserProfileService;
  private authService: UserAuthService;

  constructor() {
    this.profileService = new UserProfileService();
    this.authService = new UserAuthService();
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<APIResponse> {
    try {
      const profile = await this.profileService.getUserProfile(userId);
      
      if (!profile) {
        return {
          success: false,
          message: 'Profile not found'
        };
      }

      return {
        success: true,
        data: profile,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve profile'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: ProfileUpdateData): Promise<APIResponse> {
    try {
      // Validate profile data
      const validation = await this.profileService.validateProfileUpdate(userId, updateData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Profile validation failed'
        };
      }

      const profile = await this.profileService.updateProfile(userId, updateData);

      return {
        success: true,
        data: profile,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update profile'
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<APIResponse> {
    try {
      const stats = await this.profileService.getUserStatistics(userId);

      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve user statistics'
      };
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<APIResponse> {
    try {
      const achievements = await this.profileService.getUserAchievements(userId);

      return {
        success: true,
        data: achievements,
        message: 'User achievements retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve user achievements'
      };
    }
  }

  /**
   * Get user match history
   */
  async getMatchHistory(userId: string, page: number = 1, limit: number = 10): Promise<APIResponse> {
    try {
      const history = await this.profileService.getMatchHistory(userId, { page, limit });

      return {
        success: true,
        data: history,
        message: 'Match history retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve match history'
      };
    }
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<APIResponse> {
    try {
      const result = await this.profileService.uploadAvatar(userId, file);

      return {
        success: true,
        data: result,
        message: 'Avatar uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to upload avatar'
      };
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<APIResponse> {
    try {
      const preferences = await this.profileService.getPreferences(userId);

      return {
        success: true,
        data: preferences,
        message: 'User preferences retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve user preferences'
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<APIResponse> {
    try {
      const result = await this.profileService.updatePreferences(userId, preferences);

      return {
        success: true,
        data: result,
        message: 'User preferences updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update user preferences'
      };
    }
  }
}

// Export singleton instance
export const profileAPI = new ProfileHTTPService();
