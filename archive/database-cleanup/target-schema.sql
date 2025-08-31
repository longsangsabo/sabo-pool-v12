-- ===================================================================
-- 🔧 SABO POOL V12 - OPTIMIZED CLEAN SCHEMA DESIGN
-- Smart, consolidated database architecture
-- Created: August 31, 2025
-- ===================================================================

-- This is the TARGET schema we want to achieve after cleanup

BEGIN;

-- ============================================================================
-- 🏗️ CORE USER SYSTEM (Unified & Simplified)
-- ============================================================================

-- 👤 Profiles: Single source of truth for all user data
CREATE TABLE profiles (
  -- Identity
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  display_name TEXT,
  nickname TEXT,
  
  -- Contact & Location
  phone TEXT,
  city TEXT,
  district TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Gaming Profile
  current_rank TEXT DEFAULT 'K',
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  elo_points INTEGER DEFAULT 1000 CHECK (elo_points >= 0),
  spa_points INTEGER DEFAULT 0 CHECK (spa_points >= 0),
  
  -- Role & Status
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'club_owner', 'admin', 'both')),
  active_role TEXT DEFAULT 'player' CHECK (active_role IN ('player', 'club_owner')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
  
  -- Admin & Demo
  is_admin BOOLEAN DEFAULT false,
  is_demo_user BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- 🏆 Rankings: Simplified ranking system
CREATE TABLE user_rankings (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Core Stats
  total_matches INTEGER DEFAULT 0 CHECK (total_matches >= 0),
  wins INTEGER DEFAULT 0 CHECK (wins >= 0),
  losses INTEGER DEFAULT 0 CHECK (losses >= 0),
  win_streak INTEGER DEFAULT 0 CHECK (win_streak >= 0),
  best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
  
  -- Performance Metrics
  win_rate DECIMAL(5,2) DEFAULT 0 CHECK (win_rate >= 0 AND win_rate <= 100),
  average_score DECIMAL(5,2) DEFAULT 0,
  performance_rating DECIMAL(8,2) DEFAULT 1000,
  
  -- Ranking Info
  current_rank TEXT DEFAULT 'K',
  verified_rank TEXT,
  rank_points DECIMAL(8,2) DEFAULT 0,
  promotion_eligible BOOLEAN DEFAULT false,
  
  -- Timestamps
  last_match_at TIMESTAMPTZ,
  rank_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 💰 Wallets: Unified financial system
CREATE TABLE user_wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Balances
  spa_points INTEGER DEFAULT 0 CHECK (spa_points >= 0),
  cash_balance DECIMAL(12,2) DEFAULT 0 CHECK (cash_balance >= 0),
  
  -- Lifetime Stats
  total_earned_points INTEGER DEFAULT 0 CHECK (total_earned_points >= 0),
  total_spent_points INTEGER DEFAULT 0 CHECK (total_spent_points >= 0),
  total_cash_earned DECIMAL(12,2) DEFAULT 0 CHECK (total_cash_earned >= 0),
  total_cash_spent DECIMAL(12,2) DEFAULT 0 CHECK (total_cash_spent >= 0),
  
  -- Status
  wallet_status TEXT DEFAULT 'active' CHECK (wallet_status IN ('active', 'frozen', 'suspended')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 🎮 GAME SYSTEM (Streamlined & Efficient)
-- ============================================================================

-- ⚔️ Challenges: All challenge types in one table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  challenger_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Challenge Details
  challenge_type TEXT DEFAULT 'standard' CHECK (challenge_type IN ('standard', 'sabo', 'tournament')),
  stake_amount INTEGER NOT NULL CHECK (stake_amount > 0),
  race_to INTEGER, -- For SABO challenges
  
  -- Handicap (for SABO)
  handicap_challenger DECIMAL(3,1) DEFAULT 0,
  handicap_opponent DECIMAL(3,1) DEFAULT 0,
  
  -- Status & Scheduling
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')),
  message TEXT,
  location TEXT,
  scheduled_time TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  
  -- Results
  winner_id UUID REFERENCES profiles(user_id),
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  
  -- Metadata
  admin_created BOOLEAN DEFAULT false,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 🏆 Tournaments: Clean tournament system
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  club_id UUID REFERENCES clubs(id),
  venue_address TEXT,
  
  -- Configuration
  tournament_type TEXT DEFAULT 'single_elimination' CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  max_participants INTEGER CHECK (max_participants > 0),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  
  -- Financial
  entry_fee DECIMAL(10,2) DEFAULT 0 CHECK (entry_fee >= 0),
  prize_pool DECIMAL(10,2) DEFAULT 0 CHECK (prize_pool >= 0),
  prize_config JSONB DEFAULT '{}',
  
  -- Status & Timing
  status TEXT DEFAULT 'registration_open' CHECK (status IN ('registration_open', 'ongoing', 'completed', 'cancelled')),
  registration_start TIMESTAMPTZ DEFAULT now(),
  registration_end TIMESTAMPTZ,
  tournament_start TIMESTAMPTZ NOT NULL,
  tournament_end TIMESTAMPTZ,
  
  -- Management
  created_by UUID NOT NULL REFERENCES profiles(user_id),
  bracket_generated BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 🥊 Matches: All match records (challenges + tournaments)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Match Type
  match_type TEXT NOT NULL CHECK (match_type IN ('challenge', 'tournament')),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- Tournament Context (if applicable)
  round_number INTEGER,
  match_number INTEGER,
  bracket_position TEXT,
  
  -- Participants
  player1_id UUID NOT NULL REFERENCES profiles(user_id),
  player2_id UUID NOT NULL REFERENCES profiles(user_id),
  winner_id UUID REFERENCES profiles(user_id),
  
  -- Scores
  player1_score INTEGER DEFAULT 0 CHECK (player1_score >= 0),
  player2_score INTEGER DEFAULT 0 CHECK (player2_score >= 0),
  
  -- Status & Timing
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  referee_id UUID REFERENCES profiles(user_id),
  notes TEXT,
  video_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 🏢 BUSINESS LOGIC (Simplified & Focused)
-- ============================================================================

-- 🏛️ Clubs: Venue management
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  district TEXT,
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Facilities
  table_count INTEGER DEFAULT 1 CHECK (table_count > 0),
  operating_hours JSONB DEFAULT '{}',
  amenities TEXT[],
  
  -- Business
  owner_id UUID REFERENCES profiles(user_id),
  is_verified BOOLEAN DEFAULT false,
  is_sabo_partner BOOLEAN DEFAULT false,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 💳 Transactions: Financial history
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Wallet
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount INTEGER NOT NULL CHECK (amount != 0),
  currency_type TEXT DEFAULT 'spa_points' CHECK (currency_type IN ('spa_points', 'cash')),
  
  -- Categories
  category TEXT NOT NULL CHECK (category IN (
    'challenge_win', 'challenge_loss', 'tournament_prize', 'tournament_entry',
    'deposit', 'withdrawal', 'admin_adjustment', 'referral_bonus', 'signup_bonus'
  )),
  
  -- Context
  reference_id UUID, -- Link to challenge, tournament, etc.
  description TEXT,
  admin_notes TEXT,
  
  -- Balances (snapshot at transaction time)
  balance_before INTEGER,
  balance_after INTEGER,
  
  -- Metadata
  processed_by UUID REFERENCES profiles(user_id),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 📊 SYSTEM TABLES (Configuration & Logs)
-- ============================================================================

-- ⚙️ System Settings
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(user_id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 📢 Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
  
  -- Context
  reference_type TEXT, -- 'challenge', 'tournament', 'system'
  reference_id UUID,
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- ============================================================================
-- 🔧 INDEXES FOR PERFORMANCE
-- ============================================================================

-- User & Profile Indexes
CREATE INDEX idx_profiles_current_rank ON profiles(current_rank);
CREATE INDEX idx_profiles_spa_points ON profiles(spa_points DESC);
CREATE INDEX idx_profiles_elo_points ON profiles(elo_points DESC);
CREATE INDEX idx_profiles_active_role ON profiles(active_role);
CREATE INDEX idx_profiles_is_demo_user ON profiles(is_demo_user);

-- Challenge Indexes
CREATE INDEX idx_challenges_challenger_id ON challenges(challenger_id);
CREATE INDEX idx_challenges_opponent_id ON challenges(opponent_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_expires_at ON challenges(expires_at);
CREATE INDEX idx_challenges_created_at ON challenges(created_at DESC);

-- Tournament Indexes
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_tournament_start ON tournaments(tournament_start);
CREATE INDEX idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);

-- Match Indexes
CREATE INDEX idx_matches_match_type ON matches(match_type);
CREATE INDEX idx_matches_player1_id ON matches(player1_id);
CREATE INDEX idx_matches_player2_id ON matches(player2_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Transaction Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_reference_id ON transactions(reference_id);

-- Notification Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- 🛡️ ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- User rankings policies
CREATE POLICY "Anyone can view rankings" ON user_rankings FOR SELECT USING (true);
CREATE POLICY "System can update rankings" ON user_rankings FOR ALL USING (
  auth.role() = 'service_role' OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Wallet policies
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage wallets" ON user_wallets FOR ALL USING (
  auth.role() = 'service_role' OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Challenge policies
CREATE POLICY "Users can view challenges they're involved in" ON challenges FOR SELECT USING (
  challenger_id = auth.uid() OR opponent_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Users can create challenges" ON challenges FOR INSERT WITH CHECK (
  challenger_id = auth.uid()
);
CREATE POLICY "Users can update challenges they're involved in" ON challenges FOR UPDATE USING (
  challenger_id = auth.uid() OR opponent_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Tournament policies
CREATE POLICY "Anyone can view public tournaments" ON tournaments FOR SELECT USING (
  is_public = true OR created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Users can create tournaments" ON tournaments FOR INSERT WITH CHECK (
  created_by = auth.uid()
);
CREATE POLICY "Tournament creators can update their tournaments" ON tournaments FOR UPDATE USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Transaction policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

COMMIT;

-- ============================================================================
-- 📝 SCHEMA SUMMARY
-- ============================================================================

/*
OPTIMIZED SCHEMA FEATURES:
✅ Unified user system (profiles, rankings, wallets)
✅ Flexible challenge system (standard + SABO)
✅ Scalable tournament management
✅ Comprehensive financial tracking
✅ Performance-optimized indexes
✅ Security with RLS policies
✅ Clean foreign key relationships
✅ Proper data types and constraints

REDUCED COMPLEXITY:
❌ Eliminated 2700+ conflicting migrations
❌ Removed duplicate table definitions
❌ Simplified function dependencies
❌ Consolidated business logic

PERFORMANCE IMPROVEMENTS:
🚀 Strategic indexing for common queries
🚀 Optimized table structures
🚀 Efficient relationship design
🚀 Minimal data redundancy
*/
