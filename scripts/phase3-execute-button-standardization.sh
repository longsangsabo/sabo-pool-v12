#!/bin/bash

# Phase 3B: Execute Button Standardization
# Convert common hardcoded button patterns → design system variants

echo "🔘 Executing Button Standardization..."
echo "Target: Convert common hardcoded patterns to design system variants"

# Create backup before standardization
BACKUP_DIR="button_migration_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r apps/sabo-user/src "$BACKUP_DIR/"

echo "📦 Backup created: $BACKUP_DIR"

# Count current button patterns
BEFORE_CUSTOM=$(grep -r "className.*bg-primary-.*hover:bg-primary" apps/sabo-user/src/ | wc -l)
BEFORE_SUCCESS=$(grep -r "className.*bg-success-.*hover:bg-success" apps/sabo-user/src/ | wc -l)
BEFORE_ERROR=$(grep -r "className.*bg-error-.*hover:bg-error" apps/sabo-user/src/ | wc -l)

echo "📊 Before Standardization:"
echo "   Primary button patterns: $BEFORE_CUSTOM"
echo "   Success button patterns: $BEFORE_SUCCESS" 
echo "   Error button patterns: $BEFORE_ERROR"

echo "🎨 Applying button standardizations..."

# 1. Standard primary buttons: bg-primary-500 hover:bg-primary-600 → variant="default"
echo "   Converting primary buttons..."
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''bg-primary-500 text-white hover:bg-primary-600[^'\'']*'\''/variant="default"/g' {} \;
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''[^'\'']*bg-primary-500[^'\'']*hover:bg-primary-600[^'\'']*'\''/variant="default"/g' {} \;

# 2. Success buttons: bg-success-600 hover:bg-success-700 → variant="default" (since success is primary action)
echo "   Converting success buttons..." 
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''bg-success-600 hover:bg-success-700[^'\'']*'\''/variant="default"/g' {} \;
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''[^'\'']*bg-success-600[^'\'']*hover:bg-success-700[^'\'']*'\''/variant="default"/g' {} \;

# 3. Error/destructive buttons: bg-error-500 hover:bg-error-600 → variant="destructive"
echo "   Converting destructive buttons..."
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''bg-error-500 text-white hover:bg-error-600[^'\'']*'\''/variant="destructive"/g' {} \;
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''[^'\'']*bg-error-500[^'\'']*hover:bg-error-600[^'\'']*'\''/variant="destructive"/g' {} \;

# 4. Outline buttons: border + bg-white → variant="outline"  
echo "   Converting outline buttons..."
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''border border-neutral-200 bg-white hover:bg-neutral-50[^'\'']*'\''/variant="outline"/g' {} \;

# 5. Ghost buttons: transparent bg + hover:bg-neutral → variant="ghost"
echo "   Converting ghost buttons..."
find apps/sabo-user/src/ -name "*.tsx" -exec sed -i 's/className='\''text-neutral-600 hover:bg-neutral-100[^'\'']*'\''/variant="ghost"/g' {} \;

# Count after standardization
AFTER_CUSTOM=$(grep -r "className.*bg-primary-.*hover:bg-primary" apps/sabo-user/src/ | wc -l)
AFTER_SUCCESS=$(grep -r "className.*bg-success-.*hover:bg-success" apps/sabo-user/src/ | wc -l)
AFTER_ERROR=$(grep -r "className.*bg-error-.*hover:bg-error" apps/sabo-user/src/ | wc -l)

# Count design system adoption
VARIANT_DEFAULT=$(grep -r 'variant="default"' apps/sabo-user/src/ | wc -l)
VARIANT_DESTRUCTIVE=$(grep -r 'variant="destructive"' apps/sabo-user/src/ | wc -l)
VARIANT_OUTLINE=$(grep -r 'variant="outline"' apps/sabo-user/src/ | wc -l)
VARIANT_GHOST=$(grep -r 'variant="ghost"' apps/sabo-user/src/ | wc -l)

echo ""
echo "📈 After Standardization:"
echo "   Primary button patterns: $BEFORE_CUSTOM → $AFTER_CUSTOM"
echo "   Success button patterns: $BEFORE_SUCCESS → $AFTER_SUCCESS"
echo "   Error button patterns: $BEFORE_ERROR → $AFTER_ERROR"

echo ""
echo "🎯 Design System Adoption:"
echo "   variant=\"default\": $VARIANT_DEFAULT instances"
echo "   variant=\"destructive\": $VARIANT_DESTRUCTIVE instances"
echo "   variant=\"outline\": $VARIANT_OUTLINE instances"  
echo "   variant=\"ghost\": $VARIANT_GHOST instances"

# Calculate improvements
TOTAL_BEFORE=$((BEFORE_CUSTOM + BEFORE_SUCCESS + BEFORE_ERROR))
TOTAL_AFTER=$((AFTER_CUSTOM + AFTER_SUCCESS + AFTER_ERROR))
IMPROVED=$((TOTAL_BEFORE - TOTAL_AFTER))

echo ""
echo "✅ Button Standardization Results:"
echo "   Hardcoded patterns eliminated: $IMPROVED"
echo "   Design system compliance: $((VARIANT_DEFAULT + VARIANT_DESTRUCTIVE + VARIANT_OUTLINE + VARIANT_GHOST)) instances"
echo "   Backup preserved: $BACKUP_DIR"

echo ""
echo "🎯 Next Steps:"
echo "   1. Manual review of complex button cases"
echo "   2. Size standardization (sm, default, lg)" 
echo "   3. Visual regression testing"
echo "   4. Typography cleanup execution"

echo ""
echo "✅ Button Standardization Phase Complete!"
