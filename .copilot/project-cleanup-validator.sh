#!/bin/bash

# SABO Arena - Project Cleanup Validator
# Usage: ./project-cleanup-validator.sh

PROJECT_ROOT="/workspaces/sabo-pool-v12"
cd "$PROJECT_ROOT"

echo "🧹 SABO Arena - Project Cleanup Validator"
echo "=========================================="
echo ""

# Track issues
ISSUES=0

# 1. Check for debug code
echo "🐛 Checking for debug code..."
DEBUG_COUNT=$(find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "console\.log\|debugger" 2>/dev/null | wc -l)
echo "   Debug files found: $DEBUG_COUNT"
if [ $DEBUG_COUNT -gt 0 ]; then
    echo "   ⚠️  WARNING: Debug code still present"
    ((ISSUES++))
else
    echo "   ✅ No debug code found"
fi

# 2. Check script count
echo ""
echo "📜 Checking scripts directory..."
SCRIPT_COUNT=$(ls scripts/ 2>/dev/null | wc -l)
TEMP_SCRIPTS=$(ls scripts/ 2>/dev/null | grep -E "(phase|fix-|cleanup|migration)" | wc -l)
echo "   Total scripts: $SCRIPT_COUNT"
echo "   Temporary scripts: $TEMP_SCRIPTS"
if [ $TEMP_SCRIPTS -gt 10 ]; then
    echo "   ⚠️  WARNING: Too many temporary scripts"
    ((ISSUES++))
else
    echo "   ✅ Scripts count acceptable"
fi

# 3. Check CSS files
echo ""
echo "🎨 Checking CSS files..."
CSS_COUNT=$(find . -name "*.css" | wc -l)
echo "   CSS files count: $CSS_COUNT"
if [ $CSS_COUNT -gt 15 ]; then
    echo "   ⚠️  WARNING: Too many CSS files, consider consolidation"
    ((ISSUES++))
else
    echo "   ✅ CSS files count acceptable"
fi

# 4. Check page count
echo ""
echo "📱 Checking pages..."
PAGE_COUNT=$(find apps/sabo-user/src/pages -name "*.tsx" 2>/dev/null | wc -l)
TEST_PAGES=$(find apps/sabo-user/src/pages -name "*test*" -o -name "*Test*" 2>/dev/null | wc -l)
echo "   Total pages: $PAGE_COUNT"
echo "   Test pages: $TEST_PAGES"
if [ $PAGE_COUNT -gt 100 ]; then
    echo "   ⚠️  WARNING: High page count, check for duplicates"
    ((ISSUES++))
else
    echo "   ✅ Page count reasonable"
fi

# 5. Check component count
echo ""
echo "🧩 Checking components..."
COMPONENT_COUNT=$(find apps/sabo-user/src/components -name "*.tsx" 2>/dev/null | wc -l)
UI_COMPONENTS=$(find apps/sabo-user/src/components/ui -name "*.tsx" 2>/dev/null | wc -l)
echo "   Total components: $COMPONENT_COUNT"
echo "   UI components: $UI_COMPONENTS"
if [ $COMPONENT_COUNT -gt 300 ]; then
    echo "   ⚠️  WARNING: High component count, consider optimization"
    ((ISSUES++))
else
    echo "   ✅ Component count manageable"
fi

# 6. Check for duplicate files
echo ""
echo "🔍 Checking for potential duplicates..."
DUPLICATE_PATTERNS=$(find . -name "*duplicate*" -o -name "*copy*" -o -name "*backup*" -o -name "*old*" | wc -l)
echo "   Potential duplicate files: $DUPLICATE_PATTERNS"
if [ $DUPLICATE_PATTERNS -gt 0 ]; then
    echo "   ⚠️  WARNING: Potential duplicate files found"
    ((ISSUES++))
else
    echo "   ✅ No obvious duplicates found"
fi

# 7. Check for TODO/FIXME
echo ""
echo "📝 Checking for TODOs and FIXMEs..."
TODO_COUNT=$(find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "TODO\|FIXME" 2>/dev/null | wc -l)
echo "   Files with TODO/FIXME: $TODO_COUNT"
if [ $TODO_COUNT -gt 50 ]; then
    echo "   ⚠️  WARNING: High TODO/FIXME count"
    ((ISSUES++))
else
    echo "   ✅ TODO/FIXME count acceptable"
fi

# 8. Check for test organization
echo ""
echo "🧪 Checking test organization..."
TEST_FILES=$(find . -name "*test*" -o -name "*spec*" | wc -l)
E2E_TESTS=$(find e2e/ -name "*.spec.ts" 2>/dev/null | wc -l)
echo "   Total test files: $TEST_FILES"
echo "   E2E tests: $E2E_TESTS"

# Summary
echo ""
echo "📊 CLEANUP SUMMARY"
echo "=================="
echo "Issues found: $ISSUES"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo "🎉 EXCELLENT! Project is well-organized and clean!"
    echo "✅ All cleanup targets met"
elif [ $ISSUES -le 3 ]; then
    echo "👍 GOOD! Minor cleanup needed"
    echo "⚠️ $ISSUES areas need attention"
else
    echo "🚨 NEEDS WORK! Significant cleanup required"
    echo "❌ $ISSUES areas need major attention"
fi

echo ""
echo "📋 RECOMMENDED ACTIONS:"
if [ $DEBUG_COUNT -gt 0 ]; then
    echo "1. Remove debug code from $DEBUG_COUNT files"
fi
if [ $TEMP_SCRIPTS -gt 10 ]; then
    echo "2. Archive $TEMP_SCRIPTS temporary scripts"
fi
if [ $CSS_COUNT -gt 15 ]; then
    echo "3. Consolidate $CSS_COUNT CSS files"
fi
if [ $PAGE_COUNT -gt 100 ]; then
    echo "4. Review and optimize $PAGE_COUNT pages"
fi
if [ $COMPONENT_COUNT -gt 300 ]; then
    echo "5. Optimize $COMPONENT_COUNT components"
fi

echo ""
echo "For detailed cleanup plan, see: .copilot/project-cleanup-plan.md"

exit $ISSUES
