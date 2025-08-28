# 🧹 SABO Arena Codebase Cleanup Strategy

## 📊 Current State Analysis

### Issues Identified:
1. **Archive folders**: 10.5MB of old/backup files
2. **Archived pages**: 4+ _ARCHIVED_* files in user app  
3. **Legacy components**: 6+ legacy/* components
4. **Build artifacts**: Multiple dist/ folders (expected)
5. **Test/debug files**: Scattered across codebase
6. **Unused CSS**: Multiple style files that may not be imported
7. **Report files**: 15+ report markdown files (mostly documentation)

### Cleanup Categories:

#### 🔥 IMMEDIATE REMOVAL (Safe & High Impact)
- [ ] `/archive/` folder (3.8MB) - Move to separate backup location
- [ ] `/scripts-backup-20250821/` (6.7MB) - Outdated backup  
- [ ] `apps/sabo-user/src/pages/_ARCHIVED_*` files
- [ ] `apps/sabo-admin/src/App.backup.tsx` (already removed)
- [ ] Build artifacts in root `/dist/` folder

#### ⚠️ CAREFUL REVIEW NEEDED
- [ ] `apps/sabo-user/src/components/legacy/*` - Check imports first
- [ ] Multiple CSS files in `/src/styles/` - Verify usage
- [ ] Test files scattered in production code
- [ ] Debug components and pages

#### 📚 DOCUMENTATION CLEANUP  
- [ ] Consolidate report files in `/docs/legacy/`
- [ ] Move outdated docs to archive
- [ ] Keep only current architecture docs

#### 🔧 CODE STRUCTURE CLEANUP
- [ ] Remove unused imports across files
- [ ] Clean up TypeScript errors (429 found)
- [ ] Standardize file naming conventions
- [ ] Remove dead code paths

## 🎯 Execution Plan

### Phase 1: Safe Removals (Now)
1. Remove backup folders and archived files
2. Clean build artifacts
3. Remove obvious debug/test files

### Phase 2: Code Analysis (Next)  
1. Analyze import usage for legacy components
2. Check CSS file usage
3. Identify unused utility functions

### Phase 3: Structure Optimization
1. Fix critical TypeScript errors
2. Standardize imports and exports
3. Optimize file organization

## 💾 Estimated Space Savings
- Archive folders: ~10.5MB
- Build artifacts: ~5MB  
- Unused files: ~2-3MB
- **Total estimated**: 17-18MB reduction

## ⚡ Performance Impact
- Faster builds (fewer files to process)
- Cleaner IDE experience  
- Easier code navigation
- Reduced bundle analysis time
