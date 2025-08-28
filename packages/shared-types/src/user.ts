/**
 * Core User and Authentication Types
 * Consolidated from existing SABO Arena codebase
 */

import type {
  User as SupabaseUser,
  Session as SupabaseSession,
} from '@supabase/supabase-js';

// ===== CORE USER TYPES =====
export type User = SupabaseUser;
export type Session = SupabaseSession;

export type UserRole = 'user' | 'admin' | 'super_admin' | 'club_owner' | 'moderator';

// ===== AUTH TYPES =====
export interface AuthResponse {
  data?: any;
  error?: any;
  success?: boolean;
  message?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  referralCode?: string;
}

export interface PhoneCredentials {
  phone: string;
  password: string;
  fullName?: string;
  referralCode?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ===== PROFILE TYPES =====
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
  
  // Legacy compatibility
  id?: string;
  phone?: string;
  city?: string;
  district?: string;
  skill_level?: SkillLevel;
  member_since?: string;
  role?: UserRole;
  active_role?: UserRole;
  verified_rank?: string | null;
  completion_percentage?: number;
  elo?: number | null;
  is_admin?: boolean;
  spa_points?: number;
}

export interface PublicProfile {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  skill_level: SkillLevel;
  phone: string | null;
  avatar_url: string | null;
  verified_rank: string | null;
  created_at: string;
  updated_at: string;
  id: string;
  elo: number | null;
  is_admin: boolean;
}

export interface PlayerStats {
  total_matches: number;
  wins: number;
  spa_points: number;
  elo_rating?: number;
  ranking?: number;
}

export interface RankVerificationStatus {
  status: 'none' | 'pending' | 'verified' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  notes?: string;
}

// ===== ENUMS AND CONSTANTS =====
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export const SKILL_LEVELS = {
  beginner: { label: 'Người mới', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Khá', color: 'bg-purple-100 text-purple-800' },
  pro: { label: 'Chuyên nghiệp', color: 'bg-yellow-100 text-yellow-800' },
} as const;

export const RANK_OPTIONS = [
  { value: 'K', label: '1000 ELO - K (Người mới tập)' },
  { value: 'K+', label: '1100 ELO - K+ (Biết luật, kẻ cơ dũng)' },
  { value: 'I', label: '1200 ELO - I (Người chơi cơ bản)' },
  { value: 'I+', label: '1300 ELO - I+ (Tận bình tiến bộ)' },
  { value: 'H', label: '1400 ELO - H (Trung bình)' },
  { value: 'H+', label: '1500 ELO - H+ (Chuẩn bị lên G)' },
  { value: 'G', label: '1600 ELO - G (Khó)' },
  { value: 'G+', label: '1700 ELO - G+ (Trình phòng trào "ngon")' },
  { value: 'F', label: '1800 ELO - F (Giỏi)' },
  { value: 'F+', label: '1900 ELO - F+ (Cao nhất nhóm trung cấp)' },
  { value: 'E', label: '2000 ELO - E (Xuất sắc)' },
  { value: 'E+', label: '2100 ELO - E+ (Cao thủ)' },
] as const;
