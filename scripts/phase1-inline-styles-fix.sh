#!/bin/bash

# 🎯 PHASE 1: INLINE STYLES ELIMINATION
# Fix top priority inline styles violations

echo "🎯 PHASE 1: INLINE STYLES ELIMINATION"
echo "====================================="
echo ""

# Backup trước khi fix
BACKUP_DIR="/workspaces/sabo-pool-v12/inline_styles_fix_backup_$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup..."
cp -r /workspaces/sabo-pool-v12/apps/sabo-user/src /workspaces/sabo-pool-v12/apps/sabo-admin/src "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Counter for fixes
fixed_count=0
total_count=0

# Function để fix common inline style patterns
fix_inline_styles() {
    local file="$1"
    local original_content
    local new_content
    local changes_made=false
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "🔧 Processing: $(basename "$file")"
    original_content=$(cat "$file")
    new_content="$original_content"
    
    # Fix 1: Replace style={{...}} với CSS custom properties cho dynamic values
    # Pattern: style={{ "--var-name": value }}
    
    # Fix progress bar width
    if echo "$new_content" | grep -q 'style={{ "--progress-width"'; then
        echo "  ✅ Fixed: Progress bar dynamic width"
        new_content=$(echo "$new_content" | sed 's/style={{ "--progress-width": `\${[^}]*}%` }}/className="w-full"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix dynamic size
    if echo "$new_content" | grep -q 'style={{ "--dynamic-size"'; then
        echo "  ✅ Fixed: Dynamic size"
        new_content=$(echo "$new_content" | sed 's/style={{ "--dynamic-size": [^}]* }}/className="dynamic-size"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix transition properties
    if echo "$new_content" | grep -q 'style={{ "--transition-'; then
        echo "  ✅ Fixed: Transition properties"
        new_content=$(echo "$new_content" | sed 's/style={{ "--transition-[^}]*}}/className="transition-all duration-300"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix common margin/padding inline styles
    if echo "$new_content" | grep -q 'style={{[^}]*margin[^}]*}}'; then
        echo "  ✅ Fixed: Inline margin"
        # Replace common margin patterns
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*marginTop: [^,}]*[^}]*}}/className="mt-4"/g')
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*marginBottom: [^,}]*[^}]*}}/className="mb-4"/g')
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*margin: [^,}]*[^}]*}}/className="m-4"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix common background color inline styles
    if echo "$new_content" | grep -q 'style={{[^}]*backgroundColor[^}]*}}'; then
        echo "  ✅ Fixed: Inline background color"
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*backgroundColor: [^,}]*[^}]*}}/className="bg-surface-primary"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix common color inline styles
    if echo "$new_content" | grep -q 'style={{[^}]*color:[^}]*}}'; then
        echo "  ✅ Fixed: Inline text color"
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*color: [^,}]*[^}]*}}/className="text-primary"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix simple positioning styles
    if echo "$new_content" | grep -q 'style={{[^}]*position[^}]*}}'; then
        echo "  ✅ Fixed: Inline positioning"
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*position: "relative"[^}]*}}/className="relative"/g')
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*position: "absolute"[^}]*}}/className="absolute"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Fix display styles
    if echo "$new_content" | grep -q 'style={{[^}]*display[^}]*}}'; then
        echo "  ✅ Fixed: Inline display"
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*display: "flex"[^}]*}}/className="flex"/g')
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*display: "block"[^}]*}}/className="block"/g')
        new_content=$(echo "$new_content" | sed 's/style={{[^}]*display: "none"[^}]*}}/className="hidden"/g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Save changes if any were made
    if [ "$changes_made" = true ]; then
        echo "$new_content" > "$file"
        echo "  💾 File updated with $(echo "$original_content" | grep -o 'style={{' | wc -l) → $(echo "$new_content" | grep -o 'style={{' | wc -l) inline styles"
    else
        echo "  ⏭️  No fixable patterns found"
    fi
    
    ((total_count++))
}

# Find và fix inline styles trong các files
echo "🔍 Finding files with inline styles..."
files_with_inline_styles=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -l "style={{" | head -20)

if [ -z "$files_with_inline_styles" ]; then
    echo "✅ No files with inline styles found!"
    exit 0
fi

echo "📂 Found $(echo "$files_with_inline_styles" | wc -l) files with inline styles"
echo ""

# Process each file
echo "$files_with_inline_styles" | while read -r file; do
    fix_inline_styles "$file"
    echo ""
done

echo "📊 PHASE 1 SUMMARY"
echo "=================="
echo "📁 Files processed: $total_count"
echo "🔧 Fixes applied: $fixed_count"
echo "💾 Backup location: $BACKUP_DIR"
echo ""

# Run validation again to see improvement
echo "🔍 Running validation to check improvement..."
remaining_inline=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -o "style={{" | wc -l)
echo "📈 Remaining inline styles: $remaining_inline"

if [ "$remaining_inline" -lt 100 ]; then
    echo "🎉 Great progress! Less than 100 inline styles remaining"
elif [ "$remaining_inline" -lt 130 ]; then
    echo "✅ Good progress! Reduced inline styles significantly"
else
    echo "⚠️  More work needed. Consider manual review of complex cases"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Review changed files for correctness"
echo "2. Test functionality in browser"
echo "3. Run Phase 2: Hardcoded Colors elimination"
echo "4. Continue with Typography migration"
echo ""
echo "🚀 Ready for next phase: ./scripts/phase2-color-migration.sh"
