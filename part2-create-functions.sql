-- ============================================================================
-- PART 2: CREATE FUNCTION AND TRIGGERS
-- ============================================================================
-- Purpose: Create user name function and triggers
-- Run this SECOND after Part 1 completes
-- ============================================================================

-- Step 1: Create function to extract user name from auth metadata
CREATE OR REPLACE FUNCTION get_user_display_name(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Try to get display name from auth.users metadata
    RETURN (
        SELECT COALESCE(
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'name', 
            raw_user_meta_data->>'display_name',
            email,
            SUBSTRING(id::text, 1, 8) || '...'
        )
        FROM auth.users 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger function
CREATE OR REPLACE FUNCTION populate_user_name()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'player_rankings' THEN
        NEW.user_name = get_user_display_name(NEW.user_id);
    ELSIF TG_TABLE_NAME = 'player_milestones' THEN
        NEW.user_name = get_user_display_name(NEW.player_id);
    ELSIF TG_TABLE_NAME = 'spa_transactions' THEN
        NEW.user_name = get_user_display_name(NEW.user_id);
    ELSIF TG_TABLE_NAME = 'challenge_notifications' THEN
        NEW.user_name = get_user_display_name(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create triggers (one by one to avoid conflicts)
DROP TRIGGER IF EXISTS populate_user_name_player_rankings ON player_rankings;
CREATE TRIGGER populate_user_name_player_rankings
    BEFORE INSERT OR UPDATE ON player_rankings
    FOR EACH ROW EXECUTE FUNCTION populate_user_name();

DROP TRIGGER IF EXISTS populate_user_name_player_milestones ON player_milestones;
CREATE TRIGGER populate_user_name_player_milestones
    BEFORE INSERT OR UPDATE ON player_milestones
    FOR EACH ROW EXECUTE FUNCTION populate_user_name();

DROP TRIGGER IF EXISTS populate_user_name_spa_transactions ON spa_transactions;
CREATE TRIGGER populate_user_name_spa_transactions
    BEFORE INSERT OR UPDATE ON spa_transactions
    FOR EACH ROW EXECUTE FUNCTION populate_user_name();

DROP TRIGGER IF EXISTS populate_user_name_challenge_notifications ON challenge_notifications;
CREATE TRIGGER populate_user_name_challenge_notifications
    BEFORE INSERT OR UPDATE ON challenge_notifications
    FOR EACH ROW EXECUTE FUNCTION populate_user_name();

-- Verification
SELECT 'Function and triggers created successfully!' as status;
