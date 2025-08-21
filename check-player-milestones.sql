-- SAFE CHECK: Analyze player_milestones table structure
-- Run this first to understand the current state

-- 1. Check if player_milestones table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'player_milestones';

-- 2. Check current columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'player_milestones'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'player_milestones';

-- 4. Count existing records
SELECT COUNT(*) as total_records FROM player_milestones;

-- 5. Check for participant_id mapping to users
SELECT 
    pm.id,
    pm.participant_id,
    tp.user_id as mapped_user_id,
    tp.tournament_id
FROM player_milestones pm
LEFT JOIN tournament_participants tp ON pm.participant_id = tp.id
LIMIT 10;
