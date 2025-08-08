/**
 * SCHEDULER & BACKGROUND AUTOMATION
 * Handles cron jobs, file watching, and background tasks
 */

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { Logger } = require('./utils/logger');

class SchedulerManager {
  constructor() {
    this.logger = new Logger();
    this.watchers = new Map();
    this.scheduledTasks = new Map();
    this.changeQueue = [];
    this.isProcessing = false;
  }

  // Schedule cleanup task with cron
  scheduleCleanup(cleanupFunction, schedule = '0 2 * * *') {
    const taskId = 'daily-cleanup';

    if (this.scheduledTasks.has(taskId)) {
      this.scheduledTasks.get(taskId).destroy();
    }

    const task = cron.schedule(
      schedule,
      async () => {
        try {
          await this.logger.info('🕒 Scheduled cleanup starting...');
          await cleanupFunction();
          await this.logger.info('✅ Scheduled cleanup completed');
        } catch (error) {
          await this.logger.error('❌ Scheduled cleanup failed:', error);
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );

    this.scheduledTasks.set(taskId, task);
    this.logger.info(`📅 Cleanup scheduled for: ${schedule}`);

    return taskId;
  }

  // Setup file system watcher
  setupFileWatcher(watchPaths, onChangeCallback) {
    try {
      const watcher = chokidar.watch(watchPaths, {
        ignored: [
          /(^|[\/\\])\../, // ignore dotfiles
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.git/**',
        ],
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100,
        },
      });

      watcher
        .on('add', filePath =>
          this.handleFileChange('add', filePath, onChangeCallback)
        )
        .on('change', filePath =>
          this.handleFileChange('change', filePath, onChangeCallback)
        )
        .on('unlink', filePath =>
          this.handleFileChange('unlink', filePath, onChangeCallback)
        )
        .on('addDir', dirPath =>
          this.handleFileChange('addDir', dirPath, onChangeCallback)
        )
        .on('unlinkDir', dirPath =>
          this.handleFileChange('unlinkDir', dirPath, onChangeCallback)
        )
        .on('error', error => this.logger.error('👁️ Watcher error:', error))
        .on('ready', () => this.logger.info('👁️ File watcher ready'));

      this.watchers.set('main', watcher);

      return watcher;
    } catch (error) {
      this.logger.error('❌ Failed to setup file watcher:', error);
      throw error;
    }
  }

  // Handle file change events
  async handleFileChange(event, filePath, callback) {
    try {
      // Filter for document files only
      const docExtensions = ['.md', '.txt', '.rst', '.doc'];
      const ext = path.extname(filePath).toLowerCase();

      if (!docExtensions.includes(ext)) {
        return;
      }

      await this.logger.debug(`📁 File ${event}: ${filePath}`);

      // Add to change queue
      this.changeQueue.push({
        event,
        filePath,
        timestamp: Date.now(),
      });

      // Process changes with debouncing
      await this.processChangeQueue(callback);
    } catch (error) {
      await this.logger.error('❌ Error handling file change:', error);
    }
  }

  // Process accumulated file changes with debouncing
  async processChangeQueue(callback) {
    if (this.isProcessing) return;

    // Debounce: wait for changes to settle
    setTimeout(async () => {
      if (this.changeQueue.length === 0) return;

      this.isProcessing = true;

      try {
        const changes = [...this.changeQueue];
        this.changeQueue = [];

        await this.logger.info(
          `📋 Processing ${changes.length} file changes...`
        );

        // Group changes by type
        const changeStats = {
          added: changes.filter(c => c.event === 'add').length,
          modified: changes.filter(c => c.event === 'change').length,
          deleted: changes.filter(c => c.event === 'unlink').length,
        };

        // Trigger callback if significant changes
        const significantThreshold = 5;
        const totalChanges = Object.values(changeStats).reduce(
          (a, b) => a + b,
          0
        );

        if (totalChanges >= significantThreshold) {
          await this.logger.info(
            `🚨 Significant changes detected (${totalChanges}), triggering cleanup...`
          );
          await callback('batch', changes);
        }
      } catch (error) {
        await this.logger.error('❌ Error processing change queue:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // 5 second debounce
  }

  // Schedule weekly reports
  scheduleWeeklyReport(reportFunction) {
    const taskId = 'weekly-report';

    // Every Sunday at 9AM
    const task = cron.schedule(
      '0 9 * * 0',
      async () => {
        try {
          await this.logger.info('📊 Generating weekly report...');
          await reportFunction();
        } catch (error) {
          await this.logger.error('❌ Weekly report failed:', error);
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );

    this.scheduledTasks.set(taskId, task);
    return taskId;
  }

  // Schedule quarantine cleanup (delete files older than retention period)
  scheduleQuarantineCleanup(cleanupFunction, retentionDays = 7) {
    const taskId = 'quarantine-cleanup';

    // Daily at 3AM
    const task = cron.schedule('0 3 * * *', async () => {
      try {
        await this.logger.info('🗑️ Cleaning quarantine folder...');
        await this.cleanupQuarantine(retentionDays);
      } catch (error) {
        await this.logger.error('❌ Quarantine cleanup failed:', error);
      }
    });

    this.scheduledTasks.set(taskId, task);
    return taskId;
  }

  // Cleanup quarantine folder
  async cleanupQuarantine(retentionDays) {
    const quarantinePath = '/workspaces/sabo-pool-v11/docs/quarantine';
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    );

    try {
      const files = await fs.promises.readdir(quarantinePath);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(quarantinePath, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.promises.unlink(filePath);
          deletedCount++;
          await this.logger.debug(`🗑️ Deleted quarantined file: ${file}`);
        }
      }

      if (deletedCount > 0) {
        await this.logger.info(
          `🗑️ Deleted ${deletedCount} old quarantined files`
        );
      }
    } catch (error) {
      await this.logger.error('❌ Failed to cleanup quarantine:', error);
    }
  }

  // Stop all scheduled tasks and watchers
  stop() {
    this.scheduledTasks.forEach((task, id) => {
      task.destroy();
      this.logger.info(`⏹️ Stopped scheduled task: ${id}`);
    });
    this.scheduledTasks.clear();

    this.watchers.forEach((watcher, id) => {
      watcher.close();
      this.logger.info(`⏹️ Stopped file watcher: ${id}`);
    });
    this.watchers.clear();
  }

  // Get status of all scheduled tasks
  getStatus() {
    return {
      scheduledTasks: Array.from(this.scheduledTasks.keys()),
      watchers: Array.from(this.watchers.keys()),
      changeQueueLength: this.changeQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

// Legacy function exports for backward compatibility
function scheduleCleanup(cleanupFunction, schedule) {
  const manager = new SchedulerManager();
  return manager.scheduleCleanup(cleanupFunction, schedule);
}

function setupFileWatcher(watchPaths, onChangeCallback) {
  const manager = new SchedulerManager();
  return manager.setupFileWatcher(watchPaths, onChangeCallback);
}

module.exports = {
  SchedulerManager,
  scheduleCleanup,
  setupFileWatcher,
};
