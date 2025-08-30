// Tournament Business Logic Types
export interface TournamentData {
  id?: string;
  name: string;
  description?: string;
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  game_format: '8_ball' | '9_ball' | '10_ball' | 'straight_pool';
  max_participants: number;
  current_participants?: number;
  entry_fee: number;
  prize_pool: number;
  tournament_start: string;
  tournament_end: string;
  registration_start: string;
  registration_end: string;
  venue_address?: string;
  rules?: string;
  contact_info?: string;
  tier_level?: number;
  status?: 'upcoming' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
  created_by: string;
  club_id?: string;
  has_third_place_match?: boolean;
  requires_approval?: boolean;
  is_public?: boolean;
  allow_all_ranks?: boolean;
  eligible_ranks?: string[];
  min_rank_requirement?: string;
  max_rank_requirement?: string;
}

export interface TournamentFormData {
  name: string;
  description: string;
  max_participants: number;
  entry_fee: number;
  tournament_start: string;
  tournament_end: string;
  registration_start: string;
  registration_end: string;
  venue_address: string;
}

export interface DE16TournamentData extends TournamentData {
  tournament_type: 'double_elimination';
  max_participants: 16;
  bracket_structure: 'DE16';
}

export interface PrizeBreakdown {
  first_prize: number;
  second_prize: number;
  third_prize: number;
  prize_distribution: Array<{
    position: number;
    percentage: number;
    amount: number;
  }>;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  registration_status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
  payment_status: 'unpaid' | 'pending' | 'paid' | 'refunded';
  registered_at: string;
  notes?: string;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  bracket_type: 'winners' | 'losers' | 'semifinals' | 'finals';
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  score_player1?: number;
  score_player2?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  scheduled_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  notes?: string;
}

export interface TournamentResult {
  id: string;
  tournament_id: string;
  user_id: string;
  final_position: number;
  elo_points_earned: number;
  spa_points_earned: number;
  prize_amount: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  win_percentage: number;
}

export interface TournamentValidationErrors {
  name?: string;
  description?: string;
  max_participants?: string;
  entry_fee?: string;
  tournament_start?: string;
  tournament_end?: string;
  registration_start?: string;
  registration_end?: string;
  venue_address?: string;
}

export interface BracketNode {
  id: string;
  match_id?: string;
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  round: number;
  position: number;
  bracket_type: 'winners' | 'losers';
  next_match_id?: string;
  loser_next_match_id?: string;
}

export interface TournamentBracket {
  tournament_id: string;
  bracket_type: 'single_elimination' | 'double_elimination' | 'DE16';
  winners_bracket: BracketNode[];
  losers_bracket?: BracketNode[];
  finals_bracket?: BracketNode[];
  total_rounds: number;
  current_round: number;
}

// Tournament Service Result Types
export interface TournamentServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TournamentCreationResult {
  tournament: TournamentData;
  notification_sent: boolean;
  bracket_initialized: boolean;
}

// Tournament Business Logic Configuration
export interface TournamentConfig {
  max_participants_limit: number;
  min_entry_fee: number;
  max_entry_fee: number;
  default_prize_distribution: {
    first: number;
    second: number;
    third: number;
  };
  registration_deadline_hours: number;
  tournament_start_delay_hours: number;
}
