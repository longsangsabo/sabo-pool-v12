#!/bin/bash

# Phase 5: Typography Migration Analysis
# Comprehensive analysis of typography patterns for design system migration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANALYSIS_OUTPUT="$ROOT_DIR/typography-migration-analysis.md"

echo "📝 PHASE 5: TYPOGRAPHY MIGRATION ANALYSIS"
echo "=========================================="

# Create analysis report
cat > "$ANALYSIS_OUTPUT" << 'EOF'
# Typography Migration Analysis Report

## Overview
Comprehensive analysis of typography usage for systematic migration to design system scales.

## Analysis Results

### 1. Typography Instance Count
EOF

echo "Counting typography instances..."
TOTAL_TYPOGRAPHY=$(grep -r "text-\|font-\|leading-" apps/sabo-user/src/ --include="*.tsx" | wc -l)
echo "**Total Typography Classes**: $TOTAL_TYPOGRAPHY instances" >> "$ANALYSIS_OUTPUT"

# Text size distribution
echo ""
echo "### 2. Font Size Distribution" >> "$ANALYSIS_OUTPUT"
echo "| Class | Count | Design Token Target |" >> "$ANALYSIS_OUTPUT"
echo "|-------|-------|---------------------|" >> "$ANALYSIS_OUTPUT"

# Count each text size
TEXT_XS=$(grep -r "text-xs" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_SM=$(grep -r "text-sm" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_BASE=$(grep -r "text-base" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_LG=$(grep -r "text-lg" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_XL=$(grep -r "text-xl" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_2XL=$(grep -r "text-2xl" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_3XL=$(grep -r "text-3xl" apps/sabo-user/src/ --include="*.tsx" | wc -l)
TEXT_4XL=$(grep -r "text-4xl" apps/sabo-user/src/ --include="*.tsx" | wc -l)

echo "| text-xs | $TEXT_XS | text-caption |" >> "$ANALYSIS_OUTPUT"
echo "| text-sm | $TEXT_SM | text-body-small |" >> "$ANALYSIS_OUTPUT"
echo "| text-base | $TEXT_BASE | text-body |" >> "$ANALYSIS_OUTPUT"
echo "| text-lg | $TEXT_LG | text-body-large |" >> "$ANALYSIS_OUTPUT"
echo "| text-xl | $TEXT_XL | text-heading-small |" >> "$ANALYSIS_OUTPUT"
echo "| text-2xl | $TEXT_2XL | text-heading |" >> "$ANALYSIS_OUTPUT"
echo "| text-3xl | $TEXT_3XL | text-heading-large |" >> "$ANALYSIS_OUTPUT"
echo "| text-4xl+ | $TEXT_4XL | text-display |" >> "$ANALYSIS_OUTPUT"

echo ""
echo "### 3. Font Weight Distribution" >> "$ANALYSIS_OUTPUT"
echo "| Class | Count | Design Token Target |" >> "$ANALYSIS_OUTPUT"
echo "|-------|-------|---------------------|" >> "$ANALYSIS_OUTPUT"

FONT_NORMAL=$(grep -r "font-normal" apps/sabo-user/src/ --include="*.tsx" | wc -l)
FONT_MEDIUM=$(grep -r "font-medium" apps/sabo-user/src/ --include="*.tsx" | wc -l)
FONT_SEMIBOLD=$(grep -r "font-semibold" apps/sabo-user/src/ --include="*.tsx" | wc -l)
FONT_BOLD=$(grep -r "font-bold" apps/sabo-user/src/ --include="*.tsx" | wc -l)

echo "| font-normal | $FONT_NORMAL | font-body |" >> "$ANALYSIS_OUTPUT"
echo "| font-medium | $FONT_MEDIUM | font-medium |" >> "$ANALYSIS_OUTPUT"
echo "| font-semibold | $FONT_SEMIBOLD | font-heading |" >> "$ANALYSIS_OUTPUT"
echo "| font-bold | $FONT_BOLD | font-display |" >> "$ANALYSIS_OUTPUT"

echo ""
echo "### 4. High-Impact Files (Most Typography)" >> "$ANALYSIS_OUTPUT"
echo "| File | Typography Count |" >> "$ANALYSIS_OUTPUT"
echo "|------|------------------|" >> "$ANALYSIS_OUTPUT"

# Find files with most typography
grep -r "text-\|font-\|leading-" apps/sabo-user/src/ --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -nr | head -10 | while read count file; do
    rel_file=$(echo "$file" | sed "s|apps/sabo-user/src/||")
    echo "| $rel_file | $count |" >> "$ANALYSIS_OUTPUT"
done

echo ""
echo "### 5. Design System Typography Scale" >> "$ANALYSIS_OUTPUT"
echo "Based on packages/design-tokens/src/typography.ts:" >> "$ANALYSIS_OUTPUT"
echo ""
echo "```typescript" >> "$ANALYSIS_OUTPUT"
echo "// Target Design System Scale" >> "$ANALYSIS_OUTPUT"
echo "export const TYPOGRAPHY_SCALE = {" >> "$ANALYSIS_OUTPUT"
echo "  caption: { size: '12px', lineHeight: '16px', weight: 400 }," >> "$ANALYSIS_OUTPUT"
echo "  'body-small': { size: '14px', lineHeight: '20px', weight: 400 }," >> "$ANALYSIS_OUTPUT"
echo "  body: { size: '16px', lineHeight: '24px', weight: 400 }," >> "$ANALYSIS_OUTPUT"
echo "  'body-large': { size: '18px', lineHeight: '28px', weight: 400 }," >> "$ANALYSIS_OUTPUT"
echo "  'heading-small': { size: '20px', lineHeight: '28px', weight: 600 }," >> "$ANALYSIS_OUTPUT"
echo "  heading: { size: '24px', lineHeight: '32px', weight: 600 }," >> "$ANALYSIS_OUTPUT"
echo "  'heading-large': { size: '30px', lineHeight: '36px', weight: 600 }," >> "$ANALYSIS_OUTPUT"
echo "  display: { size: '36px', lineHeight: '40px', weight: 700 }" >> "$ANALYSIS_OUTPUT"
echo "};" >> "$ANALYSIS_OUTPUT"
echo "\`\`\`" >> "$ANALYSIS_OUTPUT"

echo ""
echo "### 6. Migration Strategy" >> "$ANALYSIS_OUTPUT"
echo ""
echo "#### Phase 5A: Size Standardization" >> "$ANALYSIS_OUTPUT"
echo "- Replace text-xs → text-caption ($TEXT_XS instances)" >> "$ANALYSIS_OUTPUT"
echo "- Replace text-sm → text-body-small ($TEXT_SM instances)" >> "$ANALYSIS_OUTPUT"
echo "- Replace text-base → text-body ($TEXT_BASE instances)" >> "$ANALYSIS_OUTPUT"
echo "- Replace text-lg → text-body-large ($TEXT_LG instances)" >> "$ANALYSIS_OUTPUT"
echo ""
echo "#### Phase 5B: Weight Systematization" >> "$ANALYSIS_OUTPUT"
echo "- Standardize font-medium usage ($FONT_MEDIUM instances)" >> "$ANALYSIS_OUTPUT"
echo "- Standardize font-semibold → font-heading ($FONT_SEMIBOLD instances)" >> "$ANALYSIS_OUTPUT"
echo "- Standardize font-bold → font-display ($FONT_BOLD instances)" >> "$ANALYSIS_OUTPUT"
echo ""
echo "#### Phase 5C: Component Integration" >> "$ANALYSIS_OUTPUT"
echo "- Create Typography component variants" >> "$ANALYSIS_OUTPUT"
echo "- Update shared-ui with typography utilities" >> "$ANALYSIS_OUTPUT"
echo "- Implement design token CSS variables" >> "$ANALYSIS_OUTPUT"

echo ""
echo "✅ Typography Analysis Complete!" 
echo "📊 Found $TOTAL_TYPOGRAPHY typography instances"
echo "🎯 Priority: text-sm ($TEXT_SM), text-base ($TEXT_BASE), font-medium ($FONT_MEDIUM)"
echo "📄 Report saved to: $ANALYSIS_OUTPUT"
echo ""
echo "Next steps:"
echo "1. Review analysis report"
echo "2. Run phase5-typography-migration.sh"
echo "3. Validate with npm run build"
