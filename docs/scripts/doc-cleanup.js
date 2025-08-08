#!/usr/bin/env node
/**
 * INTELLIGENT DOC CLEANUP AUTOMATION SYSTEM
 * Main automation script for intelligent doc cleanup
 * Scans, classifies, and performs cleanup actions automatically
 */

const fs = require('fs').promises;
const path = require('path');
const {
  analyzeFiles,
  classifyFiles,
  performCleanup,
  initializeConfig,
} = require('./file-analyzer');
const { scheduleCleanup, setupFileWatcher } = require('./scheduler');
const { Logger } = require('./utils/logger');
const { BackupManager } = require('./utils/backup');
const { EmailReporter } = require('./utils/email-reporter');

class DocCleanupSystem {
  constructor() {
    this.logger = new Logger();
    this.backup = new BackupManager();
    this.emailReporter = new EmailReporter();
    this.config = null;
  }

  async initialize() {
    try {
      this.config = await initializeConfig();
      await this.logger.info('🚀 Doc Cleanup System initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      return false;
    }
  }

  async runCleanup(options = {}) {
    const startTime = Date.now();
    let summary = {
      filesScanned: 0,
      duplicatesFound: 0,
      filesArchived: 0,
      filesQuarantined: 0,
      filesDeleted: 0,
      errors: [],
    };

    try {
      await this.logger.info('🔍 Starting intelligent doc cleanup...');

      // Step 1: Analyze all documents
      await this.logger.info('📊 Analyzing files...');
      const analysis = await analyzeFiles(this.config);
      summary.filesScanned = analysis.totalFiles;

      // Step 2: Classify files based on analysis
      await this.logger.info('🏷️ Classifying files...');
      const classified = await classifyFiles(analysis, this.config);
      summary.duplicatesFound = classified.duplicates.length;

      // Step 3: Create backup before cleanup
      if (!options.skipBackup) {
        await this.logger.info('💾 Creating backup...');
        await this.backup.createBackup(classified.allFiles);
      }

      // Step 4: Perform cleanup actions
      await this.logger.info('🧹 Performing cleanup...');
      const cleanupResult = await performCleanup(classified, this.config);

      summary.filesArchived = cleanupResult.archived.length;
      summary.filesQuarantined = cleanupResult.quarantined.length;
      summary.filesDeleted = cleanupResult.deleted.length;

      // Step 5: Generate and send report
      const duration = Date.now() - startTime;
      summary.duration = duration;

      await this.generateReport(summary);

      if (this.config.email.enabled) {
        await this.emailReporter.sendWeeklySummary(summary);
      }

      await this.logger.info(`✅ Cleanup completed in ${duration}ms`);
      return summary;
    } catch (error) {
      summary.errors.push(error.message);
      await this.logger.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  async generateReport(summary) {
    const reportPath = path.join(__dirname, '../../logs/cleanup-summary.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      details: summary,
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    await this.logger.info(`📋 Report saved to ${reportPath}`);
  }

  async startDaemon() {
    await this.logger.info('👹 Starting cleanup daemon...');

    // Schedule daily cleanup at 2AM
    scheduleCleanup(async () => {
      await this.runCleanup({ automated: true });
    });

    // Setup file system watcher
    setupFileWatcher(this.config.watchPaths, async (event, filename) => {
      await this.logger.debug(`📁 File change detected: ${event} ${filename}`);
      // Trigger cleanup if too many changes accumulated
    });

    await this.logger.info('✅ Daemon started successfully');
  }
}

// Main execution function
async function main(args = []) {
  const system = new DocCleanupSystem();

  if (!(await system.initialize())) {
    process.exit(1);
  }

  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await system.runCleanup();
      break;
    case 'daemon':
      await system.startDaemon();
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n👋 Cleanup daemon shutting down...');
        process.exit(0);
      });

      // Keep process alive indefinitely
      await new Promise(() => {}); // Never resolves
      break;
    case 'analyze':
      const analysis = await analyzeFiles();
      console.log(JSON.stringify(analysis, null, 2));
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Available commands: run, daemon, analyze');
      process.exit(1);
  }
}

// Run main if not imported
if (require.main === module) {
  const args = process.argv.slice(2);
  main(args).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, DocCleanupSystem };
