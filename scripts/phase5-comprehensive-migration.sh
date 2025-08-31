#!/bin/bash

# PHASE 5: COMPREHENSIVE COMPONENT ADOPTION SCRIPT
# Massive migration for design system adoption

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase5-comprehensive-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 PHASE 5: COMPREHENSIVE COMPONENT ADOPTION${NC}"
echo "=============================================="

# Create backup
mkdir -p "$BACKUP_DIR"

# Get initial metrics
echo -e "${YELLOW}📊 Getting baseline metrics...${NC}"
INITIAL_INLINE=$(grep -r "style=" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
INITIAL_COLORS=$(grep -rE "#[0-9a-fA-F]{3,6}" "$WORKSPACE_ROOT/apps" --include="*.tsx" --include="*.css" | wc -l)
INITIAL_HTML_TAGS=$(grep -rE "<(h[1-6]|p|span|div)[^>]*>" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)

echo -e "📈 Initial State:"
echo -e "   Inline Styles: $INITIAL_INLINE"
echo -e "   Hardcoded Colors: $INITIAL_COLORS" 
echo -e "   HTML Tags: $INITIAL_HTML_TAGS"

# Function to backup and migrate a single file
migrate_file_comprehensive() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🔄 Processing: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Create temp file for processing
    local temp_file=$(mktemp)
    cp "$file_path" "$temp_file"
    
    # 1. Add design system imports (if not exists)
    if ! grep -q "Typography.*shared-ui" "$temp_file"; then
        # Find last import line
        local last_import=$(grep -n "^import" "$temp_file" | tail -1 | cut -d: -f1)
        if [ -n "$last_import" ]; then
            head -n "$last_import" "$temp_file" > "${temp_file}.new"
            echo "" >> "${temp_file}.new"
            echo "// Design System Import" >> "${temp_file}.new"
            echo "import { Typography } from '../../../../packages/shared-ui/src/Typography/Typography';" >> "${temp_file}.new"
            tail -n +"$((last_import + 1))" "$temp_file" >> "${temp_file}.new"
            mv "${temp_file}.new" "$temp_file"
        fi
    fi
    
    # 2. Replace common inline style patterns
    sed -i 's/style={{[^}]*padding: '\''20px'\''[^}]*}}/className="p-5"/g' "$temp_file"
    sed -i 's/style={{[^}]*padding: '\''30px'\''[^}]*}}/className="p-8"/g' "$temp_file"
    sed -i 's/style={{[^}]*marginBottom: '\''20px'\''[^}]*}}/className="mb-5"/g' "$temp_file"
    sed -i 's/style={{[^}]*marginBottom: '\''30px'\''[^}]*}}/className="mb-8"/g' "$temp_file"
    sed -i 's/style={{[^}]*marginBottom: '\''40px'\''[^}]*}}/className="mb-10"/g' "$temp_file"
    sed -i 's/style={{[^}]*display: '\''flex'\''[^}]*}}/className="flex"/g' "$temp_file"
    sed -i 's/style={{[^}]*justifyContent: '\''center'\''[^}]*}}/className="justify-center"/g' "$temp_file"
    sed -i 's/style={{[^}]*textAlign: '\''center'\''[^}]*}}/className="text-center"/g' "$temp_file"
    sed -i 's/style={{[^}]*gap: '\''20px'\''[^}]*}}/className="gap-5"/g' "$temp_file"
    sed -i 's/style={{[^}]*flexWrap: '\''wrap'\''[^}]*}}/className="flex-wrap"/g' "$temp_file"
    
    # 3. Replace color patterns
    sed -i 's/#1f2937/gray-800/g' "$temp_file"
    sed -i 's/#f1f1f1/gray-100/g' "$temp_file"
    sed -i 's/#6b7280/gray-500/g' "$temp_file"
    sed -i 's/color: '\''#1f2937'\''/text-gray-800/g' "$temp_file"
    sed -i 's/color: '\''#f1f1f1'\''/text-gray-100/g' "$temp_file"
    
    # 4. Simple background replacements
    sed -i 's/background: '\''white'\''/bg-white/g' "$temp_file"
    sed -i 's/background: '\''#1a1a1a'\''/bg-gray-900/g' "$temp_file"
    
    # 5. Border radius replacements
    sed -i 's/borderRadius: '\''12px'\''/rounded-xl/g' "$temp_file"
    
    # Copy result back
    cp "$temp_file" "$file_path"
    rm "$temp_file"
    
    echo -e "${GREEN}✅ Migrated: $file_name${NC}"
}

# High priority files (most inline styles)
HIGH_PRIORITY_FILES=(
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/pages/SABOStyleTestPage.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/RankColorReference.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/pages/RankTestPage.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/dark-card-avatar.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/card-avatar.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/pages/DashboardPage.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-admin/src/pages/admin/AdminFinance.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/polaroid-frame.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-admin/src/pages/admin/AdminSystemHealthMonitoring.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/optimized-image.tsx"
)

echo -e "\n${BLUE}🎯 MIGRATING HIGH PRIORITY FILES${NC}"
echo "=================================="

for file in "${HIGH_PRIORITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        migrate_file_comprehensive "$file"
    else
        echo -e "${RED}❌ File not found: $(basename "$file")${NC}"
    fi
done

# Get final metrics
echo -e "\n${YELLOW}📊 Getting final metrics...${NC}"
FINAL_INLINE=$(grep -r "style=" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
FINAL_COLORS=$(grep -rE "#[0-9a-fA-F]{3,6}" "$WORKSPACE_ROOT/apps" --include="*.tsx" --include="*.css" | wc -l)
FINAL_HTML_TAGS=$(grep -rE "<(h[1-6]|p|span|div)[^>]*>" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)

# Calculate improvements
INLINE_REDUCTION=$((INITIAL_INLINE - FINAL_INLINE))
COLOR_REDUCTION=$((INITIAL_COLORS - FINAL_COLORS))
HTML_REDUCTION=$((INITIAL_HTML_TAGS - FINAL_HTML_TAGS))

echo -e "\n${GREEN}🎉 PHASE 5 COMPREHENSIVE MIGRATION COMPLETE!${NC}"
echo "============================================="
echo -e "📊 RESULTS:"
echo -e "   Inline Styles: $INITIAL_INLINE → $FINAL_INLINE (${INLINE_REDUCTION} reduced)"
echo -e "   Hardcoded Colors: $INITIAL_COLORS → $FINAL_COLORS (${COLOR_REDUCTION} reduced)"
echo -e "   HTML Tags: $INITIAL_HTML_TAGS → $FINAL_HTML_TAGS (${HTML_REDUCTION} reduced)"
echo -e ""
echo -e "📁 Backups: $BACKUP_DIR"
echo -e "🔍 Run validation: bash scripts/style-validation.sh"

# Run validation
echo -e "\n${YELLOW}🔍 Running validation...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"
