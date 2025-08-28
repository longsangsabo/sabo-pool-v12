/**
 * Tournament and Challenge Types
 * Core game-related interfaces for SABO Arena
 */

// ===== TOURNAMENT TYPES =====
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  tournament_type: TournamentType;
  game_format: GameFormat;
  max_participants: number;
  current_participants: number;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  tournament_end: string;
  club_id: string;
  venue_address?: string;
  entry_fee: number;
  prize_pool: number;
  first_prize: number;
  second_prize: number;
  third_prize: number;
  status: TournamentStatus;
  management_status?: TournamentManagementStatus;
  rules?: string;
  contact_info?: any;
  banner_image?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tier?: string;
  tier_level?: number;
  spa_points_config?: PrizeConfig;
  elo_points_config?: PrizeConfig;
  physical_prizes?: any;
  min_rank_requirement?: string;
  max_rank_requirement?: string;
  rank_requirement?: string | string[];
  club?: Club;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  registration_date: string;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  notes?: string;
  tournament?: Tournament;
  user?: any; // UserProfile from shared-types
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  player1_id: string;
  player2_id: string;
  winner_id?: string;
  score?: string;
  status: MatchStatus;
  scheduled_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  updated_at: string;
}

// ===== CHALLENGE TYPES =====
export interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string;
  club_id?: string;
  bet_points?: number;
  stake_amount?: number;
  race_to?: number;
  handicap_1_rank?: number;
  handicap_05_rank?: number;
  message?: string;
  status: ChallengeStatus;
  scheduled_time?: string;
  expires_at?: string;
  accepted_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  challenger_score?: number;
  opponent_score?: number;
  challenger_submitted_score?: number;
  opponent_submitted_score?: number;
  challenger_score_submitted_at?: string;
  opponent_score_submitted_at?: string;
  club_confirmed?: boolean;
  club_confirmed_by?: string;
  club_confirmed_at?: string;
  club_note?: string;
  score_confirmation_status?: ScoreConfirmationStatus;
  score_entered_by?: string;
  score_confirmed_by?: string;
  challenger_final_score?: number;
  opponent_final_score?: number;
  score_entry_timestamp?: string;
  score_confirmation_timestamp?: string;
  verification_status?: VerificationStatus;
  verification_notes?: string;
  verification_images?: string[];
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  challenger?: ChallengeProfile;
  opponent?: ChallengeProfile;
  club?: Club;
}

export interface ChallengeProfile {
  id?: string;
  user_id: string;
  full_name: string;
  display_name?: string;
  verified_rank?: string;
  elo?: number;
  avatar_url?: string;
  current_rank?: string;
  ranking_points?: number;
  spa_points?: number;
  elo_points?: number;
  player_rankings?: Array<{
    elo_points: number;
    spa_points: number;
  }>;
}

// ===== CLUB TYPES =====
export interface Club {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  owner_id: string;
  status: ClubStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
  operating_hours?: any;
  facilities?: string[];
  table_count?: number;
  pricing?: any;
  social_links?: any;
}

// ===== ENUMS AND CONSTANTS =====
export type TournamentType = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
export type GameFormat = '8_ball' | '9_ball' | '10_ball' | 'straight_pool';
export type TournamentStatus = 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
export type TournamentManagementStatus = 'open' | 'locked' | 'ongoing' | 'completed';
export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'withdrawn';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type MatchStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';
export type ClubStatus = 'pending' | 'active' | 'suspended' | 'closed';

export type ChallengeStatus = 
  | 'pending'
  | 'open'
  | 'accepted'
  | 'declined'
  | 'ongoing'
  | 'pending_approval'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'expired';

export type ScoreConfirmationStatus = 
  | 'pending'
  | 'waiting_confirmation'
  | 'completed'
  | 'score_entered'
  | 'score_confirmed'
  | 'club_confirmed';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface PrizeConfig {
  champion?: number;
  runner_up?: number;
  third_place?: number;
  top_8?: number;
  participation?: number;
}
