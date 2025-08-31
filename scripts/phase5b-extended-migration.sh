#!/bin/bash

# PHASE 5B: EXTENDED COMPONENT ADOPTION
# Continue migration for more comprehensive coverage

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase5b-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 PHASE 5B: EXTENDED COMPONENT ADOPTION${NC}"
echo "============================================"

mkdir -p "$BACKUP_DIR"

# Function to migrate files with simpler pattern matching
migrate_file_simple() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "${YELLOW}🔄 Processing: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Simple but effective replacements
    sed -i 's/style={{[[:space:]]*padding:[[:space:]]*'"'"'20px'"'"'[[:space:]]*}}/className="p-5"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*margin:[[:space:]]*'"'"'20px'"'"'[[:space:]]*}}/className="m-5"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*marginTop:[[:space:]]*'"'"'20px'"'"'[[:space:]]*}}/className="mt-5"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*marginBottom:[[:space:]]*'"'"'20px'"'"'[[:space:]]*}}/className="mb-5"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*display:[[:space:]]*'"'"'flex'"'"'[[:space:]]*}}/className="flex"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*justifyContent:[[:space:]]*'"'"'center'"'"'[[:space:]]*}}/className="justify-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*alignItems:[[:space:]]*'"'"'center'"'"'[[:space:]]*}}/className="items-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*textAlign:[[:space:]]*'"'"'center'"'"'[[:space:]]*}}/className="text-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*gap:[[:space:]]*'"'"'10px'"'"'[[:space:]]*}}/className="gap-2"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*gap:[[:space:]]*'"'"'20px'"'"'[[:space:]]*}}/className="gap-5"/g' "$file_path"
    
    # Color replacements
    sed -i 's/#ffffff/white/g' "$file_path"
    sed -i 's/#000000/black/g' "$file_path"
    sed -i 's/#f3f4f6/gray-100/g' "$file_path"
    sed -i 's/#e5e7eb/gray-200/g' "$file_path"
    sed -i 's/#d1d5db/gray-300/g' "$file_path"
    
    echo -e "${GREEN}✅ Migrated: $file_name${NC}"
}

# Batch 2 files - tournament and UI components
BATCH_2_FILES=(
    "/workspaces/sabo-pool-v12/apps/sabo-admin/src/pages/admin/AdminPayments.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-admin/src/pages/admin/AdminTournaments.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-admin/src/pages/admin/AdminAnalytics.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/CheckInWidget.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/challenges/Enhanced/SwipeableCard.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/ParticipantListRealtime.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/OptimizedTournamentCard.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/EnhancedMatchCard.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/BracketVisualization.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/TournamentParticipantsTab.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/TournamentStatsRealtime.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/tournament/TournamentControlPanel.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/auth/AuthProgress.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/mobile/MobilePlayerLayout.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/progress.tsx"
    "/workspaces/sabo-pool-v12/apps/sabo-user/src/components/ui/scrollable-table.tsx"
)

echo -e "\n${BLUE}🎯 MIGRATING BATCH 2 FILES${NC}"
echo "============================="

for file in "${BATCH_2_FILES[@]}"; do
    if [ -f "$file" ]; then
        migrate_file_simple "$file"
    else
        echo -e "${RED}❌ File not found: $(basename "$file")${NC}"
    fi
done

# Get metrics
CURRENT_INLINE=$(grep -r "style=" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
CURRENT_COLORS=$(grep -rE "#[0-9a-fA-F]{3,6}" "$WORKSPACE_ROOT/apps" --include="*.tsx" --include="*.css" | wc -l)

echo -e "\n${GREEN}🎉 PHASE 5B MIGRATION COMPLETE!${NC}"
echo "================================"
echo -e "📊 Current Status:"
echo -e "   Inline Styles: $CURRENT_INLINE"
echo -e "   Hardcoded Colors: $CURRENT_COLORS"
echo -e ""
echo -e "📁 Backups: $BACKUP_DIR"

# Run validation
echo -e "\n${YELLOW}🔍 Running validation...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"
