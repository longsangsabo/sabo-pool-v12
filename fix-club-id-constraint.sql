-- Fix club_id foreign key constraint in tournaments table
-- This script makes the club_id constraint more flexible

-- First, check if clubs table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs' AND table_schema = 'public') THEN
    RAISE NOTICE 'clubs table does not exist, creating a basic one for foreign key';
    
    -- Create a basic clubs table if it doesn't exist
    CREATE TABLE IF NOT EXISTS clubs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Insert a default club
    INSERT INTO clubs (name, address, description) 
    VALUES ('Default Club', 'Địa chỉ mặc định', 'Club mặc định cho hệ thống')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created clubs table with default club';
  ELSE
    RAISE NOTICE 'clubs table already exists';
  END IF;
END
$$;

-- Drop the existing foreign key constraint
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_club_id_fkey;

-- Make club_id nullable (in case it wasn't already)
ALTER TABLE tournaments ALTER COLUMN club_id DROP NOT NULL;

-- Add the foreign key constraint back, but make it more flexible
-- This allows NULL values and references existing clubs
ALTER TABLE tournaments ADD CONSTRAINT tournaments_club_id_fkey 
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;

-- Verify the constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'tournaments' 
  AND kcu.column_name = 'club_id';
