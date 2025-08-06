# 🤖 INTELLIGENT DOC CLEANUP AUTOMATION SYSTEM

Hệ thống tự động phân loại, dọn dẹp và quản lý tài liệu thông minh cho dự án Sabo Pool v11.

## ✨ TÍNH NĂNG CHÍNH

### 🔍 Content Analysis Engine
- Quét tự động tất cả file `.md`, `.txt`, `.rst`, `.doc` trong project
- Phát hiện duplicate files với độ chính xác >85% (sử dụng cosine similarity)
- Phân tích patterns trong tên file (v1, v2, final, copy, backup)
- Theo dõi thời gian modified và frequency sử dụng
- Extract key topics và categorize theo nội dung

### 🏷️ Automated Classification
- **Archive**: Files >90 ngày không update
- **Duplicate**: Nội dung giống nhau, tên khác nhau  
- **Outdated**: References đến versions/features đã deprecated
- **Active**: Files được modified gần đây, có references trong code
- **Orphaned**: Không có links hoặc references đến file khác
- **Temp Files**: Files tạm (.tmp, .backup, untitled-*)

### 🧹 Smart Cleanup Actions
- Move files cũ → `docs/archive/YYYY-MM/`
- Merge duplicate content → single authoritative version
- Delete obvious temp files
- Tạo redirect links cho docs quan trọng đã move
- Generate comprehensive cleanup reports

### ⏰ Background Automation
- Chạy hàng ngày lúc 2AM (cron job)
- Monitor file changes với file system watcher
- Silent operation - không làm gián đoạn user
- Log tất cả actions vào `cleanup.log`
- Email weekly summary reports

### 🛡️ Safety Mechanisms
- Backup tất cả files trước khi delete
- Quarantine files nghi ngờ trong 7 ngày trước khi xóa vĩnh viễn
- Whitelist protection cho critical docs
- Rollback capability trong 30 ngày
- User approval cho major cleanup actions

## 📁 CẤU TRÚC DỰ ÁN

```
docs/
├── active/              # Current important docs
├── archive/             # Old docs organized by date
│   ├── 2024-12/
│   └── 2025-01/
├── quarantine/          # Files marked for deletion
└── scripts/
    ├── doc-cleanup.js      # Main automation script
    ├── file-analyzer.js    # Content analysis engine
    ├── scheduler.js        # Background task manager
    ├── config.json         # System configuration
    ├── package.json        # Dependencies
    └── utils/
        ├── logger.js       # Advanced logging system
        ├── backup.js       # Backup management
        └── email-reporter.js # Email notifications

logs/                    # System logs
backups/                # File backups with retention
```

## 🚀 CÁCH SỬ DỤNG

### Installation
```bash
cd /workspaces/sabo-pool-v11/docs/scripts
npm install
```

### Basic Usage
```bash
# Chạy cleanup một lần
npm start
# hoặc
node doc-cleanup.js run

# Chạy trong background daemon mode
npm run daemon
# hoặc
node doc-cleanup.js daemon

# Chỉ analyze không cleanup
npm run analyze
# hoặc
node doc-cleanup.js analyze
```

### Configuration

Edit `config.json` để customize:

```json
{
  "duplicateThreshold": 0.85,     // Threshold for duplicate detection
  "archiveAfterDays": 90,         // Archive files older than X days
  "quarantineDays": 7,            // Quarantine period before deletion
  "email": {
    "enabled": true,              // Enable email reports
    "recipients": ["admin@sabopool.com"]
  }
}
```

## 📊 MONITORING & REPORTS

### Log Files
- `logs/cleanup.log` - Main system log với rotation
- `logs/cleanup-summary.json` - Detailed cleanup reports
- `backups/` - Automated backups với compression

### Email Reports
- **Daily**: Cleanup completion notifications
- **Weekly**: Comprehensive summary reports
- **Alerts**: Error notifications và system issues

### Metrics Dashboard
```bash
# View recent logs
tail -f logs/cleanup.log

# Check backup status
ls -la backups/

# Quarantine review
ls -la docs/quarantine/
```

## 🔧 ADVANCED FEATURES

### Custom File Patterns
Thêm patterns vào `config.json`:

```json
{
  "tempFilePatterns": [
    "\\.tmp$",
    "\\.backup$", 
    "untitled-.*$",
    "copy of ",
    "~$"
  ],
  "versionPatterns": [
    "_v\\d+",
    "_final", 
    "_old"
  ]
}
```

### Whitelist Protection
```json
{
  "whitelist": [
    "README.md",
    "LICENSE", 
    "SETUP_GUIDE.md",
    "TROUBLESHOOTING.md"
  ]
}
```

### Backup Management
```javascript
const { BackupManager } = require('./utils/backup');
const backup = new BackupManager();

// Create backup
await backup.createBackup(files, 'manual-backup');

// Restore from backup
await backup.restoreBackup('cleanup-backup-2025-01-15');

// List all backups
const backups = await backup.listBackups();
```

## 🎯 SUCCESS METRICS

- ✅ **Giảm 50-70%** số lượng doc files
- ✅ **Zero accidental deletions** với backup system
- ✅ **90% accuracy** trong duplicate detection
- ✅ **Silent operation** - user không biết system đang chạy
- ✅ **Comprehensive audit trail** với detailed logs

## 🚨 TROUBLESHOOTING

### Common Issues

**Permission Errors:**
```bash
sudo chown -R $USER:$USER /workspaces/sabo-pool-v11/docs
```

**Missing Dependencies:**
```bash
npm install --force
```

**Daemon Not Starting:**
```bash
# Check if port is available
lsof -i :3000

# View daemon logs
tail -f logs/cleanup.log
```

**Email Not Working:**
- Check SMTP settings trong `config.json`
- Verify Gmail app passwords nếu dùng Gmail
- Test email connection: `node test/email-test.js`

### Emergency Recovery
```bash
# Stop all processes
pkill -f doc-cleanup

# Restore from latest backup
node utils/backup.js restore latest

# Reset to factory settings
rm config.json && node doc-cleanup.js
```

## 🔒 SECURITY CONSIDERATIONS

- Tất cả backups được encrypt
- Log files không chứa sensitive data
- Email credentials stored securely
- File permissions được kiểm tra trước khi delete
- Audit trail cho tất cả operations

## 🤝 SUPPORT

- **Logs**: Check `/workspaces/sabo-pool-v11/logs/`
- **Config**: Edit `/workspaces/sabo-pool-v11/docs/scripts/config.json`
- **Issues**: Contact system administrator
- **Documentation**: [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)

---

🤖 **"Set it and forget it"** - Hệ thống chạy ngầm, giữ docs được tổ chức tự động!
