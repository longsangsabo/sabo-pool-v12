-- Update ANH LONG MAGIC with claim code for testing
UPDATE legacy_spa_points 
SET claim_code = 'LEGACY-46-ANH'
WHERE full_name = 'ANH LONG MAGIC' AND claim_code IS NULL;

-- Verify the update
SELECT full_name, spa_points, claim_code, claimed FROM legacy_spa_points WHERE full_name = 'ANH LONG MAGIC';
