# 📝 Documentation Naming Convention Standards

## 🎯 Naming Principles

### 1. **Case Convention**
- **kebab-case** for all file names (lowercase với hyphens)
- **NO UPPER_CASE** or **Mixed_Case_Names**
- Example: `user-authentication.md` not `USER_AUTHENTICATION.md`

### 2. **Structure Pattern**
```
[category]-[function]-[type].md

Categories: guide, reference, overview, tutorial, api, config
Functions: specific functionality (auth, payment, tournament)
Types: md (always markdown)
```

### 3. **Length Limits**
- **Maximum 30 characters** (excluding .md)
- **Descriptive but concise**
- **Avoid redundant words**

### 4. **Special Files**
- **README.md** - Always capitalized (standard)
- **Root level** - Use UPPER_CASE for major documents
- **Component specific** - Use kebab-case

---

## 📋 Standardized Names by Category

### Root Level Documents
```
README.md                    ✅ (Standard)
SYSTEM_OVERVIEW.md          ✅ (Major document)
DOCUMENTATION_SUCCESS.md    → (Rename from long name)
```

### 01-getting-started/
```
README.md                   ✅
quick-start.md             ✅  
onboarding-guide.md        ✅
onboarding-checklist.md    ✅
```

### 02-design-system/
```
README.md                  ✅
components.md              ✅
design-tokens.md           ✅
style-guide.md             → (Rename from style-editing.md)
css-reference.md           → (Rename from css-cheat-sheet.md)
usage-examples.md          ✅
```

### 03-architecture/
```
README.md                  ✅
system-overview.md         → (Rename from overview.md)
tech-stack.md              ✅
project-structure.md       ✅
```

### 04-development/
```
README.md                  ✅
coding-standards.md        ✅
development-guide.md       → (Rename from guidelines.md)
```

### 05-deployment/
```
README.md                  ✅
deployment-guide.md        ✅
ci-cd-setup.md             ✅
monitoring-guide.md        → (Rename from monitoring.md)
```

### 06-api/
```
README.md                  ✅
api-overview.md            ✅
authentication-guide.md    → (Rename from authentication.md)
integration-examples.md    ✅
```

### 07-tools/
```
README.md                  ✅
auto-reference-system.md   ✅
```

### 08-features/
```
README.md                  ✅
```

### 09-reports/
```
README.md                     ✅
audit-summary.md              → (Rename from CONSOLIDATED_AUDIT_SUMMARY.md)
cleanup-summary.md            → (Rename from CONSOLIDATED_CLEANUP_SUMMARY.md)
migration-summary.md          → (Rename from CONSOLIDATED_MIGRATION_SUMMARY.md)
progress-summary.md           → (Rename from CONSOLIDATED_DAILY_PROGRESS_SUMMARY.md)
documentation-audit.md        → (Rename from COMPREHENSIVE_DOCUMENTATION_AUDIT_REPORT.md)
migration-success.md          → (Rename from DOCUMENTATION_MIGRATION_SUCCESS_REPORT.md)
```

### 10-reference/
```
README.md                     ✅
business-logic-guide.md       ✅
factory-pattern-analysis.md   → (Rename from FACTORY_PATTERN_OPTIMIZATION_ANALYSIS.md)
rewards-system-analysis.md    → (Rename from REWARDS_SYSTEM_OPTIMIZATION_ANALYSIS.md)
inline-styles-analysis.md     ✅
spacing-analysis.md           ✅
typography-analysis.md        → (Rename from typography-migration-analysis.md)
```

### 99-archive/
```
README.md                     ✅
legacy-claims-test.md         → (Rename from LEGACY_CLAIM_QUICK_TEST.md)
legacy-configuration.md       ✅
legacy-troubleshooting.md     ✅
vnpay-legacy-config.md        ✅
```

### Apps/
```
apps/sabo-admin/README.md     ✅
apps/sabo-user/README.md      ✅
apps/sabo-user/src/components/ui/card-avatar-guide.md  → (Rename)
```

---

## 🔄 Renaming Plan

**Total Renames Needed**: 18 files
**Estimated Time**: 30 minutes
**Impact**: Zero functional impact, improved discoverability

**Benefits**:
- ✅ Consistent naming across all documents
- ✅ Easier alphabetical sorting
- ✅ Improved search and autocomplete
- ✅ Professional documentation appearance
- ✅ Better IDE navigation experience
