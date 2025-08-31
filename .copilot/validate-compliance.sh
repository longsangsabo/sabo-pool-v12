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

# 1. Check file naming conventions for documentation files only
echo "📝 Checking documentation file naming conventions..."
find "$CHECK_DIR" -name "*.md" | while read file; do
    filename=$(basename "$file")
    
    # Skip allowed UPPER_CASE files
    if [[ "$filename" =~ ^(README\.md|SYSTEM_OVERVIEW\.md|NAMING_CONVENTION_PLAN\.md|LICENSE|CHANGELOG\.md)$ ]]; then
        continue
    fi
    
    # Check for UPPER_CASE
    if [[ "$filename" =~ [A-Z] ]]; then
        echo "❌ VIOLATION: UPPER_CASE documentation file: $file"
        ((VIOLATIONS++))
    fi
    
    # Check length (excluding extension)
    name_without_ext="${filename%.*}"
    if [ ${#name_without_ext} -gt 30 ]; then
        echo "❌ VIOLATION: Documentation file name too long (>30 chars): $file"
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
    if [ ! -z "$duplicate" ]; then
        echo "❌ VIOLATION: Duplicate documentation file: $duplicate"
        ((VIOLATIONS++))
    fi
done

# 4. Check directory structure
echo ""
echo "🏗️ Checking directory structure compliance..."

# Check if new directories have documentation
find "$CHECK_DIR" -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | while read dir; do
    if [ "$dir" != "$PROJECT_ROOT" ] && [ ! -f "$dir/README.md" ]; then
        # Skip if directory only contains other directories or is a known structure
        if [[ ! "$dir" =~ (scripts|e2e|\.copilot|\.github|database_migration/.*|docs/.*) ]]; then
            if [ "$(find "$dir" -maxdepth 1 -type f | wc -l)" -gt 0 ]; then
                echo "⚠️  WARNING: Directory without documentation: $dir"
            fi
        fi
    fi
done

echo ""
echo "✅ Compliance check completed!"

if [ $VIOLATIONS -eq 0 ]; then
    echo "🎉 All checks passed! Good job following the rules!"
    exit 0
else
    echo "🚨 Please fix $VIOLATIONS violations before proceeding!"
    exit 1
fi
