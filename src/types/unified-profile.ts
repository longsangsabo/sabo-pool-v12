/**
 * UNIFIED PROFILE INTERFACE
 * Single source of truth matching database schema exactly
 * Solves display_name and multiple interface conflicts
 */

export interface UnifiedProfile {
  // === REQUIRED FIELDS (Database enforced) ===
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  spa_points: number;

  // === ESSENTIAL FIELDS (App critical) ===
  email?: string;
  current_rank?: string;
  
  // === OPTIONAL FIELDS (All optional, no dependencies) ===
  full_name?: string;
  display_name?: string; // OPTIONAL - no function dependencies
  phone?: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  district?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  verified_rank?: string;
  nickname?: string;
  
  // === CALCULATED FIELDS ===
  completion_percentage?: number;
  member_since?: string;
  role?: 'player' | 'club_owner' | 'both';
  active_role?: 'player' | 'club_owner';
  
  // === ADMIN FIELDS ===
  is_admin?: boolean;
  is_demo_user?: boolean;
  ban_status?: string;
  ban_reason?: string;
  banned_at?: string;
  banned_by?: string;
  
  // === RANKING FIELDS ===
  elo?: number;
}

/**
 * DISPLAY NAME UTILITY
 * Simple fallback logic without function dependencies
 */
export function getDisplayName(profile: UnifiedProfile): string {
  return (
    profile.display_name?.trim() ||
    profile.full_name?.trim() ||
    profile.nickname?.trim() ||
    profile.email ||
    `User ${profile.user_id.substring(0, 8)}`
  );
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
