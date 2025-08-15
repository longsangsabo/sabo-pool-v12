-- Fix club_profiles table structure
-- Run this first before the main migration

-- 1. Check current club_profiles structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'club_profiles'
ORDER BY ordinal_position;

-- 2. Add missing columns to club_profiles
ALTER TABLE club_profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS contact_info TEXT;

-- 3. Update existing club_profiles with default name if empty
UPDATE club_profiles 
SET name = COALESCE(
  CASE 
    -- Try to use user's full_name if available
    WHEN EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = club_profiles.user_id 
      AND p.full_name IS NOT NULL 
      AND p.full_name != ''
    ) THEN (
      SELECT p.full_name || '''s Club' 
      FROM profiles p 
      WHERE p.user_id = club_profiles.user_id 
      LIMIT 1
    )
    -- Default fallback
    ELSE 'Club ' || SUBSTRING(id::text, 1, 8)
  END,
  'Unnamed Club'
)
WHERE name IS NULL OR name = '';

-- 4. Add NOT NULL constraint after updating existing data
ALTER TABLE club_profiles 
ALTER COLUMN name SET NOT NULL;

-- 5. Check results
SELECT 
  id, 
  name, 
  user_id, 
  created_at,
  CASE 
    WHEN logo_url IS NOT NULL THEN 'Has Logo'
    ELSE 'No Logo'
  END as logo_status
FROM club_profiles 
ORDER BY created_at DESC 
LIMIT 10;
