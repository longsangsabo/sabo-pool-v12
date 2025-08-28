-- Final fix: Add remaining missing columns to player_milestones
-- Add all columns that triggers might reference

ALTER TABLE player_milestones 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS daily_checkin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reward_type TEXT,
ADD COLUMN IF NOT EXISTS reward_value INTEGER;

-- Add unique constraint for user_id and milestone_id to support upsert operations
-- Using DO block to handle constraint existence check
DO $$ 
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'player_milestones_user_milestone_unique'
    ) THEN
        ALTER TABLE player_milestones 
        ADD CONSTRAINT player_milestones_user_milestone_unique 
        UNIQUE (user_id, milestone_id);
        RAISE NOTICE 'Constraint added successfully';
    ELSE
        RAISE NOTICE 'Constraint already exists, skipping';
    END IF;
END $$;
