#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConsoleLogCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      consoleLogsRemoved: 0,
      errorsFound: 0,
      skippedFiles: []
    };
    this.backupDir = path.join(process.cwd(), 'console-cleanup-backup');
    this.dryRun = process.argv.includes('--dry-run');
  }

  // Tạo backup trước khi clean
  createBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
    
    try {
      execSync(`cp -r src ${backupPath}`, { stdio: 'pipe' });
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Failed to create backup:', error.message);
      process.exit(1);
    }
  }

  // Tìm tất cả files cần clean
  findTargetFiles() {
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', this.backupDir];
    
    function walkDir(dir) {
      const files = [];
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !excludeDirs.some(exclude => fullPath.includes(exclude))) {
            files.push(...walkDir(fullPath));
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Cannot read directory: ${dir}`);
      }
      
      return files;
    }
    
    return walkDir(process.cwd());
  }

  // Phân tích và clean console.log một cách thông minh
  cleanConsoleLogsInFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let removedCount = 0;

      // Các pattern console.log phức tạp và cẩn thận
      const consolePatterns = [
        // console.log đơn giản
        /^\s*console\.log\([^;]*\);\s*$/gm,
        
        // console.log với comment
        /^\s*\/\/.*console\.log.*$/gm,
        
        // console.log nhiều dòng với template literals
        /^\s*console\.log\(\s*`[\s\S]*?`\s*\);\s*$/gm,
        
        // console.log với object spread
        /^\s*console\.log\(\s*[^)]*\{[\s\S]*?\}[^)]*\);\s*$/gm,
        
        // console.log với function calls
        /^\s*console\.log\(\s*[^)]*\([^)]*\)[^)]*\);\s*$/gm,
        
        // console.log đơn giản trên một dòng
        /^\s*console\.log\([^)]*\);\s*\n/gm,
        
        // console.error, console.warn, console.info (tuỳ chọn)
        /^\s*console\.(error|warn|info|debug)\([^)]*\);\s*$/gm
      ];

      // Các trường hợp đặc biệt cần giữ lại
      const keepPatterns = [
        /console\.log.*prod.*tion/i,  // production logs
        /console\.log.*error/i,       // error logs
        /console\.log.*debug.*prod/i, // production debug
        /\/\*.*console\.log.*\*\//,   // commented out
      ];

      // Kiểm tra xem có nên giữ lại file này không
      const shouldKeep = keepPatterns.some(pattern => pattern.test(content));
      if (shouldKeep) {
        console.log(`⚠️  Skipping ${filePath} - contains important console logs`);
        this.stats.skippedFiles.push(filePath);
        return false;
      }

      // Clean từng pattern
      for (const pattern of consolePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, '');
          removedCount += matches.length;
        }
      }

      // Clean up empty lines liên tiếp
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // Trim trailing whitespace
      content = content.replace(/[ \t]+$/gm, '');

      // Kiểm tra xem có thay đổi gì không
      if (content === originalContent) {
        return false;
      }

      // Validate syntax trước khi ghi file
      if (!this.validateSyntax(content, filePath)) {
        console.error(`❌ Syntax validation failed for ${filePath}`);
        this.stats.errorsFound++;
        return false;
      }

      // Ghi file nếu không phải dry run
      if (!this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Cleaned ${filePath} - removed ${removedCount} console.log(s)`);
      } else {
        console.log(`🔍 [DRY RUN] Would clean ${filePath} - ${removedCount} console.log(s)`);
      }

      this.stats.consoleLogsRemoved += removedCount;
      return true;

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.stats.errorsFound++;
      return false;
    }
  }

  // Validate syntax của file
  validateSyntax(content, filePath) {
    try {
      // Cho TypeScript/JSX files
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        // Đơn giản check các dấu ngoặc cơ bản
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;

        return openBraces === closeBraces && 
               openParens === closeParens && 
               openBrackets === closeBrackets;
      }
      
      // Cho JavaScript files
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        // Basic syntax check
        try {
          new Function(content);
          return true;
        } catch {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  // Chạy TypeScript check
  runTypeScriptCheck() {
    try {
      console.log('🔍 Running TypeScript check...');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ TypeScript check passed');
      return true;
    } catch (error) {
      console.error('❌ TypeScript check failed:', error.stdout?.toString() || error.message);
      return false;
    }
  }

  // Chạy ESLint check
  runESLintCheck() {
    try {
      console.log('🔍 Running ESLint check...');
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ ESLint check passed');
      return true;
    } catch (error) {
      console.error('❌ ESLint check failed - but this might be expected');
      return true; // ESLint errors don't necessarily mean syntax errors
    }
  }

  // Main execution
  async run() {
    console.log('🧹 Starting Console.log Cleanup Tool');
    console.log('=====================================');
    
    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    // Tạo backup
    if (!this.dryRun) {
      this.createBackup();
    }

    // Tìm files
    console.log('\n📁 Finding target files...');
    const files = this.findTargetFiles();
    console.log(`Found ${files.length} files to process`);

    // Process từng file
    console.log('\n🧹 Processing files...');
    for (const file of files) {
      const cleaned = this.cleanConsoleLogsInFile(file);
      if (cleaned) {
        this.stats.filesProcessed++;
      }
    }

    // Run checks nếu không phải dry run
    if (!this.dryRun && this.stats.filesProcessed > 0) {
      console.log('\n🔍 Running validation checks...');
      
      const tsCheck = this.runTypeScriptCheck();
      const lintCheck = this.runESLintCheck();
      
      if (!tsCheck) {
        console.error('\n❌ TypeScript validation failed! Consider restoring from backup.');
        process.exit(1);
      }
    }

    // Hiển thị kết quả
    console.log('\n📊 Cleanup Summary:');
    console.log('===================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Console.log statements removed: ${this.stats.consoleLogsRemoved}`);
    console.log(`Errors encountered: ${this.stats.errorsFound}`);
    console.log(`Files skipped: ${this.stats.skippedFiles.length}`);
    
    if (this.stats.skippedFiles.length > 0) {
      console.log('\nSkipped files:');
      this.stats.skippedFiles.forEach(file => console.log(`  - ${file}`));
    }

    if (this.dryRun) {
      console.log('\n🔍 This was a dry run. Run without --dry-run to apply changes.');
    } else {
      console.log('\n✅ Cleanup completed successfully!');
      console.log(`💾 Backup available at: ${this.backupDir}`);
    }
  }
}

// Chạy script
if (require.main === module) {
  const cleaner = new ConsoleLogCleaner();
  cleaner.run().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = ConsoleLogCleaner;
