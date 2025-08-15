-- Add location and required_rank columns to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS required_rank TEXT;

-- Verify the columns were added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND column_name IN ('location', 'required_rank')
ORDER BY column_name;
