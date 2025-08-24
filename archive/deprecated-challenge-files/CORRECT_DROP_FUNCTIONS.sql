-- DROP FUNCTIONS VỚI ĐÚNG SIGNATURES
-- =====================================

-- BƯỚC 1: Drop các functions BỊ LỖI với đúng signature
DROP FUNCTION IF EXISTS accept_open_challenge(p_challenge_id uuid, p_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS accept_challenge_emergency_workaround(p_challenge_id uuid, p_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge_fixed(p_challenge_id uuid, p_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge_simple(p_challenge_id uuid, p_user_id uuid) CASCADE;

-- BƯỚC 2: Check xem còn functions nào khác cần drop
SELECT 
    'DROP FUNCTION IF EXISTS ' || proname || '(' || 
    pg_get_function_identity_arguments(oid) || ') CASCADE;' as drop_statement
FROM pg_proc 
WHERE proname IN (
    'accept_challenge',
    'complete_challenge_match',
    'create_challenge',
    'complete_challenge'
) AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- BƯỚC 3: Verify functions đã bị drop
SELECT 'Functions còn lại sau khi drop:' as status;
SELECT proname
FROM pg_proc 
WHERE proname LIKE '%challenge%' 
  AND proname IN ('accept_open_challenge', 'accept_challenge_emergency_workaround', 
                  'accept_open_challenge_fixed', 'accept_open_challenge_simple')
ORDER BY proname;
