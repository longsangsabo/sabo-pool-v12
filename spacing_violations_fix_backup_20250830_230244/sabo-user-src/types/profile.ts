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
  verified_rank: string | undefined;
  completion_percentage?: number;
}

export interface PublicProfile {
  user_id: string;
  display_name: string | undefined;
  full_name: string | undefined;
  bio: string | undefined;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  phone: string | undefined;
  avatar_url: string | undefined;
  verified_rank: string | undefined;
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
