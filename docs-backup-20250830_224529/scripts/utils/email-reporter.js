/**
 * EMAIL REPORTING SYSTEM
 * Sends automated reports and notifications
 */

const nodemailer = require('nodemailer');
const { Logger } = require('./logger');

class EmailReporter {
  constructor(options = {}) {
    this.config = options;
    this.logger = new Logger();
    this.transporter = null;
  }

  async init() {
    if (!this.config.enabled) {
      await this.logger.debug('📧 Email reporting disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter(this.config.smtpConfig);

      // Test connection
      await this.transporter.verify();
      await this.logger.info('📧 Email reporter initialized');
    } catch (error) {
      await this.logger.error('❌ Failed to initialize email reporter:', error);
      this.transporter = null;
    }
  }

  async sendWeeklySummary(summary) {
    if (!this.transporter || !this.config.enabled) {
      await this.logger.debug('📧 Skipping email report - not configured');
      return;
    }

    try {
      const subject = `📊 Doc Cleanup Weekly Report - ${new Date().toLocaleDateString()}`;
      const htmlContent = this.generateWeeklyReportHTML(summary);

      const mailOptions = {
        from: this.config.smtpConfig.auth.user,
        to: this.config.recipients.join(', '),
        subject,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logger.info('📧 Weekly report sent successfully');
    } catch (error) {
      await this.logger.error('❌ Failed to send weekly report:', error);
    }
  }

  async sendCleanupNotification(summary) {
    if (!this.transporter || !this.config.enabled) {
      return;
    }

    try {
      const subject = `🧹 Doc Cleanup Completed - ${summary.filesScanned} files processed`;
      const htmlContent = this.generateCleanupNotificationHTML(summary);

      const mailOptions = {
        from: this.config.smtpConfig.auth.user,
        to: this.config.recipients.join(', '),
        subject,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logger.info('📧 Cleanup notification sent');
    } catch (error) {
      await this.logger.error('❌ Failed to send cleanup notification:', error);
    }
  }

  async sendErrorAlert(error, context = {}) {
    if (!this.transporter || !this.config.enabled) {
      return;
    }

    try {
      const subject = `🚨 Doc Cleanup Error Alert`;
      const htmlContent = this.generateErrorAlertHTML(error, context);

      const mailOptions = {
        from: this.config.smtpConfig.auth.user,
        to: this.config.recipients.join(', '),
        subject,
        html: htmlContent,
        priority: 'high',
      };

      await this.transporter.sendMail(mailOptions);
      await this.logger.info('📧 Error alert sent');
    } catch (mailError) {
      await this.logger.error('❌ Failed to send error alert:', mailError);
    }
  }

  generateWeeklyReportHTML(summary) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Doc Cleanup Weekly Report</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 20px; 
      border-radius: 8px; 
      text-align: center; 
      margin-bottom: 30px; 
    }
    .stats { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 20px; 
      margin-bottom: 30px; 
    }
    .stat-card { 
      background: #f8f9fa; 
      border: 1px solid #e9ecef; 
      border-radius: 8px; 
      padding: 20px; 
      text-align: center; 
    }
    .stat-number { 
      font-size: 2em; 
      font-weight: bold; 
      color: #667eea; 
    }
    .stat-label { 
      color: #666; 
      margin-top: 5px; 
    }
    .section { 
      margin-bottom: 30px; 
    }
    .section h2 { 
      color: #333; 
      border-bottom: 2px solid #667eea; 
      padding-bottom: 10px; 
    }
    .success { color: #28a745; }
    .warning { color: #ffc107; }
    .danger { color: #dc3545; }
    .footer { 
      text-align: center; 
      color: #666; 
      font-size: 0.9em; 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #e9ecef; 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Doc Cleanup Weekly Report</h1>
    <p>Automated Document Management Summary</p>
    <p><strong>${new Date().toLocaleDateString('vi-VN')}</strong></p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${summary.filesScanned || 0}</div>
      <div class="stat-label">Files Scanned</div>
    </div>
    <div class="stat-card">
      <div class="stat-number success">${summary.filesArchived || 0}</div>
      <div class="stat-label">Files Archived</div>
    </div>
    <div class="stat-card">
      <div class="stat-number warning">${summary.duplicatesFound || 0}</div>
      <div class="stat-label">Duplicates Found</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${summary.filesQuarantined || 0}</div>
      <div class="stat-label">Files Quarantined</div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Performance Metrics</h2>
    <ul>
      <li><strong>Processing Time:</strong> ${this.formatDuration(summary.duration || 0)}</li>
      <li><strong>Space Freed:</strong> ${this.estimateSpaceFreed(summary)}</li>
      <li><strong>Success Rate:</strong> ${this.calculateSuccessRate(summary)}%</li>
    </ul>
  </div>

  ${
    summary.errors && summary.errors.length > 0
      ? `
  <div class="section">
    <h2 class="danger">⚠️ Errors Encountered</h2>
    <ul>
      ${summary.errors.map(error => `<li class="danger">${error}</li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }

  <div class="section">
    <h2>🎯 Recommendations</h2>
    <ul>
      ${this.generateRecommendations(summary)
        .map(rec => `<li>${rec}</li>`)
        .join('')}
    </ul>
  </div>

  <div class="footer">
    <p>🤖 This report was generated automatically by the Doc Cleanup System</p>
    <p>For support, contact your system administrator</p>
  </div>
</body>
</html>`;
  }

  generateCleanupNotificationHTML(summary) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cleanup Completed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 15px; border-radius: 5px; text-align: center; }
    .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .stats { display: flex; justify-content: space-around; text-align: center; }
    .stat { padding: 10px; }
    .number { font-size: 1.5em; font-weight: bold; color: #28a745; }
  </style>
</head>
<body>
  <div class="header">
    <h2>✅ Doc Cleanup Completed Successfully</h2>
    <p>${new Date().toLocaleString('vi-VN')}</p>
  </div>

  <div class="summary">
    <h3>📊 Cleanup Summary</h3>
    <div class="stats">
      <div class="stat">
        <div class="number">${summary.filesScanned || 0}</div>
        <div>Files Scanned</div>
      </div>
      <div class="stat">
        <div class="number">${summary.filesArchived || 0}</div>
        <div>Archived</div>
      </div>
      <div class="stat">
        <div class="number">${summary.duplicatesFound || 0}</div>
        <div>Duplicates</div>
      </div>
      <div class="stat">
        <div class="number">${summary.filesQuarantined || 0}</div>
        <div>Quarantined</div>
      </div>
    </div>
  </div>

  <p><strong>Duration:</strong> ${this.formatDuration(summary.duration || 0)}</p>
  
  <p><small>🤖 Automated cleanup system - Sabo Pool v11</small></p>
</body>
</html>`;
  }

  generateErrorAlertHTML(error, context) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cleanup Error Alert</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 15px; border-radius: 5px; text-align: center; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .context { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>🚨 Doc Cleanup Error Alert</h2>
    <p>${new Date().toLocaleString('vi-VN')}</p>
  </div>

  <div class="error">
    <h3>❌ Error Details</h3>
    <p><strong>Message:</strong> ${error.message}</p>
    <p><strong>Stack:</strong></p>
    <pre style="font-size: 0.8em; overflow-x: auto;">${error.stack}</pre>
  </div>

  ${
    Object.keys(context).length > 0
      ? `
  <div class="context">
    <h3>📋 Context Information</h3>
    <pre>${JSON.stringify(context, null, 2)}</pre>
  </div>
  `
      : ''
  }

  <p><strong>🔧 Recommended Actions:</strong></p>
  <ul>
    <li>Check system logs for more details</li>
    <li>Verify file system permissions</li>
    <li>Ensure sufficient disk space</li>
    <li>Review configuration settings</li>
  </ul>

  <p><small>🤖 Automated error reporting - Sabo Pool v11</small></p>
</body>
</html>`;
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  estimateSpaceFreed(summary) {
    // Rough estimate based on archived and deleted files
    const avgFileSize = 50; // KB
    const totalFiles =
      (summary.filesArchived || 0) + (summary.filesDeleted || 0);
    const estimatedKB = totalFiles * avgFileSize;

    if (estimatedKB < 1024) return `${estimatedKB}KB`;
    if (estimatedKB < 1024 * 1024)
      return `${(estimatedKB / 1024).toFixed(1)}MB`;
    return `${(estimatedKB / (1024 * 1024)).toFixed(1)}GB`;
  }

  calculateSuccessRate(summary) {
    const total = summary.filesScanned || 1;
    const errors = (summary.errors || []).length;
    return Math.round(((total - errors) / total) * 100);
  }

  generateRecommendations(summary) {
    const recommendations = [];

    if ((summary.duplicatesFound || 0) > 10) {
      recommendations.push(
        '🔄 Consider implementing stricter file naming conventions to reduce duplicates'
      );
    }

    if ((summary.filesArchived || 0) > 50) {
      recommendations.push(
        '📅 Review document retention policies - many old files were archived'
      );
    }

    if ((summary.errors || []).length > 0) {
      recommendations.push(
        '🔧 Address system errors to improve cleanup efficiency'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Document management is running smoothly');
    }

    return recommendations;
  }
}

module.exports = { EmailReporter };
