-- Rename player_id to user_id in player_milestones table for consistency
-- This will standardize the column naming across the system

-- Step 1: Drop the existing user_id column if it exists (since we're renaming player_id to user_id)
ALTER TABLE player_milestones DROP COLUMN IF EXISTS user_id;

-- Step 2: Rename player_id column to user_id
ALTER TABLE player_milestones RENAME COLUMN player_id TO user_id;

-- Step 3: Add foreign key constraint to ensure data integrity
ALTER TABLE player_milestones 
ADD CONSTRAINT fk_player_milestones_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
