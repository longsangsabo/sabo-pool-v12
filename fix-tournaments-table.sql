-- =============================================
-- FIX TOURNAMENTS TABLE - ADD MISSING COLUMNS
-- =============================================
-- Run this directly in Supabase SQL Editor

-- Check if columns exist before adding
DO $$ 
BEGIN
    -- Add venue_name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'venue_name') THEN
        ALTER TABLE tournaments ADD COLUMN venue_name TEXT;
        RAISE NOTICE 'Added venue_name column';
    END IF;

    -- Add is_public if not exists  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'is_public') THEN
        ALTER TABLE tournaments ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_public column';
    END IF;

    -- Add requires_approval if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'requires_approval') THEN
        ALTER TABLE tournaments ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added requires_approval column';
    END IF;

    -- Add tier_level if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'tier_level') THEN
        ALTER TABLE tournaments ADD COLUMN tier_level INTEGER DEFAULT 1;
        RAISE NOTICE 'Added tier_level column';
    END IF;

    -- Add allow_all_ranks if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'allow_all_ranks') THEN
        ALTER TABLE tournaments ADD COLUMN allow_all_ranks BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added allow_all_ranks column';
    END IF;

    -- Add eligible_ranks if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'eligible_ranks') THEN
        ALTER TABLE tournaments ADD COLUMN eligible_ranks JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added eligible_ranks column';
    END IF;

    -- Add organizer_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'organizer_id') THEN
        ALTER TABLE tournaments ADD COLUMN organizer_id UUID;
        RAISE NOTICE 'Added organizer_id column';
    END IF;

    -- Add banner_image if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'banner_image') THEN
        ALTER TABLE tournaments ADD COLUMN banner_image TEXT;
        RAISE NOTICE 'Added banner_image column';
    END IF;

    -- Add registration_fee if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'registration_fee') THEN
        ALTER TABLE tournaments ADD COLUMN registration_fee NUMERIC(10,2) DEFAULT 0;
        RAISE NOTICE 'Added registration_fee column';
    END IF;

    -- Add tournament_format_details if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'tournament_format_details') THEN
        ALTER TABLE tournaments ADD COLUMN tournament_format_details TEXT;
        RAISE NOTICE 'Added tournament_format_details column';
    END IF;

    -- Add special_rules if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'special_rules') THEN
        ALTER TABLE tournaments ADD COLUMN special_rules TEXT;
        RAISE NOTICE 'Added special_rules column';
    END IF;

    -- Add contact_person if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'contact_person') THEN
        ALTER TABLE tournaments ADD COLUMN contact_person TEXT;
        RAISE NOTICE 'Added contact_person column';
    END IF;

    -- Add contact_phone if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'contact_phone') THEN
        ALTER TABLE tournaments ADD COLUMN contact_phone TEXT;
        RAISE NOTICE 'Added contact_phone column';
    END IF;

    -- Add live_stream_url if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'live_stream_url') THEN
        ALTER TABLE tournaments ADD COLUMN live_stream_url TEXT;
        RAISE NOTICE 'Added live_stream_url column';
    END IF;

    -- Add sponsor_info if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'sponsor_info') THEN
        ALTER TABLE tournaments ADD COLUMN sponsor_info JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added sponsor_info column';
    END IF;

    -- Add spa_points_config if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'spa_points_config') THEN
        ALTER TABLE tournaments ADD COLUMN spa_points_config JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added spa_points_config column';
    END IF;

    -- Add elo_points_config if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'elo_points_config') THEN
        ALTER TABLE tournaments ADD COLUMN elo_points_config JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added elo_points_config column';
    END IF;

    -- Add prize_distribution if not exists (THIS IS THE MAIN ONE!)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'prize_distribution') THEN
        ALTER TABLE tournaments ADD COLUMN prize_distribution JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added prize_distribution column';
    END IF;

END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_is_public ON tournaments(is_public);
CREATE INDEX IF NOT EXISTS idx_tournaments_requires_approval ON tournaments(requires_approval);
CREATE INDEX IF NOT EXISTS idx_tournaments_tier_level ON tournaments(tier_level);
CREATE INDEX IF NOT EXISTS idx_tournaments_allow_all_ranks ON tournaments(allow_all_ranks);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON tournaments(organizer_id);

-- Add constraints (with safe checking)
DO $$ 
BEGIN
    -- Add tier_level constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'chk_tier_level_valid' 
                   AND table_name = 'tournaments') THEN
        ALTER TABLE tournaments ADD CONSTRAINT chk_tier_level_valid 
        CHECK (tier_level >= 1 AND tier_level <= 10);
        RAISE NOTICE 'Added tier_level constraint';
    END IF;

    -- Add registration_fee constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'chk_registration_fee_non_negative' 
                   AND table_name = 'tournaments') THEN
        ALTER TABLE tournaments ADD CONSTRAINT chk_registration_fee_non_negative 
        CHECK (registration_fee >= 0);
        RAISE NOTICE 'Added registration_fee constraint';
    END IF;
END $$;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

SELECT 'Tournaments table enhancement completed!' as status;
