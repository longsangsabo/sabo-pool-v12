-- ===================================================================
-- 🏅 STEP 6: CREATE REMAINING TABLES - Paste vào Supabase Dashboard
-- Tournament Results và Registrations tables
-- ===================================================================

-- 🏅 CREATE TOURNAMENT_RESULTS TABLE (Final Rankings & Rewards)
CREATE TABLE tournament_results (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id)
  
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

-- 📝 CREATE TOURNAMENT_REGISTRATIONS TABLE (Participant Management) 
CREATE TABLE tournament_registrations (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id)
  
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

-- Enable RLS on both tables
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "public_view_results" ON tournament_results
  FOR SELECT USING (true);

CREATE POLICY "public_view_registrations" ON tournament_registrations
  FOR SELECT USING (true);

-- Create performance indexes
CREATE INDEX idx_tournament_results_tournament ON tournament_results(tournament_id);
CREATE INDEX idx_tournament_results_user ON tournament_results(user_id);
CREATE INDEX idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_registrations_user ON tournament_registrations(user_id);

SELECT '✅ TOURNAMENT_RESULTS and TOURNAMENT_REGISTRATIONS tables created' as status;
