-- Add location column to challenges table
-- This allows storing location directly from the form when creating challenges

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment for documentation
COMMENT ON COLUMN challenges.location IS 'Location where the challenge will take place, usually club name from form';

-- Verify the column was added
\d challenges;
