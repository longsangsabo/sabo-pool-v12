import { logger } from '@/services/loggerService';
import { toastService } from '@/services/toastService';

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
  private isDevelopment = process.env.DEV || '' || false;
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
          logger.error(prefix, message, context);
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
      if (process.env.VITE_SENTRY_DSN || '') {
        // Integration with Sentry or other services
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry)
        });
      }
    } catch (error) {
      // Fallback to console in case of logging service failure
      logger.error('Failed to send log to service:', error);
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
