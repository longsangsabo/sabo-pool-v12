#!/usr/bin/env node

// Script để preview console.log sẽ bị xóa
const fs = require('fs');
const path = require('path');

function findConsoleLogsPreview() {
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build'];
  
  function walkDir(dir) {
    const results = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !excludeDirs.some(exclude => fullPath.includes(exclude))) {
          results.push(...walkDir(fullPath));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (line.match(/console\.(log|error|warn|info|debug)/)) {
              results.push({
                file: fullPath.replace(process.cwd(), '.'),
                line: index + 1,
                content: line.trim()
              });
            }
          });
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
    
    return results;
  }
  
  return walkDir(process.cwd());
}

console.log('🔍 Preview: Console.log statements found in your project');
console.log('========================================================');

const consoleStatements = findConsoleLogsPreview();

if (consoleStatements.length === 0) {
  console.log('✅ No console.log statements found!');
  process.exit(0);
}

// Group by file
const byFile = {};
consoleStatements.forEach(stmt => {
  if (!byFile[stmt.file]) {
    byFile[stmt.file] = [];
  }
  byFile[stmt.file].push(stmt);
});

Object.keys(byFile).forEach(file => {
  console.log(`\n📁 ${file}`);
  byFile[file].forEach(stmt => {
    console.log(`   Line ${stmt.line}: ${stmt.content}`);
  });
});

console.log(`\n📊 Summary: ${consoleStatements.length} console statements in ${Object.keys(byFile).length} files`);
console.log('\nRun the cleanup script to remove these safely!');
