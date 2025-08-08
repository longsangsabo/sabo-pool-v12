/**
 * ADVANCED LOGGING SYSTEM
 * Handles structured logging with multiple outputs and log rotation
 */

const fs = require('fs').promises;
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logDir = options.logDir || '/workspaces/sabo-pool-v11/logs';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 10;
    this.enableConsole = options.enableConsole !== false;

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  async log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.logLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      meta,
      pid: process.pid,
    };

    const logLine = this.formatLogEntry(logEntry);

    // Console output
    if (this.enableConsole) {
      this.outputToConsole(level, logLine);
    }

    // File output
    await this.writeToFile(logLine);
  }

  formatLogEntry(entry) {
    const metaStr =
      Object.keys(entry.meta).length > 0
        ? ` | ${JSON.stringify(entry.meta)}`
        : '';

    return `${entry.timestamp} [${entry.level}] ${entry.message}${metaStr}`;
  }

  outputToConsole(level, logLine) {
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      info: '\x1b[36m', // Cyan
      debug: '\x1b[90m', // Gray
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    console.log(`${color}${logLine}${reset}`);
  }

  async writeToFile(logLine) {
    try {
      const logFile = path.join(this.logDir, 'cleanup.log');

      // Check file size and rotate if necessary
      await this.rotateLogIfNeeded(logFile);

      await fs.appendFile(logFile, logLine + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  async rotateLogIfNeeded(logFile) {
    try {
      const stats = await fs.stat(logFile);

      if (stats.size > this.maxFileSize) {
        await this.rotateLog(logFile);
      }
    } catch (error) {
      // File doesn't exist yet, no rotation needed
    }
  }

  async rotateLog(logFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = logFile.replace('.log', `_${timestamp}.log`);

    try {
      await fs.rename(logFile, rotatedFile);

      // Clean up old log files
      await this.cleanupOldLogs();
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  async cleanupOldLogs() {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files
        .filter(file => file.startsWith('cleanup_') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          stat: null,
        }));

      // Get file stats
      for (const file of logFiles) {
        try {
          file.stat = await fs.stat(file.path);
        } catch (error) {
          // Skip files that can't be accessed
        }
      }

      // Sort by modification time (newest first)
      logFiles
        .filter(file => file.stat)
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(this.maxFiles) // Keep only the newest files
        .forEach(async file => {
          try {
            await fs.unlink(file.path);
          } catch (error) {
            console.error(`Failed to delete old log file ${file.name}:`, error);
          }
        });
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  async error(message, meta = {}) {
    await this.log('error', message, meta);
  }

  async warn(message, meta = {}) {
    await this.log('warn', message, meta);
  }

  async info(message, meta = {}) {
    await this.log('info', message, meta);
  }

  async debug(message, meta = {}) {
    await this.log('debug', message, meta);
  }

  // Get log file contents for debugging
  async getRecentLogs(lines = 100) {
    try {
      const logFile = path.join(this.logDir, 'cleanup.log');
      const content = await fs.readFile(logFile, 'utf8');
      const logLines = content.split('\n');

      return logLines.slice(-lines).join('\n');
    } catch (error) {
      return `No logs available: ${error.message}`;
    }
  }
}

module.exports = { Logger };
