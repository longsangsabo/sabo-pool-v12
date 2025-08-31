#!/bin/bash

# PHASE 5: COMPONENT ADOPTION MIGRATION SCRIPT
# Auto-migration tool for design system component adoption

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase5-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PHASE 5: COMPONENT ADOPTION MIGRATION${NC}"
echo "=================================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to backup file
backup_file() {
    local file_path="$1"
    local backup_path="$BACKUP_DIR/$(basename "$file_path")_$TIMESTAMP.bak"
    cp "$file_path" "$backup_path"
    echo -e "${GREEN}✅ Backed up: $file_path${NC}"
}

# Function to add design system imports
add_design_system_imports() {
    local file_path="$1"
    
    # Check if file already has design system imports
    if grep -q "from.*packages/shared-ui" "$file_path"; then
        echo -e "${YELLOW}⚠️  File already has design system imports: $file_path${NC}"
        return 0
    fi
    
    # Add imports after existing imports
    local temp_file=$(mktemp)
    
    # Find the last import line
    local last_import_line=$(grep -n "^import" "$file_path" | tail -1 | cut -d: -f1)
    
    if [ -n "$last_import_line" ]; then
        # Insert design system imports after the last import
        head -n "$last_import_line" "$file_path" > "$temp_file"
        cat >> "$temp_file" << 'EOF'

// Design System Imports
import { Button, Card, Typography, Container, Stack } from '@/packages/shared-ui';
import { cn } from '@/packages/shared-utils';
EOF
        tail -n +"$((last_import_line + 1))" "$file_path" >> "$temp_file"
        mv "$temp_file" "$file_path"
        echo -e "${GREEN}✅ Added design system imports to: $file_path${NC}"
    else
        echo -e "${RED}❌ No imports found in: $file_path${NC}"
    fi
}

# Function to replace common inline styles with classes
replace_inline_styles() {
    local file_path="$1"
    
    echo -e "${BLUE}🔄 Processing inline styles in: $file_path${NC}"
    
    # Replace common padding patterns
    sed -i "s/style={{.*padding: '20px'.*}}/className=\"p-5\"/g" "$file_path"
    sed -i "s/style={{.*padding: '30px'.*}}/className=\"p-8\"/g" "$file_path"
    sed -i "s/style={{.*marginBottom: '20px'.*}}/className=\"mb-5\"/g" "$file_path"
    sed -i "s/style={{.*marginBottom: '30px'.*}}/className=\"mb-8\"/g" "$file_path"
    sed -i "s/style={{.*marginBottom: '40px'.*}}/className=\"mb-10\"/g" "$file_path"
    
    # Replace display patterns
    sed -i "s/style={{.*display: 'flex'.*}}/className=\"flex\"/g" "$file_path"
    sed -i "s/style={{.*justifyContent: 'center'.*}}/className=\"justify-center\"/g" "$file_path"
    sed -i "s/style={{.*textAlign: 'center'.*}}/className=\"text-center\"/g" "$file_path"
    
    # Replace color patterns
    sed -i "s/style={{.*color: '#1f2937'.*}}/className=\"text-gray-800\"/g" "$file_path"
    sed -i "s/style={{.*color: '#f1f1f1'.*}}/className=\"text-gray-100\"/g" "$file_path"
    
    echo -e "${GREEN}✅ Processed inline styles in: $file_path${NC}"
}

# Function to convert HTML tags to Typography components
convert_to_typography_components() {
    local file_path="$1"
    
    echo -e "${BLUE}🔄 Converting HTML tags to Typography components in: $file_path${NC}"
    
    # Convert h1 tags
    sed -i 's/<h1\([^>]*\)>/<Typography variant="h1"\1>/g' "$file_path"
    sed -i 's/<\/h1>/<\/Typography>/g' "$file_path"
    
    # Convert h2 tags
    sed -i 's/<h2\([^>]*\)>/<Typography variant="h2"\1>/g' "$file_path"
    sed -i 's/<\/h2>/<\/Typography>/g' "$file_path"
    
    # Convert p tags (be more selective)
    sed -i 's/<p\([^>]*\)>/<Typography variant="body"\1>/g' "$file_path"
    sed -i 's/<\/p>/<\/Typography>/g' "$file_path"
    
    echo -e "${GREEN}✅ Converted HTML tags in: $file_path${NC}"
}

# Main migration function
migrate_component() {
    local file_path="$1"
    
    echo -e "\n${YELLOW}📝 Migrating: $file_path${NC}"
    
    # Backup original file
    backup_file "$file_path"
    
    # Add design system imports
    add_design_system_imports "$file_path"
    
    # Replace inline styles
    replace_inline_styles "$file_path"
    
    # Convert to Typography components
    convert_to_typography_components "$file_path"
    
    echo -e "${GREEN}✅ Migration completed: $file_path${NC}"
}

# Priority 1: High inline style files
PRIORITY_1_FILES=(
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/pages/SABOStyleTestPage.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/RankColorReference.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/pages/RankTestPage.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/dark-card-avatar.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/card-avatar.tsx"
)

echo -e "\n${BLUE}🎯 PRIORITY 1: High Inline Style Files${NC}"
echo "========================================"

for file in "${PRIORITY_1_FILES[@]}"; do
    if [ -f "$file" ]; then
        migrate_component "$file"
    else
        echo -e "${RED}❌ File not found: $file${NC}"
    fi
done

# Run validation after Priority 1
echo -e "\n${YELLOW}🔍 Running validation after Priority 1...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"

echo -e "\n${GREEN}🎉 PHASE 5 PRIORITY 1 MIGRATION COMPLETED!${NC}"
echo "============================================="
echo -e "📁 Backups saved in: $BACKUP_DIR"
echo -e "🔍 Run validation to see improvements"
echo -e "📖 Check files for any manual adjustments needed"
