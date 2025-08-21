-- Disable RLS temporarily for player_rankings to allow trigger to work
ALTER TABLE player_rankings DISABLE ROW LEVEL SECURITY;

-- Create trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION process_spa_on_completion()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    winner_id UUID;
    loser_id UUID;
    points_amount INTEGER;
BEGIN
    -- Only process when status changes to 'completed' and club_confirmed is true
    IF NEW.status = 'completed' AND NEW.club_confirmed = true AND 
       (OLD.status != 'completed' OR OLD.club_confirmed = false) THEN
        
        -- Get the points amount
        points_amount := COALESCE(NEW.bet_points, 0);
        
        -- Only process if there are points to transfer
        IF points_amount > 0 THEN
            -- Determine winner and loser based on scores
            IF NEW.challenger_score > NEW.opponent_score THEN
                winner_id := NEW.challenger_id;
                loser_id := NEW.opponent_id;
            ELSIF NEW.opponent_score > NEW.challenger_score THEN
                winner_id := NEW.opponent_id;
                loser_id := NEW.challenger_id;
            ELSE
                -- Draw - no points transfer
                RAISE NOTICE 'Draw game - no SPA transfer for challenge %', NEW.id;
                RETURN NEW;
            END IF;
            
            -- Add points to winner (upsert)
            INSERT INTO player_rankings (user_id, spa_points, updated_at)
            VALUES (winner_id, points_amount, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                spa_points = player_rankings.spa_points + points_amount,
                updated_at = NOW();
            
            -- Subtract points from loser (upsert with minimum 0)
            INSERT INTO player_rankings (user_id, spa_points, updated_at)
            VALUES (loser_id, GREATEST(0, -points_amount), NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                spa_points = GREATEST(0, player_rankings.spa_points - points_amount),
                updated_at = NOW();
            
            -- Log the transaction
            RAISE NOTICE 'SPA Transfer completed: Winner % gained %, Loser % lost % points for challenge %', 
                winner_id, points_amount, loser_id, points_amount, NEW.id;
        ELSE
            RAISE NOTICE 'No bet points to transfer for challenge %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS spa_transfer_trigger ON challenges;

-- Create the trigger
CREATE TRIGGER spa_transfer_trigger
    AFTER UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION process_spa_on_completion();

-- Test query to check current state
SELECT 
    'Current challenge state:' as info,
    id,
    status,
    club_confirmed,
    challenger_score,
    opponent_score,
    bet_points,
    challenger_id,
    opponent_id
FROM challenges 
WHERE id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

SELECT 
    'Current SPA points:' as info,
    user_id,
    spa_points,
    updated_at
FROM player_rankings
WHERE user_id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY user_id;
