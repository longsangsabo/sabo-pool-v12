-- Fix player_milestones table - Add missing user_id column
-- Date: 2025-08-21
-- Purpose: Fix "column user_id does not exist" error in tournament triggers

-- First, check current schema of player_milestones
\echo '📊 Current player_milestones schema:'
\d+ player_milestones;

-- Check if user_id column exists
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_milestones' 
        AND column_name = 'user_id'
    ) THEN
        \echo '⚠️ user_id column does not exist, adding it...';
        
        -- Add user_id column as UUID with foreign key to auth.users
        ALTER TABLE player_milestones 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        \echo '✅ Added user_id column to player_milestones';
        
        -- If there's existing data, try to populate user_id from participant_id
        IF EXISTS (SELECT 1 FROM player_milestones WHERE user_id IS NULL LIMIT 1) THEN
            \echo '🔄 Populating user_id from existing participant data...';
            
            -- Update user_id based on participant_id mapping
            UPDATE player_milestones 
            SET user_id = tp.user_id
            FROM tournament_participants tp
            WHERE player_milestones.participant_id = tp.id
            AND player_milestones.user_id IS NULL;
            
            \echo '✅ Populated user_id from participant data';
        END IF;
        
    ELSE
        \echo '✅ user_id column already exists';
    END IF;
END $$;

-- Show updated schema
\echo '📊 Updated player_milestones schema:'
\d+ player_milestones;

-- Show sample data to verify
\echo '📋 Sample data after update:'
SELECT 
    id,
    participant_id,
    user_id,
    milestone_type,
    created_at
FROM player_milestones 
LIMIT 5;

-- Check for any NULL user_id values
\echo '🔍 Checking for NULL user_id values:'
SELECT COUNT(*) as null_user_id_count
FROM player_milestones 
WHERE user_id IS NULL;

\echo '🎉 player_milestones column fix completed!';
