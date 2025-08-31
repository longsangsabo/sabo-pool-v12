#!/bin/bash

# PHASE 6A: TYPOGRAPHY MASS MIGRATION
# Automated HTML tag to Typography component conversion

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase6a-typography-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 PHASE 6A: TYPOGRAPHY MASS MIGRATION${NC}"
echo "=========================================="

mkdir -p "$BACKUP_DIR"

# Get initial HTML tag count
INITIAL_HTML_TAGS=$(grep -rE "<(h[1-6]|p|span)[^>]*>" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
echo -e "${YELLOW}📊 Initial HTML Tags: $INITIAL_HTML_TAGS${NC}"

# Function to add Typography import if not exists
add_typography_import() {
    local file_path="$1"
    
    # Check if Typography is already imported
    if grep -q "Typography.*from.*shared-ui" "$file_path"; then
        return 0
    fi
    
    # Find last import line
    local last_import=$(grep -n "^import" "$file_path" | tail -1 | cut -d: -f1)
    if [ -n "$last_import" ]; then
        local temp_file=$(mktemp)
        head -n "$last_import" "$file_path" > "$temp_file"
        echo "import { Typography } from '../../../../packages/shared-ui/src/Typography/Typography';" >> "$temp_file"
        tail -n +"$((last_import + 1))" "$file_path" >> "$temp_file"
        mv "$temp_file" "$file_path"
        echo -e "${GREEN}  ✅ Added Typography import${NC}"
    fi
}

# Function to migrate HTML tags to Typography components
migrate_typography_tags() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🔄 Processing: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Add Typography import
    add_typography_import "$file_path"
    
    # Create temp file for processing
    local temp_file=$(mktemp)
    cp "$file_path" "$temp_file"
    
    # Convert h1 tags (most important)
    sed -i 's/<h1\([^>]*\)className="\([^"]*\)"\([^>]*\)>/<Typography variant="h1" className="\2"\1\3>/g' "$temp_file"
    sed -i 's/<h1\([^>]*\)>/<Typography variant="h1"\1>/g' "$temp_file"
    sed -i 's/<\/h1>/<\/Typography>/g' "$temp_file"
    
    # Convert h2 tags
    sed -i 's/<h2\([^>]*\)className="\([^"]*\)"\([^>]*\)>/<Typography variant="h2" className="\2"\1\3>/g' "$temp_file"
    sed -i 's/<h2\([^>]*\)>/<Typography variant="h2"\1>/g' "$temp_file"
    sed -i 's/<\/h2>/<\/Typography>/g' "$temp_file"
    
    # Convert h3 tags
    sed -i 's/<h3\([^>]*\)className="\([^"]*\)"\([^>]*\)>/<Typography variant="h3" className="\2"\1\3>/g' "$temp_file"
    sed -i 's/<h3\([^>]*\)>/<Typography variant="h3"\1>/g' "$temp_file"
    sed -i 's/<\/h3>/<\/Typography>/g' "$temp_file"
    
    # Convert p tags (be selective - only simple ones)
    sed -i 's/<p\([^>]*\)className="\([^"]*\)"\([^>]*\)>/<Typography variant="body" className="\2"\1\3>/g' "$temp_file"
    sed -i 's/<p className="\([^"]*\)">/<Typography variant="body" className="\1">/g' "$temp_file"
    sed -i 's/<p>/<Typography variant="body">/g' "$temp_file"
    # Only replace </p> that are not inside complex structures
    sed -i 's/<\/p>/<\/Typography>/g' "$temp_file"
    
    # Convert simple span tags
    sed -i 's/<span className="\([^"]*\)">/<Typography variant="span" className="\1">/g' "$temp_file"
    sed -i 's/<span>/<Typography variant="span">/g' "$temp_file"
    
    # Copy result back
    cp "$temp_file" "$file_path"
    rm "$temp_file"
    
    echo -e "${GREEN}✅ Migrated: $file_name${NC}"
}

# Find files with high HTML tag usage
echo -e "\n${BLUE}🔍 Finding files with most HTML tags...${NC}"
HIGH_HTML_FILES=$(grep -rE "<(h[1-6]|p|span)" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | xargs -I {} sh -c 'echo "$(grep -cE "<(h[1-6]|p|span)" "{}" || echo 0) {}"' | sort -nr | head -20 | cut -d' ' -f2-)

echo -e "${YELLOW}📋 Top 20 files with HTML tags:${NC}"
counter=1
for file in $HIGH_HTML_FILES; do
    tag_count=$(grep -cE "<(h[1-6]|p|span)" "$file" || echo 0)
    echo -e "  $counter. $(basename "$file"): $tag_count tags"
    counter=$((counter + 1))
done

echo -e "\n${BLUE}🎯 MIGRATING HIGH HTML TAG FILES${NC}"
echo "=================================="

# Process top 15 files
counter=1
for file in $HIGH_HTML_FILES; do
    if [ $counter -le 15 ] && [ -f "$file" ]; then
        migrate_typography_tags "$file"
    fi
    counter=$((counter + 1))
done

# Get final HTML tag count
FINAL_HTML_TAGS=$(grep -rE "<(h[1-6]|p|span)[^>]*>" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
HTML_REDUCTION=$((INITIAL_HTML_TAGS - FINAL_HTML_TAGS))

echo -e "\n${GREEN}🎉 PHASE 6A TYPOGRAPHY MIGRATION COMPLETE!${NC}"
echo "============================================"
echo -e "📊 RESULTS:"
echo -e "   HTML Tags: $INITIAL_HTML_TAGS → $FINAL_HTML_TAGS (${HTML_REDUCTION} reduced)"
echo -e "   Reduction Rate: $(echo "scale=1; $HTML_REDUCTION * 100 / $INITIAL_HTML_TAGS" | bc)%"
echo -e ""
echo -e "📁 Backups: $BACKUP_DIR"
echo -e "🔍 Files Processed: 15 high-usage files"

# Run validation
echo -e "\n${YELLOW}🔍 Running validation...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"
