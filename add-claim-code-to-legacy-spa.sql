-- Add claim_code column to legacy_spa_points table
-- This will enable the new code-based claiming system

-- Add claim_code column
ALTER TABLE public.legacy_spa_points 
ADD COLUMN IF NOT EXISTS claim_code TEXT UNIQUE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_legacy_spa_points_claim_code 
ON public.legacy_spa_points(claim_code);

-- Update existing records with unique claim codes
-- Generate codes in format: LEGACY-{position_rank}-{first3chars}
UPDATE public.legacy_spa_points 
SET claim_code = CONCAT(
  'LEGACY-',
  LPAD(position_rank::text, 2, '0'),
  '-',
  UPPER(LEFT(REGEXP_REPLACE(nick_name, '[^A-Za-z0-9]', '', 'g'), 3)),
  CASE 
    WHEN LENGTH(REGEXP_REPLACE(nick_name, '[^A-Za-z0-9]', '', 'g')) < 3 
    THEN SUBSTRING(MD5(RANDOM()::text), 1, 3-LENGTH(REGEXP_REPLACE(nick_name, '[^A-Za-z0-9]', '', 'g')))
    ELSE ''
  END
)
WHERE claim_code IS NULL;

-- Verify unique codes (handle duplicates if any)
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
  counter INTEGER;
BEGIN
  FOR rec IN 
    SELECT id, claim_code, position_rank, nick_name
    FROM public.legacy_spa_points 
    WHERE claim_code IN (
      SELECT claim_code 
      FROM public.legacy_spa_points 
      WHERE claim_code IS NOT NULL
      GROUP BY claim_code 
      HAVING COUNT(*) > 1
    )
    ORDER BY position_rank
  LOOP
    counter := 1;
    new_code := rec.claim_code;
    
    -- Find unique code by adding suffix
    WHILE EXISTS (SELECT 1 FROM public.legacy_spa_points WHERE claim_code = new_code AND id != rec.id) LOOP
      new_code := rec.claim_code || counter::text;
      counter := counter + 1;
    END LOOP;
    
    -- Update with unique code
    UPDATE public.legacy_spa_points 
    SET claim_code = new_code 
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Make claim_code NOT NULL for future records
ALTER TABLE public.legacy_spa_points 
ALTER COLUMN claim_code SET NOT NULL;

-- Example codes generated:
-- Position 1: "LEGACY-01-VIN" (for nick_name "Vinny")
-- Position 2: "LEGACY-02-SAB" (for nick_name "Sabo")
-- Position 45: "LEGACY-45-LON" (for nick_name "Long Magic")

-- Test query to see generated codes
SELECT position_rank, full_name, nick_name, spa_points, claim_code, claimed
FROM public.legacy_spa_points 
ORDER BY position_rank
LIMIT 10;
