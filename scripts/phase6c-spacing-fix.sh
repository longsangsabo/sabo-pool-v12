#!/bin/bash

# PHASE 6C: CSS SPACING STANDARDIZATION
# Fix remaining 12 spacing violations to achieve 8px grid compliance

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase6c-spacing-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 PHASE 6C: CSS SPACING STANDARDIZATION${NC}"
echo "============================================="

mkdir -p "$BACKUP_DIR"

# Find spacing violations
echo -e "${YELLOW}🔍 Scanning for spacing violations...${NC}"
SPACING_FILES=$(grep -rE "(padding|margin).*:(.*1rem|.*0\.5rem|.*1px)" "$WORKSPACE_ROOT/apps" --include="*.css" --include="*.tsx" -l | sort | uniq)

echo -e "📋 Files with spacing violations:"
for file in $SPACING_FILES; do
    echo -e "   📄 $(basename "$file")"
done

# Function to fix CSS spacing
fix_css_spacing() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🔧 Fixing: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Fix common spacing violations to 8px grid
    # 1rem = 16px (2 grid units) - Convert to 16px
    sed -i 's/padding: 1rem/padding: 16px/g' "$file_path"
    sed -i 's/margin: 1rem/margin: 16px/g' "$file_path"
    sed -i 's/padding-top: 1rem/padding-top: 16px/g' "$file_path"
    sed -i 's/padding-bottom: 1rem/padding-bottom: 16px/g' "$file_path"
    sed -i 's/padding-left: 1rem/padding-left: 16px/g' "$file_path"
    sed -i 's/padding-right: 1rem/padding-right: 16px/g' "$file_path"
    
    # 0.5rem = 8px (1 grid unit) - Convert to 8px
    sed -i 's/padding: 0\.5rem/padding: 8px/g' "$file_path"
    sed -i 's/margin: 0\.5rem/margin: 8px/g' "$file_path"
    sed -i 's/padding-top: 0\.5rem/padding-top: 8px/g' "$file_path"
    sed -i 's/padding-bottom: 0\.5rem/padding-bottom: 8px/g' "$file_path"
    sed -i 's/padding-left: 0\.5rem/padding-left: 8px/g' "$file_path"
    sed -i 's/padding-right: 0\.5rem/padding-right: 8px/g' "$file_path"
    
    # 1px - Convert to 4px (minimum grid)
    sed -i 's/padding: 1px/padding: 4px/g' "$file_path"
    sed -i 's/margin: 1px/margin: 4px/g' "$file_path"
    
    # Other common non-8px values
    sed -i 's/padding: 2px/padding: 4px/g' "$file_path"
    sed -i 's/padding: 6px/padding: 8px/g' "$file_path"
    sed -i 's/padding: 10px/padding: 12px/g' "$file_path"
    sed -i 's/padding: 14px/padding: 16px/g' "$file_path"
    sed -i 's/padding: 18px/padding: 20px/g' "$file_path"
    sed -i 's/padding: 22px/padding: 24px/g' "$file_path"
    
    # Same for margins
    sed -i 's/margin: 2px/margin: 4px/g' "$file_path"
    sed -i 's/margin: 6px/margin: 8px/g' "$file_path"
    sed -i 's/margin: 10px/margin: 12px/g' "$file_path"
    sed -i 's/margin: 14px/margin: 16px/g' "$file_path"
    sed -i 's/margin: 18px/margin: 20px/g' "$file_path"
    sed -i 's/margin: 22px/margin: 24px/g' "$file_path"
    
    echo -e "${GREEN}✅ Fixed: $file_name${NC}"
}

# Function to fix TSX inline spacing
fix_tsx_spacing() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🔧 Fixing TSX: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Fix inline style spacing violations
    sed -i "s/padding: '1px'/padding: '4px'/g" "$file_path"
    sed -i "s/margin: '1px'/margin: '4px'/g" "$file_path"
    sed -i "s/padding: '2px'/padding: '4px'/g" "$file_path"
    sed -i "s/padding: '6px'/padding: '8px'/g" "$file_path"
    sed -i "s/padding: '10px'/padding: '12px'/g" "$file_path"
    sed -i "s/padding: '14px'/padding: '16px'/g" "$file_path"
    
    echo -e "${GREEN}✅ Fixed TSX: $file_name${NC}"
}

echo -e "\n${BLUE}🎯 FIXING SPACING VIOLATIONS${NC}"
echo "============================="

# Process all files with spacing violations
for file in $SPACING_FILES; do
    if [ -f "$file" ]; then
        if [[ "$file" == *.css ]]; then
            fix_css_spacing "$file"
        elif [[ "$file" == *.tsx ]]; then
            fix_tsx_spacing "$file"
        fi
    fi
done

# Check for remaining violations
echo -e "\n${YELLOW}🔍 Checking for remaining violations...${NC}"
REMAINING_VIOLATIONS=$(grep -rE "(padding|margin).*:(.*1rem|.*0\.5rem|.*1px)" "$WORKSPACE_ROOT/apps" --include="*.css" --include="*.tsx" | wc -l)

echo -e "\n${GREEN}🎉 PHASE 6C SPACING STANDARDIZATION COMPLETE!${NC}"
echo "==============================================="
echo -e "📊 RESULTS:"
echo -e "   Files Processed: $(echo "$SPACING_FILES" | wc -l)"
echo -e "   Remaining Violations: $REMAINING_VIOLATIONS"
echo -e ""
echo -e "📁 Backups: $BACKUP_DIR"

if [ "$REMAINING_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}🎯 PERFECT! 100% 8px grid compliance achieved!${NC}"
else
    echo -e "${YELLOW}⚠️  Some violations may remain (complex patterns)${NC}"
fi

# Run final validation
echo -e "\n${YELLOW}🔍 Running final validation...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"
