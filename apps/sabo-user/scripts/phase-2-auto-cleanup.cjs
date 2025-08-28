/**
 * Automated Console.log Cleanup Script
 * Intelligently removes and converts console statements
 */
const fs = require('fs');
const path = require('path');

class ConsoleCleanupService {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      debugRemoved: 0,
      errorsConverted: 0,
      userFeedbackConverted: 0,
      performanceConverted: 0,
      untouched: 0
    };
  }

  async cleanupProject() {
    console.log('🧹 Starting automated console.log cleanup...');
    console.log('===========================================');

    await this.processDirectory('./src');
    
    console.log('\n📊 Cleanup Results:');
    console.log('===================');
    console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
    console.log(`🗑️  Debug statements removed: ${this.stats.debugRemoved}`);
    console.log(`🔄 User feedback converted to toasts: ${this.stats.userFeedbackConverted}`);
    console.log(`📊 Error statements converted to logger: ${this.stats.errorsConverted}`);
    console.log(`⚡ Performance statements converted: ${this.stats.performanceConverted}`);
    console.log(`➡️  Statements left untouched: ${this.stats.untouched}`);
    
    const totalProcessed = this.stats.debugRemoved + this.stats.errorsConverted + 
                          this.stats.userFeedbackConverted + this.stats.performanceConverted;
    console.log(`\n🎯 Total console statements cleaned: ${totalProcessed}`);
  }

  async processDirectory(dir) {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        await this.processDirectory(fullPath);
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        await this.processFile(fullPath);
      }
    }
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      let newLines = [];

      // Add imports if we'll need them
      let needsLogger = false;
      let needsToast = false;
      
      // First pass: analyze what we need
      lines.forEach(line => {
        if (this.isErrorLogging(line) || this.isPerformanceLogging(line)) {
          needsLogger = true;
        }
        if (this.isUserFeedback(line)) {
          needsToast = true;
        }
      });

      // Add imports at the top
      if (needsLogger || needsToast) {
        const imports = [];
        if (needsLogger) {
          imports.push("import { logger } from '@/services/loggerService';");
        }
        if (needsToast) {
          imports.push("import { toastService } from '@/services/toastService';");
        }
        
        // Find where to insert imports (after existing imports)
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('\"use')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '') {
            continue;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, ...imports, '');
        modified = true;
      }

      // Second pass: process console statements
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (this.hasConsoleStatement(line)) {
          const processed = this.processConsoleLine(line, filePath);
          if (processed !== line) {
            lines[i] = processed;
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`✅ Processed: ${filePath}`);
      }
      
      this.stats.filesProcessed++;
    } catch (error) {
      console.log(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  hasConsoleStatement(line) {
    return line.includes('console.log') || line.includes('console.error') || 
           line.includes('console.warn') || line.includes('console.info');
  }

  processConsoleLine(line, filePath) {
    const trimmed = line.trim();
    
    // Skip if it's commented out
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      this.stats.untouched++;
      return line;
    }

    // Remove debug statements
    if (this.isDebugStatement(line)) {
      this.stats.debugRemoved++;
      return this.commentOutLine(line, 'Debug statement removed');
    }

    // Convert user feedback to toasts
    if (this.isUserFeedback(line)) {
      this.stats.userFeedbackConverted++;
      return this.convertToToast(line);
    }

    // Convert error logging to logger
    if (this.isErrorLogging(line)) {
      this.stats.errorsConverted++;
      return this.convertToLogger(line, 'error');
    }

    // Convert performance logging to logger
    if (this.isPerformanceLogging(line)) {
      this.stats.performanceConverted++;
      return this.convertToLogger(line, 'performance');
    }

    // Keep test-related logs but improve them
    if (filePath.includes('test') || filePath.includes('__tests__')) {
      this.stats.untouched++;
      return line; // Keep test logs as-is
    }

    this.stats.untouched++;
    return line;
  }

  isDebugStatement(line) {
    const debugPatterns = [
      '🧹', 'debug', 'Debug', 'DEBUG',
      'temp', 'test', 'Test', 'TODO',
      'console.log("");', 'console.log()',
      'console.log("test")', 'console.log("debug")'
    ];
    
    return debugPatterns.some(pattern => line.includes(pattern));
  }

  isUserFeedback(line) {
    const feedbackPatterns = [
      '✅', '❌', '🎯', '🏆', '⚡', '📊',
      'success', 'Success', 'completed', 'Completed',
      'created', 'Created', 'updated', 'Updated',
      'saved', 'Saved', 'deleted', 'Deleted'
    ];
    
    return feedbackPatterns.some(pattern => line.includes(pattern));
  }

  isErrorLogging(line) {
    const errorPatterns = [
      'console.error', 'error', 'Error', 'ERROR',
      'failed', 'Failed', 'exception', 'Exception'
    ];
    
    return errorPatterns.some(pattern => line.includes(pattern));
  }

  isPerformanceLogging(line) {
    const perfPatterns = [
      'performance', 'Performance', 'time', 'Time',
      'ms', 'seconds', 'duration', 'Duration',
      'benchmark', 'Benchmark'
    ];
    
    return perfPatterns.some(pattern => line.includes(pattern));
  }

  commentOutLine(line, reason) {
    const indent = line.match(/^\s*/)[0];
    return `${indent}// ${reason}: ${line.trim()}`;
  }

  convertToToast(line) {
    const indent = line.match(/^\s*/)[0];
    const content = this.extractConsoleContent(line);
    
    if (content.includes('✅') || content.includes('success') || content.includes('completed')) {
      return `${indent}toastService.success(${content});`;
    } else if (content.includes('❌') || content.includes('error') || content.includes('failed')) {
      return `${indent}toastService.error(${content});`;
    } else {
      return `${indent}toastService.info(${content});`;
    }
  }

  convertToLogger(line, type) {
    const indent = line.match(/^\s*/)[0];
    const content = this.extractConsoleContent(line);
    
    return `${indent}logger.${type}(${content});`;
  }

  extractConsoleContent(line) {
    // Extract content between console.xxx( and )
    const match = line.match(/console\.[a-z]+\((.*)\);?/);
    return match ? match[1] : '"Converted from console"';
  }
}

// Run the cleanup
const cleanup = new ConsoleCleanupService();
cleanup.cleanupProject().catch(console.error);
