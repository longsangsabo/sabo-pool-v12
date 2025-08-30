#!/bin/bash

# Phase 3: Automated Color Migration Script
# Replace hardcoded colors với design tokens

echo "🚀 Starting Phase 3: Automated Color Migration..."
echo "Target: Replace 50+ hardcoded colors with 12 design tokens"

# Color mapping từ audit findings → design tokens
declare -A COLOR_MAPPINGS=(
    # Blue variants → primary system
    ["bg-blue-50"]="bg-primary-50"
    ["bg-blue-100"]="bg-primary-100"
    ["bg-blue-200"]="bg-primary-200"
    ["bg-blue-500"]="bg-primary-500"
    ["bg-blue-600"]="bg-primary-600"
    ["text-blue-600"]="text-primary-600"
    ["text-blue-700"]="text-primary-700"
    ["text-blue-800"]="text-primary-800"
    ["border-blue-200"]="border-primary-200"
    ["border-blue-300"]="border-primary-300"
    
    # Green variants → success system
    ["bg-green-50"]="bg-success-50"
    ["bg-green-100"]="bg-success-100"
    ["bg-green-500"]="bg-success-500"
    ["bg-green-600"]="bg-success-600"
    ["bg-green-700"]="bg-success-700"
    ["text-green-600"]="text-success-600"
    ["text-green-700"]="text-success-700"
    ["text-green-800"]="text-success-800"
    ["border-green-200"]="border-success-200"
    ["border-green-300"]="border-success-300"
    
    # Red variants → error system
    ["bg-red-50"]="bg-error-50"
    ["bg-red-100"]="bg-error-100"
    ["bg-red-500"]="bg-error-500"
    ["bg-red-600"]="bg-error-600"
    ["text-red-600"]="text-error-600"
    ["text-red-700"]="text-error-700"
    ["text-red-800"]="text-error-800"
    ["border-red-200"]="border-error-200"
    
    # Yellow/Orange variants → warning system
    ["bg-yellow-50"]="bg-warning-50"
    ["bg-yellow-100"]="bg-warning-100"
    ["bg-yellow-200"]="bg-warning-200"
    ["bg-orange-50"]="bg-warning-50"
    ["bg-orange-100"]="bg-warning-100"
    ["text-yellow-600"]="text-warning-600"
    ["text-yellow-700"]="text-warning-700"
    ["text-yellow-800"]="text-warning-800"
    ["text-orange-600"]="text-warning-600"
    ["text-orange-700"]="text-warning-700"
    
    # Gray variants → neutral system
    ["bg-gray-50"]="bg-neutral-50"
    ["bg-gray-100"]="bg-neutral-100"
    ["bg-gray-200"]="bg-neutral-200"
    ["bg-gray-800"]="bg-neutral-800"
    ["bg-gray-900"]="bg-neutral-900"
    ["text-gray-500"]="text-neutral-500"
    ["text-gray-600"]="text-neutral-600"
    ["text-gray-700"]="text-neutral-700"
    ["text-gray-800"]="text-neutral-800"
    ["text-gray-900"]="text-neutral-900"
    ["border-gray-200"]="border-neutral-200"
    ["border-gray-300"]="border-neutral-300"
    
    # Purple variants → info system  
    ["bg-purple-50"]="bg-info-50"
    ["bg-purple-100"]="bg-info-100"
    ["text-purple-600"]="text-info-600"
    ["text-purple-700"]="text-info-700"
)

# Count files before migration
TOTAL_FILES=$(find apps/sabo-user/src/ -name "*.tsx" | wc -l)
COLOR_FILES=$(find apps/sabo-user/src/ -name "*.tsx" -exec grep -l "bg-blue-\|bg-green-\|bg-red-\|bg-yellow-\|bg-gray-\|bg-purple-\|bg-orange-" {} \; | wc -l)

echo "📊 Migration Statistics:"
echo "   Total TSX files: $TOTAL_FILES"
echo "   Files with hardcoded colors: $COLOR_FILES"
echo "   Color mappings to apply: ${#COLOR_MAPPINGS[@]}"

# Create backup
echo "📦 Creating backup..."
cp -r apps/sabo-user/src apps/sabo-user/src.backup.$(date +%Y%m%d_%H%M%S)

# Apply color replacements
echo "🎨 Applying color replacements..."
for old_color in "${!COLOR_MAPPINGS[@]}"; do
    new_color="${COLOR_MAPPINGS[$old_color]}"
    echo "   $old_color → $new_color"
    
    # Replace in all tsx files
    find apps/sabo-user/src/ -name "*.tsx" -exec sed -i "s/$old_color/$new_color/g" {} \;
done

# Count changes made
CHANGED_FILES=$(find apps/sabo-user/src/ -name "*.tsx" -exec grep -l "bg-primary-\|bg-success-\|bg-error-\|bg-warning-\|bg-neutral-\|bg-info-" {} \; | wc -l)

echo "✅ Color Migration Complete!"
echo "   Files changed: $CHANGED_FILES"
echo "   Hardcoded colors eliminated: ${#COLOR_MAPPINGS[@]} patterns"

echo ""
echo "🎯 Next: Button standardization (2,035 instances)"
echo "🎯 Next: Typography cleanup (15+ → 6 scales)"  
echo "🎯 Next: Spacing systematization (8px grid)"
echo "🎯 Next: Inline styles elimination (276 instances)"
