-- Rename sabo_tournament_matches to tournament_matches to work with existing SABO functions
-- This allows the 10 SABO functions to work without modification

-- First, check if tournament_matches already exists and backup if needed
DO $$
BEGIN
    -- Check if old tournament_matches exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tournament_matches') THEN
        -- Backup old tournament_matches table
        EXECUTE 'ALTER TABLE tournament_matches RENAME TO tournament_matches_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');
        RAISE NOTICE 'Backed up existing tournament_matches table';
    END IF;
END $$;

-- Rename sabo_tournament_matches to tournament_matches
ALTER TABLE sabo_tournament_matches RENAME TO tournament_matches;

-- Update any indexes that reference the old table name
-- Note: PostgreSQL automatically updates index names when table is renamed

-- Update any constraints that might reference the old table name
-- Note: Most constraints are automatically updated when table is renamed

-- Verify the rename was successful
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tournament_matches') THEN
        RAISE NOTICE '✅ Successfully renamed sabo_tournament_matches to tournament_matches';
    ELSE
        RAISE EXCEPTION '❌ Failed to rename table';
    END IF;
END $$;
