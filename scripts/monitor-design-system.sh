#!/bin/bash

# 🔍 DESIGN SYSTEM QUALITY MONITORING SCRIPT
# Monitors design system adoption metrics and prevents regression

echo "🔍 SABO Pool Design System Quality Check"
echo "========================================"
echo "Date: $(date)"
echo ""

# Set base directory
BASE_DIR="/workspaces/sabo-pool-v12"
cd "$BASE_DIR"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Thresholds (based on our "Ship It" strategy)
MAX_INLINE_STYLES=60  # Allow some buffer from current 53
MAX_HEX_COLORS=12     # Allow buffer from current 8
MIN_SHARED_COMPONENTS=55  # Expect growth from current 59

echo "📊 CURRENT METRICS"
echo "=================="

# Check inline styles
INLINE_COUNT=$(find . -name "*.tsx" -exec grep -l "style=" {} \; | wc -l)
echo -n "Inline Styles: $INLINE_COUNT files "
if [ $INLINE_COUNT -le $MAX_INLINE_STYLES ]; then
    echo -e "${GREEN}✅ GOOD${NC} (≤$MAX_INLINE_STYLES)"
else
    echo -e "${RED}⚠️  REGRESSION${NC} (>$MAX_INLINE_STYLES)"
fi

# Check hardcoded colors
HEX_COUNT=$(find . -name "*.tsx" -exec grep -l "#[0-9a-fA-F]\{3,6\}" {} \; | wc -l)
echo -n "Hex Colors: $HEX_COUNT files "
if [ $HEX_COUNT -le $MAX_HEX_COLORS ]; then
    echo -e "${GREEN}✅ GOOD${NC} (≤$MAX_HEX_COLORS)"
else
    echo -e "${RED}⚠️  REGRESSION${NC} (>$MAX_HEX_COLORS)"
fi

# Check shared components
SHARED_COUNT=$(find ./packages/shared-ui -name "*.tsx" | wc -l)
echo -n "Shared Components: $SHARED_COUNT components "
if [ $SHARED_COUNT -ge $MIN_SHARED_COMPONENTS ]; then
    echo -e "${GREEN}✅ GOOD${NC} (≥$MIN_SHARED_COMPONENTS)"
else
    echo -e "${YELLOW}📈 OPPORTUNITY${NC} (<$MIN_SHARED_COMPONENTS)"
fi

echo ""
echo "🎯 DESIGN SYSTEM ADOPTION"
echo "========================"

# Calculate adoption percentage
TOTAL_COMPONENTS=$(find ./apps -name "*.tsx" | wc -l)
STYLED_COMPONENTS=$(find ./apps -name "*.tsx" -exec grep -l "className\|tw-" {} \; | wc -l)
ADOPTION_RATE=$(( (STYLED_COMPONENTS * 100) / TOTAL_COMPONENTS ))

echo -n "Adoption Rate: $ADOPTION_RATE% "
if [ $ADOPTION_RATE -ge 90 ]; then
    echo -e "${GREEN}✅ EXCELLENT${NC} (≥90%)"
elif [ $ADOPTION_RATE -ge 80 ]; then
    echo -e "${YELLOW}📈 GOOD${NC} (80-89%)"
else
    echo -e "${RED}⚠️  NEEDS IMPROVEMENT${NC} (<80%)"
fi

echo ""
echo "📈 TREND ANALYSIS"
echo "================="

# Check for recent additions of problematic patterns
RECENT_INLINE=$(git log --since="1 week ago" --name-only --pretty=format: | grep -E "\.(tsx|ts)$" | xargs grep -l "style=" 2>/dev/null | wc -l)
RECENT_HEX=$(git log --since="1 week ago" --name-only --pretty=format: | grep -E "\.(tsx|ts)$" | xargs grep -l "#[0-9a-fA-F]\{3,6\}" 2>/dev/null | wc -l)

echo "Recent inline styles added: $RECENT_INLINE files"
echo "Recent hex colors added: $RECENT_HEX files"

if [ $RECENT_INLINE -gt 5 ] || [ $RECENT_HEX -gt 3 ]; then
    echo -e "${YELLOW}⚠️  Consider design system training for recent contributors${NC}"
fi

echo ""
echo "🛡️  QUALITY GATES"
echo "================="

# Overall health check
TOTAL_ISSUES=0

if [ $INLINE_COUNT -gt $MAX_INLINE_STYLES ]; then
    ((TOTAL_ISSUES++))
fi

if [ $HEX_COUNT -gt $MAX_HEX_COLORS ]; then
    ((TOTAL_ISSUES++))
fi

if [ $SHARED_COUNT -lt $MIN_SHARED_COMPONENTS ]; then
    ((TOTAL_ISSUES++))
fi

echo -n "Overall Health: "
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ HEALTHY${NC} - Design system quality maintained"
    exit 0
elif [ $TOTAL_ISSUES -eq 1 ]; then
    echo -e "${YELLOW}📈 MONITOR${NC} - Minor attention needed"
    exit 0
else
    echo -e "${RED}⚠️  ACTION NEEDED${NC} - Multiple quality issues detected"
    exit 1
fi

echo ""
echo "📚 IMPROVEMENT SUGGESTIONS"
echo "========================="
echo "• Add design system linting rules to prevent regression"
echo "• Create component templates for common patterns"
echo "• Set up automated quality gates in CI/CD"
echo "• Regular design system training for new team members"
echo ""
echo "🔗 Resources:"
echo "• Design System Guide: /docs/02-design-system/"
echo "• Component Library: /packages/shared-ui/"
echo "• Migration Reports: /migration-reports/"
