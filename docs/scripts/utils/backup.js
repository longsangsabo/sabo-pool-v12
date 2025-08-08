/**
 * BACKUP MANAGEMENT SYSTEM
 * Handles file backups, restoration, and retention policies
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { Logger } = require('./logger');

class BackupManager {
  constructor(options = {}) {
    this.backupDir = options.backupDir || '/workspaces/sabo-pool-v11/backups';
    this.retentionDays = options.retentionDays || 30;
    this.compressionEnabled = options.compressionEnabled !== false;
    this.logger = new Logger();
  }

  async init() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      await this.logger.info('💾 Backup manager initialized');
    } catch (error) {
      await this.logger.error('❌ Failed to initialize backup manager:', error);
      throw error;
    }
  }

  // Create comprehensive backup before cleanup
  async createBackup(files, backupName = null) {
    try {
      await this.init();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = backupName || `cleanup-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupId);

      await fs.mkdir(backupPath, { recursive: true });

      const manifest = {
        id: backupId,
        timestamp: new Date().toISOString(),
        files: [],
        totalSize: 0,
        compressionEnabled: this.compressionEnabled,
      };

      let totalFiles = 0;
      let totalSize = 0;

      // Copy files to backup directory
      for (const file of files) {
        try {
          const relativePath = path.relative(
            '/workspaces/sabo-pool-v11',
            file.path
          );
          const backupFilePath = path.join(backupPath, relativePath);

          // Create directory structure
          await fs.mkdir(path.dirname(backupFilePath), { recursive: true });

          // Copy file
          await fs.copyFile(file.path, backupFilePath);

          const stats = await fs.stat(backupFilePath);

          manifest.files.push({
            originalPath: file.path,
            relativePath,
            backupPath: backupFilePath,
            size: stats.size,
            checksumMd5: file.contentHash,
          });

          totalFiles++;
          totalSize += stats.size;
        } catch (error) {
          await this.logger.warn(
            `⚠️ Failed to backup file ${file.path}:`,
            error
          );
        }
      }

      manifest.totalFiles = totalFiles;
      manifest.totalSize = totalSize;

      // Save manifest
      const manifestPath = path.join(backupPath, 'manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      // Compress backup if enabled
      if (this.compressionEnabled) {
        await this.compressBackup(backupPath);
      }

      await this.logger.info(
        `💾 Backup created: ${backupId} (${totalFiles} files, ${this.formatSize(totalSize)})`
      );

      // Cleanup old backups
      await this.cleanupOldBackups();

      return {
        id: backupId,
        path: backupPath,
        files: totalFiles,
        size: totalSize,
      };
    } catch (error) {
      await this.logger.error('❌ Backup creation failed:', error);
      throw error;
    }
  }

  // Compress backup directory
  async compressBackup(backupPath) {
    try {
      const tarFile = `${backupPath}.tar.gz`;
      const backupName = path.basename(backupPath);

      execSync(
        `tar -czf "${tarFile}" -C "${path.dirname(backupPath)}" "${backupName}"`,
        {
          cwd: this.backupDir,
        }
      );

      // Remove uncompressed directory
      await this.removeDirectory(backupPath);

      await this.logger.info(`🗜️ Backup compressed: ${path.basename(tarFile)}`);
    } catch (error) {
      await this.logger.warn('⚠️ Failed to compress backup:', error);
    }
  }

  // Restore files from backup
  async restoreBackup(backupId, targetFiles = null) {
    try {
      const backupPath = await this.findBackup(backupId);
      if (!backupPath) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // Extract if compressed
      let manifestPath;
      if (backupPath.endsWith('.tar.gz')) {
        const extractPath = backupPath.replace('.tar.gz', '');
        execSync(`tar -xzf "${backupPath}" -C "${path.dirname(backupPath)}"`);
        manifestPath = path.join(extractPath, 'manifest.json');
      } else {
        manifestPath = path.join(backupPath, 'manifest.json');
      }

      // Read manifest
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      let restoredCount = 0;

      for (const fileInfo of manifest.files) {
        // Skip if specific files requested and this isn't one of them
        if (targetFiles && !targetFiles.includes(fileInfo.originalPath)) {
          continue;
        }

        try {
          // Create directory structure
          await fs.mkdir(path.dirname(fileInfo.originalPath), {
            recursive: true,
          });

          // Restore file
          await fs.copyFile(fileInfo.backupPath, fileInfo.originalPath);
          restoredCount++;
        } catch (error) {
          await this.logger.warn(
            `⚠️ Failed to restore ${fileInfo.originalPath}:`,
            error
          );
        }
      }

      await this.logger.info(
        `♻️ Restored ${restoredCount} files from backup ${backupId}`
      );

      return {
        backupId,
        restoredFiles: restoredCount,
        totalFiles: manifest.files.length,
      };
    } catch (error) {
      await this.logger.error('❌ Backup restoration failed:', error);
      throw error;
    }
  }

  // Find backup by ID
  async findBackup(backupId) {
    try {
      const backups = await this.listBackups();
      const backup = backups.find(b => b.id === backupId);
      return backup ? backup.path : null;
    } catch (error) {
      return null;
    }
  }

  // List all available backups
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory() || file.endsWith('.tar.gz')) {
          backups.push({
            id: file.replace('.tar.gz', ''),
            path: filePath,
            created: stats.birthtime,
            size: stats.size,
            compressed: file.endsWith('.tar.gz'),
          });
        }
      }

      // Sort by creation date (newest first)
      return backups.sort((a, b) => b.created - a.created);
    } catch (error) {
      await this.logger.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  // Cleanup old backups based on retention policy
  async cleanupOldBackups() {
    try {
      const cutoffDate = new Date(
        Date.now() - this.retentionDays * 24 * 60 * 60 * 1000
      );
      const backups = await this.listBackups();

      let deletedCount = 0;

      for (const backup of backups) {
        if (backup.created < cutoffDate) {
          try {
            if (backup.compressed) {
              await fs.unlink(backup.path);
            } else {
              await this.removeDirectory(backup.path);
            }
            deletedCount++;
            await this.logger.debug(`🗑️ Deleted old backup: ${backup.id}`);
          } catch (error) {
            await this.logger.warn(
              `⚠️ Failed to delete backup ${backup.id}:`,
              error
            );
          }
        }
      }

      if (deletedCount > 0) {
        await this.logger.info(`🗑️ Cleaned up ${deletedCount} old backups`);
      }
    } catch (error) {
      await this.logger.error('❌ Backup cleanup failed:', error);
    }
  }

  // Remove directory recursively
  async removeDirectory(dirPath) {
    try {
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
          await this.removeDirectory(filePath);
        } else {
          await fs.unlink(filePath);
        }
      }

      await fs.rmdir(dirPath);
    } catch (error) {
      throw error;
    }
  }

  // Format file size for display
  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  }

  // Get backup statistics
  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

      return {
        totalBackups: backups.length,
        totalSize: this.formatSize(totalSize),
        oldestBackup:
          backups.length > 0 ? backups[backups.length - 1].created : null,
        newestBackup: backups.length > 0 ? backups[0].created : null,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = { BackupManager };
