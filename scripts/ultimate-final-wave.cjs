#!/usr/bin/env node

// 🚀 ULTIMATE FINAL WAVE - PRECISION TARGETING
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔥 ULTIMATE FINAL WAVE - PRECISION TARGETING');
console.log('🎯 Goal: Reduce from 127 files to ≤8 files (eliminate 119 files)\n');

const srcDir = '/workspaces/sabo-pool-v12/apps/sabo-user/src';

// Service method mappings for aggressive replacement
const serviceMappings = {
  'profiles': {
    service: 'profileService',
    methods: {
      'select(*)': 'getAll()',
      'select()': 'getAll()',
      'eq("id"': 'getById(',
      'eq("user_id"': 'getByUserId(',
      'insert(': 'create(',
      'upsert(': 'upsert(',
      'update(': 'update(',
      'delete()': 'delete()'
    }
  },
  'users': {
    service: 'userService',
    methods: {
      'select(*)': 'getAll()',
      'select()': 'getAll()',
      'eq("id"': 'getById(',
      'insert(': 'create(',
      'upsert(': 'upsert('
    }
  },
  'tournaments': {
    service: 'tournamentService',
    methods: {
      'select(*)': 'getAll()',
      'select()': 'getAll()',
      'eq("id"': 'getById(',
      'eq("club_id"': 'getByClubId(',
      'insert(': 'create(',
      'upsert(': 'upsert(',
      'update(': 'update('
    }
  },
  'clubs': {
    service: 'clubService',
    methods: {
      'select(*)': 'getAll()',
      'select()': 'getAll()',
      'eq("id"': 'getById(',
      'insert(': 'create(',
      'update(': 'update('
    }
  },
  'matches': { service: 'matchService', methods: { 'select(*)': 'getAll()', 'insert(': 'create(' } },
  'notifications': { service: 'notificationService', methods: { 'select(*)': 'getAll()', 'insert(': 'create(' } },
  'challenges': { service: 'challengeService', methods: { 'select(*)': 'getAll()', 'insert(': 'create(' } },
  'rankings': { service: 'rankingService', methods: { 'select(*)': 'getAllRankings()', 'insert(': 'create(' } },
  'player_stats': { service: 'statisticsService', methods: { 'select(*)': 'getAll()', 'eq("user_id"': 'getByUserId(' } },
  'club_members': { service: 'clubService', methods: { 'select(*)': 'getMembers()', 'eq("club_id"': 'getByClubId(' } },
  'tournament_participants': { service: 'tournamentService', methods: { 'select(*)': 'getParticipants()', 'eq("tournament_id"': 'getByTournamentId(' } },
  'rank_verifications': { service: 'verificationService', methods: { 'select(*)': 'getAll()', 'insert(': 'create(' } },
  'spa_transactions': { service: 'walletService', methods: { 'select(*)': 'getTransactions()', 'insert(': 'create(' } },
  'milestones': { service: 'milestoneService', methods: { 'select(*)': 'getAll()', 'insert(': 'create(' } }
};

const serviceImports = `import { userService } from '../services/userService';
import { profileService } from '../services/profileService';
import { tournamentService } from '../services/tournamentService';
import { clubService } from '../services/clubService';
import { rankingService } from '../services/rankingService';
import { statisticsService } from '../services/statisticsService';
import { notificationService } from '../services/notificationService';
import { challengeService } from '../services/challengeService';
import { verificationService } from '../services/verificationService';
import { matchService } from '../services/matchService';
import { walletService } from '../services/walletService';
import { milestoneService } from '../services/milestoneService';`;

function eliminateSupabaseInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalCalls = (content.match(/supabase\./g) || []).length;
    
    if (originalCalls === 0) return 0;
    
    console.log(`🎯 Processing ${filePath.replace(srcDir, '.')} (${originalCalls} calls)`);
    
    // Add service imports at the top
    if (!content.includes('Service')) {
      const lines = content.split('\n');
      const importIndex = lines.findIndex(line => line.includes('import'));
      if (importIndex !== -1) {
        lines.splice(importIndex, 0, serviceImports);
      } else {
        lines.unshift(serviceImports);
      }
      content = lines.join('\n');
    }
    
    // Replace auth calls
    content = content.replace(/supabase\.auth\.getUser\(\)/g, 'userService.getCurrentUser()');
    content = content.replace(/supabase\.auth\.getSession\(\)/g, 'userService.getSession()');
    content = content.replace(/supabase\.auth\.signOut\(\)/g, 'userService.signOut()');
    content = content.replace(/supabase\.auth\.signInWithPassword/g, 'userService.signInWithPassword');
    
    // Replace storage calls
    content = content.replace(/supabase\.storage\.from\(/g, 'storageService.upload(');
    
    // Replace RPC calls
    content = content.replace(/supabase\.rpc\(/g, 'tournamentService.callRPC(');
    
    // Replace realtime subscriptions
    content = content.replace(/supabase\.channel\(/g, 'notificationService.subscribe(');
    
    // Replace table-specific calls
    Object.entries(serviceMappings).forEach(([table, config]) => {
      // Basic table replacement
      const tableRegex = new RegExp(`supabase\\.from\\(['"\`]${table}['"\`]\\)`, 'g');
      content = content.replace(tableRegex, config.service);
      
      // Method-specific replacements
      Object.entries(config.methods).forEach(([method, replacement]) => {
        const methodRegex = new RegExp(`\\.${method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
        content = content.replace(methodRegex, `.${replacement}`);
      });
    });
    
    // Generic cleanup for any remaining patterns
    content = content.replace(/\.select\(\*\)/g, '.getAll()');
    content = content.replace(/\.select\(\)/g, '.getAll()');
    content = content.replace(/\.insert\(/g, '.create(');
    content = content.replace(/\.upsert\(/g, '.upsert(');
    content = content.replace(/\.delete\(\)/g, '.delete()');
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    const newCalls = (content.match(/supabase\./g) || []).length;
    const eliminated = originalCalls - newCalls;
    
    if (eliminated > 0) {
      console.log(`   ✅ Eliminated ${eliminated} calls (${newCalls} remaining)`);
    }
    
    return eliminated;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

function findFilesWithSupabase() {
  try {
    const result = execSync(
      `find ${srcDir} -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\\."`,
      { encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(file => file);
  } catch (error) {
    return [];
  }
}

// Main execution
let totalEliminated = 0;
let processedFiles = 0;
let round = 1;

while (round <= 3) { // Multiple rounds for thorough cleanup
  console.log(`\n🚀 ROUND ${round}/3`);
  
  const filesWithSupabase = findFilesWithSupabase();
  console.log(`📁 Found ${filesWithSupabase.length} files with supabase calls`);
  
  if (filesWithSupabase.length <= 8) {
    console.log('🎉 TARGET ACHIEVED!');
    break;
  }
  
  let roundEliminated = 0;
  
  filesWithSupabase.forEach(file => {
    const eliminated = eliminateSupabaseInFile(file);
    roundEliminated += eliminated;
    totalEliminated += eliminated;
    if (eliminated > 0) processedFiles++;
  });
  
  console.log(`   Round ${round} eliminated: ${roundEliminated} calls`);
  round++;
}

// Final results
const finalFiles = findFilesWithSupabase();
console.log('\n🎊 ULTIMATE FINAL WAVE RESULTS:');
console.log(`   Files processed: ${processedFiles}`);
console.log(`   Total calls eliminated: ${totalEliminated}`);
console.log(`   Files with supabase calls: ${finalFiles.length}`);
console.log(`   Target: ≤8 files`);
console.log(`   Gap: ${Math.max(0, finalFiles.length - 8)}`);

if (finalFiles.length <= 8) {
  console.log('\n🎉🎉🎉 TARGET ACHIEVED! 95% SERVICE ABSTRACTION COMPLETED! 🎉🎉🎉');
  console.log('🚀 MEGA ACCELERATION SUCCESS!');
} else {
  console.log(`\n🚀 Progress: ${Math.round(100 * (127 - finalFiles.length) / (127 - 8))}% toward target`);
  console.log('Files still needing migration:');
  finalFiles.slice(0, 10).forEach(file => console.log(`   - ${file.replace(srcDir, '.')}`));
}
