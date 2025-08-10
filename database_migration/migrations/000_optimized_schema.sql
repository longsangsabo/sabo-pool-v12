-- MIGRATION_METADATA
-- id: 000_optimized_schema
-- created: 2025-08-10
-- author: system
-- description: Base optimized target schema tables required by migration functions & views.
-- safe_retries: true
-- requires: none
-- rollback: drop tables (manual if needed)
-- /MIGRATION_METADATA
SET search_path TO public;

-- Core optimized profile table
CREATE TABLE IF NOT EXISTS profiles_optimized (
  user_id UUID PRIMARY KEY,
  full_name TEXT,
  display_name TEXT,
  nickname TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  district TEXT,
  current_rank TEXT,
  elo_points INT,
  spa_points INT,
  skill_level TEXT,
  active_role TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_demo_user BOOLEAN DEFAULT false,
  ban_status TEXT,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID,
  member_since TIMESTAMPTZ,
  completion_percentage INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tournaments optimized
CREATE TABLE IF NOT EXISTS tournaments_v2 (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  club_id UUID,
  venue_address TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  prize_config JSONB DEFAULT '{}'::jsonb,
  status TEXT,
  current_phase TEXT,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  tournament_start TIMESTAMPTZ,
  tournament_end TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  current_participants INT,
  management_status TEXT,
  bracket_progression JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  is_visible BOOLEAN DEFAULT true,
  is_draft BOOLEAN DEFAULT false,
  rules TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Matches optimized
CREATE TABLE IF NOT EXISTS tournament_matches_v2 (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments_v2(id) ON DELETE CASCADE,
  round_number INT,
  match_number INT,
  match_stage TEXT,
  round_position INT,
  player1_id UUID,
  player2_id UUID,
  winner_id UUID,
  score_player1 INT,
  score_player2 INT,
  status TEXT,
  scheduled_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  score_status TEXT,
  score_input_by UUID,
  score_submitted_at TIMESTAMPTZ,
  referee_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wallets optimized
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID PRIMARY KEY,
  spa_points INT DEFAULT 0,
  cash_balance NUMERIC(12,2) DEFAULT 0,
  total_earned_points INT DEFAULT 0,
  total_spent_points INT DEFAULT 0,
  total_earned_cash NUMERIC(12,2) DEFAULT 0,
  total_spent_cash NUMERIC(12,2) DEFAULT 0,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wallet transactions v2
CREATE TABLE IF NOT EXISTS wallet_transactions_v2 (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_wallets(user_id) ON DELETE CASCADE,
  transaction_type TEXT,
  amount NUMERIC(12,2),
  currency TEXT,
  source_type TEXT,
  source_id UUID,
  spa_points_change INT,
  elo_points_change INT,
  wallet_balance_after NUMERIC(12,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tournament participants (optimized consolidated)
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments_v2(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_optimized(user_id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ,
  registration_status TEXT,
  status TEXT,
  seed_position INT,
  bracket_position INT,
  current_bracket TEXT,
  elimination_round TEXT,
  entry_fee NUMERIC,
  payment_status TEXT,
  payment_method TEXT,
  final_position INT,
  matches_played INT,
  matches_won INT,
  matches_lost INT,
  win_percentage NUMERIC,
  spa_points_earned INT,
  elo_points_earned INT,
  prize_amount NUMERIC,
  physical_rewards TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Club memberships optimized
-- Clubs optimized (create before memberships to satisfy FK)
CREATE TABLE IF NOT EXISTS clubs_v2 (
  id UUID PRIMARY KEY,
  owner_id UUID,
  name TEXT,
  club_code TEXT,
  description TEXT,
  address TEXT,
  district TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  status TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  member_count INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Club memberships (depends on clubs_v2 & profiles_optimized)
CREATE TABLE IF NOT EXISTS club_memberships (
  id UUID PRIMARY KEY,
  club_id UUID REFERENCES clubs_v2(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_optimized(user_id) ON DELETE CASCADE,
  role TEXT,
  membership_type TEXT,
  membership_number TEXT,
  status TEXT,
  joined_at TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  total_visits INT,
  last_visit TIMESTAMPTZ,
  total_hours_played INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_optimized_updated_at ON profiles_optimized(updated_at);
CREATE INDEX IF NOT EXISTS idx_tournaments_v2_updated_at ON tournaments_v2(updated_at);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_v2_tournament ON tournament_matches_v2(tournament_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_v2_user ON wallet_transactions_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club ON club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user ON club_memberships(user_id);

-- End of 000_optimized_schema.sql
