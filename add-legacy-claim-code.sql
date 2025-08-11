-- Add claim_code column to legacy_spa_points table
-- Simple approach: Just add column, admin will manually set codes

ALTER TABLE legacy_spa_points 
ADD COLUMN IF NOT EXISTS claim_code VARCHAR(50);

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_legacy_spa_points_claim_code 
ON legacy_spa_points(claim_code);

-- Admin can manually set codes like: UPDATE legacy_spa_points SET claim_code = 'CODE123' WHERE id = 1;
