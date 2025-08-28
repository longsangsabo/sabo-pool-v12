#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 SAFE CONSOLE CLEANUP v2.0');
console.log('==============================');

// Professional services imports to add
const LOGGER_IMPORT = "import { logger } from '@/services/loggerService';";
const TOAST_IMPORT = "import { toastService } from '@/services/toastService';";

// Safe patterns for replacement
const SAFE_REPLACEMENTS = [
  // Debug console.log removals (safe patterns only)
  {
    pattern: /console\.log\(['"`]DEBUG:.*?\);?\s*$/gm,
    replacement: '',
    description: 'Remove DEBUG console.log statements'
  },
  {
    pattern: /console\.log\(['"`]Test:.*?\);?\s*$/gm,
    replacement: '',
    description: 'Remove Test console.log statements'
  },
  
  // Simple user feedback to toast (very conservative)
  {
    pattern: /console\.log\(['"`](Success|Error|Warning|Info):\s*(.*?)['"]\);?/g,
    replacement: (match, type, message) => {
      const toastType = type.toLowerCase();
      return `toastService.${toastType}('${message}');`;
    },
    description: 'Convert simple user feedback to toasts'
  }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let hasToastImport = content.includes("import { toastService }");
  let hasLoggerImport = content.includes("import { logger }");
  
  // Apply safe replacements
  SAFE_REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      
      // Add imports if needed
      if (description.includes('toast') && !hasToastImport) {
        content = addImport(content, TOAST_IMPORT);
        hasToastImport = true;
      }
      if (description.includes('logger') && !hasLoggerImport) {
        content = addImport(content, LOGGER_IMPORT);
        hasLoggerImport = true;
      }
    }
  });
  
  if (modified) {
    // Validate syntax before writing
    if (isValidTypeScript(content)) {
      fs.writeFileSync(filePath, content);
      return true;
    } else {
      console.log(`⚠️  Skipped ${filePath} - syntax validation failed`);
      return false;
    }
  }
  
  return false;
}

function addImport(content, importStatement) {
  const lines = content.split('\n');
  const lastImportIndex = findLastImportIndex(lines);
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  } else {
    lines.unshift(importStatement);
  }
  
  return lines.join('\n');
}

function findLastImportIndex(lines) {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('import ')) {
      return i;
    }
  }
  return -1;
}

function isValidTypeScript(content) {
  // Basic syntax validation
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  return openBraces === closeBraces && openParens === closeParens;
}

function findFiles(dir, extensions) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');
const files = findFiles(srcDir, ['.ts', '.tsx']);

console.log(`📁 Found ${files.length} TypeScript files`);

let processedCount = 0;
let modifiedCount = 0;

files.forEach(file => {
  processedCount++;
  if (processFile(file)) {
    modifiedCount++;
    console.log(`✅ Modified: ${file.replace(process.cwd(), '.')}`);
  }
});

console.log('');
console.log('📊 Safe Cleanup Results:');
console.log('========================');
console.log(`📁 Files processed: ${processedCount}`);
console.log(`🔄 Files modified: ${modifiedCount}`);
console.log(`🛡️  Files preserved: ${processedCount - modifiedCount}`);
console.log('');
console.log('✅ Safe cleanup complete!');
