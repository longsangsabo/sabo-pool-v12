-- Step 1: Create functions for club profile creation and role management

-- Function to update user role to club_owner or both
CREATE OR REPLACE FUNCTION public.assign_club_owner_role(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_role text;
  v_new_role text;
BEGIN
  -- Get current role
  SELECT role INTO v_current_role 
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  -- Determine new role
  IF v_current_role = 'admin' THEN
    v_new_role := 'admin'; -- Keep admin role intact
  ELSIF v_current_role = 'player' OR v_current_role IS NULL THEN
    v_new_role := 'club_owner';
  ELSE
    v_new_role := 'both'; -- For other cases, use both
  END IF;
  
  -- Update user role
  UPDATE public.profiles 
  SET role = v_new_role, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'previous_role', v_current_role,
    'new_role', v_new_role
  );
END;
$$;

-- Function to create club profile from registration
CREATE OR REPLACE FUNCTION public.create_club_profile_from_registration(
  p_registration_id uuid,
  p_admin_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration RECORD;
  v_club_profile_id uuid;
  v_result jsonb;
BEGIN
  -- Get registration data
  SELECT * INTO v_registration
  FROM public.club_registrations
  WHERE id = p_registration_id AND status = 'approved';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Registration not found or not approved');
  END IF;
  
  -- Check if club profile already exists
  SELECT id INTO v_club_profile_id
  FROM public.club_profiles
  WHERE user_id = v_registration.user_id;
  
  IF v_club_profile_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'Club profile already exists for this user');
  END IF;
  
  -- Create club profile
  INSERT INTO public.club_profiles (
    user_id,
    club_name,
    address,
    phone,
    description,
    verification_status,
    hourly_rate,
    available_tables,
    created_at,
    updated_at
  ) VALUES (
    v_registration.user_id,
    v_registration.club_name,
    v_registration.address,
    v_registration.phone,
    v_registration.description,
    'approved',
    COALESCE(v_registration.basic_hourly_rate, 50000),
    COALESCE(v_registration.table_count, 10),
    NOW(),
    NOW()
  ) RETURNING id INTO v_club_profile_id;
  
  -- Assign club owner role
  SELECT public.assign_club_owner_role(v_registration.user_id) INTO v_result;
  
  -- Log admin action
  IF p_admin_id IS NOT NULL THEN
    INSERT INTO public.admin_actions (
      admin_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      p_admin_id,
      'club_approval',
      'club_registration',
      p_registration_id,
      jsonb_build_object(
        'club_name', v_registration.club_name,
        'club_profile_id', v_club_profile_id,
        'user_id', v_registration.user_id,
        'role_assignment', v_result
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'club_profile_id', v_club_profile_id,
    'registration_id', p_registration_id,
    'role_assignment', v_result
  );
END;
$$;

-- Function to sync approved registrations to club profiles
CREATE OR REPLACE FUNCTION public.sync_approved_club_registrations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration RECORD;
  v_synced_count integer := 0;
  v_errors jsonb[] := '{}';
  v_sync_result jsonb;
BEGIN
  -- Find approved registrations without corresponding club profiles
  FOR v_registration IN
    SELECT cr.*
    FROM public.club_registrations cr
    LEFT JOIN public.club_profiles cp ON cr.user_id = cp.user_id
    WHERE cr.status = 'approved' AND cp.id IS NULL
  LOOP
    BEGIN
      -- Create club profile for this registration
      SELECT public.create_club_profile_from_registration(v_registration.id) INTO v_sync_result;
      
      IF (v_sync_result->>'success')::boolean THEN
        v_synced_count := v_synced_count + 1;
      ELSE
        v_errors := v_errors || v_sync_result;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_errors := v_errors || jsonb_build_object(
          'registration_id', v_registration.id,
          'error', SQLERRM
        );
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'synced_count', v_synced_count,
    'errors', v_errors
  );
END;
$$;