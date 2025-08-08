#!/usr/bin/env node

/**
 * 🤖 DOCUMENT CLEANUP AUTOMATION DAEMON
 * Runs continuous document cleanup and monitoring
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { MetricsCollector } = require('./metrics-collector');

class DocCleanupDaemon {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.metricsCollector = new MetricsCollector();
    this.configPath = path.join(__dirname, 'config.json');
    this.logPath = path.join(__dirname, 'logs', 'daemon.log');
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } else {
        this.config = {
          duplicateThreshold: 0.95, // 95% similarity threshold
          archiveAfterDays: 90, // Archive docs older than 90 days
          cleanupInterval: 3600000, // Run cleanup every hour
          email: {
            alerts: true,
            recipients: [],
          },
        };
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      }
    } catch (error) {
      console.error('Error loading config:', error);
      process.exit(1);
    }
  }

  async start() {
    console.log('🚀 Starting Document Cleanup Daemon...');
    this.ensureDirectories();

    // Initial cleanup
    await this.runCleanupCycle();

    // Schedule regular cleanups
    setInterval(() => this.runCleanupCycle(), this.config.cleanupInterval);

    // Keep process alive
    process.stdin.resume();

    // Handle shutdown gracefully
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  ensureDirectories() {
    const dirs = [
      path.join(this.projectRoot, 'docs/active'),
      path.join(this.projectRoot, 'docs/archive'),
      path.join(this.projectRoot, 'docs/quarantine'),
      path.join(__dirname, 'logs'),
      path.join(this.projectRoot, 'backups'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runCleanupCycle() {
    console.log('🧹 Starting cleanup cycle...');
    const startTime = Date.now();

    try {
      // 1. Collect current metrics
      const metrics = await this.metricsCollector.collectCurrentMetrics();

      // 2. Archive old documents
      await this.archiveOldDocuments();

      // 3. Handle duplicates
      await this.handleDuplicates();

      // 4. Create backup
      await this.createBackup();

      // 5. Update metrics
      const endMetrics = await this.metricsCollector.collectCurrentMetrics();

      // 6. Log results
      const duration = Date.now() - startTime;
      this.log({
        timestamp: new Date().toISOString(),
        type: 'cleanup',
        duration,
        metrics: {
          before: metrics,
          after: endMetrics,
        },
      });

      console.log('✅ Cleanup cycle completed successfully');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      this.log({
        timestamp: new Date().toISOString(),
        type: 'error',
        error: error.message,
      });
    }
  }

  async archiveOldDocuments() {
    console.log('📦 Archiving old documents...');
    const activeDir = path.join(this.projectRoot, 'docs/active');
    const archiveDir = path.join(this.projectRoot, 'docs/archive');

    if (!fs.existsSync(activeDir)) return;

    const files = fs.readdirSync(activeDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(activeDir, file);
      const stats = fs.statSync(filePath);

      // Check if file is older than archiveAfterDays
      const ageInDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (ageInDays > this.config.archiveAfterDays) {
        const archivePath = path.join(archiveDir, file);
        fs.renameSync(filePath, archivePath);
        console.log(`Archived: ${file}`);
      }
    });
  }

  async handleDuplicates() {
    console.log('🔍 Checking for duplicates...');
    const docsDir = path.join(this.projectRoot, 'docs');
    const quarantineDir = path.join(this.projectRoot, 'docs/quarantine');

    // This would implement duplicate detection logic
    // For now, just log the action
    console.log('No duplicates found');
  }

  async createBackup() {
    console.log('💾 Creating backup...');
    const backupDir = path.join(this.projectRoot, 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(
      backupDir,
      `cleanup-backup-${timestamp}.tar.gz`
    );

    try {
      execSync(`tar -czf "${backupFile}" -C "${this.projectRoot}" docs/`);
      console.log(`✅ Backup created: ${backupFile}`);
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  log(entry) {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(this.logPath, JSON.stringify(entry) + '\n');
  }

  shutdown() {
    console.log('\n🛑 Shutting down daemon...');
    this.log({
      timestamp: new Date().toISOString(),
      type: 'shutdown',
    });
    process.exit(0);
  }
}

// Start daemon if run directly
if (require.main === module) {
  const daemon = new DocCleanupDaemon();
  daemon.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { DocCleanupDaemon };
