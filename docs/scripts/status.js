#!/usr/bin/env node

/**
 * 📊 INTELLIGENT DOC CLEANUP AUTOMATION SYSTEM - STATUS DASHBOARD
 * Displays real-time status of the automation daemon
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class StatusDashboard {
  constructor() {
    this.scriptsDir = __dirname;
    this.logsDir = path.join(this.scriptsDir, 'logs');
    this.backupsDir = path.join(this.scriptsDir, '..', '..', 'backups');
  }

  async getDaemonStatus() {
    try {
      const output = execSync('pgrep -f "node.*doc-cleanup"', {
        encoding: 'utf8',
      });
      const pids = output.trim().split('\n').filter(Boolean);

      if (pids.length > 0) {
        return {
          status: '🟢 RUNNING',
          pids: pids,
          uptime: await this.getUptime(pids[0]),
        };
      }
    } catch (error) {
      // No process found
    }

    return {
      status: '🔴 STOPPED',
      pids: [],
      uptime: null,
    };
  }

  async getUptime(pid) {
    try {
      const output = execSync(`ps -o etime= -p ${pid}`, { encoding: 'utf8' });
      return output.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  async getLogStatus() {
    if (!fs.existsSync(this.logsDir)) {
      return {
        status: '📋 No logs yet',
        files: [],
        size: '0 B',
      };
    }

    const files = fs.readdirSync(this.logsDir);
    let totalSize = 0;

    files.forEach(file => {
      const stat = fs.statSync(path.join(this.logsDir, file));
      totalSize += stat.size;
    });

    return {
      status: `📋 ${files.length} log files`,
      files: files,
      size: this.formatBytes(totalSize),
    };
  }

  async getBackupStatus() {
    if (!fs.existsSync(this.backupsDir)) {
      return {
        status: '💾 No backups yet',
        count: 0,
        size: '0 B',
      };
    }

    const files = fs.readdirSync(this.backupsDir);
    let totalSize = 0;

    files.forEach(file => {
      const stat = fs.statSync(path.join(this.backupsDir, file));
      totalSize += stat.size;
    });

    return {
      status: `💾 ${files.length} backup files`,
      count: files.length,
      size: this.formatBytes(totalSize),
    };
  }

  async getScheduleStatus() {
    // Check if cron job is configured
    const configPath = path.join(this.scriptsDir, 'config.json');

    if (!fs.existsSync(configPath)) {
      return '⏰ No schedule configured';
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const cronExp = config.schedule?.cronExpression || '0 2 * * *';

    return `⏰ Scheduled: ${cronExp} (Daily 2AM)`;
  }

  async getSystemHealth() {
    const configPath = path.join(this.scriptsDir, 'config.json');
    const packagePath = path.join(this.scriptsDir, 'package.json');

    const health = {
      config: fs.existsSync(configPath) ? '✅' : '❌',
      dependencies: fs.existsSync(packagePath) ? '✅' : '❌',
      nodeModules: fs.existsSync(path.join(this.scriptsDir, 'node_modules'))
        ? '✅'
        : '❌',
      permissions: this.checkPermissions() ? '✅' : '❌',
    };

    return health;
  }

  checkPermissions() {
    try {
      // Test if we can write to the scripts directory
      const testFile = path.join(this.scriptsDir, '.test_permission');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async displayStatus() {
    console.log('\n🤖 INTELLIGENT DOC CLEANUP AUTOMATION SYSTEM');
    console.log('================================================\n');

    // Daemon Status
    const daemon = await this.getDaemonStatus();
    console.log(`Daemon Status: ${daemon.status}`);
    if (daemon.pids.length > 0) {
      console.log(`Process IDs: ${daemon.pids.join(', ')}`);
      console.log(`Uptime: ${daemon.uptime}`);
    }
    console.log();

    // Schedule Status
    const schedule = await this.getScheduleStatus();
    console.log(`${schedule}\n`);

    // System Health
    const health = await this.getSystemHealth();
    console.log('System Health:');
    console.log(`  Configuration: ${health.config}`);
    console.log(`  Dependencies: ${health.dependencies}`);
    console.log(`  Node Modules: ${health.nodeModules}`);
    console.log(`  Permissions: ${health.permissions}\n`);

    // Log Status
    const logs = await this.getLogStatus();
    console.log(`Log Status: ${logs.status}`);
    if (logs.files.length > 0) {
      console.log(`  Total Size: ${logs.size}`);
      console.log(
        `  Files: ${logs.files.slice(0, 3).join(', ')}${logs.files.length > 3 ? '...' : ''}`
      );
    }
    console.log();

    // Backup Status
    const backups = await this.getBackupStatus();
    console.log(`Backup Status: ${backups.status}`);
    if (backups.count > 0) {
      console.log(`  Total Size: ${backups.size}`);
    }
    console.log();

    // Quick Actions
    console.log('Quick Actions:');
    console.log('  🔄 Restart daemon: npm run daemon');
    console.log('  📊 Run analysis: npm run analyze');
    console.log('  🧹 Manual cleanup: npm start');
    console.log('  📋 View logs: tail -f logs/cleanup.log');
    console.log('  ⏹️  Stop daemon: pkill -f "node.*doc-cleanup"');
    console.log();

    // Overall Status
    const isHealthy =
      daemon.status.includes('RUNNING') &&
      health.config === '✅' &&
      health.dependencies === '✅';

    console.log(
      `Overall Status: ${isHealthy ? '🟢 HEALTHY' : '🟡 NEEDS ATTENTION'}`
    );
    console.log();
  }
}

// Main execution
if (require.main === module) {
  const dashboard = new StatusDashboard();
  dashboard.displayStatus().catch(error => {
    console.error('❌ Error displaying status:', error);
    process.exit(1);
  });
}

module.exports = { StatusDashboard };
