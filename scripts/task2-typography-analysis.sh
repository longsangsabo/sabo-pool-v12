#!/bin/bash

# Task 2: Typography Migration Analysis
# Comprehensive analysis of typography patterns for systematic migration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANALYSIS_OUTPUT="$ROOT_DIR/typography-migration-analysis.md"

echo "📝 TASK 2: TYPOGRAPHY MIGRATION ANALYSIS"
echo "========================================"

# Create analysis report
cat > "$ANALYSIS_OUTPUT" << 'EOF'
# Typography Migration Analysis Report

## Overview
Systematic analysis of typography patterns for migration to design system scales.

## Current Typography Usage

### 1. Total Typography Instances
EOF

cd "$ROOT_DIR/apps/sabo-user"
TOTAL_TEXT=$(grep -r "text-" src/ --include="*.tsx" | wc -l)
echo "**Total Text Classes**: $TOTAL_TEXT instances" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"

echo "### 2. Top Typography Patterns" >> "$ANALYSIS_OUTPUT"
echo "| Pattern | Count | Migration Target |" >> "$ANALYSIS_OUTPUT"
echo "|---------|-------|------------------|" >> "$ANALYSIS_OUTPUT"

# Analyze common patterns
grep -r "text-" src/ --include="*.tsx" | grep -o '"[^"]*text-[^"]*"' | sort | uniq -c | sort -nr | head -20 | while read count pattern; do
    clean_pattern=$(echo "$pattern" | tr -d '"')
    
    # Determine migration target based on pattern
    if [[ "$clean_pattern" == *"text-xs"* ]]; then
        target="text-caption"
    elif [[ "$clean_pattern" == *"text-sm"* ]]; then
        target="text-body-small"
    elif [[ "$clean_pattern" == *"text-base"* ]]; then
        target="text-body"
    elif [[ "$clean_pattern" == *"text-lg"* ]]; then
        target="text-body-large"
    elif [[ "$clean_pattern" == *"text-xl"* ]]; then
        target="text-title"
    elif [[ "$clean_pattern" == *"text-2xl"* ]]; then
        target="text-heading"
    else
        target="Review needed"
    fi
    
    echo "| \`$clean_pattern\` | $count | $target |" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 3. Font Weight Distribution" >> "$ANALYSIS_OUTPUT"

# Analyze font weights
echo "#### Current Font Weights" >> "$ANALYSIS_OUTPUT"
grep -r "font-" src/ --include="*.tsx" | grep -o '"[^"]*font-[^"]*"' | sort | uniq -c | sort -nr | head -10 | while read count pattern; do
    clean_pattern=$(echo "$pattern" | tr -d '"')
    echo "- **$clean_pattern**: $count instances" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 4. Color Combinations" >> "$ANALYSIS_OUTPUT"

# Analyze text colors
echo "#### Text Color Usage" >> "$ANALYSIS_OUTPUT"
grep -r "text-.*-" src/ --include="*.tsx" | grep -o 'text-[a-zA-Z]*-[0-9]*' | sort | uniq -c | sort -nr | head -10 | while read count pattern; do
    echo "- **$pattern**: $count instances" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "### 5. File Impact Analysis" >> "$ANALYSIS_OUTPUT"
echo "#### Files with Most Typography Usage" >> "$ANALYSIS_OUTPUT"

grep -r "text-" src/ --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -nr | head -15 | while read count file; do
    rel_file=$(echo "$file" | sed "s|src/||")
    echo "- **$rel_file**: $count typography classes" >> "$ANALYSIS_OUTPUT"
done

echo "" >> "$ANALYSIS_OUTPUT"
echo "## Migration Strategy" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"
echo "### Phase 1: Size Migration (Priority)" >> "$ANALYSIS_OUTPUT"
echo "1. \`text-xs\` → \`text-caption\` (Most common)" >> "$ANALYSIS_OUTPUT"
echo "2. \`text-sm\` → \`text-body-small\` (High usage)" >> "$ANALYSIS_OUTPUT"
echo "3. \`text-base\` → \`text-body\` (Default)" >> "$ANALYSIS_OUTPUT"
echo "4. \`text-lg\` → \`text-body-large\` (Medium)" >> "$ANALYSIS_OUTPUT"
echo "5. \`text-xl/2xl\` → \`text-title/heading\` (Headers)" >> "$ANALYSIS_OUTPUT"
echo "" >> "$ANALYSIS_OUTPUT"
echo "### Phase 2: Weight & Color Consolidation" >> "$ANALYSIS_OUTPUT"
echo "1. Standardize font weights to design system" >> "$ANALYSIS_OUTPUT"
echo "2. Migrate color patterns to design tokens" >> "$ANALYSIS_OUTPUT"
echo "3. Combine typography + color into semantic classes" >> "$ANALYSIS_OUTPUT"

cd "$ROOT_DIR"

echo "✅ Typography analysis complete! Report saved to: $ANALYSIS_OUTPUT"
echo "📊 Found $TOTAL_TEXT typography instances to analyze"
echo ""
echo "Next steps:"
echo "1. Review analysis report"  
echo "2. Run typography-size-migration.sh"
echo "3. Test components for visual consistency"
