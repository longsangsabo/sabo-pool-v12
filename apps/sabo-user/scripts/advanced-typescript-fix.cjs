#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 PHASE 3 ADVANCED TYPESCRIPT FIX');
console.log('==================================');

// Fix type conflicts between different Challenge types
function fixChallengeTypeConflicts() {
  console.log('📝 Fixing Challenge type conflicts...');
  
  const challengeFilePath = 'src/types/challenge.ts';
  const commonFilePath = 'src/types/common.ts';
  
  // Check if files exist and contain Challenge types
  if (fs.existsSync(challengeFilePath) && fs.existsSync(commonFilePath)) {
    const challengeContent = fs.readFileSync(challengeFilePath, 'utf8');
    const commonContent = fs.readFileSync(commonFilePath, 'utf8');
    
    if (challengeContent.includes('export interface Challenge') && 
        commonContent.includes('export interface Challenge')) {
      
      // Rename Challenge in common.ts to BaseChallenge to avoid conflicts
      const updatedCommonContent = commonContent.replace(
        /export interface Challenge/g,
        'export interface BaseChallenge'
      ).replace(
        /Challenge\[\]/g,
        'BaseChallenge[]'
      );
      
      fs.writeFileSync(commonFilePath, updatedCommonContent);
      console.log('  ✅ Renamed Challenge to BaseChallenge in common.ts');
      
      // Update files that import from common.ts
      updateChallengeImports();
    }
  }
}

function updateChallengeImports() {
  console.log('📝 Updating Challenge import references...');
  
  const files = findFiles('src/', ['.ts', '.tsx']);
  let updateCount = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Update imports from common that use Challenge
    if (content.includes("from '@/types/common'") && content.includes('Challenge')) {
      content = content.replace(
        /import.*Challenge.*from '@\/types\/common'/g,
        match => match.replace('Challenge', 'BaseChallenge')
      );
      
      // Update usage in the file
      content = content.replace(
        /\bChallenge\b/g,
        (match, offset) => {
          // Only replace if it's not importing from challenge.ts
          const beforeMatch = content.substring(Math.max(0, offset - 100), offset);
          if (beforeMatch.includes("from '@/types/challenge'")) {
            return match; // Keep as Challenge
          }
          return 'BaseChallenge';
        }
      );
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      updateCount++;
    }
  });
  
  console.log(`  ✅ Updated ${updateCount} files with new Challenge references`);
}

// Fix ImportMeta env issues
function fixImportMetaEnv() {
  console.log('📝 Fixing ImportMeta env issues...');
  
  // Create a global types file if it doesn't exist
  const typesDir = 'src/types';
  const globalTypesFile = path.join(typesDir, 'global.d.ts');
  
  if (!fs.existsSync(globalTypesFile)) {
    const globalTypesContent = `// Global type declarations
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}

declare global {
  interface Window {
    // Add any global window properties here
  }
}

export {};
`;
    
    fs.writeFileSync(globalTypesFile, globalTypesContent);
    console.log('  ✅ Created global.d.ts with ImportMeta interface');
  }
}

// Fix OAuth configuration issues  
function fixOAuthConfig() {
  console.log('📝 Fixing OAuth configuration...');
  
  const authConfigPath = 'src/components/utils/authConfig.ts';
  
  if (fs.existsSync(authConfigPath)) {
    let content = fs.readFileSync(authConfigPath, 'utf8');
    
    // Add proper OAuth configuration
    if (!content.includes('SignInWithOAuthCredentials')) {
      const oauthFix = `
import { Provider } from '@supabase/supabase-js';

export interface OAuthConfig {
  provider: Provider;
  options?: {
    redirectTo?: string;
  };
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  google: {
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback'
    }
  },
  facebook: {
    provider: 'facebook', 
    options: {
      redirectTo: window.location.origin + '/auth/callback'
    }
  }
};
`;
      
      content += oauthFix;
      fs.writeFileSync(authConfigPath, content);
      console.log('  ✅ Added proper OAuth configuration');
    }
  }
}

// Fix missing adminHelpers exports
function fixAdminHelpers() {
  console.log('📝 Fixing adminHelpers exports...');
  
  const adminHelpersPath = 'src/utils/adminHelpers.ts';
  
  if (fs.existsSync(adminHelpersPath)) {
    let content = fs.readFileSync(adminHelpersPath, 'utf8');
    
    if (!content.includes('checkUserAdminStatus')) {
      content += `
export async function checkUserAdminStatus(userId: string): Promise<boolean> {
  try {
    // Implementation for checking admin status
    // This should be replaced with actual admin check logic
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export function isUserAdmin(user: any): boolean {
  return user?.role === 'admin' || user?.is_admin === true;
}
`;
      
      fs.writeFileSync(adminHelpersPath, content);
      console.log('  ✅ Added missing adminHelpers functions');
    }
  }
}

// Utility function to find files
function findFiles(dir, extensions) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Main execution
async function main() {
  try {
    fixImportMetaEnv();
    fixOAuthConfig();
    fixAdminHelpers();
    fixChallengeTypeConflicts();
    
    console.log('');
    console.log('✅ Advanced TypeScript fixes complete!');
    console.log('🎯 Run type-check to see remaining errors');
    
  } catch (error) {
    console.error('❌ Error during fixes:', error);
    process.exit(1);
  }
}

main();
