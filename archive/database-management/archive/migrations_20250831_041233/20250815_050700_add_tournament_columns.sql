-- Add missing tournament columns
-- Generated on 2025-08-15

-- Add venue information
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue_name VARCHAR(200);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue_address TEXT;

-- Add tournament configuration
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tier_level VARCHAR(20);

-- Add rank restrictions
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS allow_all_ranks BOOLEAN DEFAULT true;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS eligible_ranks JSONB DEFAULT '[]';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS min_rank_requirement VARCHAR(5);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_rank_requirement VARCHAR(5);

-- Add contact information
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS organizer_id UUID;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add media and branding
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS live_stream_url TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS sponsor_info JSONB DEFAULT '{}';

-- Add financial details
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_fee DECIMAL(10,2) DEFAULT 0;

-- Add tournament structure details
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tournament_format_details JSONB DEFAULT '{}';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS special_rules JSONB DEFAULT '{}';

-- Add points configuration
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS spa_points_config JSONB DEFAULT '{}';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS elo_points_config JSONB DEFAULT '{}';

-- Add prize distribution (most important!)
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS prize_distribution JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments(tournament_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_public ON tournaments(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(tournament_start);
CREATE INDEX IF NOT EXISTS idx_tournaments_eligible_ranks ON tournaments USING gin(eligible_ranks);
CREATE INDEX IF NOT EXISTS idx_tournaments_prize_distribution ON tournaments USING gin(prize_distribution);

-- Add constraints
ALTER TABLE tournaments ADD CONSTRAINT IF NOT EXISTS chk_tier_level 
  CHECK (tier_level IN ('tier_1', 'tier_2', 'tier_3', 'amateur', 'professional') OR tier_level IS NULL);

-- Update table statistics
ANALYZE tournaments;
