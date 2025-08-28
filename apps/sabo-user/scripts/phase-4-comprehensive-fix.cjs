#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 PHASE 4: COMPREHENSIVE TYPESCRIPT ERROR ELIMINATION');
console.log('===================================================');

// Categories of errors to fix
const ERROR_CATEGORIES = {
  IMPORT_CONFLICTS: 'Import/Export conflicts',
  MISSING_MODULES: 'Missing module declarations', 
  TYPE_MISMATCHES: 'Type assignment mismatches',
  MISSING_DEPENDENCIES: 'Missing test dependencies',
  ICON_IMPORTS: 'Icon import issues'
};

// Fix Challenge/BaseChallenge conflicts
function fixChallengeConflicts() {
  console.log('📝 Fixing Challenge/BaseChallenge conflicts...');
  
  const commonTypesPath = 'src/types/common.ts';
  if (fs.existsSync(commonTypesPath)) {
    let content = fs.readFileSync(commonTypesPath, 'utf8');
    
    // Also rename ChallengeProposal to BaseChallengeProposal
    content = content.replace(/export interface ChallengeProposal/g, 'export interface BaseChallengeProposal');
    content = content.replace(/ChallengeProposal\[\]/g, 'BaseChallengeProposal[]');
    
    fs.writeFileSync(commonTypesPath, content);
    console.log('  ✅ Renamed ChallengeProposal to BaseChallengeProposal');
  }
  
  // Update files that reference the old names
  const files = findFiles('src/', ['.ts', '.tsx']);
  let fixedFiles = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix ChallengeProposal imports
    if (content.includes("from '@/types/common'") && content.includes('ChallengeProposal')) {
      content = content.replace(/ChallengeProposal/g, 'BaseChallengeProposal');
    }
    
    // Fix Challenge type assignments from common.ts
    if (content.includes('Type \'Challenge\' is not assignable to type \'BaseChallenge\'')) {
      // This requires more specific fixes per file
      content = content.replace(/: Challenge/g, ': BaseChallenge');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      fixedFiles++;
    }
  });
  
  console.log(`  ✅ Fixed Challenge conflicts in ${fixedFiles} files`);
}

// Install missing test dependencies
function installTestDependencies() {
  console.log('📝 Installing missing test dependencies...');
  
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    console.log('  🔧 Adding test dependencies to package.json...');
    
    // Create a script to install dependencies
    const installScript = `#!/bin/bash
echo "Installing test dependencies..."
pnpm add -D @testing-library/react @testing-library/jest-dom @jest/globals vitest @testing-library/user-event
echo "✅ Test dependencies installed"
`;
    
    fs.writeFileSync('install-test-deps.sh', installScript);
    console.log('  ✅ Created install-test-deps.sh script');
  }
}

// Fix lucide-react icon imports
function fixIconImports() {
  console.log('📝 Fixing lucide-react icon imports...');
  
  const iconMappings = {
    'SwipeRight': 'ChevronRight',
    'SwipeLeft': 'ChevronLeft',
    'SwipeUp': 'ChevronUp', 
    'SwipeDown': 'ChevronDown'
  };
  
  const files = findFiles('src/', ['.ts', '.tsx']);
  let fixedFiles = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix icon imports
    Object.entries(iconMappings).forEach(([oldIcon, newIcon]) => {
      content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      fixedFiles++;
    }
  });
  
  console.log(`  ✅ Fixed icon imports in ${fixedFiles} files`);
}

// Fix button size type conflicts
function fixButtonSizeConflicts() {
  console.log('📝 Fixing button size type conflicts...');
  
  const files = findFiles('src/components/', ['.tsx']);
  let fixedFiles = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix button size conflicts - standardize to allowed values
    content = content.replace(/size=["']md["']/g, 'size="default"');
    content = content.replace(/size=["']medium["']/g, 'size="default"');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      fixedFiles++;
    }
  });
  
  console.log(`  ✅ Fixed button size conflicts in ${fixedFiles} files`);
}

// Fix OAuth configuration properly
function fixOAuthConfigAdvanced() {
  console.log('📝 Fixing OAuth configuration properly...');
  
  const socialLoginPath = 'src/components/SocialLoginButtons.tsx';
  if (fs.existsSync(socialLoginPath)) {
    let content = fs.readFileSync(socialLoginPath, 'utf8');
    
    // Replace the problematic OAuth calls with proper Supabase syntax
    content = content.replace(
      /supabase\.auth\.signInWithOAuth\(\{\s*clientId:\s*[^}]+\}\)/g,
      "supabase.auth.signInWithOAuth({ provider: 'google' })"
    );
    
    content = content.replace(
      /supabase\.auth\.signInWithOAuth\(\{\s*appId:\s*[^}]+\}\)/g,
      "supabase.auth.signInWithOAuth({ provider: 'facebook' })"
    );
    
    fs.writeFileSync(socialLoginPath, content);
    console.log('  ✅ Fixed OAuth configuration in SocialLoginButtons');
  }
}

// Create comprehensive type declarations
function createComprehensiveTypes() {
  console.log('📝 Creating comprehensive type declarations...');
  
  // Enhanced global types
  const globalTypesContent = `// Enhanced global type declarations
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
  readonly hot?: {
    accept(): void;
    dispose(cb: () => void): void;
  };
}

// Jest/Testing globals
declare global {
  var describe: jest.Describe;
  var it: jest.It;
  var test: jest.It;
  var expect: jest.Expect;
  var beforeEach: jest.LifeCycleMethod;
  var afterEach: jest.LifeCycleMethod;
  var beforeAll: jest.LifeCycleMethod;
  var afterAll: jest.LifeCycleMethod;
}

// Module declarations for better compatibility
declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

export {};
`;
  
  fs.writeFileSync('src/types/global.d.ts', globalTypesContent);
  console.log('  ✅ Enhanced global.d.ts with comprehensive declarations');
}

// Utility function to find files
function findFiles(dir, extensions) {
  const files = [];
  
  function walkDir(currentDir) {
    try {
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
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  walkDir(dir);
  return files;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting comprehensive Phase 4 fixes...\n');
    
    createComprehensiveTypes();
    fixChallengeConflicts();
    fixIconImports();
    fixButtonSizeConflicts(); 
    fixOAuthConfigAdvanced();
    installTestDependencies();
    
    console.log('\n✅ Phase 4 comprehensive fixes complete!');
    console.log('🎯 Next steps:');
    console.log('  1. Run: chmod +x install-test-deps.sh && ./install-test-deps.sh');
    console.log('  2. Run: pnpm type-check to verify improvements');
    
  } catch (error) {
    console.error('❌ Error during Phase 4 fixes:', error);
    process.exit(1);
  }
}

main();
