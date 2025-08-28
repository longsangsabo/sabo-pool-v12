-- Fix ON CONFLICT issue: Add unique constraint for player_milestones
-- Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- Add unique constraint for user_id and milestone_id combination
ALTER TABLE player_milestones 
ADD CONSTRAINT unique_user_milestone 
UNIQUE (user_id, milestone_id);
