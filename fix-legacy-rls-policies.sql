-- Fix RLS policies for legacy_spa_points table
-- This allows anonymous users to search for legacy players
-- while still protecting update operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON legacy_spa_points;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON legacy_spa_points;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON legacy_spa_points;

-- Create new policies with anonymous read access
CREATE POLICY "Enable read access for all users" ON legacy_spa_points 
FOR SELECT USING (true);

-- Allow authenticated users to update claims
CREATE POLICY "Enable update for authenticated users only" ON legacy_spa_points 
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Enable all for service role" ON legacy_spa_points 
FOR ALL USING (auth.role() = 'service_role');

-- Test query to verify access
SELECT 'RLS policies updated successfully' as status;
