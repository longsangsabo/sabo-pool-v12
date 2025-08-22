#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Mobile Profile Console.log Cleaner
 * Safely removes console.log statements from mobile profile components
 */

function cleanConsoleLogsFromFile(filePath) {
  try {
    console.log(`🔧 Cleaning: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Patterns to match various console.log statements
    const patterns = [
      // Basic console.log
      /^\s*console\.log\([^)]*\);\s*$/gm,
      // Multi-line console.log
      /^\s*console\.log\(\s*$/gm,
      // Console.log with object literals (careful handling)
      /^\s*console\.log\(['"`][^'"`]*['"`],\s*\{[^}]*\}\);\s*$/gm,
      // Console.log with template literals
      /^\s*console\.log\(`[^`]*`[^)]*\);\s*$/gm,
      // Console.log with concatenation
      /^\s*console\.log\([^)]*\+[^)]*\);\s*$/gm,
    ];
    
    // Apply each pattern
    patterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // Clean up empty lines (more than 2 consecutive)
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Only write if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function validateSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax checks
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.error(`❌ Syntax error in ${filePath}: Mismatched braces (${openBraces} vs ${closeBraces})`);
      return false;
    }
    
    if (openParens !== closeParens) {
      console.error(`❌ Syntax error in ${filePath}: Mismatched parentheses (${openParens} vs ${closeParens})`);
      return false;
    }
    
    // Check for unterminated strings (basic check)
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes("'") && line.split("'").length % 2 === 0) {
        console.error(`❌ Possible unterminated string at line ${i + 1} in ${filePath}`);
        return false;
      }
      if (line.includes('"') && line.split('"').length % 2 === 0) {
        console.error(`❌ Possible unterminated string at line ${i + 1} in ${filePath}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error validating ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let cleaned = 0;
  let errors = 0;
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const subResult = processDirectory(fullPath);
      cleaned += subResult.cleaned;
      errors += subResult.errors;
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Create backup first
      const backupPath = fullPath + '.backup';
      fs.copyFileSync(fullPath, backupPath);
      
      if (cleanConsoleLogsFromFile(fullPath)) {
        if (validateSyntax(fullPath)) {
          cleaned++;
          // Remove backup if successful
          fs.unlinkSync(backupPath);
        } else {
          // Restore from backup if syntax error
          fs.copyFileSync(backupPath, fullPath);
          fs.unlinkSync(backupPath);
          errors++;
          console.error(`❌ Restored ${fullPath} due to syntax errors`);
        }
      } else {
        // Remove backup if no changes
        fs.unlinkSync(backupPath);
      }
    }
  }
  
  return { cleaned, errors };
}

// Main execution
const targetDir = path.join(process.cwd(), 'src/pages/mobile/profile');

if (!fs.existsSync(targetDir)) {
  console.error('❌ Mobile profile directory not found:', targetDir);
  process.exit(1);
}

console.log('🚀 Starting mobile profile console.log cleanup...');
console.log('📂 Target directory:', targetDir);

const result = processDirectory(targetDir);

console.log('\n📊 Cleanup Summary:');
console.log(`✅ Files cleaned: ${result.cleaned}`);
console.log(`❌ Errors: ${result.errors}`);

if (result.errors === 0) {
  console.log('🎉 Mobile profile cleanup completed successfully!');
} else {
  console.log('⚠️ Some files had errors and were restored from backup.');
}
