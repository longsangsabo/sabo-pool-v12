-- =============================================================================
-- COMPREHENSIVE TOURNAMENT DATABASE OPTIMIZATION
-- This script runs all necessary database enhancements in sequence
-- =============================================================================

\echo '🎯 Starting comprehensive tournament database optimization...'

-- Step 1: Add missing columns (from 01-add-additional-columns.sql)
\echo '📊 Step 1: Adding missing columns...'

DO $$ 
BEGIN
    \echo 'Checking and adding venue_name column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'venue_name') THEN
        ALTER TABLE tournaments ADD COLUMN venue_name VARCHAR(200);
        RAISE NOTICE 'Added venue_name column';
    ELSE
        RAISE NOTICE 'venue_name column already exists';
    END IF;

    \echo 'Checking and adding is_public column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'is_public') THEN
        ALTER TABLE tournaments ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_public column';
    ELSE
        RAISE NOTICE 'is_public column already exists';
    END IF;

    \echo 'Checking and adding requires_approval column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'requires_approval') THEN
        ALTER TABLE tournaments ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added requires_approval column';
    ELSE
        RAISE NOTICE 'requires_approval column already exists';
    END IF;

    \echo 'Checking and adding tier_level column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'tier_level') THEN
        ALTER TABLE tournaments ADD COLUMN tier_level VARCHAR(20) CHECK (tier_level IN ('tier_1', 'tier_2', 'tier_3', 'amateur', 'professional'));
        RAISE NOTICE 'Added tier_level column';
    ELSE
        RAISE NOTICE 'tier_level column already exists';
    END IF;

    \echo 'Checking and adding allow_all_ranks column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'allow_all_ranks') THEN
        ALTER TABLE tournaments ADD COLUMN allow_all_ranks BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added allow_all_ranks column';
    ELSE
        RAISE NOTICE 'allow_all_ranks column already exists';
    END IF;

    \echo 'Checking and adding eligible_ranks column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'eligible_ranks') THEN
        ALTER TABLE tournaments ADD COLUMN eligible_ranks JSONB DEFAULT '[]';
        RAISE NOTICE 'Added eligible_ranks column';
    ELSE
        RAISE NOTICE 'eligible_ranks column already exists';
    END IF;

    \echo 'Checking and adding organizer_id column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'organizer_id') THEN
        ALTER TABLE tournaments ADD COLUMN organizer_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added organizer_id column';
    ELSE
        RAISE NOTICE 'organizer_id column already exists';
    END IF;

    \echo 'Checking and adding banner_image column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'banner_image') THEN
        ALTER TABLE tournaments ADD COLUMN banner_image TEXT;
        RAISE NOTICE 'Added banner_image column';
    ELSE
        RAISE NOTICE 'banner_image column already exists';
    END IF;

    \echo 'Checking and adding registration_fee column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'registration_fee') THEN
        ALTER TABLE tournaments ADD COLUMN registration_fee DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added registration_fee column';
    ELSE
        RAISE NOTICE 'registration_fee column already exists';
    END IF;

    \echo 'Checking and adding tournament_format_details column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'tournament_format_details') THEN
        ALTER TABLE tournaments ADD COLUMN tournament_format_details JSONB DEFAULT '{}';
        RAISE NOTICE 'Added tournament_format_details column';
    ELSE
        RAISE NOTICE 'tournament_format_details column already exists';
    END IF;

    \echo 'Checking and adding special_rules column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'special_rules') THEN
        ALTER TABLE tournaments ADD COLUMN special_rules JSONB DEFAULT '{}';
        RAISE NOTICE 'Added special_rules column';
    ELSE
        RAISE NOTICE 'special_rules column already exists';
    END IF;

    \echo 'Checking and adding contact_person column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'contact_person') THEN
        ALTER TABLE tournaments ADD COLUMN contact_person VARCHAR(100);
        RAISE NOTICE 'Added contact_person column';
    ELSE
        RAISE NOTICE 'contact_person column already exists';
    END IF;

    \echo 'Checking and adding contact_phone column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'contact_phone') THEN
        ALTER TABLE tournaments ADD COLUMN contact_phone VARCHAR(20);
        RAISE NOTICE 'Added contact_phone column';
    ELSE
        RAISE NOTICE 'contact_phone column already exists';
    END IF;

    \echo 'Checking and adding live_stream_url column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'live_stream_url') THEN
        ALTER TABLE tournaments ADD COLUMN live_stream_url TEXT;
        RAISE NOTICE 'Added live_stream_url column';
    ELSE
        RAISE NOTICE 'live_stream_url column already exists';
    END IF;

    \echo 'Checking and adding sponsor_info column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'sponsor_info') THEN
        ALTER TABLE tournaments ADD COLUMN sponsor_info JSONB DEFAULT '{}';
        RAISE NOTICE 'Added sponsor_info column';
    ELSE
        RAISE NOTICE 'sponsor_info column already exists';
    END IF;

    \echo 'Checking and adding venue_address column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'venue_address') THEN
        ALTER TABLE tournaments ADD COLUMN venue_address TEXT;
        RAISE NOTICE 'Added venue_address column';
    ELSE
        RAISE NOTICE 'venue_address column already exists';
    END IF;

    \echo 'Checking and adding spa_points_config column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'spa_points_config') THEN
        ALTER TABLE tournaments ADD COLUMN spa_points_config JSONB DEFAULT '{}';
        RAISE NOTICE 'Added spa_points_config column';
    ELSE
        RAISE NOTICE 'spa_points_config column already exists';
    END IF;

    \echo 'Checking and adding elo_points_config column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'elo_points_config') THEN
        ALTER TABLE tournaments ADD COLUMN elo_points_config JSONB DEFAULT '{}';
        RAISE NOTICE 'Added elo_points_config column';
    ELSE
        RAISE NOTICE 'elo_points_config column already exists';
    END IF;

    \echo 'Checking and adding min_rank_requirement column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'min_rank_requirement') THEN
        ALTER TABLE tournaments ADD COLUMN min_rank_requirement VARCHAR(5);
        RAISE NOTICE 'Added min_rank_requirement column';
    ELSE
        RAISE NOTICE 'min_rank_requirement column already exists';
    END IF;

    \echo 'Checking and adding max_rank_requirement column...'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'max_rank_requirement') THEN
        ALTER TABLE tournaments ADD COLUMN max_rank_requirement VARCHAR(5);
        RAISE NOTICE 'Added max_rank_requirement column';
    ELSE
        RAISE NOTICE 'max_rank_requirement column already exists';
    END IF;
END $$;

-- Step 2: Ensure prize_distribution column exists
\echo '🏆 Step 2: Ensuring prize_distribution column exists...'

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'prize_distribution') THEN
        ALTER TABLE tournaments ADD COLUMN prize_distribution JSONB DEFAULT '{}';
        RAISE NOTICE 'Added prize_distribution column';
    ELSE
        RAISE NOTICE 'prize_distribution column already exists';
    END IF;
END $$;

-- Step 3: Add indexes for performance
\echo '📈 Step 3: Adding performance indexes...'

DO $$ 
BEGIN
    -- Index for tournament status queries
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_status') THEN
        CREATE INDEX idx_tournaments_status ON tournaments(status);
        RAISE NOTICE 'Created index: idx_tournaments_status';
    END IF;

    -- Index for tournament type queries
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_type') THEN
        CREATE INDEX idx_tournaments_type ON tournaments(tournament_type);
        RAISE NOTICE 'Created index: idx_tournaments_type';
    END IF;

    -- Index for public tournaments
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_public') THEN
        CREATE INDEX idx_tournaments_public ON tournaments(is_public) WHERE is_public = true;
        RAISE NOTICE 'Created index: idx_tournaments_public';
    END IF;

    -- Index for tournament dates
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_start_date') THEN
        CREATE INDEX idx_tournaments_start_date ON tournaments(tournament_start);
        RAISE NOTICE 'Created index: idx_tournaments_start_date';
    END IF;

    -- Index for eligible_ranks JSONB queries
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_eligible_ranks') THEN
        CREATE INDEX idx_tournaments_eligible_ranks ON tournaments USING gin(eligible_ranks);
        RAISE NOTICE 'Created GIN index: idx_tournaments_eligible_ranks';
    END IF;

    -- Index for prize_distribution JSONB queries
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_prize_distribution') THEN
        CREATE INDEX idx_tournaments_prize_distribution ON tournaments USING gin(prize_distribution);
        RAISE NOTICE 'Created GIN index: idx_tournaments_prize_distribution';
    END IF;
END $$;

-- Step 4: Update database statistics
\echo '📊 Step 4: Updating database statistics...'
ANALYZE tournaments;

-- Step 5: Final verification
\echo '✅ Step 5: Final verification...'

SELECT 
    COUNT(*) as total_columns,
    COUNT(*) FILTER (WHERE column_name = 'venue_name') as has_venue_name,
    COUNT(*) FILTER (WHERE column_name = 'is_public') as has_is_public,
    COUNT(*) FILTER (WHERE column_name = 'requires_approval') as has_requires_approval,
    COUNT(*) FILTER (WHERE column_name = 'allow_all_ranks') as has_allow_all_ranks,
    COUNT(*) FILTER (WHERE column_name = 'eligible_ranks') as has_eligible_ranks,
    COUNT(*) FILTER (WHERE column_name = 'prize_distribution') as has_prize_distribution,
    COUNT(*) FILTER (WHERE column_name = 'organizer_id') as has_organizer_id,
    COUNT(*) FILTER (WHERE column_name = 'contact_person') as has_contact_person,
    COUNT(*) FILTER (WHERE column_name = 'contact_phone') as has_contact_phone
FROM information_schema.columns 
WHERE table_name = 'tournaments' AND table_schema = 'public';

\echo '🎉 Comprehensive tournament database optimization completed!'
\echo '📋 Summary:'
\echo '- Added all missing columns for enhanced tournament form'
\echo '- Ensured prize_distribution JSONB column exists'
\echo '- Created performance indexes'
\echo '- Updated database statistics'
\echo ''
\echo 'The tournaments table is now ready for full form field mapping!'
