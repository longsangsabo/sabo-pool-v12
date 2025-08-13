-- Check if location and required_rank columns exist in challenges table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND column_name IN ('location', 'required_rank')
ORDER BY column_name;

-- Also check all columns in challenges table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
