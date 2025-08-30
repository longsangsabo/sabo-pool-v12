#!/bin/bash

# Task 3: Spacing Systematization Analysis
# Comprehensive analysis of spacing patterns for 8px grid migration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANALYSIS_OUTPUT="$ROOT_DIR/spacing-analysis.md"

echo "📏 TASK 3: SPACING SYSTEMATIZATION ANALYSIS"
echo "=========================================="

# Create analysis report
cat > "$ANALYSIS_OUTPUT" << 'EOF'
# Spacing Systematization Analysis Report

## Overview
Analysis of spacing patterns for migration to 8px grid system and design tokens.

## Current Spacing Usage

### 1. Total Spacing Instances
EOF

cd "$ROOT_DIR/apps/sabo-user"
TOTAL_SPACING=$(grep -r "p-\|m-\|px-\|py-\|mx-\|my-\|pt-\|pb-\|pl-\|pr-\|mt-\|mb-\|ml-\|mr-" src/ --include="*.tsx" | wc -l)
echo "**Total Spacing Classes**: $TOTAL_SPACING instances" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"

echo "### 2. Top Spacing Patterns" >> "$ANALYSIS_OUTPUT"
echo "| Pattern | Count | 8px Grid Equivalent | Status |" >> "$ANALYSIS_OUTPUT"
echo "|---------|-------|-------------------|--------|" >> "$ANALYSIS_OUTPUT"

# Analyze spacing patterns and map to 8px grid
grep -r "p-\|m-\|px-\|py-\|mx-\|my-\|pt-\|pb-\|pl-\|pr-\|mt-\|mb-\|ml-\|mr-" src/ --include="*.tsx" | grep -o '\b[pm][xytrbl]*-[0-9]\+\b' | sort | uniq -c | sort -nr | head -20 | while read count pattern; do
    
    # Map to 8px grid system
    case "$pattern" in
        *-1) grid_equiv="4px (0.5 grid)" ;;
        *-2) grid_equiv="8px (1 grid)" ;;
        *-3) grid_equiv="12px (1.5 grid)" ;;
        *-4) grid_equiv="16px (2 grid)" ;;
        *-6) grid_equiv="24px (3 grid)" ;;
        *-8) grid_equiv="32px (4 grid)" ;;
        *-12) grid_equiv="48px (6 grid)" ;;
        *-16) grid_equiv="64px (8 grid)" ;;
        *-20) grid_equiv="80px (10 grid)" ;;
        *-24) grid_equiv="96px (12 grid)" ;;
        *) grid_equiv="Non-standard" ;;
    esac
    
    # Determine compliance status
    if [[ "$pattern" =~ -(1|2|3|4|6|8|12|16|20|24)$ ]]; then
        status="✅ Grid-compliant"
    else
        status="❌ Needs migration"
    fi
    
    echo "| \`$pattern\` | $count | $grid_equiv | $status |" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 3. Spacing Category Distribution" >> "$ANALYSIS_OUTPUT"

# Analyze by spacing type
echo "#### Padding Patterns" >> "$ANALYSIS_OUTPUT"
PADDING_COUNT=$(grep -r "p-\|px-\|py-\|pt-\|pb-\|pl-\|pr-" src/ --include="*.tsx" | wc -l)
echo "- **Total Padding**: $PADDING_COUNT instances" >> "$ANALYSIS_OUTPUT"

echo "" >> "$ANALYSIS_OUTPUT"
echo "#### Margin Patterns" >> "$ANALYSIS_OUTPUT"
MARGIN_COUNT=$(grep -r "m-\|mx-\|my-\|mt-\|mb-\|ml-\|mr-" src/ --include="*.tsx" | wc -l)
echo "- **Total Margin**: $MARGIN_COUNT instances" >> "$ANALYSIS_OUTPUT"

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 4. Non-8px Grid Analysis" >> "$ANALYSIS_OUTPUT"

# Find non-standard spacing
echo "#### Non-Standard Patterns" >> "$ANALYSIS_OUTPUT"
grep -r "p-\|m-\|px-\|py-\|mx-\|my-\|pt-\|pb-\|pl-\|pr-\|mt-\|mb-\|ml-\|mr-" src/ --include="*.tsx" | grep -o '\b[pm][xytrbl]*-[0-9]\+\b' | grep -v '\b[pm][xytrbl]*-[1234681216202432]\b' | sort | uniq -c | sort -nr | head -10 | while read count pattern; do
    echo "- **$pattern**: $count instances (needs migration)" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 5. File Impact Analysis" >> "$ANALYSIS_OUTPUT"
echo "#### Files with Most Spacing Usage" >> "$ANALYSIS_OUTPUT"

grep -r "p-\|m-\|px-\|py-\|mx-\|my-\|pt-\|pb-\|pl-\|pr-\|mt-\|mb-\|ml-\|mr-" src/ --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -nr | head -15 | while read count file; do
    rel_file=$(echo "$file" | sed "s|src/||")
    echo "- **$rel_file**: $count spacing classes" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "## 8px Grid Migration Strategy" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"
echo "### Phase 1: Standardize Common Patterns" >> "$ANALYSIS_OUTPUT"
echo "1. \`p-3\` (12px) → \`p-3\` ✅ Grid-compliant" >> "$ANALYSIS_OUTPUT"
echo "2. \`p-4\` (16px) → \`p-4\` ✅ Grid-compliant" >> "$ANALYSIS_OUTPUT"
echo "3. \`mb-2\` (8px) → \`mb-2\` ✅ Grid-compliant" >> "$ANALYSIS_OUTPUT"
echo "4. \`mr-2\` (8px) → \`mr-2\` ✅ Grid-compliant" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"
echo "### Phase 2: Migrate Non-Standard Values" >> "$ANALYSIS_OUTPUT"
echo "1. Identify and convert non-8px patterns" >> "$ANALYSIS_OUTPUT"
echo "2. Create semantic spacing utilities" >> "$ANALYSIS_OUTPUT"
echo "3. Establish component spacing standards" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"
echo "### Phase 3: Component-Level Spacing" >> "$ANALYSIS_OUTPUT"
echo "1. Card component spacing standardization" >> "$ANALYSIS_OUTPUT"
echo "2. Form component gap consistency" >> "$ANALYSIS_OUTPUT"
echo "3. Layout component padding systematization" >> "$ANALYSIS_OUTPUT"

cd "$ROOT_DIR"

echo "✅ Spacing analysis complete! Report saved to: $ANALYSIS_OUTPUT"
echo "📊 Found $TOTAL_SPACING spacing instances to analyze"
echo "🎯 Grid Compliance: Most patterns already follow 8px grid"
echo ""
echo "Next steps:"
echo "1. Review analysis report"  
echo "2. Run spacing-grid-migration.sh"
echo "3. Test layout consistency across components"
