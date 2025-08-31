#!/bin/bash

# Phase 3: Component Color Migration Script
# Migrate common hardcoded color patterns to theme variables

echo "🎨 Starting Phase 3 Component Migration..."

# Define the apps directory
APPS_DIR="/workspaces/sabo-pool-v12/apps/sabo-user/src"

# Function to migrate colors in a file
migrate_colors() {
    local file="$1"
    echo "  ↳ Migrating: $file"
    
    # Background color migrations
    sed -i 's/bg-white/bg-background/g' "$file"
    sed -i 's/bg-gray-50/bg-muted\/50/g' "$file"
    sed -i 's/bg-gray-100/bg-muted/g' "$file"
    sed -i 's/bg-gray-200/bg-muted/g' "$file"
    sed -i 's/bg-slate-800/bg-card/g' "$file"
    sed -i 's/bg-slate-900/bg-background/g' "$file"
    
    # Text color migrations
    sed -i 's/text-white/text-foreground/g' "$file"
    sed -i 's/text-gray-600/text-muted-foreground/g' "$file"
    sed -i 's/text-gray-500/text-muted-foreground/g' "$file"
    sed -i 's/text-gray-800/text-foreground/g' "$file"
    sed -i 's/text-gray-900/text-foreground/g' "$file"
    sed -i 's/text-slate-100/text-foreground/g' "$file"
    sed -i 's/text-slate-300/text-muted-foreground/g' "$file"
    sed -i 's/text-slate-400/text-muted-foreground/g' "$file"
    
    # Border color migrations
    sed -i 's/border-gray-200/border/g' "$file"
    sed -i 's/border-gray-300/border/g' "$file"
    sed -i 's/border-slate-700/border/g' "$file"
    sed -i 's/border-slate-600/border/g' "$file"
    
    # Specific pattern fixes
    sed -i 's/bg-white\/80/bg-background\/80/g' "$file"
    sed -i 's/bg-white\/90/bg-background\/90/g' "$file"
    sed -i 's/bg-white\/70/bg-background\/70/g' "$file"
}

# Migrate components directory (selective)
echo "📁 Migrating key components..."
files_to_migrate=(
    "$APPS_DIR/components/ClubRegistrationMultiStepForm.tsx"
    "$APPS_DIR/components/ClubTournamentManagement.tsx"
    "$APPS_DIR/components/DiscoveryStats.tsx"
    "$APPS_DIR/components/EnhancedPlayerCard.tsx"
    "$APPS_DIR/components/Season2Info.tsx"
)

for file in "${files_to_migrate[@]}"; do
    if [[ -f "$file" ]]; then
        migrate_colors "$file"
    fi
done

echo "✅ Phase 3 key component migration completed!"
echo "🎯 Next: Test theme switching functionality"
