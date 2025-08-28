-- ===================================================================
-- 🚀 STEP 2: SAFE BACKUP CREATION - Paste vào Supabase Dashboard
-- Tạo backup an toàn trước khi consolidate schema
-- ===================================================================

-- Create backup tables với timestamp
DO $$
DECLARE
  backup_suffix TEXT := to_char(now(), 'YYYYMMDD_HH24MI');
BEGIN
  -- Backup tournaments table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments' AND table_schema = 'public') THEN
    EXECUTE format('CREATE TABLE tournaments_backup_%s AS SELECT * FROM tournaments', backup_suffix);
    RAISE NOTICE '✅ Created tournaments_backup_%', backup_suffix;
  ELSE
    RAISE NOTICE '⚠️ tournaments table not found, skipping backup';
  END IF;
  
  -- Backup tournament_matches table  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament_matches' AND table_schema = 'public') THEN
    EXECUTE format('CREATE TABLE tournament_matches_backup_%s AS SELECT * FROM tournament_matches', backup_suffix);
    RAISE NOTICE '✅ Created tournament_matches_backup_%', backup_suffix;
  ELSE
    RAISE NOTICE '⚠️ tournament_matches table not found, skipping backup';
  END IF;
  
  -- Backup tournament_results table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament_results' AND table_schema = 'public') THEN
    EXECUTE format('CREATE TABLE tournament_results_backup_%s AS SELECT * FROM tournament_results', backup_suffix);
    RAISE NOTICE '✅ Created tournament_results_backup_%', backup_suffix;
  ELSE
    RAISE NOTICE '⚠️ tournament_results table not found, skipping backup';
  END IF;
  
  -- Backup tournament_registrations table if exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament_registrations' AND table_schema = 'public') THEN
    EXECUTE format('CREATE TABLE tournament_registrations_backup_%s AS SELECT * FROM tournament_registrations', backup_suffix);
    RAISE NOTICE '✅ Created tournament_registrations_backup_%', backup_suffix;
  ELSE
    RAISE NOTICE '⚠️ tournament_registrations table not found, skipping backup';
  END IF;
END $$;

-- Verify backups created
SELECT 
  '✅ BACKUP VERIFICATION' as status,
  table_name,
  (xpath('/row/c/text()', query_to_xml(format('SELECT COUNT(*) as c FROM %I', table_name), false, true, '')))[1]::text::int as record_count
FROM information_schema.tables 
WHERE table_name LIKE '%backup_%' 
  AND table_schema = 'public'
  AND table_name LIKE '%tournament%'
ORDER BY table_name DESC;
