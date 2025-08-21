-- =====================================================
-- 🔧 FINAL FIX: CORRECT FOREIGN KEY CONSTRAINT
-- =====================================================

-- This script fixes the foreign key constraint in challenge_notifications
-- to reference the correct column in profiles table

BEGIN;

-- 1. First, check current constraint (for reference)
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='challenge_notifications'
AND tc.table_schema='public';

-- 2. Drop the incorrect foreign key constraint
ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS challenge_notifications_user_id_fkey;

-- 3. Add the correct foreign key constraint
-- Reference profiles.user_id (not profiles.id)
ALTER TABLE challenge_notifications 
ADD CONSTRAINT challenge_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 4. Verify the fix worked
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='challenge_notifications'
AND tc.table_schema='public';

-- 5. Test by inserting a sample notification (then delete it)
-- This should now work without FK violation
INSERT INTO challenge_notifications (
    type, 
    user_id, 
    title, 
    message, 
    icon, 
    priority
) VALUES (
    'test_fk_fix',
    (SELECT user_id FROM profiles LIMIT 1),
    'Test FK Fix',
    'Testing foreign key constraint fix',
    'test',
    'medium'
);

-- Delete the test notification
DELETE FROM challenge_notifications 
WHERE type = 'test_fk_fix';

COMMIT;

-- Success message
SELECT 'Foreign key constraint fixed successfully!' AS result;
