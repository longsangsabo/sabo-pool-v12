-- =====================================================
-- 🔧 FIX ACCEPT_OPEN_CHALLENGE FUNCTION RESPONSE FORMAT
-- =====================================================
-- Run this in Supabase SQL Editor to fix the response format

-- Drop all existing versions to avoid conflicts
DROP FUNCTION IF EXISTS public.accept_open_challenge CASCADE;

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.accept_open_challenge(
  p_challenge_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_challenge RECORD;
  v_user_spa INTEGER;
  v_required_spa INTEGER;
  v_match_id UUID;
BEGIN
  -- Get challenge details
  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Challenge not found'
    );
  END IF;
  
  IF v_challenge.opponent_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Challenge is not open'
    );
  END IF;
  
  IF v_challenge.status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Challenge is no longer available'
    );
  END IF;
  
  IF v_challenge.challenger_id = p_user_id THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Cannot accept your own challenge'
    );
  END IF;
  
  IF v_challenge.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Challenge has expired'
    );
  END IF;
  
  SELECT COALESCE(spa_points, 0) INTO v_user_spa 
  FROM player_rankings WHERE user_id = p_user_id;
  
  v_required_spa := COALESCE(v_challenge.bet_points, 100);
  
  IF v_user_spa < v_required_spa THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Insufficient SPA points. Required: %s, Available: %s', v_required_spa, v_user_spa),
      'required_spa', v_required_spa,
      'user_spa', v_user_spa,
      'shortage', v_required_spa - v_user_spa
    );
  END IF;
  
  -- Update challenge to accepted
  UPDATE challenges SET 
    opponent_id = p_user_id, 
    status = 'accepted', 
    responded_at = NOW(), 
    updated_at = NOW() 
  WHERE id = p_challenge_id;
  
  -- Create match record
  INSERT INTO matches (
    player1_id, 
    player2_id, 
    challenge_id, 
    status, 
    match_type, 
    scheduled_time
  ) VALUES (
    v_challenge.challenger_id, 
    p_user_id, 
    p_challenge_id, 
    'scheduled', 
    'challenge', 
    COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '2 hours')
  ) RETURNING id INTO v_match_id;
  
  -- Return success response
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Successfully joined challenge', 
    'challenge_id', p_challenge_id, 
    'match_id', v_match_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM
  );
END;
$function$;

-- Test the function with a dummy call to verify response format
-- This should return: {"success": false, "error": "Challenge not found"}
-- NOT an array like [{"success": false, ...}]
SELECT accept_open_challenge('00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid) as test_response;
