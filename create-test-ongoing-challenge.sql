-- Create test ongoing challenge for score submission
-- Run this in Supabase SQL Editor

-- First, make sure we have test users (you may need to adjust user IDs)
DO $$ 
DECLARE
    challenger_user_id UUID;
    opponent_user_id UUID;
    test_club_id UUID;
    challenge_id UUID := gen_random_uuid();
BEGIN
    -- Get first two users as test players
    SELECT id INTO challenger_user_id FROM auth.users LIMIT 1;
    SELECT id INTO opponent_user_id FROM auth.users OFFSET 1 LIMIT 1;
    
    -- Get first club as test club
    SELECT id INTO test_club_id FROM clubs LIMIT 1;
    
    -- Create test ongoing challenge
    INSERT INTO challenges (
        id,
        challenger_id,
        opponent_id,
        club_id,
        bet_points,
        race_to,
        status,
        message,
        created_at,
        scheduled_time,
        started_at
    ) VALUES (
        challenge_id,
        challenger_user_id,
        opponent_user_id,
        test_club_id,
        100,
        9,
        'ongoing',
        'Test challenge for score submission',
        NOW(),
        NOW() + INTERVAL '1 hour',
        NOW()
    );
    
    RAISE NOTICE 'Created test challenge: %', challenge_id;
    RAISE NOTICE 'Challenger: %', challenger_user_id;
    RAISE NOTICE 'Opponent: %', opponent_user_id;
    
END $$;

-- Verify the challenge was created
SELECT 
    c.id,
    c.status,
    c.challenger_id,
    c.opponent_id,
    c.bet_points,
    c.race_to,
    c.message,
    cp.display_name as challenger_name,
    op.display_name as opponent_name
FROM challenges c
LEFT JOIN profiles cp ON c.challenger_id = cp.id
LEFT JOIN profiles op ON c.opponent_id = op.id
WHERE c.status = 'ongoing'
ORDER BY c.created_at DESC
LIMIT 5;
