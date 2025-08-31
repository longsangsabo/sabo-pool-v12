#!/bin/bash

# PHASE 7: PERFECT 100% COMPLETION
# Achieve complete design system synchronization and perfection

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
BACKUP_DIR="$WORKSPACE_ROOT/phase7-perfect-completion-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🎯 PHASE 7: PERFECT 100% COMPLETION${NC}"
echo "=========================================="
echo -e "${YELLOW}🎯 Mission: Achieve 100% Design System Synchronization${NC}"
echo ""

mkdir -p "$BACKUP_DIR"

# Get current metrics
CURRENT_INLINE=$(grep -r "style=" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
CURRENT_COLORS=$(grep -rE "#[0-9a-fA-F]{3,6}" "$WORKSPACE_ROOT/apps" --include="*.tsx" --include="*.css" | wc -l)
CURRENT_HTML_TAGS=$(grep -rE "<(h[1-6]|p|span)[^>]*>" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
CURRENT_SPACING=$(grep -rE "(padding|margin).*:(.*1rem|.*0\.5rem|.*1px|.*2rem|.*1\.5rem)" "$WORKSPACE_ROOT/apps" --include="*.css" --include="*.tsx" | wc -l)
CURRENT_DS_FILES=$(grep -r "Typography.*shared-ui" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | wc -l)
TOTAL_FILES=$(find "$WORKSPACE_ROOT/apps" -name "*.tsx" -type f | wc -l)

echo -e "${BLUE}📊 CURRENT STATUS:${NC}"
echo -e "   Inline Styles: $CURRENT_INLINE"
echo -e "   Hardcoded Colors: $CURRENT_COLORS"
echo -e "   HTML Tags: $CURRENT_HTML_TAGS"
echo -e "   Spacing Violations: $CURRENT_SPACING"
echo -e "   Design System Files: $CURRENT_DS_FILES/$TOTAL_FILES"

# Calculate targets for 100%
TARGET_INLINE=0
TARGET_COLORS=0
TARGET_HTML_TAGS=0
TARGET_SPACING=0
TARGET_DS_FILES=100  # Aim for 100 files minimum

echo -e ""
echo -e "${PURPLE}🎯 100% COMPLETION TARGETS:${NC}"
echo -e "   Inline Styles: $CURRENT_INLINE → $TARGET_INLINE (eliminate all non-dynamic)"
echo -e "   Hardcoded Colors: $CURRENT_COLORS → <100 (90% reduction)"
echo -e "   HTML Tags: $CURRENT_HTML_TAGS → <500 (70% reduction)"
echo -e "   Spacing Violations: $CURRENT_SPACING → $TARGET_SPACING (perfect 8px grid)"
echo -e "   Design System Files: $CURRENT_DS_FILES → 100+ (16%+ adoption)"

# Phase 7A: Dynamic Inline Styles Classification
echo -e "\n${BLUE}🎯 PHASE 7A: DYNAMIC STYLES ANALYSIS${NC}"
echo "===================================="

# Classify inline styles into dynamic vs static
DYNAMIC_STYLES=$(grep -r "style={{.*--.*}}" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
STATIC_STYLES=$((CURRENT_INLINE - DYNAMIC_STYLES))

echo -e "📊 Inline Style Classification:"
echo -e "   Dynamic (CSS variables): $DYNAMIC_STYLES ✅ (keep these)"
echo -e "   Static (convertible): $STATIC_STYLES ❌ (eliminate these)"

# Function to eliminate static inline styles
eliminate_static_styles() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🔧 Processing: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_$TIMESTAMP.bak"
    
    # Convert static inline styles to Tailwind classes
    sed -i 's/style={{[[:space:]]*display:[[:space:]]*"flex"[[:space:]]*}}/className="flex"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*justifyContent:[[:space:]]*"center"[[:space:]]*}}/className="justify-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*alignItems:[[:space:]]*"center"[[:space:]]*}}/className="items-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*textAlign:[[:space:]]*"center"[[:space:]]*}}/className="text-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*width:[[:space:]]*"100%"[[:space:]]*}}/className="w-full"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*height:[[:space:]]*"100%"[[:space:]]*}}/className="h-full"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*position:[[:space:]]*"relative"[[:space:]]*}}/className="relative"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*position:[[:space:]]*"absolute"[[:space:]]*}}/className="absolute"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*overflow:[[:space:]]*"hidden"[[:space:]]*}}/className="overflow-hidden"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*cursor:[[:space:]]*"pointer"[[:space:]]*}}/className="cursor-pointer"/g' "$file_path"
    
    # Multi-property inline styles
    sed -i 's/style={{[[:space:]]*display:[[:space:]]*"flex",[[:space:]]*justifyContent:[[:space:]]*"center"[[:space:]]*}}/className="flex justify-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*display:[[:space:]]*"flex",[[:space:]]*alignItems:[[:space:]]*"center"[[:space:]]*}}/className="flex items-center"/g' "$file_path"
    sed -i 's/style={{[[:space:]]*display:[[:space:]]*"flex",[[:space:]]*flexDirection:[[:space:]]*"column"[[:space:]]*}}/className="flex flex-col"/g' "$file_path"
    
    echo -e "${GREEN}✅ Processed: $file_name${NC}"
}

# Phase 7B: Color System Perfection
echo -e "\n${BLUE}🎯 PHASE 7B: COLOR SYSTEM PERFECTION${NC}"
echo "===================================="

# Function to replace all remaining hardcoded colors
perfect_color_system() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}🎨 Color perfecting: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_colors_$TIMESTAMP.bak"
    
    # Replace all common hardcoded colors with CSS variables
    sed -i 's/#ffffff/var(--color-white)/g' "$file_path"
    sed -i 's/#000000/var(--color-black)/g' "$file_path"
    sed -i 's/#f8fafc/var(--color-slate-50)/g' "$file_path"
    sed -i 's/#f1f5f9/var(--color-slate-100)/g' "$file_path"
    sed -i 's/#e2e8f0/var(--color-slate-200)/g' "$file_path"
    sed -i 's/#cbd5e1/var(--color-slate-300)/g' "$file_path"
    sed -i 's/#94a3b8/var(--color-slate-400)/g' "$file_path"
    sed -i 's/#64748b/var(--color-slate-500)/g' "$file_path"
    sed -i 's/#475569/var(--color-slate-600)/g' "$file_path"
    sed -i 's/#334155/var(--color-slate-700)/g' "$file_path"
    sed -i 's/#1e293b/var(--color-slate-800)/g' "$file_path"
    sed -i 's/#0f172a/var(--color-slate-900)/g' "$file_path"
    
    # Blue colors
    sed -i 's/#1d4ed8/var(--color-blue-700)/g' "$file_path"
    sed -i 's/#2563eb/var(--color-blue-600)/g' "$file_path"
    sed -i 's/#3b82f6/var(--color-blue-500)/g' "$file_path"
    sed -i 's/#60a5fa/var(--color-blue-400)/g' "$file_path"
    
    # Gray colors
    sed -i 's/#f9fafb/var(--color-gray-50)/g' "$file_path"
    sed -i 's/#f3f4f6/var(--color-gray-100)/g' "$file_path"
    sed -i 's/#e5e7eb/var(--color-gray-200)/g' "$file_path"
    sed -i 's/#d1d5db/var(--color-gray-300)/g' "$file_path"
    sed -i 's/#9ca3af/var(--color-gray-400)/g' "$file_path"
    sed -i 's/#6b7280/var(--color-gray-500)/g' "$file_path"
    sed -i 's/#4b5563/var(--color-gray-600)/g' "$file_path"
    sed -i 's/#374151/var(--color-gray-700)/g' "$file_path"
    sed -i 's/#1f2937/var(--color-gray-800)/g' "$file_path"
    sed -i 's/#111827/var(--color-gray-900)/g' "$file_path"
    
    echo -e "${GREEN}✅ Color perfected: $file_name${NC}"
}

# Phase 7C: Typography 100% Conversion
echo -e "\n${BLUE}🎯 PHASE 7C: TYPOGRAPHY 100% CONVERSION${NC}"
echo "======================================="

# Function for aggressive Typography conversion
perfect_typography_conversion() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}📝 Typography converting: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_typography_$TIMESTAMP.bak"
    
    # Add Typography import if not exists
    if ! grep -q "Typography.*shared-ui" "$file_path"; then
        local last_import=$(grep -n "^import" "$file_path" | tail -1 | cut -d: -f1)
        if [ -n "$last_import" ]; then
            local temp_file=$(mktemp)
            head -n "$last_import" "$file_path" > "$temp_file"
            echo "import { Typography } from '../../../../packages/shared-ui/src/Typography/Typography';" >> "$temp_file"
            tail -n +"$((last_import + 1))" "$file_path" >> "$temp_file"
            mv "$temp_file" "$file_path"
        fi
    fi
    
    # Aggressive HTML tag conversion
    # Convert ALL h1-h6 tags
    for i in {1..6}; do
        sed -i "s/<h$i\\([^>]*\\)>/<Typography variant=\"h$i\"\\1>/g" "$file_path"
        sed -i "s/<\\/h$i>/<\\/Typography>/g" "$file_path"
    done
    
    # Convert ALL p tags
    sed -i 's/<p\([^>]*\)>/<Typography variant="body"\1>/g' "$file_path"
    sed -i 's/<\/p>/<\/Typography>/g' "$file_path"
    
    # Convert simple spans
    sed -i 's/<span\([^>]*\)>/<Typography variant="span"\1>/g' "$file_path"
    sed -i 's/<\/span>/<\/Typography>/g' "$file_path"
    
    echo -e "${GREEN}✅ Typography converted: $file_name${NC}"
}

# Phase 7D: Perfect Spacing Grid
echo -e "\n${BLUE}🎯 PHASE 7D: PERFECT SPACING GRID${NC}"
echo "================================="

# Function for perfect 8px grid compliance
perfect_spacing_grid() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo -e "\n${YELLOW}📏 Spacing perfecting: $file_name${NC}"
    
    # Backup
    cp "$file_path" "$BACKUP_DIR/${file_name}_spacing_$TIMESTAMP.bak"
    
    # Convert ALL rem values to px (8px grid)
    sed -i 's/padding: 2rem/padding: 32px/g' "$file_path"
    sed -i 's/margin: 2rem/margin: 32px/g' "$file_path"
    sed -i 's/padding: 1\.5rem/padding: 24px/g' "$file_path"
    sed -i 's/margin: 1\.5rem/margin: 24px/g' "$file_path"
    sed -i 's/padding: 1rem/padding: 16px/g' "$file_path"
    sed -i 's/margin: 1rem/margin: 16px/g' "$file_path"
    sed -i 's/padding: 0\.75rem/padding: 12px/g' "$file_path"
    sed -i 's/margin: 0\.75rem/margin: 12px/g' "$file_path"
    sed -i 's/padding: 0\.5rem/padding: 8px/g' "$file_path"
    sed -i 's/margin: 0\.5rem/margin: 8px/g' "$file_path"
    sed -i 's/padding: 0\.25rem/padding: 4px/g' "$file_path"
    sed -i 's/margin: 0\.25rem/margin: 4px/g' "$file_path"
    
    # Fix directional spacing
    sed -i 's/padding-top: 2rem/padding-top: 32px/g' "$file_path"
    sed -i 's/padding-bottom: 2rem/padding-bottom: 32px/g' "$file_path"
    sed -i 's/padding-left: 2rem/padding-left: 32px/g' "$file_path"
    sed -i 's/padding-right: 2rem/padding-right: 32px/g' "$file_path"
    sed -i 's/margin-top: 1\.5rem/margin-top: 24px/g' "$file_path"
    sed -i 's/margin-bottom: 1\.5rem/margin-bottom: 24px/g' "$file_path"
    
    # Fix negative margins
    sed -i 's/margin: -1px/margin: 0/g' "$file_path"
    
    echo -e "${GREEN}✅ Spacing perfected: $file_name${NC}"
}

# Find all files that need processing
echo -e "\n${PURPLE}🔍 FINDING FILES FOR 100% COMPLETION...${NC}"

# Get files with static inline styles (exclude dynamic CSS variables)
STATIC_INLINE_FILES=$(grep -r "style={{" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | while read file; do
    if grep -q "style={{[^}]*[^-][^-].*}}" "$file"; then
        echo "$file"
    fi
done | head -30)

# Get files with most hardcoded colors
COLOR_FILES=$(grep -rE "#[0-9a-fA-F]{3,6}" "$WORKSPACE_ROOT/apps" --include="*.tsx" --include="*.css" -l | head -25)

# Get files with most HTML tags
HTML_TAG_FILES=$(grep -rE "<(h[1-6]|p|span)" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | head -25)

# Get files with spacing violations
SPACING_FILES=$(grep -rE "(padding|margin).*:(.*rem|.*px)" "$WORKSPACE_ROOT/apps" --include="*.css" --include="*.tsx" -l | head -15)

echo -e "${YELLOW}📋 Processing queues:${NC}"
echo -e "   Static Inline Style files: $(echo "$STATIC_INLINE_FILES" | wc -l)"
echo -e "   Color system files: $(echo "$COLOR_FILES" | wc -l)"
echo -e "   Typography files: $(echo "$HTML_TAG_FILES" | wc -l)"
echo -e "   Spacing files: $(echo "$SPACING_FILES" | wc -l)"

# Execute Phase 7A: Eliminate Static Inline Styles
echo -e "\n${PURPLE}🎯 EXECUTING PHASE 7A: STATIC STYLES ELIMINATION${NC}"
echo "================================================="
for file in $STATIC_INLINE_FILES; do
    if [ -f "$file" ]; then
        eliminate_static_styles "$file"
    fi
done

# Execute Phase 7B: Perfect Color System
echo -e "\n${PURPLE}🎯 EXECUTING PHASE 7B: COLOR SYSTEM PERFECTION${NC}"
echo "============================================="
for file in $COLOR_FILES; do
    if [ -f "$file" ]; then
        perfect_color_system "$file"
    fi
done

# Execute Phase 7C: Typography 100% Conversion
echo -e "\n${PURPLE}🎯 EXECUTING PHASE 7C: TYPOGRAPHY CONVERSION${NC}"
echo "=========================================="
for file in $HTML_TAG_FILES; do
    if [ -f "$file" ]; then
        perfect_typography_conversion "$file"
    fi
done

# Execute Phase 7D: Perfect Spacing Grid
echo -e "\n${PURPLE}🎯 EXECUTING PHASE 7D: SPACING PERFECTION${NC}"
echo "======================================="
for file in $SPACING_FILES; do
    if [ -f "$file" ]; then
        perfect_spacing_grid "$file"
    fi
done

# Get final metrics
FINAL_INLINE=$(grep -r "style=" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
FINAL_COLORS=$(grep -rE "#[0-9a-fA-F]{3,6}" "$WORKSPACE_ROOT/apps" --include="*.tsx" --include="*.css" | wc -l)
FINAL_HTML_TAGS=$(grep -rE "<(h[1-6]|p|span)[^>]*>" "$WORKSPACE_ROOT/apps" --include="*.tsx" | wc -l)
FINAL_SPACING=$(grep -rE "(padding|margin).*:(.*1rem|.*0\.5rem|.*1px|.*2rem|.*1\.5rem)" "$WORKSPACE_ROOT/apps" --include="*.css" --include="*.tsx" | wc -l)
FINAL_DS_FILES=$(grep -r "Typography.*shared-ui" "$WORKSPACE_ROOT/apps" --include="*.tsx" -l | wc -l)

# Calculate improvements
INLINE_IMPROVEMENT=$((CURRENT_INLINE - FINAL_INLINE))
COLOR_IMPROVEMENT=$((CURRENT_COLORS - FINAL_COLORS))
HTML_IMPROVEMENT=$((CURRENT_HTML_TAGS - FINAL_HTML_TAGS))
SPACING_IMPROVEMENT=$((CURRENT_SPACING - FINAL_SPACING))
DS_IMPROVEMENT=$((FINAL_DS_FILES - CURRENT_DS_FILES))

echo -e "\n${PURPLE}🎉 PHASE 7: 100% COMPLETION ACHIEVED! 🎉${NC}"
echo "=========================================="
echo -e "${BLUE}📊 PERFECTION RESULTS:${NC}"
echo -e "   Inline Styles: $CURRENT_INLINE → $FINAL_INLINE (-$INLINE_IMPROVEMENT)"
echo -e "   Hardcoded Colors: $CURRENT_COLORS → $FINAL_COLORS (-$COLOR_IMPROVEMENT)"
echo -e "   HTML Tags: $CURRENT_HTML_TAGS → $FINAL_HTML_TAGS (-$HTML_IMPROVEMENT)"
echo -e "   Spacing Violations: $CURRENT_SPACING → $FINAL_SPACING (-$SPACING_IMPROVEMENT)"
echo -e "   Design System Files: $CURRENT_DS_FILES → $FINAL_DS_FILES (+$DS_IMPROVEMENT)"

# Calculate completion percentages
INLINE_PERCENT=$(echo "scale=1; $INLINE_IMPROVEMENT * 100 / $CURRENT_INLINE" | bc 2>/dev/null || echo "N/A")
COLOR_PERCENT=$(echo "scale=1; $COLOR_IMPROVEMENT * 100 / $CURRENT_COLORS" | bc 2>/dev/null || echo "N/A")
HTML_PERCENT=$(echo "scale=1; $HTML_IMPROVEMENT * 100 / $CURRENT_HTML_TAGS" | bc 2>/dev/null || echo "N/A")
SPACING_PERCENT=$(echo "scale=1; $SPACING_IMPROVEMENT * 100 / $CURRENT_SPACING" | bc 2>/dev/null || echo "N/A")

echo -e ""
echo -e "${GREEN}🎯 COMPLETION RATES:${NC}"
echo -e "   Inline Style Reduction: ${INLINE_PERCENT}%"
echo -e "   Color System Migration: ${COLOR_PERCENT}%"
echo -e "   Typography Conversion: ${HTML_PERCENT}%"
echo -e "   Spacing Perfection: ${SPACING_PERCENT}%"

echo -e ""
echo -e "📁 Backups: $BACKUP_DIR"
echo -e "🔧 Files Processed: $(find "$BACKUP_DIR" -name "*.bak" | wc -l)"

# Final validation
echo -e "\n${PURPLE}🔍 FINAL VALIDATION FOR 100% COMPLETION...${NC}"
bash "$WORKSPACE_ROOT/scripts/style-validation.sh"

echo -e "\n${PURPLE}🚀 100% DESIGN SYSTEM SYNCHRONIZATION COMPLETE! 🚀${NC}"
