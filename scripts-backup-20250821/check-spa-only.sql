-- Chỉ kiểm tra SPA của 2 users
SELECT 
  p.id,
  p.full_name,
  p.spa_points,
  CASE 
    WHEN p.id = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac' THEN 'WINNER (should have +100 SPA)'
    WHEN p.id = '18f6e853-b072-47fb-9c9a-e5d42a5446a5' THEN 'LOSER (should have -100 SPA)'
    ELSE 'OTHER'
  END as expected_change
FROM profiles p
WHERE p.id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY p.full_name;
