-- ============================================================================
-- ADD USER NAME COLUMNS TO DATA TABLES
-- ============================================================================
-- Purpose: Add user_name columns to make data tracking easier
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Step 1: Add user_name column to player_rankings table
ALTER TABLE player_rankings 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 2: Add user_name column to player_milestones table  
ALTER TABLE player_milestones 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 3: Add user_name column to spa_transactions table
ALTER TABLE spa_transactions 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 4: Add user_name column to challenge_notifications table
ALTER TABLE challenge_notifications 
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 5: Create function to extract user name from auth metadata
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

-- Step 6: Update existing records with user names

-- Update player_rankings
UPDATE player_rankings 
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- Update player_milestones  
UPDATE player_milestones
SET user_name = get_user_display_name(player_id)
WHERE user_name IS NULL;

-- Update spa_transactions
UPDATE spa_transactions
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- Update challenge_notifications
UPDATE challenge_notifications
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- Step 7: Create triggers to auto-populate user_name on INSERT/UPDATE

-- Trigger function
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

-- Create triggers
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

-- Step 8: Verification queries
SELECT 'VERIFICATION - Player Rankings with Names' as section;
SELECT 
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    user_name,
    spa_points,
    created_at
FROM player_rankings 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'VERIFICATION - Milestones with Names' as section;
SELECT 
    SUBSTRING(player_id::text, 1, 8) || '...' as user_id,
    user_name,
    (SELECT name FROM milestones WHERE id = milestone_id) as milestone_name,
    is_completed,
    completed_at
FROM player_milestones 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'VERIFICATION - SPA Transactions with Names' as section;
SELECT 
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    user_name,
    transaction_type,
    amount,
    description,
    created_at
FROM spa_transactions 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'VERIFICATION - Notifications with Names' as section;
SELECT 
    SUBSTRING(user_id::text, 1, 8) || '...' as user_id,
    user_name,
    type,
    title,
    created_at
FROM challenge_notifications 
ORDER BY created_at DESC 
LIMIT 10;
