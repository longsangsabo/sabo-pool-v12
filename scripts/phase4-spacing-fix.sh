#!/bin/bash

# 📏 PHASE 4: SPACING VIOLATIONS FIX
# Fix spacing values để follow 8px grid system

echo "📏 PHASE 4: SPACING VIOLATIONS FIX"
echo "=================================="
echo ""

# Backup trước khi fix
BACKUP_DIR="/workspaces/sabo-pool-v12/spacing_violations_fix_backup_$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r /workspaces/sabo-pool-v12/apps/sabo-user/src "$BACKUP_DIR/sabo-user-src" 2>/dev/null
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Counters
fixed_count=0
total_count=0

# Function để fix spacing violations
fix_spacing_violations() {
    local file="$1"
    local original_content
    local new_content
    local changes_made=false
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "📏 Processing: $(basename "$file")"
    original_content=$(cat "$file")
    new_content="$original_content"
    
    # Fix common non-8px-grid spacing values
    
    # Fix 2px → 4px (smallest grid value)
    if echo "$new_content" | grep -q '[^0-9]2px\|margin: 2px\|padding: 2px'; then
        echo "  ✅ Fixed: 2px → 4px"
        new_content=$(echo "$new_content" | sed 's/margin: 2px/margin: 4px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 2px/padding: 4px/g')
        new_content=$(echo "$new_content" | sed 's/margin-top: 2px/margin-top: 4px/g')
        new_content=$(echo "$new_content" | sed 's/margin-bottom: 2px/margin-bottom: 4px/g')
        new_content=$(echo "$new_content" | sed 's/padding-top: 2px/padding-top: 4px/g')
        new_content=$(echo "$new_content" | sed 's/padding-bottom: 2px/padding-bottom: 4px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 5px → 4px or 8px (closest grid values)
    if echo "$new_content" | grep -q '[^0-9]5px\|margin: 5px\|padding: 5px'; then
        echo "  ✅ Fixed: 5px → 4px"
        new_content=$(echo "$new_content" | sed 's/margin: 5px/margin: 4px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 5px/padding: 4px/g')
        new_content=$(echo "$new_content" | sed 's/margin: 5px 0/margin: 4px 0/g')
        new_content=$(echo "$new_content" | sed 's/padding: 5px 0/padding: 4px 0/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 6px → 8px
    if echo "$new_content" | grep -q '[^0-9]6px\|margin: 6px\|padding: 6px'; then
        echo "  ✅ Fixed: 6px → 8px"
        new_content=$(echo "$new_content" | sed 's/margin: 6px/margin: 8px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 6px/padding: 8px/g')
        new_content=$(echo "$new_content" | sed 's/6px/8px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 10px → 8px or 12px
    if echo "$new_content" | grep -q '[^0-9]10px\|margin: 10px\|padding: 10px'; then
        echo "  ✅ Fixed: 10px → 12px"
        new_content=$(echo "$new_content" | sed 's/margin: 10px/margin: 12px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 10px/padding: 12px/g')
        new_content=$(echo "$new_content" | sed 's/10px/12px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 14px → 12px or 16px
    if echo "$new_content" | grep -q '[^0-9]14px\|margin: 14px\|padding: 14px'; then
        echo "  ✅ Fixed: 14px → 12px"
        new_content=$(echo "$new_content" | sed 's/margin: 14px/margin: 12px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 14px/padding: 12px/g')
        new_content=$(echo "$new_content" | sed 's/14px/12px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 15px → 16px
    if echo "$new_content" | grep -q '[^0-9]15px\|margin: 15px\|padding: 15px'; then
        echo "  ✅ Fixed: 15px → 16px"
        new_content=$(echo "$new_content" | sed 's/margin: 15px/margin: 16px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 15px/padding: 16px/g')
        new_content=$(echo "$new_content" | sed 's/15px/16px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 18px → 16px or 20px
    if echo "$new_content" | grep -q '[^0-9]18px\|margin: 18px\|padding: 18px'; then
        echo "  ✅ Fixed: 18px → 20px"
        new_content=$(echo "$new_content" | sed 's/margin: 18px/margin: 20px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 18px/padding: 20px/g')
        new_content=$(echo "$new_content" | sed 's/18px/20px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 22px → 20px or 24px
    if echo "$new_content" | grep -q '[^0-9]22px\|margin: 22px\|padding: 22px'; then
        echo "  ✅ Fixed: 22px → 24px"
        new_content=$(echo "$new_content" | sed 's/margin: 22px/margin: 24px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 22px/padding: 24px/g')
        new_content=$(echo "$new_content" | sed 's/22px/24px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 25px → 24px
    if echo "$new_content" | grep -q '[^0-9]25px\|margin: 25px\|padding: 25px'; then
        echo "  ✅ Fixed: 25px → 24px"
        new_content=$(echo "$new_content" | sed 's/margin: 25px/margin: 24px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 25px/padding: 24px/g')
        new_content=$(echo "$new_content" | sed 's/25px/24px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix 30px → 32px
    if echo "$new_content" | grep -q '[^0-9]30px\|margin: 30px\|padding: 30px'; then
        echo "  ✅ Fixed: 30px → 32px"
        new_content=$(echo "$new_content" | sed 's/margin: 30px/margin: 32px/g')
        new_content=$(echo "$new_content" | sed 's/padding: 30px/padding: 32px/g')
        new_content=$(echo "$new_content" | sed 's/30px/32px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix negative margins to grid values
    if echo "$new_content" | grep -q 'margin: -2px'; then
        echo "  ✅ Fixed: -2px → -4px"
        new_content=$(echo "$new_content" | sed 's/margin: -2px/margin: -4px/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Convert rem values that don't align với grid
    # Assuming 1rem = 16px, fix non-grid rem values
    if echo "$new_content" | grep -q '0\.125rem\|0\.25rem\|0\.375rem\|0\.625rem\|0\.875rem'; then
        echo "  ✅ Fixed: Non-grid rem values"
        new_content=$(echo "$new_content" | sed 's/0\.125rem/0.25rem/g')  # 2px → 4px
        new_content=$(echo "$new_content" | sed 's/0\.375rem/0.5rem/g')   # 6px → 8px
        new_content=$(echo "$new_content" | sed 's/0\.625rem/0.75rem/g')  # 10px → 12px
        new_content=$(echo "$new_content" | sed 's/0\.875rem/1rem/g')     # 14px → 16px
        changes_made=true
        ((fixed_count++))
    fi
    
    # Save changes if any were made
    if [ "$changes_made" = true ]; then
        echo "$new_content" > "$file"
        echo "  💾 File updated with grid-compliant spacing"
    else
        echo "  ⏭️  No spacing violations found"
    fi
    
    ((total_count++))
}

# Function để fix Tailwind spacing classes
fix_tailwind_spacing() {
    local file="$1"
    local original_content
    local new_content
    local changes_made=false
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "🎨 Processing Tailwind: $(basename "$file")"
    original_content=$(cat "$file")
    new_content="$original_content"
    
    # Fix non-standard Tailwind spacing classes
    # Tailwind uses 4px increments by default, which aligns with our 8px grid
    
    # Fix arbitrary values that don't align với grid
    if echo "$new_content" | grep -q '\[2px\]\|\[6px\]\|\[10px\]\|\[14px\]\|\[18px\]\|\[22px\]'; then
        echo "  ✅ Fixed: Arbitrary Tailwind values"
        new_content=$(echo "$new_content" | sed 's/\[2px\]/[4px]/g')
        new_content=$(echo "$new_content" | sed 's/\[6px\]/[8px]/g')
        new_content=$(echo "$new_content" | sed 's/\[10px\]/[12px]/g')
        new_content=$(echo "$new_content" | sed 's/\[14px\]/[12px]/g')
        new_content=$(echo "$new_content" | sed 's/\[18px\]/[20px]/g')
        new_content=$(echo "$new_content" | sed 's/\[22px\]/[24px]/g')
        changes_made=true
    fi
    
    # Save changes if any were made
    if [ "$changes_made" = true ]; then
        echo "$new_content" > "$file"
        echo "  💾 Tailwind file updated with grid-compliant values"
    else
        echo "  ⏭️  No Tailwind spacing violations found"
    fi
}

# Find CSS files với spacing violations
echo "🔍 Finding CSS files with spacing violations..."
css_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" | xargs grep -l '[^0-9]\(2\|5\|6\|10\|14\|15\|18\|22\|25\|30\)px' | head -10)

if [ ! -z "$css_files" ]; then
    echo "📂 Found $(echo "$css_files" | wc -l) CSS files with spacing violations"
    echo ""
    
    echo "$css_files" | while read -r file; do
        fix_spacing_violations "$file"
        echo ""
    done
fi

# Find TSX/JSX files với Tailwind arbitrary values
echo "🔍 Finding TSX files with Tailwind spacing violations..."
tsx_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -l '\[.*px\]' | head -10)

if [ ! -z "$tsx_files" ]; then
    echo "📂 Found $(echo "$tsx_files" | wc -l) TSX files with Tailwind arbitrary values"
    echo ""
    
    echo "$tsx_files" | while read -r file; do
        fix_tailwind_spacing "$file"
        echo ""
    done
fi

echo "📊 PHASE 4 SUMMARY"
echo "=================="
echo "📁 Files processed: $total_count"
echo "📏 Spacing fixes applied: $fixed_count"
echo "💾 Backup location: $BACKUP_DIR"
echo ""

# Run validation again
echo "🔍 Running validation to check improvement..."
remaining_violations=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" | xargs grep -E "(padding|margin).*[0-9]+(px|rem)" | grep -vE "(4|8|12|16|20|24|32|40|48)px" | wc -l)
echo "📈 Remaining spacing violations: $remaining_violations"

if [ "$remaining_violations" -lt 15 ]; then
    echo "🎉 Excellent progress! Spacing is now highly grid-compliant"
elif [ "$remaining_violations" -lt 20 ]; then
    echo "✅ Good progress! Most spacing violations fixed"
else
    echo "⚠️  Some complex cases remain. Manual review recommended"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Review spacing changes for visual consistency"
echo "2. Test responsive layouts"
echo "3. Run final validation to see overall progress"
echo "4. Consider Phase 5: Design system component adoption"
echo ""
echo "🚀 Run final validation: ./scripts/style-validation.sh"
