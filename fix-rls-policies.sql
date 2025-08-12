-- RLS Policy Fix for tournament_registrations
-- This script should be run in Supabase SQL Editor

-- First, let's check existing policies
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'tournament_registrations';

-- Drop existing restrictive policy if needed
DROP POLICY IF EXISTS "users_manage_own_registrations" ON tournament_registrations;

-- Create comprehensive policies
-- 1. Allow public read access
CREATE POLICY "public_read_registrations" ON tournament_registrations
FOR SELECT USING (true);

-- 2. Allow users to manage their own registrations
CREATE POLICY "users_manage_own_registrations" ON tournament_registrations
FOR ALL USING (auth.uid() = user_id);

-- 3. Allow admins to manage all registrations (THIS IS THE KEY POLICY)
CREATE POLICY "admins_manage_all_registrations" ON tournament_registrations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- 4. Alternative: Allow tournament organizers to manage registrations for their tournaments
CREATE POLICY "organizers_manage_tournament_registrations" ON tournament_registrations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_registrations.tournament_id 
    AND tournaments.created_by = auth.uid()
  )
);

-- Verify policies were created
SELECT 
  policyname, 
  permissive, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'tournament_registrations'
ORDER BY policyname;

-- Test admin user status
SELECT 
  user_id, 
  full_name, 
  email, 
  is_admin, 
  role 
FROM profiles 
WHERE is_admin = true;

SELECT 'RLS policies updated successfully!' as status;
