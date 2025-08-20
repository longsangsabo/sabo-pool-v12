-- Fix missing get_user_display_name function
-- This function returns display name for a user, fallback to full_name or email

CREATE OR REPLACE FUNCTION get_user_display_name(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  display_name text;
BEGIN
  -- Get display_name, full_name, or email from profiles
  SELECT 
    COALESCE(
      NULLIF(p.display_name, ''),
      NULLIF(p.full_name, ''),
      NULLIF(p.nickname, ''),
      p.email,
      'User ' || SUBSTRING(p.user_id::text, 1, 8)
    )
  INTO display_name
  FROM profiles p
  WHERE p.user_id = get_user_display_name.user_id;
  
  -- Return the display name or a fallback
  RETURN COALESCE(display_name, 'Unknown User');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_display_name(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_display_name(uuid) TO anon;
