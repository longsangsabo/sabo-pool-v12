-- Create get_user_display_name function with proper escaping
DROP FUNCTION IF EXISTS get_user_display_name(uuid);

CREATE OR REPLACE FUNCTION get_user_display_name(input_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_name text;
BEGIN
  -- Get display name with fallback chain
  SELECT 
    COALESCE(
      CASE WHEN LENGTH(TRIM(p.display_name)) > 0 THEN TRIM(p.display_name) END,
      CASE WHEN LENGTH(TRIM(p.full_name)) > 0 THEN TRIM(p.full_name) END,
      CASE WHEN LENGTH(TRIM(p.nickname)) > 0 THEN TRIM(p.nickname) END,
      p.email,
      'User ' || SUBSTRING(p.user_id::text, 1, 8)
    )
  INTO result_name
  FROM profiles p
  WHERE p.user_id = input_user_id;
  
  -- Return result or fallback
  RETURN COALESCE(result_name, 'Unknown User');
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_display_name(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_display_name(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_user_display_name(uuid) TO service_role;
