-- ===================================================================
-- 🔧 SABO POOL V12 - CONSOLIDATED SCHEMA MIGRATION
-- Giải quyết vấn đề 57+ conflicting migration files
-- Created: 2025-08-11
-- ===================================================================

-- MISSION: Tạo CLEAN, CONSOLIDATED schema cho production
-- PROBLEM: 61 migration files tạo tournament tables → schema inconsistency
-- SOLUTION: Single source of truth với proper versioning

BEGIN;

-- ===============================================
-- 📋 PHASE 1: BACKUP EXISTING DATA (SAFETY FIRST)
-- ===============================================

-- Create backup tables trước khi consolidate
DO $$
BEGIN
  -- Backup tournaments data if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS tournaments_backup_' || to_char(now(), 'YYYYMMDD_HH24MI') || ' AS SELECT * FROM tournaments';
    RAISE NOTICE '✅ Backed up tournaments table';
  END IF;
  
  -- Backup tournament_matches data if table exists  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament_matches') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS tournament_matches_backup_' || to_char(now(), 'YYYYMMDD_HH24MI') || ' AS SELECT * FROM tournament_matches';
    RAISE NOTICE '✅ Backed up tournament_matches table';
  END IF;
  
  -- Backup tournament_results data if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament_results') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS tournament_results_backup_' || to_char(now(), 'YYYYMMDD_HH24MI') || ' AS SELECT * FROM tournament_results';
    RAISE NOTICE '✅ Backed up tournament_results table';
  END IF;
END $$;

-- ===============================================
-- 📋 PHASE 2: DROP CONFLICTING OBJECTS
-- ===============================================

-- Drop all conflicting triggers
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v9 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS update_tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS notify_winner_advancement_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_advance_double_elimination ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_update_tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS auto_advance_double_elimination_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS tournament_match_winner_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS advance_winner_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_advance_double_elimination_fixed ON tournament_matches CASCADE;

-- Drop conflicting policies (will recreate clean ones)
DROP POLICY IF EXISTS "Club owners can manage their tournaments" ON tournaments;
DROP POLICY IF EXISTS "Everyone can view public tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can manage their registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Everyone can view registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Tournament participants and organizers can view matches" ON tournament_matches;
DROP POLICY IF EXISTS "Tournament organizers can manage matches" ON tournament_matches;
DROP POLICY IF EXISTS "Admins and club owners can view tournament results" ON tournament_results;
DROP POLICY IF EXISTS "System can insert tournament results" ON tournament_results;

-- ===============================================
-- 📋 PHASE 3: CONSOLIDATED TABLE SCHEMAS 
-- ===============================================

-- 🏆 TABLE 1: TOURNAMENTS (Master Tournament Info)
DROP TABLE IF EXISTS tournaments CASCADE;
CREATE TABLE tournaments (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Tournament type configuration (SABO-compatible)
  tournament_type TEXT NOT NULL DEFAULT 'single_elimination' 
    CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  format TEXT NOT NULL DEFAULT 'single_elimination'
    CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  bracket_type TEXT DEFAULT 'single_elimination'
    CHECK (bracket_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'registration_open'
    CHECK (status IN ('registration_open', 'ongoing', 'completed', 'cancelled')),
  bracket_generated BOOLEAN DEFAULT false,
  
  -- Participant management
  max_participants INTEGER CHECK (max_participants > 0),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  
  -- Financial
  entry_fee NUMERIC DEFAULT 0 CHECK (entry_fee >= 0),
  prize_pool NUMERIC DEFAULT 0 CHECK (prize_pool >= 0),
  
  -- Scheduling
  tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_end TIMESTAMP WITH TIME ZONE,
  registration_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registration_end TIMESTAMP WITH TIME ZONE,
  
  -- Additional info
  location TEXT,
  rules TEXT,
  
  -- Ownership & visibility
  created_by UUID REFERENCES auth.users(id),
  club_id UUID, -- FK to club_profiles, but not enforced to avoid circular deps
  is_visible BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false,
  
  -- Tournament results
  winner_id UUID REFERENCES auth.users(id),
  runner_up_id UUID REFERENCES auth.users(id), 
  third_place_id UUID REFERENCES auth.users(id),
  
  -- Round robin specific (for future use)
  round_robin_rounds INTEGER,
  advancement_rule TEXT DEFAULT 'elimination'
    CHECK (advancement_rule IN ('elimination', 'points', 'hybrid')),
  tiebreaker_rule TEXT DEFAULT 'head_to_head'
    CHECK (tiebreaker_rule IN ('head_to_head', 'goal_difference', 'random')),
  
  -- Audit fields
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 🥅 TABLE 2: TOURNAMENT_MATCHES (Core SABO Table)
DROP TABLE IF EXISTS tournament_matches CASCADE;
CREATE TABLE tournament_matches (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- SABO bracket structure
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  match_number INTEGER NOT NULL CHECK (match_number > 0),
  bracket_type TEXT NOT NULL DEFAULT 'winner'
    CHECK (bracket_type IN ('winners', 'losers', 'semifinals', 'finals', 'winner', 'loser')),
  branch_type TEXT CHECK (branch_type IN ('A', 'B')), -- Only for losers bracket
  
  -- Match participants
  player1_id UUID REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),
  winner_id UUID REFERENCES auth.users(id),
  
  -- Scoring system
  score_player1 INTEGER DEFAULT 0 CHECK (score_player1 >= 0),
  score_player2 INTEGER DEFAULT 0 CHECK (score_player2 >= 0),
  
  -- Match status & timing
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'in_progress', 'completed', 'cancelled')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE, -- For legacy compatibility
  
  -- Table management
  assigned_table_id UUID, -- FK to tables (if table system exists)
  table_released_at TIMESTAMP WITH TIME ZONE,
  
  -- Score submission tracking
  score_status TEXT DEFAULT 'pending'
    CHECK (score_status IN ('pending', 'submitted', 'confirmed', 'disputed')),
  score_confirmed_by UUID REFERENCES auth.users(id),
  score_confirmed_at TIMESTAMP WITH TIME ZONE,
  score_input_by UUID REFERENCES auth.users(id), -- Who submitted the score
  score_submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Special match flags  
  is_third_place_match BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tournament_id, round_number, match_number, bracket_type),
  
  -- Ensure winner is one of the players
  CHECK (winner_id IS NULL OR winner_id IN (player1_id, player2_id)),
  
  -- Ensure completed matches have winner
  CHECK (status != 'completed' OR winner_id IS NOT NULL)
);

-- 🏅 TABLE 3: TOURNAMENT_RESULTS (Final Rankings & Rewards)
DROP TABLE IF EXISTS tournament_results CASCADE;
CREATE TABLE tournament_results (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Final ranking
  final_position INTEGER NOT NULL CHECK (final_position > 0),
  
  -- Match statistics
  total_matches INTEGER DEFAULT 0 CHECK (total_matches >= 0),
  wins INTEGER DEFAULT 0 CHECK (wins >= 0),
  losses INTEGER DEFAULT 0 CHECK (losses >= 0),
  win_percentage NUMERIC DEFAULT 0 CHECK (win_percentage >= 0 AND win_percentage <= 100),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0),
  
  -- Rewards
  prize_amount NUMERIC DEFAULT 0 CHECK (prize_amount >= 0),
  spa_points_awarded INTEGER DEFAULT 0,
  elo_points_awarded INTEGER DEFAULT 0,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tournament_id, user_id),
  UNIQUE(tournament_id, final_position)
);

-- 📊 TABLE 4: TOURNAMENT_REGISTRATIONS (Participant Management) 
DROP TABLE IF EXISTS tournament_registrations CASCADE;
CREATE TABLE tournament_registrations (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Registration status
  registration_status TEXT DEFAULT 'confirmed'
    CHECK (registration_status IN ('pending', 'confirmed', 'cancelled', 'waitlist')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Payment tracking
  payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
  
  -- Additional info
  notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tournament_id, user_id)
);
