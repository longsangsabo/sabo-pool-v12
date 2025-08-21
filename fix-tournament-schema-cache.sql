-- Fix tournament schema cache relationship error
-- Error: "Could not find a relationship between 'tournament_registrations' and 'tournaments' in the schema cache"

-- 1. First, let's check if the foreign key constraint exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'tournament_registrations'
    AND tc.table_schema = 'public';

-- 2. Check if both tables exist
SELECT 
    'tournament_registrations' as table_name,
    COUNT(*) as record_count
FROM tournament_registrations
UNION ALL
SELECT 
    'tournaments' as table_name,
    COUNT(*) as record_count
FROM tournaments;

-- 3. Refresh PostgREST schema cache (if needed)
-- This should be done via the PostgREST admin endpoint
-- POST /rpc/reload_schema

-- 4. Alternative: Use direct table joins instead of PostgREST relations
-- Update the query to avoid PostgREST relationship resolution

-- 5. Check for any name conflicts or duplicate constraints
SELECT conname, contype, conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid IN ('tournament_registrations'::regclass, 'tournaments'::regclass)
ORDER BY conrelid, conname;
