#!/bin/bash

# 📝 PHASE 3: TYPOGRAPHY COMPONENT MIGRATION
# Replace raw HTML text tags với Typography component

echo "📝 PHASE 3: TYPOGRAPHY COMPONENT MIGRATION"
echo "=========================================="
echo ""

# Backup trước khi fix
BACKUP_DIR="/workspaces/sabo-pool-v12/typography_migration_fix_backup_$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r /workspaces/sabo-pool-v12/apps/sabo-user/src "$BACKUP_DIR/sabo-user-src" 2>/dev/null
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Counters
fixed_count=0
total_count=0

# Function để add Typography import nếu chưa có
add_typography_import() {
    local file="$1"
    local content=$(cat "$file")
    
    # Check if Typography import already exists
    if ! echo "$content" | grep -q "import.*Typography.*from"; then
        # Check if there are other imports
        if echo "$content" | grep -q "^import"; then
            # Add Typography import after existing imports
            local first_import_line=$(echo "$content" | grep -n "^import" | head -1 | cut -d: -f1)
            local import_line="import { Typography } from '@/packages/shared-ui';"
            
            # Insert after first import
            echo "$content" | sed "${first_import_line}a\\
$import_line" > "$file"
            echo "  ✅ Added Typography import"
            return 0
        else
            # Add import at the beginning
            echo "import { Typography } from '@/packages/shared-ui';
$content" > "$file"
            echo "  ✅ Added Typography import at beginning"
            return 0
        fi
    fi
    return 1
}

# Function để migrate typography tags
migrate_typography() {
    local file="$1"
    local original_content
    local new_content
    local changes_made=false
    local import_added=false
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "📝 Processing: $(basename "$file")"
    original_content=$(cat "$file")
    new_content="$original_content"
    
    # Add Typography import if we're going to make changes
    if echo "$new_content" | grep -q '<h[1-6][^>]*>\|<p[^>]*>'; then
        add_typography_import "$file"
        import_added=true
        # Re-read file content after import addition
        new_content=$(cat "$file")
    fi
    
    # Replace h1 tags
    if echo "$new_content" | grep -q '<h1[^>]*>'; then
        echo "  ✅ Migrating h1 tags"
        # Simple h1 replacement
        new_content=$(echo "$new_content" | sed 's|<h1[^>]*>\([^<]*\)</h1>|<Typography variant="heading" size="2xl">\1</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace h2 tags
    if echo "$new_content" | grep -q '<h2[^>]*>'; then
        echo "  ✅ Migrating h2 tags"
        new_content=$(echo "$new_content" | sed 's|<h2[^>]*>\([^<]*\)</h2>|<Typography variant="heading" size="xl">\1</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace h3 tags
    if echo "$new_content" | grep -q '<h3[^>]*>'; then
        echo "  ✅ Migrating h3 tags"
        new_content=$(echo "$new_content" | sed 's|<h3[^>]*>\([^<]*\)</h3>|<Typography variant="heading" size="lg">\1</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace h4 tags
    if echo "$new_content" | grep -q '<h4[^>]*>'; then
        echo "  ✅ Migrating h4 tags"
        new_content=$(echo "$new_content" | sed 's|<h4[^>]*>\([^<]*\)</h4>|<Typography variant="heading" size="md">\1</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace h5 tags
    if echo "$new_content" | grep -q '<h5[^>]*>'; then
        echo "  ✅ Migrating h5 tags"
        new_content=$(echo "$new_content" | sed 's|<h5[^>]*>\([^<]*\)</h5>|<Typography variant="heading" size="sm">\1</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace h6 tags
    if echo "$new_content" | grep -q '<h6[^>]*>'; then
        echo "  ✅ Migrating h6 tags"
        new_content=$(echo "$new_content" | sed 's|<h6[^>]*>\([^<]*\)</h6>|<Typography variant="heading" size="xs">\1</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace simple p tags (without complex attributes)
    if echo "$new_content" | grep -q '<p>\|<p className="[^"]*">'; then
        echo "  ✅ Migrating simple p tags"
        # Replace simple p tags
        new_content=$(echo "$new_content" | sed 's|<p>\([^<]*\)</p>|<Typography variant="body" size="md">\1</Typography>|g')
        # Replace p tags with simple className
        new_content=$(echo "$new_content" | sed 's|<p className="\([^"]*\)">\([^<]*\)</p>|<Typography variant="body" size="md" className="\1">\2</Typography>|g')
        changes_made=true
        ((fixed_count++))
    fi
    
    # Replace common text styling classes với Typography props
    if echo "$new_content" | grep -q 'className="[^"]*text-'; then
        echo "  ✅ Converting text styling classes"
        # Convert text-lg, text-xl etc to size props
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)text-xs\([^"]*\)"|<Typography\1size="xs" className="\2\3"|g')
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)text-sm\([^"]*\)"|<Typography\1size="sm" className="\2\3"|g')
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)text-lg\([^"]*\)"|<Typography\1size="lg" className="\2\3"|g')
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)text-xl\([^"]*\)"|<Typography\1size="xl" className="\2\3"|g')
        
        # Convert font-weight classes
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)font-bold\([^"]*\)"|<Typography\1weight="bold" className="\2\3"|g')
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)font-semibold\([^"]*\)"|<Typography\1weight="semibold" className="\2\3"|g')
        new_content=$(echo "$new_content" | sed 's|<Typography\([^>]*\)className="\([^"]*\)font-medium\([^"]*\)"|<Typography\1weight="medium" className="\2\3"|g')
        
        changes_made=true
    fi
    
    # Save changes if any were made
    if [ "$changes_made" = true ] || [ "$import_added" = true ]; then
        echo "$new_content" > "$file"
        local original_tag_count=$(echo "$original_content" | grep -o '<h[1-6][^>]*>\|<p[^>]*>' | wc -l)
        local new_tag_count=$(echo "$new_content" | grep -o '<h[1-6][^>]*>\|<p[^>]*>' | wc -l)
        echo "  💾 File updated: $original_tag_count → $new_tag_count raw HTML tags"
    else
        echo "  ⏭️  No migratable tags found"
    fi
    
    ((total_count++))
}

# Find files với raw HTML text tags
echo "🔍 Finding files with raw HTML text tags..."
files_with_html_tags=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -l '<h[1-6][^>]*>\|<p[^>]*>' | head -20)

if [ -z "$files_with_html_tags" ]; then
    echo "✅ No files with raw HTML text tags found!"
    exit 0
fi

echo "📂 Found $(echo "$files_with_html_tags" | wc -l) files with raw HTML text tags"
echo ""

# Process each file
echo "$files_with_html_tags" | while read -r file; do
    migrate_typography "$file"
    echo ""
done

echo "📊 PHASE 3 SUMMARY"
echo "=================="
echo "📁 Files processed: $total_count"
echo "📝 Typography migrations applied: $fixed_count"
echo "💾 Backup location: $BACKUP_DIR"
echo ""

# Run validation again
echo "🔍 Running validation to check improvement..."
remaining_tags=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -o '<h[1-6][^>]*>\|<p[^>]*>' | wc -l)
echo "📈 Remaining raw HTML text tags: $remaining_tags"

if [ "$remaining_tags" -lt 1500 ]; then
    echo "🎉 Great progress! Significantly reduced raw HTML tags"
elif [ "$remaining_tags" -lt 1700 ]; then
    echo "✅ Good progress! Typography migration showing results"
else
    echo "⚠️  More work needed. Consider manual review of complex cases"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Review Typography component usage"
echo "2. Test font consistency across pages"
echo "3. Fix any remaining TypeScript errors"
echo "4. Run Phase 4: Spacing violations fix"
echo ""
echo "🚀 Ready for next phase: ./scripts/phase4-spacing-fix.sh"
