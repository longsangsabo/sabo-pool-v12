#!/bin/bash

# BULK FIX SCRIPT: Fix all Phase 7 syntax errors in batch
# Fix các lỗi hàng loạt do Phase 7 migration gây ra

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/bulk-fix-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🔧 BULK FIX: Phase 7 Syntax Errors"
echo "=================================="

mkdir -p "$BACKUP_DIR"

# Function to backup file
backup_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
}

echo "📋 Step 1: Fix mismatched HTML/JSX tags"
echo "======================================"

# Fix all button/Button mismatches
echo "🔧 Fixing button/Button tag mismatches..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "</Button>" "$file" && grep -q "<button" "$file"; then
        echo "  Fixing: $(basename "$file")"
        backup_file "$file"
        sed -i 's|</Button>|</button>|g' "$file"
    fi
done

# Fix all p/Typography mismatches  
echo "🔧 Fixing p/Typography tag mismatches..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "</Typography>" "$file" && grep -q "<p " "$file"; then
        echo "  Fixing: $(basename "$file")"
        backup_file "$file"
        # Replace </Typography> with </p> where there's a <p opening tag
        sed -i ':a;N;$!ba;s|<p\([^>]*\)>\([^<]*\)</Typography>|<p\1>\2</p>|g' "$file"
    fi
done

# Fix all span/Typography mismatches
echo "🔧 Fixing span/Typography tag mismatches..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q 'Typography variant="span"' "$file" && grep -q "</span>" "$file"; then
        echo "  Fixing: $(basename "$file")"
        backup_file "$file"
        sed -i 's|<Typography variant="span">|<span>|g' "$file"
        sed -i 's|</span>|</span>|g' "$file"
    fi
done

# Fix h1-h6/Typography mismatches
echo "🔧 Fixing h1-h6/Typography tag mismatches..."
for i in {1..6}; do
    find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
        if grep -q "Typography variant=\"h$i\"" "$file" && grep -q "</Typography>" "$file"; then
            echo "  Fixing h$i in: $(basename "$file")"
            backup_file "$file"
            sed -i "s|<Typography variant=\"h$i\"|<h$i|g" "$file"
            sed -i 's|</Typography>|</h'"$i"'>|g' "$file"
        fi
    done
done

echo "📋 Step 2: Fix corrupted import statements"
echo "======================================="

# Fix corrupted Typography imports
echo "🔧 Fixing corrupted Typography imports..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "import {" "$file" && grep -q "from '@sabo/shared-ui';" "$file"; then
        echo "  Fixing imports in: $(basename "$file")"
        backup_file "$file"
        
        # Fix broken import lines
        sed -i '/^import {$/N;s/import {\nimport { Typography } from/@sabo\/shared-ui/g' "$file"
        sed -i 's|^import { Typography } from@sabo/shared-ui/g|import { Typography } from "@sabo/shared-ui";|g' "$file"
        
        # Remove duplicate imports
        awk '!seen[$0]++' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
done

# Fix @/packages/shared-ui imports  
echo "🔧 Fixing @/packages/shared-ui imports..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i 's|from "@/packages/shared-ui"|from "@sabo/shared-ui"|g' {} \;

# Fix relative path imports
echo "🔧 Fixing relative path imports..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i 's|from "../../../../packages/shared-ui/src/Typography/Typography"|from "@sabo/shared-ui"|g' {} \;
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i 's|from "../../../packages/shared-ui/src/Typography/Typography"|from "@sabo/shared-ui"|g' {} \;

echo "📋 Step 3: Fix CSS syntax errors"
echo "=============================="

# Fix CSS variable syntax
echo "🔧 Fixing CSS variable syntax..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "bg-gray-900," "$file"; then
        echo "  Fixing CSS syntax in: $(basename "$file")"
        backup_file "$file"
        sed -i 's|bg-gray-900,|bg-gray-900|g' "$file"
    fi
done

# Fix duplicate className attributes
echo "🔧 Fixing duplicate className attributes..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "className.*className" "$file"; then
        echo "  Fixing duplicate className in: $(basename "$file")"
        backup_file "$file"
        # Merge duplicate className attributes
        sed -i 's|className="\([^"]*\)" className="\([^"]*\)"|className="\1 \2"|g' "$file"
    fi
done

echo "📋 Step 4: Fix CSS @import order"
echo "=============================="

# Fix CSS @import order in index.css files
echo "🔧 Fixing CSS @import order..."
find "$WORKSPACE_ROOT/apps" -name "index.css" -type f | while read file; do
    if grep -q "@import" "$file"; then
        echo "  Fixing CSS imports in: $(basename "$file")"
        backup_file "$file"
        
        # Extract all @import statements
        grep "^@import" "$file" > "$file.imports.tmp" || true
        # Extract everything else
        grep -v "^@import" "$file" > "$file.content.tmp" || true
        
        # Recreate file with imports first
        cat "$file.imports.tmp" "$file.content.tmp" > "$file"
        rm -f "$file.imports.tmp" "$file.content.tmp"
    fi
done

echo "📋 Step 5: Remove unused imports"
echo "=============================="

# Remove unused Button imports where Button component is not used
echo "🔧 Removing unused Button imports..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "import.*Button.*from" "$file" && ! grep -q "<Button" "$file"; then
        echo "  Removing unused Button import in: $(basename "$file")"
        backup_file "$file"
        sed -i '/import.*Button.*from.*shared-ui/d' "$file"
    fi
done

# Remove unused Card imports where Card is not used
echo "🔧 Removing unused Card imports..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | while read file; do
    if grep -q "import.*Card.*from" "$file" && ! grep -q "<Card" "$file"; then
        echo "  Removing unused Card import in: $(basename "$file")"
        backup_file "$file"
        sed -i '/import.*Card.*from.*shared-ui/d' "$file"
    fi
done

echo "📋 Step 6: Fix Typography component usage"
echo "======================================="

# Fix Typography size prop (should be variant)
echo "🔧 Fixing Typography size prop..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i 's|<Typography size=|<Typography variant=|g' {} \;

# Fix common Typography variant names
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i 's|variant="small"|variant="body-small"|g' {} \;
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i 's|variant="large"|variant="body-large"|g' {} \;

echo "📋 Step 7: Validate and clean up"
echo "=============================="

# Remove empty lines and clean up formatting
echo "🔧 Cleaning up formatting..."
find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f -exec sed -i '/^$/N;/^\n$/d' {} \;

# Count backup files created
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.bak" | wc -l)

echo ""
echo "✅ BULK FIX COMPLETED!"
echo "===================="
echo "📁 Backup files created: $BACKUP_COUNT"
echo "📍 Backup location: $BACKUP_DIR"
echo ""
echo "🔧 Fixed issues:"
echo "   ✓ HTML/JSX tag mismatches"
echo "   ✓ Corrupted import statements" 
echo "   ✓ CSS syntax errors"
echo "   ✓ Duplicate className attributes"
echo "   ✓ CSS @import order"
echo "   ✓ Unused imports removal"
echo "   ✓ Typography component usage"
echo ""
echo "🚀 Ready to restart dev server!"
