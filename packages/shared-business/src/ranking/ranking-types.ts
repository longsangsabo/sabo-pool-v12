// ELO and Ranking Types
export interface ELOConfig {
  k_factor: number;
  rating_floor: number;
  rating_ceiling: number;
  volatility_adjustment: boolean;
  streak_bonus: boolean;
  tournament_bonus: boolean;
  upset_bonus: boolean;
  quality_match_bonus: boolean;
}

export interface ELOMatch {
  player1_rating: number;
  player2_rating: number;
  player1_matches: number;
  player2_matches: number;
  player1_streak: number;
  player2_streak: number;
  player1_volatility: number;
  player2_volatility: number;
}

export interface ELOResult {
  player1_rating_change: number;
  player2_rating_change: number;
  expected_score_1: number;
  expected_score_2: number;
  k_factor_1: number;
  k_factor_2: number;
}

export interface ELOChange {
  newRating: number;
  ratingChange: number;
  kFactor: number;
  expectedScore: number;
}

// SABO Pool Arena Rank System
export type SABORank = 'K' | 'K+' | 'I' | 'I+' | 'H' | 'H+' | 'G' | 'G+' | 'F' | 'F+' | 'E' | 'E+';

export interface RankTier {
  rank: SABORank;
  minRating: number;
  maxRating: number;
  color: string;
  description: string;
  kFactor: number;
  tier?: string;
  division?: number;
  qualifiesForTournaments?: string[];
  canCreateChallenges?: boolean;
  maxChallengesPerDay?: number;
  unlockFeatures?: string[];
}

export interface PlayerRating {
  id: string;
  user_id: string;
  username: string;
  current_rating: number;
  rank: SABORank;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  win_rate: number;
  current_streak: number;
  best_streak: number;
  recent_form: number;
  consistency_score: number;
  rating_volatility: number;
  highest_rating: number;
  lowest_rating: number;
  average_opponent_rating: number;
  elo_efficiency: number;
}

// SPA (SABO Pool Arena) Points System
export interface SPAPointsConfig {
  base_points_per_match: number;
  win_bonus_multiplier: number;
  tournament_base_multiplier: number;
  challenge_bonus_multiplier: number;
  daily_activity_bonus: number;
  weekly_activity_bonus: number;
  monthly_activity_bonus: number;
  streak_bonus_threshold: number;
  streak_bonus_multiplier: number;
  upset_bonus_multiplier: number;
  perfect_game_bonus: number;
  first_win_of_day_bonus: number;
}

export interface SPAActivity {
  player_id: string;
  activity_type: 'match' | 'tournament' | 'challenge' | 'practice';
  result: 'win' | 'loss' | 'draw';
  is_tournament: boolean;
  is_challenge: boolean;
  is_perfect_game: boolean;
  is_first_win_of_day: boolean;
  current_streak: number;
  opponent_rating?: number;
  player_rating?: number;
  match_id?: string;
  tournament_id?: string;
  challenge_id?: string;
}

export interface SPABonus {
  type: string;
  amount: number;
  description: string;
}

export interface SPAPointsTransaction {
  player_id: string;
  activity_type: string;
  base_points: number;
  bonus_points: number;
  total_points: number;
  bonuses: SPABonus[];
  timestamp: Date;
  match_id?: string;
  tournament_id?: string;
  challenge_id?: string;
  achievement_id?: string;
}

export interface SPAPointsBalance {
  player_id: string;
  current_balance: number;
  total_earned: number;
  total_spent: number;
  recent_earned: number;
  last_updated: Date;
}

export interface SPALeaderboard {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  rankings: {
    rank: number;
    player_id: string;
    points: number;
    change_from_previous: number;
  }[];
  generated_at: Date;
}

export interface SPABadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlock_condition: string;
}

export interface SPAAchievement {
  id: string;
  name: string;
  description: string;
  points_reward: number;
  badge_id?: string;
  progress_type: 'count' | 'streak' | 'milestone';
  target_value: number;
}

export interface SPAReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'cosmetic' | 'gameplay' | 'convenience';
  available: boolean;
}

export interface SPAMultiplier {
  factor: number;
  type: string;
}

export interface SPAPointsCalculation {
  tournament_multipliers: {
    tier_1: number;
    tier_2: number;
    tier_3: number;
  };
  position_points: {
    champion: number;
    runner_up: number;
    third_place: number;
    top_8: number;
    participation: number;
  };
  streak_bonuses: {
    win_streak_3: number;
    win_streak_5: number;
    win_streak_10: number;
  };
  seasonal_decay: number; // Points decay per season
}

export interface SPAPointsCalculation {
  base_points: number;
  tier_multiplier: number;
  position_bonus: number;
  streak_bonus: number;
  total_points: number;
}

export interface RankProgression {
  current_rank: SABORank;
  current_rating: number;
  next_rank: SABORank | null;
  points_to_next: number;
  progress_percentage: number;
}

// Service Results
export interface RankingServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
