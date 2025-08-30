#!/bin/bash

# 🎨 PHASE 2: HARDCODED COLORS MIGRATION
# Replace hardcoded colors với design system color variables

echo "🎨 PHASE 2: HARDCODED COLORS MIGRATION"
echo "====================================="
echo ""

# Backup trước khi fix
BACKUP_DIR="/workspaces/sabo-pool-v12/hardcoded_colors_fix_backup_$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r /workspaces/sabo-pool-v12/apps/sabo-user/src "$BACKUP_DIR/sabo-user-src" 2>/dev/null
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Counters
fixed_count=0
total_count=0

# Function để replace common hardcoded colors
fix_hardcoded_colors() {
    local file="$1"
    local original_content
    local new_content
    local changes_made=false
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "🎨 Processing: $(basename "$file")"
    original_content=$(cat "$file")
    new_content="$original_content"
    
    # Color mapping: Hardcoded → Design System Variable
    
    # White colors
    if echo "$new_content" | grep -q '#[Ff][Ff][Ff][Ff][Ff][Ff]\|#[Ff][Ff][Ff]\|#[Ww][Hh][Ii][Tt][Ee]'; then
        echo "  ✅ Fixed: White colors"
        new_content=$(echo "$new_content" | sed 's/#[Ff][Ff][Ff][Ff][Ff][Ff]/var(--color-white)/g')
        new_content=$(echo "$new_content" | sed 's/#[Ff][Ff][Ff]/var(--color-white)/g')
        new_content=$(echo "$new_content" | sed 's/"white"/"var(--color-white)"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Black colors
    if echo "$new_content" | grep -q '#000000\|#000\|#[Bb][Ll][Aa][Cc][Kk]'; then
        echo "  ✅ Fixed: Black colors"
        new_content=$(echo "$new_content" | sed 's/#000000/var(--color-black)/g')
        new_content=$(echo "$new_content" | sed 's/#000/var(--color-black)/g')
        new_content=$(echo "$new_content" | sed 's/"black"/"var(--color-black)"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Primary blue colors (common in the app)
    if echo "$new_content" | grep -q '#3[Bb]82[Ff]6\|#1877[Ff]2\|#2563[Ee][Bb]'; then
        echo "  ✅ Fixed: Primary blue colors"
        new_content=$(echo "$new_content" | sed 's/#3[Bb]82[Ff]6/var(--color-primary-500)/g')
        new_content=$(echo "$new_content" | sed 's/#1877[Ff]2/var(--color-primary-600)/g')
        new_content=$(echo "$new_content" | sed 's/#2563[Ee][Bb]/var(--color-primary-600)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Dark gray/slate colors
    if echo "$new_content" | grep -q '#1[Ee]293[Bb]\|#374151\|#4[Bb]5563'; then
        echo "  ✅ Fixed: Dark gray colors"
        new_content=$(echo "$new_content" | sed 's/#1[Ee]293[Bb]/var(--color-gray-800)/g')
        new_content=$(echo "$new_content" | sed 's/#374151/var(--color-gray-700)/g')
        new_content=$(echo "$new_content" | sed 's/#4[Bb]5563/var(--color-gray-600)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Success green colors
    if echo "$new_content" | grep -q '#22[Cc]55[Ee]\|#16[Aa]34[Aa]\|#15803[Dd]'; then
        echo "  ✅ Fixed: Success green colors"
        new_content=$(echo "$new_content" | sed 's/#22[Cc]55[Ee]/var(--color-success-500)/g')
        new_content=$(echo "$new_content" | sed 's/#16[Aa]34[Aa]/var(--color-success-600)/g')
        new_content=$(echo "$new_content" | sed 's/#15803[Dd]/var(--color-success-700)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Error red colors
    if echo "$new_content" | grep -q '#[Ee][Ff]4444\|#[Dd][Cc]2626\|#[Bb]91[Cc]1[Cc]'; then
        echo "  ✅ Fixed: Error red colors"
        new_content=$(echo "$new_content" | sed 's/#[Ee][Ff]4444/var(--color-error-500)/g')
        new_content=$(echo "$new_content" | sed 's/#[Dd][Cc]2626/var(--color-error-600)/g')
        new_content=$(echo "$new_content" | sed 's/#[Bb]91[Cc]1[Cc]/var(--color-error-700)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Warning orange colors
    if echo "$new_content" | grep -q '#[Ff]59[Ee]0[Bb]\|#[Dd]97706\|#[Aa]76503'; then
        echo "  ✅ Fixed: Warning orange colors"
        new_content=$(echo "$new_content" | sed 's/#[Ff]59[Ee]0[Bb]/var(--color-warning-500)/g')
        new_content=$(echo "$new_content" | sed 's/#[Dd]97706/var(--color-warning-600)/g')
        new_content=$(echo "$new_content" | sed 's/#[Aa]76503/var(--color-warning-700)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Light gray colors
    if echo "$new_content" | grep -q '#[Ff]3[Ff]4[Ff]6\|#[Ee]5[Ee]7[Ee][Bb]\|#[Dd]1[Dd]5[Dd][Bb]'; then
        echo "  ✅ Fixed: Light gray colors"
        new_content=$(echo "$new_content" | sed 's/#[Ff]3[Ff]4[Ff]6/var(--color-gray-100)/g')
        new_content=$(echo "$new_content" | sed 's/#[Ee]5[Ee]7[Ee][Bb]/var(--color-gray-200)/g')
        new_content=$(echo "$new_content" | sed 's/#[Dd]1[Dd]5[Dd][Bb]/var(--color-gray-300)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Tailwind arbitrary values [#hex] → CSS variables
    if echo "$new_content" | grep -q 'text-\[#[0-9A-Fa-f]\{6\}\]\|bg-\[#[0-9A-Fa-f]\{6\}\]\|border-\[#[0-9A-Fa-f]\{6\}\]'; then
        echo "  ✅ Fixed: Tailwind arbitrary color values"
        # Replace common Tailwind arbitrary patterns
        new_content=$(echo "$new_content" | sed 's/text-\[#[Ff][Ff][Ff][Ff][Ff][Ff]\]/text-white/g')
        new_content=$(echo "$new_content" | sed 's/text-\[#000000\]/text-black/g')
        new_content=$(echo "$new_content" | sed 's/text-\[#3[Bb]82[Ff]6\]/text-primary-500/g')
        new_content=$(echo "$new_content" | sed 's/bg-\[#[Ff][Ff][Ff][Ff][Ff][Ff]\]/bg-white/g')
        new_content=$(echo "$new_content" | sed 's/bg-\[#000000\]/bg-black/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Save changes if any were made
    if [ "$changes_made" = true ]; then
        echo "$new_content" > "$file"
        local original_hex_count=$(echo "$original_content" | grep -o '#[0-9A-Fa-f]\{3,6\}' | wc -l)
        local new_hex_count=$(echo "$new_content" | grep -o '#[0-9A-Fa-f]\{3,6\}' | wc -l)
        echo "  💾 File updated: $original_hex_count → $new_hex_count hardcoded colors"
    else
        echo "  ⏭️  No common hardcoded colors found"
    fi
    
    ((total_count++))
}

# Function để fix colors trong CSS files
fix_css_colors() {
    local file="$1"
    local original_content
    local new_content
    local changes_made=false
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "🎨 Processing CSS: $(basename "$file")"
    original_content=$(cat "$file")
    new_content="$original_content"
    
    # Fix common CSS color properties
    if echo "$new_content" | grep -q 'color:\s*#[0-9A-Fa-f]\{3,6\}\|background-color:\s*#[0-9A-Fa-f]\{3,6\}\|border-color:\s*#[0-9A-Fa-f]\{3,6\}'; then
        echo "  ✅ Fixed: CSS color properties"
        # Replace in CSS properties
        new_content=$(echo "$new_content" | sed 's/color:\s*#[Ff][Ff][Ff][Ff][Ff][Ff]/color: var(--color-white)/g')
        new_content=$(echo "$new_content" | sed 's/color:\s*#000000/color: var(--color-black)/g')
        new_content=$(echo "$new_content" | sed 's/background-color:\s*#[Ff][Ff][Ff][Ff][Ff][Ff]/background-color: var(--color-white)/g')
        new_content=$(echo "$new_content" | sed 's/background-color:\s*#000000/background-color: var(--color-black)/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Save changes if any were made
    if [ "$changes_made" = true ]; then
        echo "$new_content" > "$file"
        echo "  💾 CSS file updated with design system colors"
    else
        echo "  ⏭️  No fixable CSS colors found"
    fi
    
    ((total_count++))
}

# Find files với hardcoded colors
echo "🔍 Finding files with hardcoded colors..."

# Process TSX/JSX files
tsx_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -l '#[0-9A-Fa-f]\{3,6\}' | head -15)

if [ ! -z "$tsx_files" ]; then
    echo "📂 Found $(echo "$tsx_files" | wc -l) TSX/JSX files with hardcoded colors"
    echo ""
    
    echo "$tsx_files" | while read -r file; do
        fix_hardcoded_colors "$file"
        echo ""
    done
fi

# Process CSS files
css_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" | xargs grep -l '#[0-9A-Fa-f]\{3,6\}' | head -10)

if [ ! -z "$css_files" ]; then
    echo "📂 Found $(echo "$css_files" | wc -l) CSS files with hardcoded colors"
    echo ""
    
    echo "$css_files" | while read -r file; do
        fix_css_colors "$file"
        echo ""
    done
fi

echo "📊 PHASE 2 SUMMARY"
echo "=================="
echo "📁 Files processed: $total_count"
echo "🎨 Color fixes applied: $fixed_count"
echo "💾 Backup location: $BACKUP_DIR"
echo ""

# Run validation again
echo "🔍 Running validation to check improvement..."
remaining_colors=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" -o -name "*.css" | xargs grep -o '#[0-9A-Fa-f]\{3,6\}' | wc -l)
echo "📈 Remaining hardcoded colors: $remaining_colors"

if [ "$remaining_colors" -lt 300 ]; then
    echo "🎉 Excellent progress! Significantly reduced hardcoded colors"
elif [ "$remaining_colors" -lt 400 ]; then
    echo "✅ Good progress! Color migration showing results"
else
    echo "⚠️  More work needed. Consider reviewing complex color usage"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Review color changes for visual consistency"
echo "2. Test color themes và dark mode compatibility"
echo "3. Run Phase 3: Typography component migration"
echo "4. Continue with spacing violations fix"
echo ""
echo "🚀 Ready for next phase: ./scripts/phase3-typography-migration.sh"
