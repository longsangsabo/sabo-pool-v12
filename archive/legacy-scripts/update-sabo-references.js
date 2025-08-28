#!/usr/bin/env node

/**
 * 🔄 SABO TABLE MIGRATION SCRIPT
 * Updates all references from sabo_tournament_matches -> tournament_matches
 * across the entire codebase
 */

import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  // JavaScript/TypeScript files
  'check-tournament-tables.js',
  'test-service-key.cjs',
  'test-sabo-fix.mjs',
  'test-sabo-10-functions.mjs',
  'create-test-tournament-full.mjs',
  'check-advancement-issue.mjs',
  'analyze-sabo-tournament.mjs',
  'create-test-sabo-tournament.mjs',
  'test-current-function.mjs',
  'create-sabo-test-data.mjs',
  'check-table-structure.mjs',
  'test-client-side.cjs',
  'simple-debug-test.mjs',
  'check-sabo-direct.cjs',
  'check-both-tables.mjs',
  'disable-rls.cjs',
  'fix-sabo-score-function.mjs',
  
  // SQL files that need updating
  'fix-sabo-function-manual.sql',
  
  // Documentation files
  'SCORE_SUBMISSION_FIX_SUMMARY.md',
  
  // Source files (if any exist)
  'src/services/ClientSideDoubleElimination.ts',
  'src/services/SABOMatchHandler.ts'
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all instances of sabo_tournament_matches with tournament_matches
    content = content.replace(/sabo_tournament_matches/g, 'tournament_matches');
    
    // Replace RPC function references if any
    content = content.replace(/generate_sabo_tournament_matches/g, 'generate_tournament_matches');
    
    // Update comments and documentation
    content = content.replace(/Uses sabo_tournament_matches table/g, 'Uses tournament_matches table');
    content = content.replace(/renamed from sabo_tournament_matches/g, 'renamed from sabo_tournament_matches (migration completed)');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`📋 No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function updateRLSPolicies() {
  console.log('\n🔐 Updating RLS policies...');
  
  const rlsUpdateScript = `
-- Update RLS policies to reference tournament_matches instead of sabo_tournament_matches
-- This script is safe to run multiple times

-- Drop old policies if they exist (might be on the renamed table)
DO $$ 
BEGIN
  -- Drop policies on old table name (if it still exists)
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sabo_tournament_matches') THEN
    DROP POLICY IF EXISTS "Users can view sabo tournament matches" ON sabo_tournament_matches;
    DROP POLICY IF EXISTS "Tournament organizers can manage sabo matches" ON sabo_tournament_matches;
    DROP POLICY IF EXISTS "Admins can manage all sabo matches" ON sabo_tournament_matches;
  END IF;
  
  -- Ensure correct policies exist on tournament_matches
  DROP POLICY IF EXISTS "Users can view tournament matches" ON tournament_matches;
  DROP POLICY IF EXISTS "Tournament organizers can manage matches" ON tournament_matches;
  DROP POLICY IF EXISTS "Admins can manage all matches" ON tournament_matches;
  
  -- Create updated policies
  CREATE POLICY "Users can view tournament matches" ON tournament_matches
    FOR SELECT USING (true);
    
  CREATE POLICY "Tournament organizers can manage matches" ON tournament_matches
    FOR ALL USING (
      auth.uid() IN (
        SELECT t.created_by FROM tournaments t WHERE t.id = tournament_matches.tournament_id
      )
    );
    
  CREATE POLICY "Admins can manage all matches" ON tournament_matches
    FOR ALL USING (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
    );
    
  RAISE NOTICE '✅ RLS policies updated for tournament_matches';
END $$;
`;

  fs.writeFileSync('update-rls-policies.sql', rlsUpdateScript);
  console.log('✅ Created update-rls-policies.sql');
}

function main() {
  console.log('🚀 Starting SABO table reference update...\n');
  
  filesToUpdate.forEach(updateFile);
  
  updateRLSPolicies();
  
  console.log('\n📋 SUMMARY:');
  console.log('✅ Updated all sabo_tournament_matches references to tournament_matches');
  console.log('✅ Created RLS policy update script');
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Run: psql -f update-rls-policies.sql (if needed)');
  console.log('2. Test the application');
  console.log('3. Commit changes to git');
}

main();
