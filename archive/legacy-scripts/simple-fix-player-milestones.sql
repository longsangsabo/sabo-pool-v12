-- SIMPLE FIX: Add user_id column to player_milestones if missing
-- Run this after checking with check-player-milestones.sql

-- Add user_id column if it doesn't exist
ALTER TABLE player_milestones 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Populate user_id from tournament_participants if possible
UPDATE player_milestones 
SET user_id = tp.user_id
FROM tournament_participants tp
WHERE player_milestones.participant_id = tp.id
AND player_milestones.user_id IS NULL;
