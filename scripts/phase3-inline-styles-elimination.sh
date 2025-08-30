#!/bin/bash

# Phase 3: Inline Styles Elimination Script
# Target: 276 inline styles → 0 instances

echo "🧹 Starting Inline Styles Elimination..."
echo "Target: 276 inline style instances → 0 (complete elimination)"

# Audit current inline styles
INLINE_STYLE_FILES=$(find apps/sabo-user/src/ -name "*.tsx" -exec grep -l "style=" {} \; | wc -l)
INLINE_STYLE_COUNT=$(grep -r "style=" apps/sabo-user/src/ | wc -l)

echo "📊 Inline Styles Audit:"
echo "   Files with inline styles: $INLINE_STYLE_FILES"
echo "   Total inline style instances: $INLINE_STYLE_COUNT"

# Common inline style patterns → design tokens
declare -A INLINE_STYLE_MAPPINGS=(
    # Width/height patterns
    ["style={{.*width:.*'100%'.*}}"]="className=\"w-full\""
    ["style={{.*height:.*'100%'.*}}"]="className=\"h-full\""
    ["style={{.*width:.*'auto'.*}}"]="className=\"w-auto\""
    
    # Color patterns  
    ["style={{.*backgroundColor:.*'#ffffff'.*}}"]="className=\"bg-white\""
    ["style={{.*backgroundColor:.*'#f8f9fa'.*}}"]="className=\"bg-neutral-50\""
    ["style={{.*color:.*'#000000'.*}}"]="className=\"text-neutral-900\""
    ["style={{.*color:.*'#6b7280'.*}}"]="className=\"text-neutral-500\""
    
    # Spacing patterns
    ["style={{.*padding:.*'8px'.*}}"]="className=\"p-2\""
    ["style={{.*padding:.*'16px'.*}}"]="className=\"p-4\""
    ["style={{.*margin:.*'8px'.*}}"]="className=\"m-2\""
    ["style={{.*margin:.*'16px'.*}}"]="className=\"m-4\""
    
    # Display patterns
    ["style={{.*display:.*'flex'.*}}"]="className=\"flex\""
    ["style={{.*display:.*'none'.*}}"]="className=\"hidden\""
    ["style={{.*display:.*'block'.*}}"]="className=\"block\""
)

# Generate detailed inline styles report
echo "📝 Generating Inline Styles Report..."

# Find all inline style patterns
echo "🔍 Analyzing inline style patterns..."

grep -r "style=" apps/sabo-user/src/ --include="*.tsx" > /tmp/inline_styles.txt

# Categorize inline styles
WIDTH_HEIGHT=$(grep -c "width\|height" /tmp/inline_styles.txt)
COLORS=$(grep -c "color\|backgroundColor" /tmp/inline_styles.txt)  
SPACING=$(grep -c "padding\|margin" /tmp/inline_styles.txt)
DISPLAY=$(grep -c "display\|flex" /tmp/inline_styles.txt)
POSITION=$(grep -c "position\|top\|left\|right\|bottom" /tmp/inline_styles.txt)
OTHER=$(grep -c -v "width\|height\|color\|backgroundColor\|padding\|margin\|display\|flex\|position\|top\|left\|right\|bottom" /tmp/inline_styles.txt)

cat > INLINE_STYLES_ELIMINATION_REPORT.md << EOF
# Inline Styles Elimination Report
**Phase 3: Migration & Cleanup**

## Inline Styles Analysis

### Current State:
- **Total inline style instances**: $INLINE_STYLE_COUNT
- **Files affected**: $INLINE_STYLE_FILES
- **Anti-pattern impact**: High (maintenance nightmare)

### Style Categories:
- **Width/Height**: $WIDTH_HEIGHT instances
- **Colors**: $COLORS instances  
- **Spacing**: $SPACING instances
- **Display/Layout**: $DISPLAY instances
- **Positioning**: $POSITION instances
- **Other**: $OTHER instances

### Common Patterns Found:
\`\`\`tsx
// Width/Height patterns
style={{ width: '100%' }}          → className="w-full"
style={{ height: '100%' }}         → className="h-full"

// Color patterns  
style={{ backgroundColor: '#fff' }} → className="bg-white"
style={{ color: '#000' }}          → className="text-neutral-900"

// Spacing patterns
style={{ padding: '16px' }}        → className="p-4"
style={{ margin: '8px' }}          → className="m-2"

// Layout patterns
style={{ display: 'flex' }}        → className="flex"
style={{ display: 'none' }}        → className="hidden"
\`\`\`

## Migration Strategy:

### Phase 3A: Automated Conversion (70% of cases)
1. **Simple mappings**: Direct style → className conversion
2. **Spacing conversion**: px values → spacing tokens
3. **Color conversion**: hex/rgb → design tokens
4. **Layout conversion**: CSS display → Tailwind classes

### Phase 3B: Manual Review (30% of cases)  
1. **Complex inline styles**: Custom CSS → component variants
2. **Dynamic styles**: Conditional styling → className conditionals
3. **Third-party conflicts**: Library styles → wrapper components
4. **Animation styles**: Custom animations → design system

### Phase 3C: Validation & Testing
1. **Visual regression testing**: Before/after comparison
2. **Functionality testing**: Interactive elements
3. **Performance testing**: Bundle size impact
4. **Accessibility testing**: Focus states, screen readers

## Success Metrics:
- [ ] 0 inline style instances
- [ ] All styling uses design tokens
- [ ] Consistent visual appearance  
- [ ] Maintainable CSS architecture
- [ ] Performance improvement

## Benefits:
- **Maintainability**: Centralized styling system
- **Consistency**: Design token compliance
- **Performance**: Reduced CSS-in-JS overhead
- **Developer Experience**: Better code readability
- **Design System**: Complete token adoption

## Timeline:
- **Day 1**: Automated conversion (70%)
- **Day 2**: Manual review and complex cases (25%)  
- **Day 3**: Testing and validation (5%)

**Risk Level**: Low-Medium (mainly visual)
**Impact Level**: High (architecture improvement)
EOF

echo "✅ Inline Styles Analysis Complete!"
echo "📄 Report generated: INLINE_STYLES_ELIMINATION_REPORT.md"

# Clean up temp file
rm -f /tmp/inline_styles.txt

echo ""
echo "🎯 Ready for execution:"
echo "   1. Color migration (automated)"
echo "   2. Button standardization (semi-automated)"  
echo "   3. Inline styles elimination (mixed)"
echo "   4. Typography cleanup (automated)"
echo "   5. Spacing systematization (automated)"
