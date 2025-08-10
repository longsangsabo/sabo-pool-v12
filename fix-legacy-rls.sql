-- Fix RLS policy for legacy_spa_points to allow public read access
-- This allows anonymous users to view the legacy leaderboard

-- Drop existing policies
DROP POLICY IF EXISTS "legacy_spa_public_read" ON legacy_spa_points;
DROP POLICY IF EXISTS "legacy_spa_claims_read" ON legacy_spa_points;

-- Create policy allowing public read access for leaderboard display
CREATE POLICY "legacy_spa_public_read" 
ON legacy_spa_points 
FOR SELECT 
TO public 
USING (true);

-- Create policy for authenticated users to read their own claims
CREATE POLICY "legacy_spa_claims_read" 
ON legacy_spa_points 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy for admin updates (claims)
CREATE POLICY "legacy_spa_admin_update" 
ON legacy_spa_points 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE legacy_spa_points ENABLE ROW LEVEL SECURITY;

-- Test the policy - this should now work
SELECT 
	full_name, 
	spa_points, 
	position_rank, 
	claimed,
	facebook_url
FROM legacy_spa_points 
WHERE full_name = 'ANH LONG MAGIC';
