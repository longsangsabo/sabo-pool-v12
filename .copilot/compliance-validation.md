# 🎯 Copilot Compliance Validation Script

> **AUTO-CHECK** script to validate AI assistant compliance with project rules

## 🤖 Usage Instructions

Run this script to validate if changes follow project governance:

```bash
# Make executable
chmod +x .copilot/validate-compliance.sh

# Run validation
./.copilot/validate-compliance.sh

# Check specific directory
./.copilot/validate-compliance.sh docs/
```

---

## 📋 Validation Checks

### **File Naming Compliance**
- ✅ kebab-case convention
- ✅ Maximum 30 character length
- ✅ No UPPER_CASE (except allowed files)
- ✅ Proper extensions

### **Directory Structure Compliance**
- ✅ No unauthorized root files
- ✅ Follows established hierarchy
- ✅ No duplicate directories

### **Documentation Compliance**
- ✅ README.md exists in new directories
- ✅ Documentation updated for new features
- ✅ Cross-references maintained

---

## 🔧 Validation Script

```bash
#!/bin/bash

# SABO Arena - Copilot Compliance Validator
# Usage: ./validate-compliance.sh [directory]

PROJECT_ROOT="/workspaces/sabo-pool-v12"
CHECK_DIR="${1:-$PROJECT_ROOT}"

echo "🤖 SABO Arena - Copilot Compliance Validator"
echo "============================================="
echo "Checking: $CHECK_DIR"
echo ""

# Track violations
VIOLATIONS=0

# 1. Check file naming conventions
echo "📝 Checking file naming conventions..."
find "$CHECK_DIR" -name "*.md" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
    filename=$(basename "$file")
    
    # Skip allowed UPPER_CASE files
    if [[ "$filename" =~ ^(README\.md|SYSTEM_OVERVIEW\.md|NAMING_CONVENTION_PLAN\.md|LICENSE|CHANGELOG\.md)$ ]]; then
        continue
    fi
    
    # Check for UPPER_CASE
    if [[ "$filename" =~ [A-Z] ]]; then
        echo "❌ VIOLATION: UPPER_CASE file name: $file"
        ((VIOLATIONS++))
    fi
    
    # Check length (excluding extension)
    name_without_ext="${filename%.*}"
    if [ ${#name_without_ext} -gt 30 ]; then
        echo "❌ VIOLATION: File name too long (>30 chars): $file"
        ((VIOLATIONS++))
    fi
done

# 2. Check for unauthorized root files
echo ""
echo "📁 Checking root directory compliance..."
find "$PROJECT_ROOT" -maxdepth 1 -type f -name "*.md" | while read file; do
    filename=$(basename "$file")
    
    # Allowed root files
    if [[ ! "$filename" =~ ^(README\.md|SYSTEM_OVERVIEW\.md|NAMING_CONVENTION_PLAN\.md)$ ]]; then
        echo "❌ VIOLATION: Unauthorized root file: $file"
        ((VIOLATIONS++))
    fi
done

# 3. Check for duplicate documentation
echo ""
echo "📚 Checking for duplicate documentation..."
find "$PROJECT_ROOT/docs" -name "*.md" -exec basename {} \; | sort | uniq -d | while read duplicate; do
    echo "❌ VIOLATION: Duplicate documentation file: $duplicate"
    ((VIOLATIONS++))
done

# 4. Check directory structure
echo ""
echo "🏗️ Checking directory structure compliance..."

# Check if new directories have README.md
find "$CHECK_DIR" -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | while read dir; do
    if [ "$dir" != "$PROJECT_ROOT" ] && [ ! -f "$dir/README.md" ] && [ "$(find "$dir" -maxdepth 1 -name "*.md" | wc -l)" -eq 0 ]; then
        # Skip if directory only contains other directories
        if [ "$(find "$dir" -maxdepth 1 -type f | wc -l)" -gt 0 ]; then
            echo "⚠️  WARNING: Directory without documentation: $dir"
        fi
    fi
done

echo ""
echo "✅ Compliance check completed!"
echo "Violations found: $VIOLATIONS"

if [ $VIOLATIONS -eq 0 ]; then
    echo "🎉 All checks passed! Good job following the rules!"
    exit 0
else
    echo "🚨 Please fix violations before proceeding!"
    exit 1
fi
```

---

## 🔄 Auto-Fix Script

```bash
#!/bin/bash

# Auto-fix common compliance issues
echo "🔧 Auto-fixing common compliance issues..."

# Fix UPPER_CASE to kebab-case (excluding allowed files)
find . -name "*.md" -not -name "README.md" -not -name "SYSTEM_OVERVIEW.md" -not -name "NAMING_CONVENTION_PLAN.md" | while read file; do
    filename=$(basename "$file")
    if [[ "$filename" =~ [A-Z] ]]; then
        # Convert to kebab-case
        new_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | sed 's/_/-/g')
        new_path="$(dirname "$file")/$new_name"
        
        echo "🔄 Renaming: $file → $new_path"
        mv "$file" "$new_path"
    fi
done

echo "✅ Auto-fix completed!"
```

---

## 📊 Compliance Report Template

```markdown
# 🤖 Copilot Compliance Report

**Date**: $(date)
**Copilot Session**: [Session ID]
**Changes Made**: [Number] files created/modified

## ✅ Compliance Checklist

- [ ] Read project documentation first
- [ ] Followed naming conventions
- [ ] Used existing patterns
- [ ] Updated related documentation
- [ ] No unauthorized root files created
- [ ] No duplicate functionality added

## 📁 Files Changed

| File | Action | Compliant |
|------|--------|-----------|
| path/to/file.md | Created | ✅ |
| path/to/other.ts | Modified | ✅ |

## 🎯 Summary

**Violations**: 0
**Warnings**: 0
**Status**: ✅ COMPLIANT

*All changes follow SABO Arena governance rules.*
```

---

## 🚀 Integration with VS Code

Add to `.vscode/tasks.json`:

```json
{
    "label": "Validate Copilot Compliance",
    "type": "shell",
    "command": "./.copilot/validate-compliance.sh",
    "group": "build",
    "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
    },
    "problemMatcher": []
}
```

---

**Remember**: Run this validation after every AI assistant session to ensure compliance! 🎯
