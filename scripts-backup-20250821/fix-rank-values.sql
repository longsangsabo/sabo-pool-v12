-- Fix existing rank data from ELO numbers to rank letters
-- Run this to convert existing "1100" to "K+" etc.

-- Update rank_requests table
UPDATE rank_requests 
SET requested_rank = CASE 
  WHEN requested_rank = '1000' THEN 'K'
  WHEN requested_rank = '1100' THEN 'K+'
  WHEN requested_rank = '1200' THEN 'I'
  WHEN requested_rank = '1300' THEN 'I+'
  WHEN requested_rank = '1400' THEN 'H'
  WHEN requested_rank = '1500' THEN 'H+'
  WHEN requested_rank = '1600' THEN 'G'
  WHEN requested_rank = '1700' THEN 'G+'
  WHEN requested_rank = '1800' THEN 'F'
  WHEN requested_rank = '1900' THEN 'F+'
  WHEN requested_rank = '2000' THEN 'E'
  WHEN requested_rank = '2100' THEN 'E+'
  ELSE requested_rank
END
WHERE requested_rank IN ('1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100');

-- Update profiles.verified_rank table
UPDATE profiles 
SET verified_rank = CASE 
  WHEN verified_rank = '1000' THEN 'K'
  WHEN verified_rank = '1100' THEN 'K+'
  WHEN verified_rank = '1200' THEN 'I'
  WHEN verified_rank = '1300' THEN 'I+'
  WHEN verified_rank = '1400' THEN 'H'
  WHEN verified_rank = '1500' THEN 'H+'
  WHEN verified_rank = '1600' THEN 'G'
  WHEN verified_rank = '1700' THEN 'G+'
  WHEN verified_rank = '1800' THEN 'F'
  WHEN verified_rank = '1900' THEN 'F+'
  WHEN verified_rank = '2000' THEN 'E'
  WHEN verified_rank = '2100' THEN 'E+'
  ELSE verified_rank
END
WHERE verified_rank IN ('1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100');

-- Verify the changes
SELECT 'rank_requests' as table_name, requested_rank, COUNT(*) as count
FROM rank_requests 
GROUP BY requested_rank
UNION ALL
SELECT 'profiles' as table_name, verified_rank, COUNT(*) as count
FROM profiles 
WHERE verified_rank IS NOT NULL
GROUP BY verified_rank
ORDER BY table_name, requested_rank;
