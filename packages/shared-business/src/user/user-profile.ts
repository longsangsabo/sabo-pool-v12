/**
 * USER PROFILE BUSINESS LOGIC
 * Consolidated from UnifiedProfileContext.tsx, useMobileProfile.ts, and related components
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== TYPES =====
export interface UserProfile {
  user_id: string;
  display_name?: string;
  full_name: string;
  nickname?: string;
  phone?: string;
  email?: string;
  bio?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  city?: string;
  district?: string;
  avatar_url?: string;
  role?: 'player' | 'club_owner' | 'both' | 'admin';
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileStats {
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  current_rank: string;
  spa_points: number;
  elo_points: number;
  current_streak?: number;
  best_streak?: number;
}

export interface ProfileUpdateData {
  display_name?: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  city?: string;
  district?: string;
  avatar_url?: string;
  role?: 'player' | 'club_owner' | 'both';
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  completionPercentage: number;
}

// ===== USER PROFILE SERVICE =====
export class UserProfileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Load user profile with stats
   */
  async loadUserProfile(userId: string): Promise<{
    profile: UserProfile | null;
    stats: UserProfileStats | null;
  }> {
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Get player rankings for stats
      const { data: rankingData, error: rankingError } = await this.supabase
        .from('player_rankings')
        .select('*')
        .eq('user_id', userId)
        .single();

      const profile: UserProfile = {
        user_id: profileData.user_id,
        display_name: profileData.display_name,
        full_name: profileData.full_name,
        nickname: profileData.nickname,
        phone: profileData.phone,
        email: profileData.email,
        bio: profileData.bio,
        skill_level: profileData.skill_level,
        city: profileData.city,
        district: profileData.district,
        avatar_url: profileData.avatar_url,
        role: profileData.role,
        completion_percentage: this.calculateCompletionPercentage(profileData),
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };

      const stats: UserProfileStats | null = rankingData
        ? {
            total_matches: rankingData.total_matches || 0,
            wins: rankingData.wins || 0,
            losses: rankingData.losses || 0,
            win_rate: rankingData.win_rate || 0,
            current_rank: rankingData.current_rank || 'K',
            spa_points: rankingData.spa_points || 0,
            elo_points: rankingData.elo_points || 1000,
            current_streak: rankingData.current_streak || 0,
            best_streak: rankingData.best_streak || 0,
          }
        : null;

      return { profile, stats };
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: ProfileUpdateData
  ): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        user_id: data.user_id,
        display_name: data.display_name,
        full_name: data.full_name,
        nickname: data.nickname,
        phone: data.phone,
        email: data.email,
        bio: data.bio,
        skill_level: data.skill_level,
        city: data.city,
        district: data.district,
        avatar_url: data.avatar_url,
        role: data.role,
        completion_percentage: this.calculateCompletionPercentage(data),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Upload and update avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Validate profile data
   */
  validateProfile(profile: Partial<UserProfile>): ProfileValidationResult {
    const errors: string[] = [];
    let completionPercentage = 0;
    const totalFields = 8; // Essential fields for completion

    // Required fields validation
    if (!profile.full_name?.trim()) {
      errors.push('Tên đầy đủ là bắt buộc');
    } else {
      completionPercentage += 100 / totalFields;
    }

    if (!profile.display_name?.trim()) {
      errors.push('Tên hiển thị là bắt buộc');
    } else {
      completionPercentage += 100 / totalFields;
    }

    // Optional but recommended fields
    if (profile.phone?.trim()) {
      completionPercentage += 100 / totalFields;
    }

    if (profile.bio?.trim()) {
      completionPercentage += 100 / totalFields;
    }

    if (profile.city?.trim()) {
      completionPercentage += 100 / totalFields;
    }

    if (profile.skill_level) {
      completionPercentage += 100 / totalFields;
    }

    if (profile.avatar_url?.trim()) {
      completionPercentage += 100 / totalFields;
    }

    if (profile.role) {
      completionPercentage += 100 / totalFields;
    }

    // Phone number format validation
    if (profile.phone && !this.isValidPhoneNumber(profile.phone)) {
      errors.push('Số điện thoại không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors,
      completionPercentage: Math.round(completionPercentage),
    };
  }

  /**
   * Get display name following business rules
   */
  getDisplayName(profile: UserProfile): string {
    if (profile.display_name?.trim()) {
      return profile.display_name.trim();
    }
    if (profile.full_name?.trim()) {
      return profile.full_name.trim();
    }
    if (profile.nickname?.trim()) {
      return profile.nickname.trim();
    }
    if (profile.email?.trim()) {
      return profile.email.trim();
    }
    return `User ${profile.user_id.substring(0, 8)}`;
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateCompletionPercentage(profileData: any): number {
    const validation = this.validateProfile(profileData);
    return validation.completionPercentage;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Vietnamese phone number pattern
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Create initial profile for new user
   */
  async createInitialProfile(
    userId: string,
    basicData: {
      email?: string;
      fullName?: string;
      phone?: string;
    }
  ): Promise<UserProfile> {
    try {
      const initialProfile = {
        user_id: userId,
        full_name: basicData.fullName || 'Người chơi mới',
        display_name: basicData.fullName || 'Người chơi mới',
        email: basicData.email,
        phone: basicData.phone,
        role: 'player' as const,
        skill_level: 'beginner' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .insert(initialProfile)
        .select()
        .single();

      if (error) throw error;

      return {
        user_id: data.user_id,
        display_name: data.display_name,
        full_name: data.full_name,
        nickname: data.nickname,
        phone: data.phone,
        email: data.email,
        bio: data.bio,
        skill_level: data.skill_level,
        city: data.city,
        district: data.district,
        avatar_url: data.avatar_url,
        role: data.role,
        completion_percentage: this.calculateCompletionPercentage(data),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating initial profile:', error);
      throw error;
    }
  }

  /**
   * Search users by query
   */
  async searchUsers(
    query: string,
    limit: number = 20
  ): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .or(
          `full_name.ilike.%${query}%,display_name.ilike.%${query}%,phone.ilike.%${query}%`
        )
        .eq('deleted_at', null)
        .eq('is_demo_user', false)
        .order('full_name')
        .limit(limit);

      if (error) throw error;

      return (data || []).map(profile => ({
        user_id: profile.user_id,
        display_name: profile.display_name,
        full_name: profile.full_name,
        nickname: profile.nickname,
        phone: profile.phone,
        email: profile.email,
        bio: profile.bio,
        skill_level: profile.skill_level,
        city: profile.city,
        district: profile.district,
        avatar_url: profile.avatar_url,
        role: profile.role,
        completion_percentage: this.calculateCompletionPercentage(profile),
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}
