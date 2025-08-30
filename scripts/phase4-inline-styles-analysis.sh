#!/bin/bash

# Phase 4: Inline Styles Analysis Script
# Comprehensive analysis of inline styles for cleanup planning

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANALYSIS_OUTPUT="$ROOT_DIR/inline-styles-analysis.md"

echo "🔍 PHASE 4: INLINE STYLES ANALYSIS"
echo "===================================="

# Create analysis report
cat > "$ANALYSIS_OUTPUT" << 'EOF'
# Inline Styles Analysis Report

## Overview
This analysis identifies all inline styles for systematic cleanup and conversion to design tokens.

## Analysis Results

### 1. Total Inline Style Count
EOF

echo "Counting total inline styles..."
TOTAL_COUNT=$(grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | wc -l)
echo "**Total Inline Styles**: $TOTAL_COUNT instances" >> "$ANALYSIS_OUTPUT"
echo ""

echo "### 2. File Distribution" >> "$ANALYSIS_OUTPUT"
echo "| File | Inline Styles Count |" >> "$ANALYSIS_OUTPUT"
echo "|------|-------------------|" >> "$ANALYSIS_OUTPUT"

# Count by file
grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -nr | head -20 | while read count file; do
    rel_file=$(echo "$file" | sed "s|apps/sabo-user/src/||")
    echo "| $rel_file | $count |" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 3. Style Pattern Categories" >> "$ANALYSIS_OUTPUT"

# Analyze patterns
echo "#### Animation Styles" >> "$ANALYSIS_OUTPUT"
ANIMATION_COUNT=$(grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | grep -i -E "(transition|animation|transform|opacity|scale|rotate)" | wc -l)
echo "- **Count**: $ANIMATION_COUNT instances" >> "$ANALYSIS_OUTPUT"
echo "- **Action**: Convert to CSS animations with design tokens" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"

echo "#### Dynamic Width/Height" >> "$ANALYSIS_OUTPUT"
DIMENSION_COUNT=$(grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | grep -E "(width:|height:)" | wc -l)
echo "- **Count**: $DIMENSION_COUNT instances" >> "$ANALYSIS_OUTPUT"
echo "- **Action**: Use design system spacing or CSS variables" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"

echo "#### Progress Bars" >> "$ANALYSIS_OUTPUT"
PROGRESS_COUNT=$(grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | grep -E "(progress|percentage|\`.*%\`)" | wc -l)
echo "- **Count**: $PROGRESS_COUNT instances" >> "$ANALYSIS_OUTPUT"
echo "- **Action**: Create ProgressBar component with design tokens" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"

echo "#### Color Overrides" >> "$ANALYSIS_OUTPUT"
COLOR_COUNT=$(grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | grep -E "(color:|background:|border:)" | wc -l)
echo "- **Count**: $COLOR_COUNT instances" >> "$ANALYSIS_OUTPUT"
echo "- **Action**: Replace with design token classes" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"

echo "### 4. Sample Files for Review"
echo ""
echo "#### High Priority Files (Most Inline Styles)"
grep -r "style=" apps/sabo-user/src/ --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -nr | head -5 | while read count file; do
    echo "**$file** ($count styles)"
    echo "\`\`\`bash"
    grep -n "style=" "$file" | head -3
    echo "\`\`\`"
    echo ""
done >> "$ANALYSIS_OUTPUT"

echo "✅ Analysis complete! Report saved to: $ANALYSIS_OUTPUT"
echo "📊 Found $TOTAL_COUNT inline styles to cleanup"
echo ""
echo "Next steps:"
echo "1. Review analysis report"
echo "2. Run phase4-inline-styles-cleanup.sh"
echo "3. Validate changes with npm run build"
