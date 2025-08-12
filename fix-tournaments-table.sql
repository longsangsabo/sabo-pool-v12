-- ✅ KHÔI PHỤC BẢNG TOURNAMENTS
-- Tạo lại bảng tournaments với các cột cần thiết

CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tournament_type VARCHAR(50) DEFAULT 'sabo_double_elimination',
    format VARCHAR(50) DEFAULT 'double_elimination',
    max_participants INTEGER DEFAULT 16,
    current_participants INTEGER DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    club_id UUID REFERENCES clubs(id),
    tier_id UUID REFERENCES tournament_tiers(id),
    status VARCHAR(50) DEFAULT 'registration' CHECK (status IN ('registration', 'active', 'completed', 'cancelled')),
    
    -- Date fields
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_start TIMESTAMPTZ DEFAULT NOW(),
    registration_end TIMESTAMPTZ,
    
    -- Tournament specific
    bracket_data JSONB DEFAULT '{}',
    rules JSONB DEFAULT '{}',
    requirements JSONB DEFAULT '{}',
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_registration CHECK (registration_end IS NULL OR registration_end <= start_date),
    CONSTRAINT valid_participants CHECK (current_participants <= max_participants)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_tier_id ON tournaments(tier_id);

-- RLS Policy
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read tournaments
CREATE POLICY "Public can read tournaments" ON tournaments
    FOR SELECT USING (true);

-- Policy: Authenticated users can create tournaments
CREATE POLICY "Authenticated users can create tournaments" ON tournaments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Tournament creators and admins can update
CREATE POLICY "Tournament creators and admins can update" ON tournaments
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin', 'tournament_admin')
        )
    );

-- Update trigger
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_tournaments_updated_at();

-- ✅ Thêm sample tournament để test
INSERT INTO tournaments (
    name,
    description,
    tournament_type,
    format,
    max_participants,
    entry_fee,
    prize_pool,
    start_date,
    end_date,
    status
) VALUES (
    'SABO Pool Championship 2025',
    'SABO Double Elimination Tournament with 16 players maximum',
    'sabo_double_elimination',
    'double_elimination',
    16,
    50000.00,
    500000.00,
    '2025-08-15 09:00:00+07',
    '2025-08-15 18:00:00+07',
    'registration'
) ON CONFLICT DO NOTHING;

-- ✅ Chắc chắn bảng tournaments_tiers có data
INSERT INTO tournament_tiers (
    tier_name,
    tier_level,
    points_multiplier,
    qualification_required,
    min_participants,
    description
) VALUES (
    'Bronze',
    1,
    1.0,
    false,
    8,
    'Entry level tournament for all players'
),
(
    'Silver', 
    2,
    1.5,
    true,
    12,
    'Intermediate tournament for experienced players'
),
(
    'Gold',
    3,
    2.0,
    true,
    16,
    'Advanced tournament for skilled players'
),
(
    'Diamond',
    4,
    3.0,
    true,
    16,
    'Elite tournament for top players'
) ON CONFLICT (tier_name) DO NOTHING;

-- ✅ Verify tables exist
SELECT 'tournaments table created' as status, count(*) as records FROM tournaments;
SELECT 'tournament_tiers table verified' as status, count(*) as records FROM tournament_tiers;
