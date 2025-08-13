-- Add challenger_name column to challenges table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS challenger_name TEXT;

-- Add comment to document the column
COMMENT ON COLUMN challenges.challenger_name IS 'Cached challenger name for display purposes';

-- Create index for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_name 
ON challenges(challenger_name);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'challenges' 
AND column_name = 'challenger_name';
