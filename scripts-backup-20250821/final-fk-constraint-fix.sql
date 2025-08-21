-- =====================================================
-- 🛠️ FINAL FK CONSTRAINT FIX
-- =====================================================

-- 1. Check current constraint
SELECT 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='challenge_notifications'
AND kcu.column_name='user_id';

-- 2. Drop ALL foreign key constraints on user_id column
ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS challenge_notifications_user_id_fkey;

-- Alternative names the constraint might have
ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS fk_challenge_notifications_user_id;

ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS fk_challenge_notifications_profiles;

-- 3. Add the CORRECT foreign key constraint
-- challenge_notifications.user_id should reference profiles.user_id (NOT profiles.id)
ALTER TABLE challenge_notifications 
ADD CONSTRAINT challenge_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 4. Verify the fix
SELECT 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='challenge_notifications'
AND kcu.column_name='user_id';

-- 5. Test the fix by creating a sample notification
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a valid user_id from profiles
    SELECT user_id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a test notification
        INSERT INTO challenge_notifications (
            type, 
            user_id, 
            title, 
            message, 
            icon, 
            priority
        ) VALUES (
            'fk_test',
            test_user_id,
            'FK Test',
            'Testing foreign key constraint fix',
            'bell',
            'medium'
        );
        
        -- Delete the test notification
        DELETE FROM challenge_notifications 
        WHERE type = 'fk_test' AND user_id = test_user_id;
        
        RAISE NOTICE 'Foreign key constraint fix SUCCESSFUL!';
    ELSE
        RAISE NOTICE 'No users found in profiles table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Foreign key constraint fix FAILED: %', SQLERRM;
END $$;
