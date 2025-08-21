/**
 * UNIFIED PROFILE INTERFACE
 * Single source of truth matching database schema exactly
 * Solves display_name and multiple interface conflicts
 */

export interface UnifiedProfile {
  user_id: string;
  email?: string;
  display_name?: string;
  full_name?: string;
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter_handle?: string;
  github_handle?: string;
  linkedin_handle?: string;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
  privacy_settings?: {
    show_email?: boolean;
    show_location?: boolean;
    show_social_links?: boolean;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      in_app?: boolean;
    };
  };
  stats?: {
    total_matches?: number;
    wins?: number;
    losses?: number;
    win_rate?: number;
    current_streak?: number;
    best_streak?: number;
    total_points?: number;
    rank?: string;
    achievements?: string[];
  };
  
  // === LEGACY COMPATIBILITY ===
  id?: string;
  spa_points?: number;
  current_rank?: string;
  phone?: string;
  city?: string;
  district?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  verified_rank?: string;
  completion_percentage?: number;
  member_since?: string;
  role?: 'player' | 'club_owner' | 'both';
  active_role?: 'player' | 'club_owner';
  is_admin?: boolean;
  is_demo_user?: boolean;
  ban_status?: string;
  ban_reason?: string;
  banned_at?: string;
  banned_by?: string;
  elo?: number;
}

/**
 * DISPLAY NAME UTILITY
 * Matches database get_user_display_name() function exactly
 */
export function getDisplayName(profile: UnifiedProfile): string {
  // Use SAME logic as database function
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
 * PROFILE UPDATE DATA
 * Only fields that can be updated by user
 */
export interface ProfileUpdateData {
  full_name?: string;
  display_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  district?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
}

/**
 * PROFILE CREATION DATA
 * Minimal required data for creating new profile
 */
export interface ProfileCreateData {
  user_id: string;
  email?: string;
  current_rank?: string;
  spa_points?: number;
}
