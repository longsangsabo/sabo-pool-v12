-- ===================================================================
-- 📦 STEP 7: RESTORE DATA FROM BACKUPS - Paste vào Supabase Dashboard
-- Migrate dữ liệu từ backup tables về clean schema
-- ===================================================================

-- Find backup tables và restore data
DO $$
DECLARE
  backup_table_name TEXT;
  migration_count INTEGER;
  backup_count INTEGER;
BEGIN
  RAISE NOTICE '🔄 Starting data restoration from backups...';
  
  -- Check for tournaments backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournaments_backup_%'
    AND table_schema = 'public'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    -- Get backup count
    EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO backup_count;
    
    -- Restore tournaments data
    EXECUTE format('
      INSERT INTO tournaments 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Restored % tournaments from % (% records in backup)', 
                 migration_count, backup_table_name, backup_count;
  ELSE
    RAISE NOTICE '⚠️ No tournaments backup found, starting with clean slate';
  END IF;
  
  -- Check for tournament_matches backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournament_matches_backup_%'
    AND table_schema = 'public'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    -- Get backup count
    EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO backup_count;
    
    -- Restore tournament_matches data
    EXECUTE format('
      INSERT INTO tournament_matches 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Restored % tournament_matches from % (% records in backup)', 
                 migration_count, backup_table_name, backup_count;
  ELSE
    RAISE NOTICE '⚠️ No tournament_matches backup found';
  END IF;
  
  -- Check for tournament_results backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournament_results_backup_%'
    AND table_schema = 'public'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    -- Get backup count
    EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO backup_count;
    
    -- Restore tournament_results data
    EXECUTE format('
      INSERT INTO tournament_results 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Restored % tournament_results from % (% records in backup)', 
                 migration_count, backup_table_name, backup_count;
  ELSE
    RAISE NOTICE '⚠️ No tournament_results backup found';
  END IF;
  
  -- Check for tournament_registrations backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournament_registrations_backup_%'
    AND table_schema = 'public'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    -- Get backup count
    EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO backup_count;
    
    -- Restore tournament_registrations data
    EXECUTE format('
      INSERT INTO tournament_registrations 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Restored % tournament_registrations from % (% records in backup)', 
                 migration_count, backup_table_name, backup_count;
  ELSE
    RAISE NOTICE '⚠️ No tournament_registrations backup found';
  END IF;
END $$;

-- Verify restored data
SELECT 
  '📊 DATA RESTORATION SUMMARY' as summary,
  'tournaments' as table_name,
  COUNT(*) as restored_count,
  COUNT(CASE WHEN tournament_type = 'double_elimination' THEN 1 END) as double_elim_count
FROM tournaments

UNION ALL

SELECT 
  '📊 DATA RESTORATION SUMMARY' as summary,
  'tournament_matches' as table_name,
  COUNT(*) as restored_count,
  COUNT(CASE WHEN round_number IN (1,2,3,101,102,103,201,202,250,300) THEN 1 END) as sabo_matches
FROM tournament_matches

UNION ALL

SELECT 
  '📊 DATA RESTORATION SUMMARY' as summary,
  'tournament_results' as table_name,
  COUNT(*) as restored_count,
  0 as special_count
FROM tournament_results

UNION ALL

SELECT 
  '📊 DATA RESTORATION SUMMARY' as summary,
  'tournament_registrations' as table_name,
  COUNT(*) as restored_count,
  0 as special_count
FROM tournament_registrations;
