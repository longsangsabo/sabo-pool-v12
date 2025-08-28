#!/bin/bash

# ===================================
# PHASE 2: INTELLIGENT CONSOLE.LOG CLEANUP
# Automated categorization and professional cleanup
# ===================================

echo "🧹 Phase 2: Intelligent Console.log Cleanup"
echo "==========================================="

# First, run analysis to get current state
echo "📊 Running console.log analysis..."
node scripts/analysis/console-log-analyzer.cjs

echo ""
echo "🎯 Phase 2 Strategy:"
echo "==================="
echo "1. 🗑️  Remove debug statements (automatic)"
echo "2. 🔄 Convert user feedback to toast notifications"  
echo "3. 📊 Migrate error logging to proper logger"
echo "4. ⚡ Keep testing logs but improve them"
echo "5. 🔍 Review and categorize 'other' statements"

# Create professional logger service
echo ""
echo "📄 Creating professional logger service..."

cat > src/services/loggerService.ts << 'EOF'
/**
 * Professional Logger Service
 * Replaces console.log with structured logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
}

class LoggerService {
  private isDevelopment = import.meta.env.DEV || false;
  private minLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  private log(level: LogLevel, message: string, context?: any, component?: string, action?: string) {
    if (level < this.minLogLevel) return;

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      component,
      action,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    // Development: Still use console for immediate feedback
    if (this.isDevelopment) {
      const levelName = LogLevel[level];
      const prefix = `[${levelName}]${component ? ` [${component}]` : ''}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, context);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, context);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, context);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(prefix, message, context);
          break;
      }
    }

    // Production: Send to logging service
    if (!this.isDevelopment) {
      this.sendToLoggingService(logEntry);
    }

    // Always store in local storage for debugging (limited)
    this.storeLocalLog(logEntry);
  }

  debug(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.DEBUG, message, context, component, action);
  }

  info(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.INFO, message, context, component, action);
  }

  warn(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.WARN, message, context, component, action);
  }

  error(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.ERROR, message, context, component, action);
  }

  critical(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.CRITICAL, message, context, component, action);
  }

  // Performance logging
  performance(operation: string, duration: number, context?: any, component?: string) {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      ...context,
      duration,
      operation
    }, component, 'performance');
  }

  // User action logging  
  userAction(action: string, context?: any, component?: string) {
    this.info(`User Action: ${action}`, context, component, 'user_action');
  }

  // API call logging
  apiCall(method: string, url: string, status: number, duration: number, context?: any) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${url} - ${status} (${duration}ms)`, {
      ...context,
      method,
      url,
      status,
      duration
    }, 'api', 'request');
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or local storage
    try {
      const user = JSON.parse(localStorage.getItem('auth-user') || '{}');
      return user?.id;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  private async sendToLoggingService(logEntry: LogEntry) {
    try {
      // Send to external logging service (Sentry, LogRocket, etc.)
      if (import.meta.env.VITE_SENTRY_DSN) {
        // Integration with Sentry or other services
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry)
        });
      }
    } catch (error) {
      // Fallback to console in case of logging service failure
      console.error('Failed to send log to service:', error);
    }
  }

  private storeLocalLog(logEntry: LogEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('app-logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app-logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  // Get recent logs for debugging
  getRecentLogs(limit = 50): LogEntry[] {
    try {
      const logs = JSON.parse(localStorage.getItem('app-logs') || '[]');
      return logs.slice(-limit);
    } catch {
      return [];
    }
  }

  // Clear logs
  clearLogs() {
    localStorage.removeItem('app-logs');
  }
}

export const logger = new LoggerService();
EOF

# Create toast notification service  
echo "📄 Creating enhanced toast notification service..."

cat > src/services/toastService.ts << 'EOF'
/**
 * Toast Notification Service
 * Professional user feedback system
 */
import { toast } from 'sonner';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  icon?: React.ReactNode;
}

class ToastService {
  success(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  error(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.error(message, {
      duration: options?.duration || 6000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  warning(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  info(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  loading(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.loading(message, {
      duration: options?.duration || Infinity,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false
    });
  }

  // Tournament-specific toasts
  tournamentCreated(name: string) {
    this.success(`🏆 Tournament "${name}" created successfully!`, {
      action: {
        label: 'View',
        onClick: () => window.location.href = '/tournaments'
      }
    });
  }

  matchResult(winner: string, score: string) {
    this.success(`🎯 Match completed! ${winner} wins ${score}`, {
      duration: 6000
    });
  }

  challengeReceived(challenger: string) {
    this.info(`⚔️ Challenge received from ${challenger}`, {
      action: {
        label: 'View',
        onClick: () => window.location.href = '/challenges'
      },
      duration: 8000
    });
  }

  rankingUpdate(newRank: number, change: number) {
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    const message = change > 0 
      ? `${emoji} Rank increased to #${newRank} (+${change})`
      : change < 0 
      ? `${emoji} Rank changed to #${newRank} (${change})`
      : `${emoji} Rank maintained at #${newRank}`;
    
    this.info(message, { duration: 6000 });
  }

  // Batch operations
  promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error
    });
  }

  // Dismiss specific toast
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  dismissAll() {
    toast.dismiss();
  }
}

export const toastService = new ToastService();
EOF

# Create automated console.log cleanup script
echo "📄 Creating automated console.log cleanup script..."

cat > scripts/phase-2-auto-cleanup.cjs << 'EOF'
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
EOF

echo ""
echo "✅ Phase 2 setup complete!"
echo "📊 Created services:"
echo "  - 📄 src/services/loggerService.ts - Professional logging"
echo "  - 📄 src/services/toastService.ts - User notifications"  
echo "  - 📄 scripts/phase-2-auto-cleanup.cjs - Automated cleanup"
echo ""
echo "🎯 Ready to run automated console.log cleanup!"
echo ""
echo "Would you like to:"
echo "1. 🧹 Run automated cleanup now"
echo "2. 📊 Preview what will be changed first"
echo "3. 🔍 Manual review before automation"
echo ""
echo "Command to run: node scripts/phase-2-auto-cleanup.cjs"
