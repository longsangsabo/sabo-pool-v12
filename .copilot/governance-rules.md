# 🎯 SABO Arena - Complete AI Assistant Governance System

> **COMPREHENSIVE RULES** for all AI assistants working on SABO Arena project

## 🚨 CRITICAL MANDATORY RULES

### **RULE #0: READ FIRST, ACT SECOND**
```
🔴 NEVER make changes without reading these rules
🔴 NEVER assume anything about project structure
🔴 NEVER create files without checking existing patterns
✅ ALWAYS read documentation first
✅ ALWAYS follow established patterns
✅ ALWAYS ask before major changes
```

---

## 📋 1. FILE & DIRECTORY MANAGEMENT

### **1.1 File Naming Rules**
- **Format**: kebab-case (lowercase + hyphens)
- **Length**: Maximum 30 characters (excluding extension)
- **Pattern**: `[category]-[function]-[type].[ext]`
- **Forbidden**: UPPER_CASE, camelCase, snake_case, spaces

### **1.2 Directory Structure Rules**
```
✅ ALLOWED locations for new files:
├── apps/sabo-admin/src/          # Admin app code
├── apps/sabo-user/src/           # User app code  
├── packages/shared-*/src/        # Shared package code
├── docs/[01-11]-*/               # Documentation sections
├── database_migration/           # DB migration files
├── scripts/                      # Utility scripts
├── e2e/                         # End-to-end tests

❌ FORBIDDEN locations:
├── / (root directory)            # Only README.md, SYSTEM_OVERVIEW.md allowed
├── arbitrary new directories     # Must follow established structure
```

### **1.3 File Creation Rules**
- **Check first**: Search for existing similar files
- **Follow patterns**: Use existing file structures as templates
- **Documentation**: Create README.md for new directories
- **No duplicates**: Don't create functionality that already exists

---

## 🏗️ 2. CODE ARCHITECTURE RULES

### **2.1 Component Organization**
```typescript
// ✅ CORRECT: Use shared packages
import { Button } from '@/packages/shared-ui'
import { useAuth } from '@/packages/shared-auth'
import { Tournament } from '@/packages/shared-types'

// ❌ WRONG: Create duplicate components
// Don't create new Button in apps/ if shared one exists
```

### **2.2 Business Logic Rules**
- **Shared logic**: Must go in `packages/shared-business/`
- **App-specific**: Only UI and routing logic in apps/
- **Types**: All TypeScript types in `packages/shared-types/`
- **Utils**: Common utilities in `packages/shared-utils/`

### **2.3 Database Rules**
- **Migrations**: Only in `database_migration/migrations/`
- **Schema changes**: Must include rollback scripts
- **Supabase**: Use existing connection patterns
- **No direct SQL**: Use Supabase client methods

---

## 🎨 3. UI/UX STANDARDS

### **3.1 Design System Compliance**
```typescript
// ✅ CORRECT: Use design tokens
import { colors, spacing, typography } from '@/packages/design-tokens'

const StyledButton = styled.button`
  background: ${colors.primary.main};
  padding: ${spacing.md};
  font-size: ${typography.body.fontSize};
`

// ❌ WRONG: Inline styles or arbitrary values
const BadButton = styled.button`
  background: #3498db;  // Use design tokens instead
  padding: 16px;        // Use spacing tokens instead
`
```

### **3.2 Component Standards**
- **Reuse first**: Check `packages/shared-ui/` before creating
- **Variants**: Use existing component variants
- **Props**: Follow established prop patterns
- **Styling**: Use Tailwind classes or styled-components with tokens

### **3.3 Responsive Design**
- **Mobile-first**: All components must work on mobile
- **Breakpoints**: Use established breakpoint system
- **Touch-friendly**: Minimum 44px touch targets

---

## 🔧 4. DEVELOPMENT WORKFLOW

### **4.1 Before Starting Any Task**
```bash
# 1. Read project documentation
cat README.md
cat SYSTEM_OVERVIEW.md  
cat NAMING_CONVENTION_PLAN.md

# 2. Check existing implementations
find . -name "*keyword*" -type f

# 3. Understand the request
# - What exactly is needed?
# - Where should it be implemented?
# - What existing patterns can be used?
```

### **4.2 Code Quality Rules**
- **TypeScript**: All new code must be TypeScript
- **ESLint**: Follow existing ESLint configuration
- **Prettier**: Use project Prettier settings
- **Comments**: Document complex business logic
- **Tests**: Add tests for new functionality

### **4.3 Git Workflow**
- **Commits**: Use conventional commit messages
- **Branches**: Follow established branching strategy
- **PRs**: Include clear description and testing notes

---

## 📚 5. DOCUMENTATION REQUIREMENTS

### **5.1 When to Update Documentation**
- ✅ New features added
- ✅ API changes made
- ✅ Architecture modifications
- ✅ New dependencies added
- ✅ Configuration changes

### **5.2 Documentation Standards**
```markdown
# ✅ GOOD documentation structure:
## Overview
Brief description of what this does

## Usage
Code examples and implementation guide

## API Reference
Parameters, return values, types

## Examples
Real-world usage examples

# ❌ BAD documentation:
- No examples
- Missing context
- Outdated information
```

### **5.3 Location Rules**
- **Feature docs**: `docs/08-features/`
- **API docs**: `docs/06-api/`
- **Development guides**: `docs/04-development/`
- **Component docs**: In component source files
- **Package docs**: README.md in package root

---

## 🚫 6. FORBIDDEN ACTIONS

### **6.1 File Operations**
- ❌ Creating files in project root (except approved ones)
- ❌ Renaming files without checking all references
- ❌ Moving files between apps/packages without approval
- ❌ Deleting files without understanding dependencies
- ❌ Creating temporary files without cleanup

### **6.2 Code Operations**
- ❌ Adding new dependencies without approval
- ❌ Modifying package.json scripts without consultation
- ❌ Changing build configuration without testing
- ❌ Copying code instead of creating shared packages
- ❌ Hardcoding values that should be configurable

### **6.3 Architecture Operations**
- ❌ Creating new database tables without migration scripts
- ❌ Changing API endpoints without updating documentation
- ❌ Modifying authentication flow without security review
- ❌ Adding external services without approval

---

## ✅ 7. REQUIRED WORKFLOWS

### **7.1 Creating New Features**
1. **Research**: Check if similar feature exists
2. **Plan**: Identify affected components/packages
3. **Design**: Follow existing patterns and design system
4. **Implement**: Use shared packages, follow conventions
5. **Test**: Add appropriate tests
6. **Document**: Update relevant documentation
7. **Review**: Check compliance with all rules

### **7.2 Modifying Existing Features**
1. **Understand**: Read existing code and documentation
2. **Impact analysis**: Identify all affected areas
3. **Backward compatibility**: Ensure no breaking changes
4. **Testing**: Test all affected functionality
5. **Documentation**: Update changed behavior

### **7.3 Adding Dependencies**
1. **Justify**: Explain why existing solutions don't work
2. **Research**: Check for similar existing dependencies
3. **Security**: Verify package security and maintenance
4. **Impact**: Understand bundle size and performance impact
5. **Approval**: Get approval before adding

---

## 🎯 8. QUALITY STANDARDS

### **8.1 Code Quality Metrics**
- **TypeScript coverage**: 100% for new code
- **ESLint compliance**: Zero violations
- **Test coverage**: Minimum 80% for business logic
- **Performance**: No unnecessary re-renders or API calls
- **Accessibility**: WCAG 2.1 AA compliance

### **8.2 Documentation Quality**
- **Completeness**: All features documented
- **Accuracy**: Documentation matches implementation
- **Examples**: Working code examples provided
- **Navigation**: Clear cross-references and links
- **Maintenance**: Updated with every change

### **8.3 User Experience Standards**
- **Loading states**: All async operations show loading
- **Error handling**: Graceful error messages
- **Responsiveness**: Works on all device sizes
- **Performance**: Fast loading and interaction
- **Accessibility**: Keyboard navigation and screen readers

---

## 🔍 9. VALIDATION & COMPLIANCE

### **9.1 Pre-commit Checklist**
- [ ] Code follows TypeScript standards
- [ ] ESLint and Prettier passed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] No hardcoded values
- [ ] File naming conventions followed
- [ ] No unauthorized file locations

### **9.2 Automated Checks**
```bash
# Run compliance validation
./.copilot/validate-compliance.sh

# Check code quality
npm run lint
npm run type-check
npm run test

# Verify build
npm run build
```

### **9.3 Manual Review Points**
- Does this follow existing patterns?
- Is this the right place for this code?
- Will this scale well?
- Is error handling adequate?
- Are edge cases covered?

---

## 🆘 10. EMERGENCY PROCEDURES

### **10.1 If You Made a Mistake**
1. **STOP**: Don't make more changes
2. **Document**: List exactly what was changed
3. **Revert**: Offer to undo the changes
4. **Learn**: Understand what should have been done
5. **Proceed**: Follow correct procedure

### **10.2 If You're Unsure**
1. **ASK**: Request clarification from user
2. **RESEARCH**: Check documentation and existing code
3. **PLAN**: Explain your intended approach
4. **VERIFY**: Confirm before executing

### **10.3 If Rules Conflict**
1. **Prioritize**: User safety and data integrity first
2. **Consult**: Ask user for guidance
3. **Document**: Note the conflict for future resolution
4. **Choose**: Most conservative approach

---

## 📞 11. SUPPORT & ESCALATION

### **11.1 Documentation References**
- **Project Overview**: `SYSTEM_OVERVIEW.md`
- **File Naming**: `NAMING_CONVENTION_PLAN.md`
- **Documentation Structure**: `docs/README.md`
- **Development Guide**: `docs/04-development/development-guide.md`
- **Architecture Guide**: `docs/03-architecture/system-overview.md`

### **11.2 Quick Help Commands**
```bash
# Get project overview
cat SYSTEM_OVERVIEW.md

# Check naming rules
cat NAMING_CONVENTION_PLAN.md

# Find existing implementations
grep -r "keyword" --include="*.ts" --include="*.tsx"

# Check documentation structure
tree docs/ -L 2
```

### **11.3 Escalation Path**
1. **Level 1**: Check documentation
2. **Level 2**: Search existing codebase
3. **Level 3**: Ask user for clarification
4. **Level 4**: Propose solution with explanation

---

## 🏆 12. SUCCESS METRICS

### **12.1 A Good AI Assistant Session Has:**
- ✅ Zero unauthorized file creation
- ✅ 100% naming convention compliance
- ✅ No duplicate functionality
- ✅ Updated documentation
- ✅ Followed existing patterns
- ✅ Asked for approval on major changes
- ✅ Added appropriate tests
- ✅ Maintained code quality standards

### **12.2 Project Health Indicators**
- ✅ Consistent file organization
- ✅ No code duplication
- ✅ Complete documentation
- ✅ Working tests
- ✅ Fast development velocity
- ✅ Easy onboarding for new developers

---

**Remember**: These rules exist to maintain high code quality, prevent technical debt, and ensure all AI assistants work systematically to build a maintainable, scalable system! 🎯✨

**Last Updated**: August 31, 2025
**Version**: 1.0
**Status**: Active & Enforced
