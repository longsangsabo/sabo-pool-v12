// Common Profile Types
export interface ProfileData {
  user_id: string;
  display_name: string;
  phone: string;
  bio: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  city: string;
  district: string;
  avatar_url: string;
  member_since: string;
  role: 'player' | 'club_owner' | 'both';
  active_role: 'player' | 'club_owner';
  verified_rank: string | null;
  completion_percentage?: number;
}

export interface PublicProfile {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
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

export const SKILL_LEVELS = {
  beginner: { label: 'Người mới', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Khá', color: 'bg-purple-100 text-purple-800' },
  pro: { label: 'Chuyên nghiệp', color: 'bg-yellow-100 text-yellow-800' },
} as const;

export const RANK_OPTIONS = [
  { value: '1000', label: '1000 - K' },
  { value: '1100', label: '1100 - K+' },
  { value: '1200', label: '1200 - I' },
  { value: '1300', label: '1300 - I+' },
  { value: '1400', label: '1400 - H' },
  { value: '1500', label: '1500 - H+' },
  { value: '1600', label: '1600 - G' },
  { value: '1700', label: '1700 - G+' },
  { value: '1800', label: '1800 - F' },
  { value: '1900', label: '1900 - F+' },
  { value: '2000', label: '2000 - E' },
  { value: '2100', label: '2100 - E+' },
] as const;
