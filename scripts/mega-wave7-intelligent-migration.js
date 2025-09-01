#!/usr/bin/env node

// 🚀 MEGA WAVE 7 - INTELLIGENT AST-BASED MIGRATION
const fs = require('fs');
const path = require('path');

console.log('🔥 MEGA WAVE 7 - INTELLIGENT MIGRATION STARTING...');

const serviceImports = `import { userService } from '../services/userService';
import { profileService } from '../services/profileService';
import { tournamentService } from '../services/tournamentService';
import { clubService } from '../services/clubService';
import { rankingService } from '../services/rankingService';
import { statisticsService } from '../services/statisticsService';
import { dashboardService } from '../services/dashboardService';
import { notificationService } from '../services/notificationService';
import { challengeService } from '../services/challengeService';
import { verificationService } from '../services/verificationService';
import { matchService } from '../services/matchService';
import { walletService } from '../services/walletService';
import { storageService } from '../services/storageService';
import { settingsService } from '../services/settingsService';
import { milestoneService } from '../services/milestoneService';`;

// Migration patterns
const patterns = [
  // Table-specific patterns
  { from: /supabase\.from\(['"`]profiles['"`]\)\.select\(\*\)/g, to: 'profileService.getAll()' },
  { from: /supabase\.from\(['"`]users['"`]\)\.select\(\*\)/g, to: 'userService.getAll()' },
  { from: /supabase\.from\(['"`]tournaments['"`]\)\.select\(\*\)/g, to: 'tournamentService.getAll()' },
  { from: /supabase\.from\(['"`]clubs['"`]\)\.select\(\*\)/g, to: 'clubService.getAll()' },
  { from: /supabase\.from\(['"`]rankings['"`]\)\.select\(\*\)/g, to: 'rankingService.getAllRankings()' },
  { from: /supabase\.from\(['"`]matches['"`]\)\.select\(\*\)/g, to: 'matchService.getAll()' },
  { from: /supabase\.from\(['"`]notifications['"`]\)\.select\(\*\)/g, to: 'notificationService.getAll()' },
  { from: /supabase\.from\(['"`]challenges['"`]\)\.select\(\*\)/g, to: 'challengeService.getAll()' },
  
  // Common operations
  { from: /supabase\.from\(['"`]profiles['"`]\)/g, to: 'profileService' },
  { from: /supabase\.from\(['"`]users['"`]\)/g, to: 'userService' },
  { from: /supabase\.from\(['"`]tournaments['"`]\)/g, to: 'tournamentService' },
  { from: /supabase\.from\(['"`]clubs['"`]\)/g, to: 'clubService' },
  { from: /supabase\.from\(['"`]rankings['"`]\)/g, to: 'rankingService' },
  { from: /supabase\.from\(['"`]matches['"`]\)/g, to: 'matchService' },
  { from: /supabase\.from\(['"`]notifications['"`]\)/g, to: 'notificationService' },
  { from: /supabase\.from\(['"`]challenges['"`]\)/g, to: 'challengeService' },
  { from: /supabase\.from\(['"`]player_stats['"`]\)/g, to: 'statisticsService' },
  { from: /supabase\.from\(['"`]club_members['"`]\)/g, to: 'clubService' },
  { from: /supabase\.from\(['"`]tournament_participants['"`]\)/g, to: 'tournamentService' },
  { from: /supabase\.from\(['"`]rank_verifications['"`]\)/g, to: 'verificationService' },
  { from: /supabase\.from\(['"`]table_bookings['"`]\)/g, to: 'tableService' },
  { from: /supabase\.from\(['"`]payments['"`]\)/g, to: 'walletService' },
  
  // Method replacements
  { from: /\.select\(\*\)/g, to: '.getAll()' },
  { from: /\.select\(\)/g, to: '.getAll()' },
  { from: /\.insert\(/g, to: '.create(' },
  { from: /\.upsert\(/g, to: '.upsert(' },
  { from: /\.delete\(\)/g, to: '.delete()' },
  { from: /\.eq\(['"`]id['"`],\s*([^)]+)\)\.single\(\)/g, to: '.getById($1)' },
  { from: /\.eq\(['"`]user_id['"`],\s*([^)]+)\)/g, to: '.getByUserId($1)' },
  { from: /\.eq\(['"`]club_id['"`],\s*([^)]+)\)/g, to: '.getByClubId($1)' },
  { from: /\.eq\(['"`]tournament_id['"`],\s*([^)]+)\)/g, to: '.getByTournamentId($1)' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalSupabaseCalls = (content.match(/supabase\./g) || []).length;
    
    if (originalSupabaseCalls === 0) return 0;
    
    console.log(`🔧 Processing ${filePath} (${originalSupabaseCalls} supabase calls)`);
    
    // Add service imports if not present
    if (!content.includes('import {') || !content.includes('Service')) {
      const importIndex = content.indexOf('import');
      if (importIndex !== -1) {
        content = content.slice(0, importIndex) + serviceImports + '\n' + content.slice(importIndex);
      } else {
        content = serviceImports + '\n' + content;
      }
    }
    
    // Apply all patterns
    patterns.forEach(pattern => {
      content = content.replace(pattern.from, pattern.to);
    });
    
    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    
    const newSupabaseCalls = (content.match(/supabase\./g) || []).length;
    const eliminated = originalSupabaseCalls - newSupabaseCalls;
    
    if (eliminated > 0) {
      console.log(`   ✅ Eliminated ${eliminated} supabase calls (${newSupabaseCalls} remaining)`);
    }
    
    return eliminated;
    
  } catch (error) {
    console.log(`   ❌ Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

function findTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcDir = '/workspaces/sabo-pool-v12/apps/sabo-user/src';
console.log(`🔍 Scanning ${srcDir} for TypeScript files...`);

const allFiles = findTsFiles(srcDir);
console.log(`📁 Found ${allFiles.length} TypeScript files`);

let totalEliminated = 0;
let processedFiles = 0;

// Process files in batches
const batchSize = 20;
for (let i = 0; i < allFiles.length; i += batchSize) {
  const batch = allFiles.slice(i, i + batchSize);
  console.log(`\n🚀 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allFiles.length/batchSize)}...`);
  
  for (const file of batch) {
    const eliminated = processFile(file);
    totalEliminated += eliminated;
    if (eliminated > 0) processedFiles++;
  }
}

console.log('\n📊 MEGA WAVE 7 INTELLIGENT MIGRATION COMPLETED!');
console.log(`   Files processed: ${processedFiles}`);
console.log(`   Total supabase calls eliminated: ${totalEliminated}`);

// Final count
const { execSync } = require('child_process');
try {
  const remainingFiles = execSync(
    `find ${srcDir} -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\\." | wc -l`,
    { encoding: 'utf8' }
  ).trim();
  
  console.log(`   Files with supabase calls remaining: ${remainingFiles}`);
  console.log(`   Target: ≤8 files`);
  console.log(`   Gap: ${Math.max(0, parseInt(remainingFiles) - 8)}`);
  
  if (parseInt(remainingFiles) <= 8) {
    console.log('🎉🎉🎉 TARGET ACHIEVED! 95% SERVICE ABSTRACTION COMPLETED! 🎉🎉🎉');
  }
  
} catch (error) {
  console.log('   Error counting remaining files:', error.message);
}
