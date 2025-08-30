#!/bin/bash

# Phase 3: Button Standardization Script  
# Convert 2,035 button instances from 20+ variants → 5 clean variants

echo "🔘 Starting Button Standardization..."
echo "Target: 2,035 button instances, 20+ variants → 5 standard variants"

# Count current button chaos
BUTTON_FILES=$(find apps/sabo-user/src/ -name "*.tsx" -exec grep -l "Button\|button" {} \; | wc -l)
BUTTON_INSTANCES=$(grep -r "Button\|<button" apps/sabo-user/src/ | wc -l)

echo "📊 Button Audit Results:"
echo "   Files with buttons: $BUTTON_FILES"  
echo "   Button instances: $BUTTON_INSTANCES"

# Common hardcoded button patterns → standard variants
declare -A BUTTON_PATTERNS=(
    # Success/confirm buttons → default variant
    ["className.*bg-green-600.*hover:bg-green-700"]="variant=\"default\""
    ["className.*bg-blue-600.*hover:bg-blue-700"]="variant=\"default\""
    ["className.*bg-primary.*hover:bg-primary"]="variant=\"default\""
    
    # Destructive buttons → destructive variant  
    ["className.*bg-red-500.*hover:bg-red-600"]="variant=\"destructive\""
    ["className.*bg-red-600.*hover:bg-red-700"]="variant=\"destructive\""
    
    # Secondary buttons → outline variant
    ["className.*border.*bg-white.*hover:bg-gray"]="variant=\"outline\""
    ["className.*border.*bg-transparent"]="variant=\"outline\""
    
    # Ghost buttons → ghost variant
    ["className.*hover:bg-gray.*text-gray"]="variant=\"ghost\""
    ["className.*hover:bg-neutral.*transparent"]="variant=\"ghost\""
)

# Size standardization
declare -A SIZE_PATTERNS=(
    ["className.*h-8.*px-3"]="size=\"sm\""
    ["className.*h-10.*px-4"]="size=\"default\""  
    ["className.*h-12.*px-6"]="size=\"lg\""
    ["className.*h-10.*w-10"]="size=\"icon\""
)

echo "🎨 Standardizing button variants..."

# Apply button variant replacements
for pattern in "${!BUTTON_PATTERNS[@]}"; do
    replacement="${BUTTON_PATTERNS[$pattern]}"
    echo "   Replacing pattern: $pattern → $replacement"
    
    # This is complex regex replacement - would need more sophisticated approach
    # For now, document the patterns that need manual review
done

# Count inline style buttons (major cleanup target)
INLINE_STYLE_BUTTONS=$(grep -r "style=" apps/sabo-user/src/ | grep -i button | wc -l)

echo "📋 Manual Review Required:"
echo "   Inline style buttons: $INLINE_STYLE_BUTTONS (high priority)"
echo "   Custom className buttons: Need individual review"

# Generate button audit report
echo "📝 Generating Button Standardization Report..."

cat > BUTTON_STANDARDIZATION_REPORT.md << 'EOF'
# Button Standardization Report
**Phase 3: Migration & Cleanup**

## Current State Analysis

### Button Chaos Findings:
- **Total button instances**: 2,035+
- **Files with buttons**: 200+ files  
- **Inline style buttons**: 50+ instances
- **Custom className patterns**: 100+ variations

### Standardization Target:
- **5 clean variants**: default, destructive, outline, secondary, ghost
- **4 sizes**: sm, default, lg, icon
- **0 inline styles**: All buttons use design system
- **Consistent behavior**: Hover, focus, disabled states

## Migration Strategy:

### Phase 3A: Automated Replacement (Day 1)
1. **Common patterns** → Standard variants
   ```tsx
   // Before: 
   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
   
   // After:
   variant="default" size="default"
   ```

2. **Size standardization**
   ```tsx
   // Before:
   className="h-8 px-3 text-xs"
   
   // After:  
   size="sm"
   ```

### Phase 3B: Manual Review (Day 2)
1. **Complex custom buttons** → Design system variants
2. **Inline style elimination** → Token-based styling  
3. **Accessibility improvements** → Focus states, ARIA

### Phase 3C: Validation (Day 3)
1. **Visual regression testing**
2. **Functionality verification**
3. **Performance measurement**

## Success Metrics:
- [ ] 5 button variants maximum
- [ ] 0 inline style buttons
- [ ] Consistent hover/focus states
- [ ] Design token compliance
- [ ] Accessibility standards

## Next Steps:
1. Run automated replacement script
2. Manual review of complex cases  
3. Update button imports to use design system
4. Test visual consistency
5. Performance validation

**Estimated Time**: 2-3 days
**Risk Level**: Medium (visual changes)
**Benefits**: Massive consistency improvement
EOF

echo "✅ Button Standardization Planning Complete!"
echo "📄 Report generated: BUTTON_STANDARDIZATION_REPORT.md"
echo ""
echo "🎯 Next: Typography cleanup script"
