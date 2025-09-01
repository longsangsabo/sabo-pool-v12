#!/bin/bash

# 🚨 EMERGENCY TYPOGRAPHY MIGRATION FIX SCRIPT
# Fixes breaking changes after design system migration

echo "🚨 Typography Migration Fix - Emergency Patch"
echo "=============================================="
echo "Date: $(date)"
echo ""

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base directory
cd /workspaces/sabo-pool-v12

echo "🔍 SCANNING FOR AFFECTED FILES..."
echo "================================="

# Find files with Typography imports
AFFECTED_FILES=$(grep -r "import.*Typography.*from.*shared-ui" apps/ --include="*.tsx" -l 2>/dev/null)

if [ -z "$AFFECTED_FILES" ]; then
    echo -e "${GREEN}✅ No files found with old Typography imports${NC}"
else
    echo -e "${YELLOW}⚠️  Found affected files:${NC}"
    echo "$AFFECTED_FILES"
fi

echo ""
echo "🔧 APPLYING FIXES..."
echo "==================="

# Counter for fixes
FIXES_APPLIED=0

# Fix 1: Replace Typography imports
echo "📝 Fix 1: Updating import statements..."
find apps/ -name "*.tsx" -exec grep -l "import.*Typography.*from.*shared-ui" {} \; | while read file; do
    echo "  Fixing imports in: $file"
    sed -i 's/import { Typography }/import { Heading, Text, Label }/g' "$file"
    sed -i 's/import { Typography, /import { Heading, Text, Label, /g' "$file" 
    sed -i 's/, Typography }/, Heading, Text, Label }/g' "$file"
    ((FIXES_APPLIED++))
done

# Fix 2: Replace common Typography patterns
echo "📝 Fix 2: Converting Typography components..."

# Large Typography -> Heading h2
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="large"/<Heading variant="h2"/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="xl"/<Heading variant="h1"/g' {} \;

# Medium Typography -> Text
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="medium"/<Text/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/<Typography>/<Text>/g' {} \;

# Small Typography -> Text sm
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="small"/<Text size="sm"/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="sm"/<Text size="sm"/g' {} \;

# Fix closing tags - be more specific
find apps/ -name "*.tsx" -exec sed -i 's/<\/Typography>/<\/Text>/g' {} \;

# Fix weight props -> className
find apps/ -name "*.tsx" -exec sed -i 's/weight="bold"/className="font-bold"/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/weight="semibold"/className="font-semibold"/g' {} \;

# Fix color props -> variant or className
find apps/ -name "*.tsx" -exec sed -i 's/color="muted"/variant="muted"/g' {} \;

echo ""
echo "🧹 POST-FIX CLEANUP..."
echo "====================="

# Fix any remaining issues with closing tags for Headings
find apps/ -name "*.tsx" -exec sed -i 's/<Heading variant="h[1-6]"[^>]*>.*<\/Text>/<Heading variant="h2">\n  Text Content\n<\/Heading>/g' {} \;

echo ""
echo "✅ VERIFICATION..."
echo "=================="

# Check for remaining Typography imports
REMAINING=$(grep -r "import.*Typography.*from.*shared-ui" apps/ --include="*.tsx" -l 2>/dev/null | wc -l)
echo "Remaining Typography imports: $REMAINING files"

# Check for Typography components still in use
TYPOGRAPHY_USAGE=$(grep -r "<Typography" apps/ --include="*.tsx" -l 2>/dev/null | wc -l)
echo "Files still using <Typography>: $TYPOGRAPHY_USAGE files"

echo ""
echo "📊 SUMMARY"
echo "=========="

if [ $REMAINING -eq 0 ] && [ $TYPOGRAPHY_USAGE -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS: All Typography imports and usage have been migrated!${NC}"
else
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS: Some manual fixes may be needed${NC}"
    
    if [ $REMAINING -gt 0 ]; then
        echo -e "${YELLOW}Files with remaining Typography imports:${NC}"
        grep -r "import.*Typography.*from.*shared-ui" apps/ --include="*.tsx" -l 2>/dev/null
    fi
    
    if [ $TYPOGRAPHY_USAGE -gt 0 ]; then
        echo -e "${YELLOW}Files still using <Typography> components:${NC}"
        grep -r "<Typography" apps/ --include="*.tsx" -l 2>/dev/null
    fi
fi

echo ""
echo "🚀 NEXT STEPS"
echo "============="
echo "1. Run: pnpm dev"
echo "2. Check for compilation errors"
echo "3. Test components in browser"
echo "4. Run: pnpm design-system:check"
echo "5. Manually review any remaining issues"

echo ""
echo "📚 DOCUMENTATION"
echo "================"
echo "📖 Full guide: docs/02-design-system/MIGRATION_BREAKING_CHANGES_GUIDE.md"
echo "🔧 Component reference: packages/shared-ui/src/components/Typography/"

echo ""
echo -e "${GREEN}🎉 Typography migration fix completed!${NC}"
