-- ============================================================================
-- PART 1: ADD USER NAME COLUMNS ONLY
-- ============================================================================
-- Purpose: Add user_name columns first (separate from updates)
-- Run this FIRST in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Step 1: Add user_name column to player_rankings table
ALTER TABLE player_rankings 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 2: Add user_name column to player_milestones table  
ALTER TABLE player_milestones 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 3: Add user_name column to spa_transactions table
ALTER TABLE spa_transactions 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 4: Add user_name column to challenge_notifications table
ALTER TABLE challenge_notifications 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Verification that columns were added
SELECT 'Columns added successfully!' as status;
