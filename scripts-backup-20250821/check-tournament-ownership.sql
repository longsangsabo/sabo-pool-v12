-- Check tournament ownership and permissions for SABO Score Test Tournament

-- 1. Find the SABO test tournament
SELECT 
  t.id as tournament_id,
  t.name as tournament_name,
  t.club_id,
  t.created_by,
  c.name as club_name,
  c.owner_id as club_owner_id,
  p.full_name as club_owner_name,
  p.email as club_owner_email
FROM tournaments t
JOIN clubs c ON c.id = t.club_id  
JOIN profiles p ON p.id = c.owner_id
WHERE t.name ILIKE '%SABO Score Test Tournament - REAL DATA%';
