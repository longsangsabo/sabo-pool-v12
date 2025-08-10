-- Create Legacy SPA Claim Request System
-- This system allows users to claim legacy SPA points with SABO admin approval

-- 1. Create legacy_spa_claim_requests table
CREATE TABLE IF NOT EXISTS public.legacy_spa_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User making the claim
  requester_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_full_name TEXT NOT NULL,
  requester_display_name TEXT,
  requester_phone TEXT NOT NULL,
  
  -- Legacy account being claimed
  legacy_entry_id UUID NOT NULL REFERENCES public.legacy_spa_points(id) ON DELETE CASCADE,
  legacy_full_name TEXT NOT NULL,
  legacy_nick_name TEXT,
  legacy_spa_points INTEGER NOT NULL,
  
  -- Claim verification
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  verification_phone TEXT, -- Phone number provided by user for SABO to call
  verification_notes TEXT, -- Notes from phone verification
  
  -- Admin approval
  reviewed_by UUID REFERENCES auth.users(id), -- SABO admin who reviewed
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_legacy_spa_claim_requests_requester ON public.legacy_spa_claim_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_spa_claim_requests_legacy ON public.legacy_spa_claim_requests(legacy_entry_id);
CREATE INDEX IF NOT EXISTS idx_legacy_spa_claim_requests_status ON public.legacy_spa_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_legacy_spa_claim_requests_created ON public.legacy_spa_claim_requests(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.legacy_spa_claim_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can view their own claim requests
CREATE POLICY "Users can view their own claim requests"
ON public.legacy_spa_claim_requests FOR SELECT
USING (auth.uid() = requester_user_id);

-- Users can create claim requests for themselves
CREATE POLICY "Users can create their own claim requests"
ON public.legacy_spa_claim_requests FOR INSERT
WITH CHECK (auth.uid() = requester_user_id);

-- Users can cancel their own pending requests
CREATE POLICY "Users can cancel their own pending requests"
ON public.legacy_spa_claim_requests FOR UPDATE
USING (auth.uid() = requester_user_id AND status = 'pending')
WITH CHECK (auth.uid() = requester_user_id AND status IN ('pending', 'cancelled'));

-- SABO admins and club owners can view all claim requests
CREATE POLICY "SABO admins can view all claim requests"
ON public.legacy_spa_claim_requests FOR SELECT
USING (
  -- System admins
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
  OR
  -- SABO/SBO Pool Arena club owners
  EXISTS (
    SELECT 1 FROM public.club_profiles 
    WHERE user_id = auth.uid() 
    AND verification_status = 'approved'
    AND (
      club_name ILIKE '%SABO%' 
      OR club_name ILIKE '%SBO%'
      OR club_name ILIKE '%POOL ARENA%'
    )
  )
);

-- SABO admins and club owners can approve/reject claim requests
CREATE POLICY "SABO admins can review claim requests"
ON public.legacy_spa_claim_requests FOR UPDATE
USING (
  -- System admins
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
  OR
  -- SABO/SBO Pool Arena club owners
  EXISTS (
    SELECT 1 FROM public.club_profiles 
    WHERE user_id = auth.uid() 
    AND verification_status = 'approved'
    AND (
      club_name ILIKE '%SABO%' 
      OR club_name ILIKE '%SBO%'
      OR club_name ILIKE '%POOL ARENA%'
    )
  )
)
WITH CHECK (
  -- System admins
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
  OR
  -- SABO/SBO Pool Arena club owners
  EXISTS (
    SELECT 1 FROM public.club_profiles 
    WHERE user_id = auth.uid() 
    AND verification_status = 'approved'
    AND (
      club_name ILIKE '%SABO%' 
      OR club_name ILIKE '%SBO%'
      OR club_name ILIKE '%POOL ARENA%'
    )
  )
);

-- 5. Create function to submit legacy SPA claim request
CREATE OR REPLACE FUNCTION public.submit_legacy_spa_claim_request(
  p_legacy_entry_id UUID,
  p_verification_phone TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_legacy_entry public.legacy_spa_points%ROWTYPE;
  v_user_profile public.profiles%ROWTYPE;
  v_existing_request_id UUID;
  v_claim_request_id UUID;
  v_result JSON;
BEGIN
  -- Get current user profile
  SELECT * INTO v_user_profile
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  IF v_user_profile.user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- Get legacy entry
  SELECT * INTO v_legacy_entry
  FROM public.legacy_spa_points
  WHERE id = p_legacy_entry_id
  AND claimed = false; -- Only allow claiming unclaimed entries
  
  IF v_legacy_entry.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Legacy entry not found or already claimed'
    );
  END IF;
  
  -- Check if user's name matches legacy entry (case insensitive)
  IF NOT (
    LOWER(COALESCE(v_user_profile.display_name, '')) = LOWER(COALESCE(v_legacy_entry.nick_name, '')) OR
    LOWER(COALESCE(v_user_profile.display_name, '')) = LOWER(COALESCE(v_legacy_entry.full_name, '')) OR
    LOWER(COALESCE(v_user_profile.full_name, '')) = LOWER(COALESCE(v_legacy_entry.nick_name, '')) OR
    LOWER(COALESCE(v_user_profile.full_name, '')) = LOWER(COALESCE(v_legacy_entry.full_name, ''))
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Name mismatch: Your name does not match the legacy account'
    );
  END IF;
  
  -- Check for existing pending request
  SELECT id INTO v_existing_request_id
  FROM public.legacy_spa_claim_requests
  WHERE requester_user_id = auth.uid()
  AND legacy_entry_id = p_legacy_entry_id
  AND status = 'pending';
  
  IF v_existing_request_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You already have a pending claim request for this legacy account'
    );
  END IF;
  
  -- Create claim request
  INSERT INTO public.legacy_spa_claim_requests (
    requester_user_id,
    requester_full_name,
    requester_display_name,
    requester_phone,
    legacy_entry_id,
    legacy_full_name,
    legacy_nick_name,
    legacy_spa_points,
    verification_phone
  ) VALUES (
    auth.uid(),
    v_user_profile.full_name,
    v_user_profile.display_name,
    p_verification_phone,
    p_legacy_entry_id,
    v_legacy_entry.full_name,
    v_legacy_entry.nick_name,
    v_legacy_entry.spa_points,
    p_verification_phone
  ) RETURNING id INTO v_claim_request_id;
  
  -- Log admin action
  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_user_id,
    action_details,
    reason
  ) VALUES (
    auth.uid(),
    'legacy_spa_claim_request',
    auth.uid(),
    json_build_object(
      'claim_request_id', v_claim_request_id,
      'legacy_entry_id', p_legacy_entry_id,
      'spa_points', v_legacy_entry.spa_points,
      'verification_phone', p_verification_phone
    ),
    format('User requested to claim %s SPA points from legacy account "%s"', 
           v_legacy_entry.spa_points, 
           COALESCE(v_legacy_entry.nick_name, v_legacy_entry.full_name))
  );
  
  RETURN json_build_object(
    'success', true,
    'claim_request_id', v_claim_request_id,
    'message', format('Claim request submitted for %s SPA points. SABO will call %s for verification.', 
                     v_legacy_entry.spa_points, 
                     p_verification_phone)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 6. Create function for SABO admin to approve/reject claim requests
CREATE OR REPLACE FUNCTION public.review_legacy_spa_claim_request(
  p_claim_request_id UUID,
  p_action TEXT, -- 'approve' or 'reject'
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim_request public.legacy_spa_claim_requests%ROWTYPE;
  v_admin_profile public.profiles%ROWTYPE;
  v_result JSON;
BEGIN
  -- Verify admin permissions
  SELECT * INTO v_admin_profile
  FROM public.profiles
  WHERE user_id = auth.uid()
  AND (
    is_admin = true
    OR
    user_id IN (
      SELECT cp.user_id FROM public.club_profiles cp
      WHERE cp.verification_status = 'approved'
      AND (
        cp.club_name ILIKE '%SABO%' 
        OR cp.club_name ILIKE '%SBO%'
        OR cp.club_name ILIKE '%POOL ARENA%'
      )
    )
  );
  
  IF v_admin_profile.user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access denied: SABO admin or club owner privileges required'
    );
  END IF;
  
  -- Get claim request
  SELECT * INTO v_claim_request
  FROM public.legacy_spa_claim_requests
  WHERE id = p_claim_request_id
  AND status = 'pending';
  
  IF v_claim_request.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Claim request not found or already processed'
    );
  END IF;
  
  -- Validate action
  IF p_action NOT IN ('approve', 'reject') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid action. Must be "approve" or "reject"'
    );
  END IF;
  
  -- If approving, transfer SPA points and mark legacy entry as claimed
  IF p_action = 'approve' THEN
    -- Add SPA points to user's wallet
    INSERT INTO public.spa_points_log (
      user_id,
      source_type,
      source_id,
      points,
      description
    ) VALUES (
      v_claim_request.requester_user_id,
      'legacy_claim',
      v_claim_request.legacy_entry_id,
      v_claim_request.legacy_spa_points,
      format('Legacy SPA claim approved: %s points from "%s"', 
             v_claim_request.legacy_spa_points,
             COALESCE(v_claim_request.legacy_nick_name, v_claim_request.legacy_full_name))
    );
    
    -- Mark legacy entry as claimed
    UPDATE public.legacy_spa_points
    SET 
      claimed = true,
      claimed_by = v_claim_request.requester_user_id,
      claimed_at = NOW()
    WHERE id = v_claim_request.legacy_entry_id;
    
    -- Update claim request status
    UPDATE public.legacy_spa_claim_requests
    SET 
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      admin_notes = p_admin_notes,
      updated_at = NOW()
    WHERE id = p_claim_request_id;
    
    v_result = json_build_object(
      'success', true,
      'message', format('Claim approved: %s SPA points transferred to user', v_claim_request.legacy_spa_points)
    );
    
  ELSE -- reject
    -- Update claim request status
    UPDATE public.legacy_spa_claim_requests
    SET 
      status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      admin_notes = p_admin_notes,
      rejection_reason = p_rejection_reason,
      updated_at = NOW()
    WHERE id = p_claim_request_id;
    
    v_result = json_build_object(
      'success', true,
      'message', 'Claim request rejected'
    );
  END IF;
  
  -- Log admin action
  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_user_id,
    action_details,
    reason
  ) VALUES (
    auth.uid(),
    format('legacy_spa_claim_%s', p_action),
    v_claim_request.requester_user_id,
    json_build_object(
      'claim_request_id', p_claim_request_id,
      'spa_points', v_claim_request.legacy_spa_points,
      'admin_notes', p_admin_notes,
      'rejection_reason', p_rejection_reason
    ),
    format('SABO admin %s legacy claim request for %s SPA points', 
           p_action, 
           v_claim_request.legacy_spa_points)
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 7. Create function to get pending claim requests for SABO admins
CREATE OR REPLACE FUNCTION public.get_pending_claim_requests()
RETURNS TABLE (
  id UUID,
  requester_full_name TEXT,
  requester_display_name TEXT,
  requester_phone TEXT,
  legacy_full_name TEXT,
  legacy_nick_name TEXT,
  legacy_spa_points INTEGER,
  verification_phone TEXT,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  days_pending INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND (
      is_admin = true
      OR
      user_id IN (
        SELECT cp.user_id FROM public.club_profiles cp
        WHERE cp.verification_status = 'approved'
        AND (
          cp.club_name ILIKE '%SABO%' 
          OR cp.club_name ILIKE '%SBO%'
          OR cp.club_name ILIKE '%POOL ARENA%'
        )
      )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: SABO admin or club owner privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    cr.id,
    cr.requester_full_name,
    cr.requester_display_name,
    cr.verification_phone as requester_phone,
    cr.legacy_full_name,
    cr.legacy_nick_name,
    cr.legacy_spa_points,
    cr.verification_phone,
    cr.verification_notes,
    cr.created_at,
    EXTRACT(DAYS FROM (NOW() - cr.created_at))::INTEGER as days_pending
  FROM public.legacy_spa_claim_requests cr
  WHERE cr.status = 'pending'
  ORDER BY cr.created_at ASC;
END;
$$;

-- 8. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_legacy_spa_claim_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_legacy_spa_claim_request(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_claim_requests() TO authenticated;

-- 9. Create helpful view for claim request history
CREATE OR REPLACE VIEW public.legacy_claim_requests_view AS
SELECT 
  cr.id,
  cr.requester_user_id,
  rp.full_name as requester_full_name,
  rp.display_name as requester_display_name,
  cr.verification_phone,
  cr.legacy_full_name,
  cr.legacy_nick_name,
  cr.legacy_spa_points,
  cr.status,
  cr.reviewed_by,
  ap.full_name as admin_full_name,
  ap.display_name as admin_display_name,
  cr.reviewed_at,
  cr.admin_notes,
  cr.rejection_reason,
  cr.created_at,
  EXTRACT(DAYS FROM (COALESCE(cr.reviewed_at, NOW()) - cr.created_at))::INTEGER as processing_days
FROM public.legacy_spa_claim_requests cr
LEFT JOIN public.profiles rp ON cr.requester_user_id = rp.user_id
LEFT JOIN public.profiles ap ON cr.reviewed_by = ap.user_id;

-- Grant view access
GRANT SELECT ON public.legacy_claim_requests_view TO authenticated;

-- 10. Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_legacy_spa_claim_requests_updated_at
  BEFORE UPDATE ON public.legacy_spa_claim_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Success message
SELECT 'Legacy SPA Claim Request System created successfully!' as result;
