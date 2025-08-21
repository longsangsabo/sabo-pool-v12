-- Add missing columns to player_milestones table
-- Database triggers expect more columns than currently exist

-- Add missing columns that triggers might be looking for
ALTER TABLE player_milestones 
ADD COLUMN IF NOT EXISTS milestone_type TEXT,
ADD COLUMN IF NOT EXISTS current_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS times_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_completion TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_progress_update TIMESTAMP DEFAULT NOW();
