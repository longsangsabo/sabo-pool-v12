-- KIỂM TRA SCHEMA THỰC TẾ CỦA TABLE CHALLENGES
-- ===============================================

-- Check all columns in challenges table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check for similar column names
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'challenges' 
  AND table_schema = 'public'
  AND (column_name LIKE '%spa%' OR column_name LIKE '%amount%' OR column_name LIKE '%point%' OR column_name LIKE '%bet%')
ORDER BY column_name;
