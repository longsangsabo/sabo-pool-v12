-- Add claim_code column to legacy_spa_points table
-- This will enable the new code-based claiming system

ALTER TABLE legacy_spa_points 
ADD COLUMN IF NOT EXISTS claim_code VARCHAR(20) UNIQUE;

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_legacy_spa_points_claim_code 
ON legacy_spa_points(claim_code);

-- Generate unique claim codes for existing entries
-- Format: SP{ID}{4-CHAR-RANDOM} (e.g., SP1A1B2)
UPDATE legacy_spa_points 
SET claim_code = 'SP' || id || SUBSTR(MD5(RANDOM()::text), 1, 4)
WHERE claim_code IS NULL;

-- Add constraint to ensure claim_code is required for new entries
ALTER TABLE legacy_spa_points 
ALTER COLUMN claim_code SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN legacy_spa_points.claim_code IS 'Unique claim code for legacy SPA points redemption';
