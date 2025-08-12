-- Quick fix for tournaments status constraint
-- This script updates the status constraint to be more flexible

-- Drop the existing constraint
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_status_check;

-- Add a more flexible constraint that includes all possible status values
ALTER TABLE tournaments ADD CONSTRAINT tournaments_status_check 
CHECK (status IN (
  'registration_open', 
  'registration_closed', 
  'ongoing', 
  'completed', 
  'cancelled',
  'upcoming',
  'in_progress',
  'registration',
  'active',
  'finished'
));

-- Also update the default value to be more common
ALTER TABLE tournaments ALTER COLUMN status SET DEFAULT 'upcoming';

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'tournaments_status_check';
