-- Add unique constraints to player_milestones table
-- Required for upsert operations in milestoneService.ts

-- Add unique constraint for user_id + milestone_id combination
ALTER TABLE player_milestones 
ADD CONSTRAINT unique_user_milestone 
UNIQUE (user_id, milestone_id);

-- Add unique constraint for user_id + date combination (for daily checkins)
ALTER TABLE player_milestones 
ADD CONSTRAINT unique_user_date 
UNIQUE (user_id, date);
