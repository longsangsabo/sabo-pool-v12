-- ===================================================================
-- 🏗️ STEP 4: CREATE CLEAN TOURNAMENT SCHEMA - Paste vào Supabase Dashboard
-- Tạo consolidated schema mới (CORE MIGRATION)
-- ===================================================================

-- Drop existing tables để tạo clean schema
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS tournament_results CASCADE;
DROP TABLE IF EXISTS tournament_registrations CASCADE;

-- 🏆 CREATE TOURNAMENTS TABLE (Master Tournament Info)
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
  created_by UUID, -- References auth.users(id) - will add FK later
  club_id UUID, -- References club_profiles
  is_visible BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false,
  
  -- Tournament results
  winner_id UUID, -- References auth.users(id)
  runner_up_id UUID, -- References auth.users(id)
  third_place_id UUID, -- References auth.users(id)
  
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

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Basic tournament policies
CREATE POLICY "public_view_visible_tournaments" ON tournaments
  FOR SELECT USING (is_visible = true AND deleted_at IS NULL);

SELECT '✅ TOURNAMENTS table created successfully' as status;
