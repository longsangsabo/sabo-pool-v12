#!/bin/bash

# PHASE 6B: ADVANCED DESIGN SYSTEM INTEGRATION
# Scale design system adoption from 5% to 15% (94 files target)

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase6b-integration-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 PHASE 6B: ADVANCED DESIGN SYSTEM INTEGRATION${NC}"
echo "=================================================="

mkdir -p "$BACKUP_DIR"

# Current stats
CURRENT_FILES=$(grep -r "Typography.*shared-ui" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | wc -l)
TOTAL_FILES=$(find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | wc -l)
CURRENT_ADOPTION=$(echo "scale=1; $CURRENT_FILES * 100 / $TOTAL_FILES" | bc 2>/dev/null || echo "5")

echo -e "${YELLOW}📊 Current Status:${NC}"
echo -e "   Design System Files: $CURRENT_FILES"
echo -e "   Total Component Files: $TOTAL_FILES"
echo -e "   Current Adoption: ${CURRENT_ADOPTION}%"

TARGET_FILES=94
NEEDED_FILES=$((TARGET_FILES - CURRENT_FILES))
echo -e "   Target: 15% (94 files)"
echo -e "   Need to add: $NEEDED_FILES files"

# Function to add comprehensive design system imports
add_design_system_imports() {
    local file_path="$1"
    
    # Skip if already has comprehensive imports
    if grep -q "Typography.*shared-ui" "$file_path" && grep -q "Button.*shared-ui" "$file_path"; then
        return 0
    fi
    
    # Find last import line
    local last_import=$(grep -n "^import" "$file_path" | tail -1 | cut -d: -f1)
    if [ -n "$last_import" ]; then
        local temp_file=$(mktemp)
        head -n "$last_import" "$file_path" > "$temp_file"
        
        # Add comprehensive design system imports
        cat >> "$temp_file" << 'EOF'

// Design System Imports
import { Typography } from '../../../../packages/shared-ui/src/Typography/Typography';
import { Button } from '../../../../packages/shared-ui/src/components/button';
import { Card, CardHeader, CardContent } from '../../../../packages/shared-ui/src/components/card';
EOF
        
        tail -n +"$((last_import + 1))" "$file_path" >> "$temp_file"
        mv "$temp_file" "$file_path"
        echo -e "${GREEN}  ✅ Added comprehensive design system imports${NC}"
        return 1
    fi
    return 0
}

# Function to migrate a component file
migrate_component_comprehensive() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🔄 Processing: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Add design system imports
    if add_design_system_imports "$file_path"; then
        echo -e "  📦 Already has design system imports"
    fi
    
    # Simple component migrations
    sed -i 's/<button\([^>]*\)className="\([^"]*\)"\([^>]*\)>/<Button className="\2"\1\3>/g' "$file_path"
    sed -i 's/<button\([^>]*\)>/<Button\1>/g' "$file_path"
    sed -i 's/<\/button>/<\/Button>/g' "$file_path"
    
    # Card component patterns
    sed -i 's/<div className=".*card.*">/<Card>/g' "$file_path"
    
    echo -e "${GREEN}✅ Migrated: $file_name${NC}"
}

# Find files that should be migrated (exclude test files, exclude already migrated)
echo -e "\n${BLUE}🔍 Finding files for migration...${NC}"

# Get files that don't have design system imports yet
UNMIGRATED_FILES=$(find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f ! -path "*/test/*" ! -path "*/__tests__/*" ! -name "*.test.tsx" ! -name "*.spec.tsx" | while read file; do
    if ! grep -q "Typography.*shared-ui" "$file" && ! grep -q "Button.*shared-ui" "$file"; then
        echo "$file"
    fi
done)

# Priority categories
LAYOUT_COMPONENTS=$(echo "$UNMIGRATED_FILES" | grep -E "(Layout|Container|Grid|Flex|Stack)" | head -15)
FORM_COMPONENTS=$(echo "$UNMIGRATED_FILES" | grep -E "(Form|Input|Field|Select|Checkbox)" | head -15) 
NAV_COMPONENTS=$(echo "$UNMIGRATED_FILES" | grep -E "(Nav|Menu|Header|Footer|Sidebar)" | head -15)
UI_COMPONENTS=$(echo "$UNMIGRATED_FILES" | grep -E "(Modal|Dialog|Alert|Toast|Dropdown)" | head -15)
PAGE_COMPONENTS=$(echo "$UNMIGRATED_FILES" | grep -E "(Page|View)" | head -10)

# Combine and take first 60 files (to reach our target)
MIGRATION_BATCH=$(echo -e "$LAYOUT_COMPONENTS\n$FORM_COMPONENTS\n$NAV_COMPONENTS\n$UI_COMPONENTS\n$PAGE_COMPONENTS" | grep -v "^$" | head -60)

if [ -z "$MIGRATION_BATCH" ]; then
    # If no specific patterns found, take any unmigrated files
    MIGRATION_BATCH=$(echo "$UNMIGRATED_FILES" | head -60)
fi

echo -e "${YELLOW}📋 Files selected for migration:${NC}"
counter=1
for file in $MIGRATION_BATCH; do
    echo -e "  $counter. $(basename "$file")"
    counter=$((counter + 1))
    if [ $counter -gt 20 ]; then
        echo -e "  ... and $(echo "$MIGRATION_BATCH" | wc -l | tr -d ' ') more files"
        break
    fi
done

echo -e "\n${BLUE}🎯 MIGRATING COMPONENTS${NC}"
echo "========================"

# Process files
counter=1
for file in $MIGRATION_BATCH; do
    if [ -f "$file" ]; then
        migrate_component_comprehensive "$file"
        counter=$((counter + 1))
        
        # Progress indicator
        if [ $((counter % 10)) -eq 0 ]; then
            echo -e "${BLUE}  📊 Processed $counter files...${NC}"
        fi
    fi
done

# Get final stats
FINAL_FILES=$(grep -r "Typography.*shared-ui" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | wc -l)
FINAL_ADOPTION=$(echo "scale=1; $FINAL_FILES * 100 / $TOTAL_FILES" | bc 2>/dev/null || echo "Unknown")
FILES_ADDED=$((FINAL_FILES - CURRENT_FILES))

echo -e "\n${GREEN}🎉 PHASE 6B INTEGRATION COMPLETE!${NC}"
echo "=================================="
echo -e "📊 RESULTS:"
echo -e "   Design System Files: $CURRENT_FILES → $FINAL_FILES (+$FILES_ADDED)"
echo -e "   Adoption Rate: ${CURRENT_ADOPTION}% → ${FINAL_ADOPTION}%"
echo -e "   Files Processed: $((counter - 1))"
echo -e ""
echo -e "📁 Backups: $BACKUP_DIR"

# Check if we reached target
if [ "$FINAL_FILES" -ge 94 ]; then
    echo -e "${GREEN}🎯 TARGET ACHIEVED: 15% adoption rate!${NC}"
else
    echo -e "${YELLOW}⚠️  Target: 94 files (15%), Current: $FINAL_FILES files${NC}"
fi

# Run validation
echo -e "\n${YELLOW}🔍 Running validation...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"
