# 🛠️ Scripts Directory

## 📋 Active Scripts

### 🚀 Build & Deployment
- **`build-optimized.sh`** - Optimized production build process
- **`bundle-analyzer.sh`** - Analyze bundle size and dependencies  
- **`deploy-netlify.sh`** - Deploy to Netlify platform
- **`deploy-production-enhanced.sh`** - Enhanced production deployment
- **`dev-optimized.sh`** - Optimized development server startup

### 🔍 Monitoring & Quality
- **`monitor-design-system.sh`** - ✨ **NEW** Monitor design system adoption metrics
- **`performance-monitor.sh`** - Monitor app performance metrics
- **`performance-benchmark.js`** - Performance benchmarking utilities
- **`integration-test.sh`** - Run integration tests
- **`updated-validation.sh`** - Validate codebase quality

### 🧹 Maintenance & Utils
- **`clear-avatar-cache.js`** - Clear user avatar cache
- **`remove-console-statements.js`** - Remove console.log statements
- **`reset-local-storage.js`** - Reset browser local storage
- **`detect-unused-components.sh`** - Find unused React components

### ⚙️ Setup & Configuration  
- **`setup-admin.sh`** - Setup admin environment
- **`setup-vscode-integration.sh`** - Configure VS Code integration
- **`reorganize-documentation.sh`** - Organize project documentation

### 🗄️ Database
- **`deploy-current-season.sql`** - Deploy current season data
- **`deploy-season-history.sql`** - Deploy historical season data

### 🧪 Testing & Demo
- **`test-theme-integration.sh`** - Test theme system integration
- **`demo-auto-reference.sh`** - Demo automatic reference generation
- **`manual-migrate-single.sh`** - Manual single component migration
- **`verify_no_milestones.sh`** - Verify no milestone conflicts

## 📦 Archive

All migration scripts and historical tools have been moved to `archive/` directory:
- Phase migration scripts (phase1-7)
- Aggressive conversion tools
- Bulk cleanup utilities
- Final validation scripts
- Daily migration tasks

## 🚀 Quick Commands

```bash
# Check design system quality
./scripts/monitor-design-system.sh

# Build optimized version  
./scripts/build-optimized.sh

# Analyze bundle size
./scripts/bundle-analyzer.sh

# Deploy to production
./scripts/deploy-production-enhanced.sh

# Run performance benchmark
node ./scripts/performance-benchmark.js
```

## 📝 Usage Guidelines

1. **Always run from project root:** `./scripts/script-name.sh`
2. **Check script permissions:** `chmod +x scripts/script-name.sh`
3. **Read script comments** before execution
4. **Test in development** before production use
5. **Backup data** before running database scripts

## 🔐 Security Note

- Database scripts contain sensitive operations
- Always review SQL scripts before execution
- Use appropriate environment variables
- Never commit sensitive credentials
