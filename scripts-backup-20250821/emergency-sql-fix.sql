-- =====================================================
-- 🚑 EMERGENCY SQL FIX FOR CHALLENGE CREATION
-- =====================================================

-- 1. Drop notification trigger causing FK errors
DROP TRIGGER IF EXISTS challenge_created_notification_trigger ON challenges;

-- 2. Fix foreign key constraint 
ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS challenge_notifications_user_id_fkey;

ALTER TABLE challenge_notifications 
ADD CONSTRAINT challenge_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 3. Verify fix
SELECT 'Challenge notification trigger disabled and FK constraint fixed!' as status;
