-- Fix player_rankings RLS policies for rank approval
-- This allows club owners to create player_rankings entries when approving rank requests

-- Drop existing policies
DROP POLICY IF EXISTS "System can insert player rankings" ON public.player_rankings;
DROP POLICY IF EXISTS "Users can update their own rankings" ON public.player_rankings;

-- Create new policies that allow club owners to manage rankings
CREATE POLICY "Users can update their own rankings" ON public.player_rankings 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "System can insert player rankings" ON public.player_rankings
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) OR
  -- Allow club owners to create rankings for their members during rank approval
  EXISTS (
    SELECT 1 FROM public.club_profiles cp 
    WHERE cp.user_id = auth.uid() 
    AND cp.verification_status = 'approved'
  )
);

-- Update the sync_profile_rankings function to run with elevated privileges
CREATE OR REPLACE FUNCTION public.sync_profile_rankings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
SET search_path TO 'public'
AS $function$
BEGIN
  -- Sync profile changes to player_rankings
  INSERT INTO public.player_rankings (user_id, updated_at)
  VALUES (NEW.user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
  
  RETURN NEW;
END;
$function$;

-- Also create a function to handle rank approval that bypasses RLS
CREATE OR REPLACE FUNCTION public.approve_rank_request(
  request_id UUID,
  approver_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the rank request
  SELECT * INTO request_record 
  FROM rank_requests 
  WHERE id = request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rank request not found';
  END IF;
  
  -- Update the rank request
  UPDATE rank_requests 
  SET 
    status = 'approved',
    approved_by = approver_id,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Update profile verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank
  WHERE user_id = request_record.user_id;
  
  -- Ensure player_rankings record exists
  INSERT INTO player_rankings (user_id, updated_at)
  VALUES (request_record.user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
  
  RETURN true;
END;
$function$;
