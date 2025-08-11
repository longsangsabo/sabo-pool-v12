-- Generate random claim codes for all NULL entries
-- Simple format: 6 random characters

UPDATE legacy_spa_points 
SET claim_code = 
    CHR(65 + (RANDOM() * 25)::INT) ||  -- Random A-Z
    CHR(65 + (RANDOM() * 25)::INT) ||  -- Random A-Z  
    (RANDOM() * 9)::INT ||             -- Random 0-9
    (RANDOM() * 9)::INT ||             -- Random 0-9
    CHR(65 + (RANDOM() * 25)::INT) ||  -- Random A-Z
    (RANDOM() * 9)::INT                -- Random 0-9
WHERE claim_code IS NULL;

-- Example result: AB12C3, XY89Z5, etc.
