#!/usr/bin/env node

/**
 * 📊 CLEANUP SYSTEM METRICS COLLECTOR
 * Collects and analyzes cleanup effectiveness metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MetricsCollector {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.metricsDir = path.join(__dirname, 'metrics');
    this.ensureMetricsDir();
  }

  ensureMetricsDir() {
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }
  }

  async collectCurrentMetrics() {
    const timestamp = new Date().toISOString();

    const metrics = {
      timestamp,
      fileMetrics: await this.getFileMetrics(),
      storageMetrics: await this.getStorageMetrics(),
      qualityMetrics: await this.getQualityMetrics(),
      systemMetrics: await this.getSystemMetrics(),
    };

    // Save daily snapshot
    const dateStr = new Date().toISOString().split('T')[0];
    const metricsFile = path.join(this.metricsDir, `metrics-${dateStr}.json`);
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

    return metrics;
  }

  async getFileMetrics() {
    const docsDir = path.join(this.projectRoot, 'docs');
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      fileTypes: {},
      directories: {
        active: 0,
        archive: 0,
        quarantine: 0,
        scripts: 0,
      },
      ageDistribution: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        older: 0,
      },
    };

    if (!fs.existsSync(docsDir)) return stats;

    const walkDir = (dir, relativePath = '') => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relPath = path.join(relativePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Count directory files
          if (relPath.includes('active')) stats.directories.active++;
          else if (relPath.includes('archive')) stats.directories.archive++;
          else if (relPath.includes('quarantine'))
            stats.directories.quarantine++;
          else if (relPath.includes('scripts')) stats.directories.scripts++;

          walkDir(fullPath, relPath);
        } else {
          stats.totalFiles++;
          stats.totalSize += stat.size;

          // File type analysis
          const ext = path.extname(file).toLowerCase();
          stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;

          // Age analysis
          const ageInDays =
            (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays < 1) stats.ageDistribution.today++;
          else if (ageInDays < 7) stats.ageDistribution.thisWeek++;
          else if (ageInDays < 30) stats.ageDistribution.thisMonth++;
          else stats.ageDistribution.older++;
        }
      });
    };

    walkDir(docsDir);
    return stats;
  }

  async getStorageMetrics() {
    const docsDir = path.join(this.projectRoot, 'docs');
    const backupsDir = path.join(this.projectRoot, 'backups');

    const metrics = {
      docsSize: 0,
      backupsSize: 0,
      spaceSaved: 0,
      compressionRatio: 0,
    };

    // Calculate docs directory size
    if (fs.existsSync(docsDir)) {
      try {
        const output = execSync(`du -sb "${docsDir}"`, { encoding: 'utf8' });
        metrics.docsSize = parseInt(output.split('\t')[0]);
      } catch (error) {
        // Fallback to manual calculation
        metrics.docsSize = this.calculateDirSize(docsDir);
      }
    }

    // Calculate backups size
    if (fs.existsSync(backupsDir)) {
      metrics.backupsSize = this.calculateDirSize(backupsDir);
    }

    return metrics;
  }

  calculateDirSize(dirPath) {
    let totalSize = 0;

    const walkDir = dir => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          totalSize += stat.size;
        }
      });
    };

    try {
      walkDir(dirPath);
    } catch (error) {
      console.warn(`Could not calculate size for ${dirPath}:`, error.message);
    }

    return totalSize;
  }

  async getQualityMetrics() {
    const metrics = {
      duplicateFiles: 0,
      orphanedFiles: 0,
      tempFiles: 0,
      outdatedFiles: 0,
      qualityScore: 0,
    };

    // Analyze file quality using our analyzer
    try {
      const analyzerPath = path.join(__dirname, 'file-analyzer.js');
      if (fs.existsSync(analyzerPath)) {
        const { analyzeFiles } = require(analyzerPath);
        const analysis = await analyzeFiles();

        metrics.duplicateFiles = analysis.duplicateGroups?.length || 0;
        metrics.tempFiles =
          analysis.files?.filter(f => f.isTempFile).length || 0;
        metrics.orphanedFiles =
          analysis.files?.filter(f => f.classification === 'orphaned').length ||
          0;
        metrics.outdatedFiles =
          analysis.files?.filter(f => f.classification === 'outdated').length ||
          0;

        // Calculate quality score (0-100)
        const totalFiles = analysis.totalFiles || 1;
        const problemFiles =
          metrics.duplicateFiles +
          metrics.tempFiles +
          metrics.orphanedFiles +
          metrics.outdatedFiles;
        metrics.qualityScore = Math.max(
          0,
          Math.round((1 - problemFiles / totalFiles) * 100)
        );
      }
    } catch (error) {
      console.warn('Could not analyze file quality:', error.message);
    }

    return metrics;
  }

  async getSystemMetrics() {
    const logsDir = path.join(__dirname, 'logs');
    const configPath = path.join(__dirname, 'config.json');

    const metrics = {
      daemonUptime: 0,
      lastCleanupTime: null,
      cleanupFrequency: 0,
      errorRate: 0,
      configurationHealth: 100,
    };

    // Check daemon uptime
    try {
      const output = execSync('pgrep -f "node.*doc-cleanup"', {
        encoding: 'utf8',
      });
      const pids = output.trim().split('\n').filter(Boolean);

      if (pids.length > 0) {
        const uptimeOutput = execSync(`ps -o etime= -p ${pids[0]}`, {
          encoding: 'utf8',
        });
        metrics.daemonUptime = uptimeOutput.trim();
      }
    } catch (error) {
      // Daemon not running
    }

    // Check logs for cleanup history
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir);
      // Analyze log files for cleanup frequency and errors
      // This would be implemented based on actual log format
    }

    // Check configuration health
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // Validate config completeness
        const requiredFields = [
          'duplicateThreshold',
          'archiveAfterDays',
          'email',
        ];
        const missingFields = requiredFields.filter(field => !config[field]);
        metrics.configurationHealth = Math.round(
          (1 - missingFields.length / requiredFields.length) * 100
        );
      } catch (error) {
        metrics.configurationHealth = 0;
      }
    }

    return metrics;
  }

  async generateReport() {
    const metrics = await this.collectCurrentMetrics();

    console.log('\n📊 CLEANUP SYSTEM EFFECTIVENESS REPORT');
    console.log('==========================================\n');

    // File Organization
    console.log('📁 File Organization:');
    console.log(`   Total Files: ${metrics.fileMetrics.totalFiles}`);
    console.log(
      `   Total Size: ${this.formatBytes(metrics.fileMetrics.totalSize)}`
    );
    console.log(`   Active Docs: ${metrics.fileMetrics.directories.active}`);
    console.log(`   Archived: ${metrics.fileMetrics.directories.archive}`);
    console.log(
      `   In Quarantine: ${metrics.fileMetrics.directories.quarantine}\n`
    );

    // Quality Metrics
    console.log('🎯 Quality Metrics:');
    console.log(`   Quality Score: ${metrics.qualityMetrics.qualityScore}/100`);
    console.log(`   Duplicate Files: ${metrics.qualityMetrics.duplicateFiles}`);
    console.log(`   Temp Files: ${metrics.qualityMetrics.tempFiles}`);
    console.log(`   Orphaned Files: ${metrics.qualityMetrics.orphanedFiles}`);
    console.log(`   Outdated Files: ${metrics.qualityMetrics.outdatedFiles}\n`);

    // System Health
    console.log('🏥 System Health:');
    console.log(
      `   Daemon Status: ${metrics.systemMetrics.daemonUptime ? '🟢 Running' : '🔴 Stopped'}`
    );
    console.log(`   Uptime: ${metrics.systemMetrics.daemonUptime || 'N/A'}`);
    console.log(
      `   Configuration: ${metrics.systemMetrics.configurationHealth}%\n`
    );

    // Storage Efficiency
    console.log('💾 Storage Metrics:');
    console.log(
      `   Docs Size: ${this.formatBytes(metrics.storageMetrics.docsSize)}`
    );
    console.log(
      `   Backups Size: ${this.formatBytes(metrics.storageMetrics.backupsSize)}`
    );

    return metrics;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getHistoricalTrends() {
    const metricsFiles = fs
      .readdirSync(this.metricsDir)
      .filter(f => f.startsWith('metrics-') && f.endsWith('.json'))
      .sort();

    const trends = {
      fileCountTrend: [],
      storageTrend: [],
      qualityTrend: [],
    };

    metricsFiles.slice(-30).forEach(file => {
      // Last 30 days
      try {
        const data = JSON.parse(
          fs.readFileSync(path.join(this.metricsDir, file), 'utf8')
        );
        const date = file.replace('metrics-', '').replace('.json', '');

        trends.fileCountTrend.push({
          date,
          totalFiles: data.fileMetrics.totalFiles,
          archived: data.fileMetrics.directories.archive,
        });

        trends.storageTrend.push({
          date,
          size: data.storageMetrics.docsSize,
        });

        trends.qualityTrend.push({
          date,
          score: data.qualityMetrics.qualityScore,
        });
      } catch (error) {
        console.warn(`Could not parse ${file}:`, error.message);
      }
    });

    return trends;
  }
}

// CLI Interface
if (require.main === module) {
  const collector = new MetricsCollector();

  const command = process.argv[2] || 'report';

  switch (command) {
    case 'collect':
      collector.collectCurrentMetrics().then(metrics => {
        console.log('✅ Metrics collected successfully');
        console.log(JSON.stringify(metrics, null, 2));
      });
      break;

    case 'report':
      collector.generateReport().catch(error => {
        console.error('❌ Error generating report:', error);
        process.exit(1);
      });
      break;

    case 'trends':
      collector.getHistoricalTrends().then(trends => {
        console.log('📈 Historical Trends:');
        console.log(JSON.stringify(trends, null, 2));
      });
      break;

    default:
      console.log('Usage: node metrics-collector.js [collect|report|trends]');
  }
}

module.exports = { MetricsCollector };
