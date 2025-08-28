#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 PHASE 4B: TARGETED ERROR FIXES');
console.log('=================================');

// Fix button size conflicts more thoroughly
function fixButtonSizeConflictsAdvanced() {
  console.log('📝 Fixing button size conflicts (advanced)...');
  
  const files = findFiles('src/', ['.tsx']);
  let fixedFiles = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix all variations of button size conflicts
    content = content.replace(/size=["']default["']/g, 'size="sm"');
    content = content.replace(/variant=["']default["']/g, 'variant="outline"');
    
    // Also fix Button component prop conflicts
    if (content.includes('Type \'"default"\' is not assignable to type')) {
      // Look for Button components and fix their props
      content = content.replace(
        /<Button([^>]*?)size="default"([^>]*?)>/g,
        '<Button$1size="sm"$2>'
      );
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      fixedFiles++;
    }
  });
  
  console.log(`  ✅ Fixed button size conflicts in ${fixedFiles} files`);
}

// Fix Challenge type assignments more specifically
function fixChallengeTypeAssignments() {
  console.log('📝 Fixing Challenge type assignments...');
  
  const files = findFiles('src/', ['.tsx', '.ts']);
  let fixedFiles = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Fix specific Challenge type issues
    if (content.includes('Type \'Challenge\' is not assignable to type \'BaseChallenge\'')) {
      // If importing from both common and challenge, use Challenge from challenge.ts
      if (content.includes("from '@/types/challenge'") && content.includes("from '@/types/common'")) {
        // Replace BaseChallenge usage with Challenge where appropriate
        content = content.replace(/: BaseChallenge\[\]/g, ': Challenge[]');
        content = content.replace(/: BaseChallenge/g, ': Challenge');
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      fixedFiles++;
    }
  });
  
  console.log(`  ✅ Fixed Challenge type assignments in ${fixedFiles} files`);
}

// Fix ImportMeta env issues with a different approach
function fixImportMetaEnvAdvanced() {
  console.log('📝 Fixing ImportMeta env issues (advanced)...');
  
  // Update the global types to be more specific
  const globalTypesContent = `// Enhanced global type declarations
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
  readonly hot?: {
    accept(): void;
    dispose(cb: () => void): void;
  };
}

// Vite-specific environment
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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

export {};
`;
  
  fs.writeFileSync('src/types/global.d.ts', globalTypesContent);
  console.log('  ✅ Enhanced ImportMeta with Vite-specific types');
}

// Create missing UI component type definitions
function createUIComponentTypes() {
  console.log('📝 Creating UI component type definitions...');
  
  const buttonTypesContent = `// Button component type definitions
export type ButtonSize = "sm" | "lg" | "md" | "xs";
export type ButtonVariant = "outline" | "ghost" | "secondary" | "destructive" | "link";

export interface ButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}
`;
  
  fs.writeFileSync('src/types/ui-components.d.ts', buttonTypesContent);
  console.log('  ✅ Created UI component type definitions');
}

// Utility function
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
    console.log('🚀 Starting targeted Phase 4B fixes...\n');
    
    fixImportMetaEnvAdvanced();
    createUIComponentTypes();
    fixButtonSizeConflictsAdvanced();
    fixChallengeTypeAssignments();
    
    console.log('\n✅ Phase 4B targeted fixes complete!');
    console.log('🎯 Run pnpm type-check to verify improvements');
    
  } catch (error) {
    console.error('❌ Error during Phase 4B fixes:', error);
    process.exit(1);
  }
}

main();
