-- URGENT: Kiểm tra function đang connect đến database nào
-- Copy và chạy trong Supabase SQL Editor

-- Test với service role để bypass RLS
SELECT handle_club_approval_spa(
  '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c'::UUID, 
  false, -- Reset về false trước
  'Reset challenge status'
);

-- Check lại SPA sau khi reset
SELECT 
  p.id,
  p.full_name,
  p.spa_points,
  'AFTER RESET' as status
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY p.full_name;

-- Thử approve lại với debug
SELECT handle_club_approval_spa(
  '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c'::UUID, 
  true,
  'MANUAL TEST WITH SERVICE ROLE'
);

-- Check SPA sau approve
SELECT 
  p.id,
  p.full_name,
  p.spa_points,
  'AFTER APPROVE' as status
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY p.full_name;
